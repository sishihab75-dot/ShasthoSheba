import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedUserSession } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getVerifiedUserSession(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized or session expired" }, { status: 401 });
    }

    const unreadNotificationsCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountStatus: user.accountStatus,
        createdAt: user.createdAt,
        doctor: user.doctor || null,
        patient: user.patient || null,
        unreadNotifications: unreadNotificationsCount,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
