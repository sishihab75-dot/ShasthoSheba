import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedUserSession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getVerifiedUserSession(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Administrator authorization required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body; // "APPROVE", "REJECT", "SUSPEND", "REACTIVATE"

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    let newVerificationStatus = doctor.verificationStatus;
    let newAccountStatus = doctor.accountStatus;
    let notifTitle = "";
    let notifMessage = "";

    switch (action) {
      case "APPROVE":
        newVerificationStatus = "VERIFIED";
        newAccountStatus = "ACTIVE";
        notifTitle = "Doctor Profile Approved";
        notifMessage = "Your medical credentials have been verified by administration. Your consultation profile is now active.";
        break;
      case "REJECT":
        newVerificationStatus = "REJECTED";
        newAccountStatus = "INACTIVE";
        notifTitle = "Doctor Profile Rejected";
        notifMessage = `Your profile verification could not be approved. Reason: ${reason || "BMDC credential verification failure"}.`;
        break;
      case "SUSPEND":
        newAccountStatus = "SUSPENDED";
        notifTitle = "Account Privileges Suspended";
        notifMessage = `Your consultation privileges have been suspended. Reason: ${reason || "Administrative policy review"}.`;
        break;
      case "REACTIVATE":
        newAccountStatus = "ACTIVE";
        notifTitle = "Account Reactivated";
        notifMessage = "Your doctor account and consultation schedule have been reactivated.";
        break;
      default:
        return NextResponse.json({ error: "Invalid action. Choose APPROVE, REJECT, SUSPEND, or REACTIVATE." }, { status: 400 });
    }

    // Update doctor record
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        verificationStatus: newVerificationStatus,
        accountStatus: newAccountStatus,
      },
    });

    // Also update parent User accountStatus
    await prisma.user.update({
      where: { id: doctor.userId },
      data: { accountStatus: newAccountStatus },
    });

    // Create database Notification for Doctor
    await prisma.notification.create({
      data: {
        userId: doctor.userId,
        title: notifTitle,
        message: notifMessage,
        type: "SYSTEM",
      },
    });

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorRole: "ADMIN",
        action: `DOCTOR_${action}`,
        targetType: "Doctor",
        targetId: id,
        details: `Doctor Dr. ${doctor.user.name} status updated to ${newVerificationStatus}/${newAccountStatus}. Reason: ${reason || "None"}`,
      },
    });

    return NextResponse.json({
      message: `Doctor ${action} completed successfully`,
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("Doctor verify action error:", error);
    return NextResponse.json({ error: "Failed to process doctor verification action" }, { status: 500 });
  }
}
