import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedUserSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getVerifiedUserSession(request);
    if (!session || session.role !== "DOCTOR" || !session.doctor) {
      return NextResponse.json({ error: "Doctor access required" }, { status: 403 });
    }

    const leaves = await prisma.doctorLeave.findMany({
      where: { doctorId: session.doctor.id },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ leaves });
  } catch (error) {
    console.error("Get doctor leaves error:", error);
    return NextResponse.json({ error: "Failed to fetch leave dates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getVerifiedUserSession(request);
    if (!session || session.role !== "DOCTOR" || !session.doctor) {
      return NextResponse.json({ error: "Doctor access required" }, { status: 403 });
    }

    const body = await request.json();
    const { date, reason } = body;

    if (!date) {
      return NextResponse.json({ error: "Date is required (YYYY-MM-DD)" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];
    if (date < today) {
      return NextResponse.json({ error: "Cannot declare leave for past dates" }, { status: 400 });
    }

    const leave = await prisma.doctorLeave.upsert({
      where: {
        doctorId_date: {
          doctorId: session.doctor.id,
          date,
        },
      },
      create: {
        doctorId: session.doctor.id,
        date,
        reason: reason || "Personal / Emergency Leave",
      },
      update: {
        reason: reason || "Personal / Emergency Leave",
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorRole: "DOCTOR",
        action: "ADD_DOCTOR_LEAVE",
        targetType: "DoctorLeave",
        targetId: leave.id,
        details: `Leave date set for ${date}. Reason: ${reason || "None"}`,
      },
    });

    return NextResponse.json({ message: "Leave date registered successfully", leave });
  } catch (error) {
    console.error("Post doctor leave error:", error);
    return NextResponse.json({ error: "Failed to set leave date" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getVerifiedUserSession(request);
    if (!session || session.role !== "DOCTOR" || !session.doctor) {
      return NextResponse.json({ error: "Doctor access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const leaveId = searchParams.get("id");

    if (!leaveId) {
      return NextResponse.json({ error: "Leave ID required" }, { status: 400 });
    }

    const leave = await prisma.doctorLeave.findUnique({
      where: { id: leaveId },
    });

    if (!leave || leave.doctorId !== session.doctor.id) {
      return NextResponse.json({ error: "Leave record not found or unauthorized" }, { status: 404 });
    }

    await prisma.doctorLeave.delete({
      where: { id: leaveId },
    });

    return NextResponse.json({ message: "Leave date removed successfully" });
  } catch (error) {
    console.error("Delete doctor leave error:", error);
    return NextResponse.json({ error: "Failed to delete leave record" }, { status: 500 });
  }
}
