import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedUserSession } from "@/lib/auth";

// GET - Role-isolated appointments query
export async function GET(request: Request) {
  try {
    const session = await getVerifiedUserSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized session" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const dateFilter = searchParams.get("date");

    const where: any = {};
    if (statusFilter && statusFilter !== "ALL") where.status = statusFilter;
    if (dateFilter) where.date = dateFilter;

    // Strict role-based query isolation
    if (session.role === "ADMIN") {
      const appointments = await prisma.appointment.findMany({
        where,
        include: {
          doctor: {
            include: {
              user: { select: { id: true, name: true, email: true, phone: true } },
            },
          },
          patient: {
            include: {
              user: { select: { id: true, name: true, email: true, phone: true } },
            },
          },
          prescription: true,
        },
        orderBy: { date: "desc" },
      });
      return NextResponse.json({ appointments });
    }

    if (session.role === "DOCTOR") {
      if (!session.doctor) {
        return NextResponse.json({ appointments: [] });
      }

      // DOCTOR CAN ONLY ACCESS THEIR OWN APPOINTMENTS!
      where.doctorId = session.doctor.id;

      const appointments = await prisma.appointment.findMany({
        where,
        include: {
          patient: {
            include: {
              user: { select: { id: true, name: true, email: true, phone: true } },
            },
          },
          prescription: true,
        },
        orderBy: [{ date: "asc" }, { timeSlot: "asc" }],
      });
      return NextResponse.json({ appointments });
    }

    // PATIENT ROLE - CAN ONLY ACCESS THEIR OWN APPOINTMENTS!
    if (!session.patient) {
      return NextResponse.json({ appointments: [] });
    }

    where.patientId = session.patient.id;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        },
        prescription: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Get appointments error:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

// POST - Patient books appointment
export async function POST(request: Request) {
  try {
    const session = await getVerifiedUserSession(request);
    if (!session || session.role !== "PATIENT" || !session.patient) {
      return NextResponse.json(
        { error: "Please log in as a patient to book an appointment" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { doctorId, date, timeSlot, symptoms, notes } = body;

    if (!doctorId || !date || !timeSlot) {
      return NextResponse.json(
        { error: "Doctor, date, and preferred time slot are required" },
        { status: 400 }
      );
    }

    // 1. Past-date validation
    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      return NextResponse.json(
        { error: "Cannot book appointments on past dates. Please choose today or a future date." },
        { status: 400 }
      );
    }

    // 2. Doctor existence and status validation
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        user: { select: { id: true, name: true, accountStatus: true } },
        leaves: true,
      },
    });

    if (!doctor || doctor.accountStatus !== "ACTIVE" || doctor.user.accountStatus !== "ACTIVE") {
      return NextResponse.json(
        { error: "The selected doctor is currently not accepting consultations." },
        { status: 400 }
      );
    }

    // 3. Leave date validation
    const isDoctorOnLeave = doctor.leaves.some((leave) => leave.date === date);
    if (isDoctorOnLeave) {
      return NextResponse.json(
        { error: `Dr. ${doctor.user.name} is on official leave on ${date}. Please select another date.` },
        { status: 400 }
      );
    }

    // 4. Chamber days check
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const bookingDayName = dayNames[new Date(date).getDay()];
    const availableDaysList = doctor.availableDays.split(",").map((d) => d.trim());
    if (!availableDaysList.includes(bookingDayName)) {
      return NextResponse.json(
        { error: `Dr. ${doctor.user.name} is available on (${doctor.availableDays}). ${bookingDayName} is not a chamber day.` },
        { status: 400 }
      );
    }

    // 5. Daily patient maximum quota check
    const dayAppointmentsCount = await prisma.appointment.count({
      where: {
        doctorId,
        date,
        status: { not: "CANCELLED" },
      },
    });

    if (dayAppointmentsCount >= doctor.maxDailyPatients) {
      return NextResponse.json(
        { error: `The maximum daily limit (${doctor.maxDailyPatients} patients) for this doctor on ${date} has been reached. Please choose another date.` },
        { status: 400 }
      );
    }

    // 6. Slot availability check (atomic constraint)
    const existingSlot = await prisma.appointment.findUnique({
      where: {
        doctorId_date_timeSlot: {
          doctorId,
          date,
          timeSlot,
        },
      },
    });

    if (existingSlot && existingSlot.status !== "CANCELLED") {
      return NextResponse.json(
        { error: "This time slot has already been booked. Please choose another time slot." },
        { status: 400 }
      );
    }

    // 7. Calculate dynamic serial number
    const serialNo = dayAppointmentsCount + 1;

    // 8. Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId: session.patient.id,
        doctorId,
        date,
        timeSlot,
        serialNo,
        status: "WAITING",
        symptoms: symptoms ? symptoms.trim() : null,
        notes: notes ? notes.trim() : null,
      },
      include: {
        doctor: {
          include: {
            user: { select: { name: true, phone: true } },
          },
        },
      },
    });

    // 9. Send database notification to Doctor
    await prisma.notification.create({
      data: {
        userId: doctor.userId,
        title: "New Patient Consultation Booked",
        message: `${session.name} has booked an appointment for ${date} at ${timeSlot} (Serial #${serialNo}).`,
        type: "APPOINTMENT",
      },
    });

    // 10. Audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorRole: "PATIENT",
        action: "BOOK_APPOINTMENT",
        targetType: "Appointment",
        targetId: appointment.id,
        details: `Booked with Dr. ${doctor.user.name} on ${date} at ${timeSlot} (Serial #${serialNo})`,
      },
    });

    return NextResponse.json({
      message: "Appointment booked successfully!",
      appointment,
    });
  } catch (error: any) {
    console.error("Book appointment error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "This time slot was just booked by another patient. Please pick another slot." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to book appointment" }, { status: 500 });
  }
}
