import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedUserSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getVerifiedUserSession(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Administrator authorization required" }, { status: 403 });
    }

    const today = new Date().toISOString().split("T")[0];

    const [
      totalDoctors,
      verifiedDoctors,
      pendingDoctorApplications,
      suspendedDoctors,
      totalPatients,
      totalAppointments,
      todayAppointments,
      waitingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      totalPrescriptions,
      recentAppointments,
      doctors,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.doctor.count(),
      prisma.doctor.count({ where: { verificationStatus: { in: ["VERIFIED", "DEMO"] } } }),
      prisma.doctor.count({ where: { verificationStatus: "PENDING" } }),
      prisma.doctor.count({ where: { accountStatus: "SUSPENDED" } }),
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.appointment.count({ where: { date: today } }),
      prisma.appointment.count({ where: { status: "WAITING" } }),
      prisma.appointment.count({ where: { status: "CONFIRMED" } }),
      prisma.appointment.count({ where: { status: "COMPLETED" } }),
      prisma.appointment.count({ where: { status: "CANCELLED" } }),
      prisma.prescription.count(),
      prisma.appointment.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          doctor: {
            include: { user: { select: { name: true } } },
          },
          patient: {
            include: { user: { select: { name: true, phone: true } } },
          },
          prescription: true,
        },
      }),
      prisma.doctor.findMany({
        include: {
          user: { select: { name: true, email: true, phone: true, accountStatus: true } },
          _count: { select: { appointments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          actor: { select: { name: true, email: true, role: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalDoctors,
        verifiedDoctors,
        pendingDoctorApplications,
        suspendedDoctors,
        totalPatients,
        totalAppointments,
        todayAppointments,
        waitingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
        totalPrescriptions,
      },
      recentAppointments,
      doctors,
      recentAuditLogs,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to compile administrative statistics" }, { status: 500 });
  }
}
