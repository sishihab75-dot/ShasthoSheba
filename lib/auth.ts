import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "shasthosheba-jwt-secret-key-2026-super-secure";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getUserFromRequest(request: Request): JWTPayload | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const payload = verifyToken(token);
    if (payload) return payload;
  }

  // Also check cookie header for token
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)token=([^;]+)/);
    if (match && match[1]) {
      const payload = verifyToken(decodeURIComponent(match[1]));
      if (payload) return payload;
    }
  }

  return null;
}

// Deep database verification of authenticated user and account status
export async function getVerifiedUserSession(request: Request) {
  const payload = getUserFromRequest(request);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      doctor: true,
      patient: true,
    },
  });

  if (!user || user.accountStatus !== "ACTIVE") {
    return null;
  }

  // If Doctor, ensure doctor account is also active
  if (user.role === "DOCTOR") {
    if (!user.doctor || user.doctor.accountStatus !== "ACTIVE") {
      return null;
    }
  }

  return user;
}
