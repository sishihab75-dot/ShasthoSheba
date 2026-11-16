import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getVerifiedUserSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET - List active & verified doctors with search and filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const specialization = searchParams.get("specialization") || "";
    const includeAll = searchParams.get("all") === "true"; // For admin

    const where: any = {};

    // For public catalog, only show active and verified/demo accounts
    if (!includeAll) {
      where.accountStatus = "ACTIVE";
      where.verificationStatus = { in: ["VERIFIED", "DEMO"] };
    }

    if (specialization && specialization !== "all") {
      where.specialization = specialization;
    }

    if (search) {
      where.OR = [
        { specialization: { contains: search, mode: "insensitive" } },
        { qualification: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        { chamberName: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const doctors = await prisma.doctor.findMany({
      where,
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
          select: { date: true, reason: true },
        },
      },
      orderBy: {
        experience: "desc",
      },
    });

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("Get doctors error:", error);
    return NextResponse.json(
      { error: "Failed to fetch doctors from database" },
      { status: 500 }
    );
  }
}

// POST - Admin creates new doctor account
export async function POST(request: Request) {
  try {
    const session = await getVerifiedUserSession(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Administrator access required to create doctors" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      specialization,
      qualification,
      bmdcNumber,
      experience,
      fee,
      chamberName,
      chamberAddress,
      availableDays,
      startTime,
      endTime,
      appointmentDuration,
      maxDailyPatients,
      bio,
      password,
      isDemo,
      verificationStatus,
    } = body;

    if (!name || !email || !specialization || !qualification) {
      return NextResponse.json(
        { error: "Doctor name, email, specialization, and qualifications are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A user account with this email already exists" },
        { status: 400 }
      );
    }

    // Default password or custom temporary password
    const rawPass = password && password.length >= 6 ? password : "doctor123";
    const hashedPassword = await bcrypt.hash(rawPass, 10);

    const expNum = parseInt(String(experience || 0));
    const safeExp = Number.isNaN(expNum) ? 0 : expNum;

    const feeNum = parseFloat(String(fee || 500));
    const safeFee = Number.isNaN(feeNum) ? 500 : feeNum;

    const durNum = parseInt(String(appointmentDuration || 15));
    const safeDuration = Number.isNaN(durNum) ? 15 : durNum;

    const maxNum = parseInt(String(maxDailyPatients || 30));
    const safeMax = Number.isNaN(maxNum) ? 30 : maxNum;

    const cleanName = name.trim();
    const docTitle = cleanName.toLowerCase().startsWith("prof") ? "Prof. Dr." : "Dr.";

    const doctor = await prisma.doctor.create({
      data: {
        title: docTitle,
        specialization: specialization.trim(),
        qualification: qualification.trim(),
        bmdcNumber: bmdcNumber ? bmdcNumber.trim() : null,
        isDemo: Boolean(isDemo),
        verificationStatus: verificationStatus || "VERIFIED",
        accountStatus: "ACTIVE",
        experience: safeExp,
        fee: safeFee,
        chamberName: chamberName ? chamberName.trim() : null,
        chamberAddress: chamberAddress ? chamberAddress.trim() : null,
        availableDays: availableDays || "Sat,Sun,Mon,Tue,Wed",
        startTime: startTime || "16:00",
        endTime: endTime || "21:00",
        appointmentDuration: safeDuration,
        maxDailyPatients: safeMax,
        bio: bio ? bio.trim() : null,
        user: {
          create: {
            name: cleanName,
            email: cleanEmail,
            password: hashedPassword,
            phone: phone ? phone.trim() : null,
            role: "DOCTOR",
            accountStatus: "ACTIVE",
          },
        },
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.id,
        actorRole: "ADMIN",
        action: "CREATE_DOCTOR",
        targetType: "Doctor",
        targetId: doctor.id,
        details: `Created doctor profile ${doctor.user.name} (${doctor.specialization}, BMDC: ${doctor.bmdcNumber || "None"})`,
      },
    });

    return NextResponse.json({
      message: "Doctor profile created successfully",
      doctor,
      credentials: {
        email: cleanEmail,
        temporaryPassword: rawPass,
      },
    });
  } catch (error) {
    console.error("Add doctor error:", error);
    return NextResponse.json(
      { error: "Failed to create doctor profile" },
      { status: 500 }
    );
  }
}
