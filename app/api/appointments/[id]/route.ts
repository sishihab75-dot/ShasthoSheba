import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedUserSession } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getVerifiedUserSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Role-based authorization rules:
    // 1. DOCTOR: Can only update if they are the ASSIGNED doctor for this appointment!
    if (session.role === "DOCTOR") {
      if (!session.doctor || appointment.doctorId !== session.doctor.id) {
        return NextResponse.json(
          { error: "Access Denied: You can only manage appointments assigned to your own profile" },
          { status: 403 }
        );
      }
      // Doctor can transition WAITING -> CONFIRMED -> COMPLETED or CANCELLED
      if (!["WAITING", "CONFIRMED", "COMPLETED", "CANCELLED"].includes(status)) {
        return NextResponse.json({ error: "Invalid appointment status" }, { status: 400 });
      }
    }
    // 2. PATIENT: Can only cancel their OWN appointment and only if status is WAITING
    else if (session.role === "PATIENT") {
      if (!session.patient || appointment.patientId !== session.patient.id) {
        return NextResponse.json(
          { error: "Access Denied: You can only view or manage your own appointments" },
          { status: 403 }
        );
      }
      if (status !== "CANCELLED") {
        return NextResponse.json(
          { error: "Patients are only permitted to cancel pending appointments" },
          { status: 403 }
        );
      }
      if (appointment.status === "COMPLETED") {
        return NextResponse.json(
          { error: "Cannot cancel a consultation that has already been completed" },
          { status: 400 }
        );
      }
    }
    // 3. ADMIN: Full authority
    else if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized role" }, { status: 403 });
    }

    const previousStatus = appointment.status;
    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status: status || appointment.status,
        notes: notes !== undefined ? notes : appointment.notes,
      },
    });

    // Notify patient if Doctor or Admin confirmed/cancelled
    if (session.role !== "PATIENT" && status && status !== previousStatus) {
      await prisma.notification.create({
        data: {
          userId: appointment.patient.userId,
          title: `Appointment Status: ${status}`,
          message: `Your appointment with Dr. ${appointment.doctor.user.name} on ${appointment.date} is now ${status}.`,
          type: "APPOINTMENT",
        },
      });
    }

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorRole: session.role,
        action: `APPOINTMENT_STATUS_${status}`,
        targetType: "Appointment",
        targetId: id,
        details: `Status transitioned from ${previousStatus} to ${status}. Notes: ${notes || "None"}`,
      },
    });

    return NextResponse.json({
      message: `Appointment status updated to ${status}`,
      appointment: updated,
    });
  } catch (error) {
    console.error("Update appointment status error:", error);
    return NextResponse.json({ error: "Failed to update appointment status" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getVerifiedUserSession(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Administrative privilege required to delete appointments" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.appointment.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorRole: "ADMIN",
        action: "DELETE_APPOINTMENT",
        targetType: "Appointment",
        targetId: id,
        details: `Admin deleted appointment record ID ${id}`,
      },
    });

    return NextResponse.json({ message: "Appointment record deleted" });
  } catch (error) {
    console.error("Delete appointment error:", error);
    return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 });
  }
}
