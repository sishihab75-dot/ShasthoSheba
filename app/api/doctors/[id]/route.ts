import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedUserSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            accountStatus: true,
          },
        },
        leaves: {
          select: { id: true, date: true, reason: true },
        },
        _count: {
          select: { appointments: true },
        },
      },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    return NextResponse.json({ doctor });
  } catch (error) {
    console.error("Get doctor error:", error);
    return NextResponse.json({ error: "Failed to fetch doctor" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getVerifiedUserSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    // Only Admin or the Doctor themselves can update
    const isOwner = session.role === "DOCTOR" && doctor.userId === session.id;
    const isAdmin = session.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    const {
      fee,
      chamberName,
      chamberAddress,
      availableDays,
      startTime,
      endTime,
      appointmentDuration,
      maxDailyPatients,
      bio,
      qualification,
      specialization,
      bmdcNumber,
      verificationStatus,
      accountStatus,
    } = body;

    const updateData: any = {};
    if (fee !== undefined) updateData.fee = parseFloat(String(fee));
    if (chamberName !== undefined) updateData.chamberName = chamberName;
    if (chamberAddress !== undefined) updateData.chamberAddress = chamberAddress;
    if (availableDays !== undefined) updateData.availableDays = availableDays;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (appointmentDuration !== undefined) updateData.appointmentDuration = parseInt(String(appointmentDuration));
    if (maxDailyPatients !== undefined) updateData.maxDailyPatients = parseInt(String(maxDailyPatients));
    if (bio !== undefined) updateData.bio = bio;
    if (qualification !== undefined) updateData.qualification = qualification;

    // Admin-only fields
    if (isAdmin) {
      if (specialization !== undefined) updateData.specialization = specialization;
      if (bmdcNumber !== undefined) updateData.bmdcNumber = bmdcNumber;
      if (verificationStatus !== undefined) updateData.verificationStatus = verificationStatus;
      if (accountStatus !== undefined) updateData.accountStatus = accountStatus;
    }

    const updated = await prisma.doctor.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorRole: session.role,
        action: "UPDATE_DOCTOR_PROFILE",
        targetType: "Doctor",
        targetId: id,
        details: `Updated fields: ${Object.keys(updateData).join(", ")}`,
      },
    });

    return NextResponse.json({
      message: "Doctor profile updated successfully",
      doctor: updated,
    });
  } catch (error) {
    console.error("Update doctor error:", error);
    return NextResponse.json({ error: "Failed to update doctor profile" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getVerifiedUserSession(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // Cascading delete deletes doctor and their user
    await prisma.user.delete({
      where: { id: doctor.userId },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorRole: "ADMIN",
        action: "DELETE_DOCTOR",
        targetType: "Doctor",
        targetId: id,
        details: `Deleted doctor account Dr. ${doctor.user.name} (${doctor.user.email})`,
      },
    });

    return NextResponse.json({ message: "Doctor profile and account removed successfully" });
  } catch (error) {
    console.error("Delete doctor error:", error);
    return NextResponse.json({ error: "Failed to delete doctor" }, { status: 500 });
  }
}
