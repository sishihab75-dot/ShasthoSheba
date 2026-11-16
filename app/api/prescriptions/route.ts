import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedUserSession } from "@/lib/auth";

// POST - Issue or update digital prescription
export async function POST(request: Request) {
  try {
    const session = await getVerifiedUserSession(request);
    if (!session || session.role !== "DOCTOR" || !session.doctor) {
      return NextResponse.json(
        { error: "Access Denied: Only certified and active physicians can issue prescriptions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { appointmentId, diagnosis, medicines, advice, nextVisit, markCompleted } = body;

    if (!appointmentId || !diagnosis || !medicines) {
      return NextResponse.json(
        { error: "Appointment ID, clinical diagnosis, and medications are required fields" },
        { status: 400 }
      );
    }

    // Verify appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: { include: { user: true } },
        patient: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // STRICT ISOLATION: Verify Doctor owns this appointment!
    if (appointment.doctorId !== session.doctor.id) {
      return NextResponse.json(
        { error: "Access Denied: You cannot issue a prescription for another physician's patient" },
        { status: 403 }
      );
    }

    // Upsert prescription in MongoDB
    const prescription = await prisma.prescription.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        doctorId: session.doctor.id, // Reliably store Doctor profile ID
        diagnosis: diagnosis.trim(),
        medicines: medicines.trim(),
        advice: advice ? advice.trim() : null,
        nextVisit: nextVisit ? nextVisit.trim() : null,
      },
      update: {
        diagnosis: diagnosis.trim(),
        medicines: medicines.trim(),
        advice: advice ? advice.trim() : null,
        nextVisit: nextVisit ? nextVisit.trim() : null,
      },
    });

    // If doctor requested to mark consultation as completed:
    if (markCompleted !== false) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: "COMPLETED" },
      });
    }

    // Send database notification to Patient
    await prisma.notification.create({
      data: {
        userId: appointment.patient.userId,
        title: "Digital Prescription Issued",
        message: `Dr. ${appointment.doctor.user.name} has issued your official digital prescription.`,
        type: "PRESCRIPTION",
      },
    });

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorRole: "DOCTOR",
        action: "ISSUE_PRESCRIPTION",
        targetType: "Prescription",
        targetId: prescription.id,
        details: `Issued for Appointment ${appointmentId} to Patient ${appointment.patient.id}. Diagnosis: ${diagnosis}`,
      },
    });

    return NextResponse.json({
      message: "Digital prescription saved successfully!",
      prescription,
    });
  } catch (error) {
    console.error("Prescription save error:", error);
    return NextResponse.json({ error: "Failed to save prescription" }, { status: 500 });
  }
}

// GET - Retrieve single prescription with privacy enforcement
export async function GET(request: Request) {
  try {
    const session = await getVerifiedUserSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get("appointmentId");

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 });
    }

    const prescription = await prisma.prescription.findUnique({
      where: { appointmentId },
      include: {
        doctor: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        appointment: {
          include: {
            doctor: {
              include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
              },
            },
            patient: {
              include: {
                user: { select: { id: true, name: true, phone: true, email: true } },
              },
            },
          },
        },
      },
    });

    if (!prescription) {
      return NextResponse.json({ error: "No prescription record found for this appointment" }, { status: 404 });
    }

    // PRIVACY ENFORCEMENT:
    // If Patient: must be the patient of this appointment
    if (session.role === "PATIENT") {
      if (!session.patient || prescription.appointment.patientId !== session.patient.id) {
        return NextResponse.json({ error: "Access Denied: You cannot view another patient's prescription" }, { status: 403 });
      }
    }
    // If Doctor: must be the doctor who wrote it
    else if (session.role === "DOCTOR") {
      if (!session.doctor || prescription.doctorId !== session.doctor.id) {
        return NextResponse.json({ error: "Access Denied: You cannot view another doctor's prescription" }, { status: 403 });
      }
    }
    // Admin is permitted for audit

    return NextResponse.json({ prescription });
  } catch (error) {
    console.error("Get prescription error:", error);
    return NextResponse.json({ error: "Failed to fetch prescription" }, { status: 500 });
  }
}
