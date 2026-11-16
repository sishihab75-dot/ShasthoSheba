import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, age, gender, address, bloodGroup } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required fields" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check for duplicate account
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Public registration is strictly PATIENT role for security
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        role: "PATIENT",
        accountStatus: "ACTIVE",
        patient: {
          create: {
            age: age ? parseInt(String(age)) : null,
            gender: gender || null,
            address: address ? address.trim() : null,
            bloodGroup: bloodGroup || null,
          },
        },
      },
      include: {
        patient: true,
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: "PATIENT",
        action: "PATIENT_REGISTERED",
        targetType: "User",
        targetId: user.id,
        details: `Patient registered with email ${cleanEmail}`,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({
      message: "Patient account created successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        patientId: user.patient?.id || null,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
