import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";

async function updateAdmin() {
  const adminPassword = await bcrypt.hash("admin123", 10);

  // Update existing admin or upsert
  const admin = await prisma.user.upsert({
    where: { email: "admin@shasthosheba.com" },
    update: {
      name: "Saydul Islam",
      role: "ADMIN",
      accountStatus: "ACTIVE",
      password: adminPassword,
    },
    create: {
      name: "Saydul Islam",
      email: "admin@shasthosheba.com",
      password: adminPassword,
      phone: "+8801711001122",
      role: "ADMIN",
      accountStatus: "ACTIVE",
    },
  });

  console.log("Successfully updated admin in MongoDB:", admin.id, admin.name, admin.email);

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      actorRole: "ADMIN",
      action: "ADMIN_PROFILE_UPDATED",
      targetType: "User",
      targetId: admin.id,
      details: "Admin identity updated to Saydul Islam",
    },
  });

  console.log("Audit log recorded.");
}

updateAdmin().catch(console.error).finally(() => prisma.$disconnect());
