import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        doctor: true,
        patient: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check account status
    if (user.accountStatus === "SUSPENDED") {
      return NextResponse.json(
        { error: "Your account has been suspended by system administration. Please contact support." },
        { status: 403 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // If doctor, verify doctor profile status
    if (user.role === "DOCTOR") {
      if (!user.doctor) {
        return NextResponse.json(
          { error: "Doctor profile record not found. Please contact administration." },
          { status: 403 }
        );
      }
      if (user.doctor.accountStatus === "SUSPENDED") {
        return NextResponse.json(
          { error: "Doctor consultation privileges have been suspended." },
          { status: 403 }
        );
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountStatus: user.accountStatus,
        doctorId: user.doctor?.id || null,
        patientId: user.patient?.id || null,
        verificationStatus: user.doctor?.verificationStatus || null,
        isDemo: user.doctor?.isDemo || false,
      },
    });

    // Set cookie for automatic browser session persistence
    response.cookies.set("token", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login" },
      { status: 500 }
    );
  }
}
