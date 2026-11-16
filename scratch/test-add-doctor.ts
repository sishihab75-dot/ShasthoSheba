import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/auth";

async function testAddDoctor() {
  console.log("Checking admin user...");
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });
  console.log("Admin user:", admin?.email, admin?.name);

  if (!admin) {
    console.error("No admin user found!");
    return;
  }

  const token = generateToken({
    userId: admin.id,
    email: admin.email,
    role: admin.role,
  });

  console.log("Generated admin token successfully.");

  // Test creating a doctor with unique email
  const testEmail = `test.doc.${Date.now()}@shasthosheba.com`;
  console.log("Attempting to create doctor with email:", testEmail);

  const rawPass = "doc123456";
  const hashedPassword = await bcrypt.hash(rawPass, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name: "Dr. Test Addition",
        email: testEmail,
        password: hashedPassword,
        phone: "+8801700112233",
        role: "DOCTOR",
        accountStatus: "ACTIVE",
      },
    });

    console.log("Created user:", user.id);

    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        title: "Dr.",
        specialization: "Cardiology",
        qualification: "MBBS, FCPS",
        bmdcNumber: "A-99999",
        isDemo: false,
        verificationStatus: "VERIFIED",
        accountStatus: "ACTIVE",
        experience: 10,
        fee: 1200,
        chamberName: "Test Chamber",
        chamberAddress: "Dhaka",
        availableDays: "Sat,Sun,Mon,Tue,Wed",
        startTime: "16:00",
        endTime: "21:00",
        appointmentDuration: 15,
        maxDailyPatients: 30,
        bio: "Test bio",
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    console.log("Created doctor:", doctor.id);

    const audit = await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorRole: "ADMIN",
        action: "CREATE_DOCTOR",
        targetType: "Doctor",
        targetId: doctor.id,
        details: `Created doctor profile Dr. ${doctor.user.name}`,
      },
    });

    console.log("Created audit log:", audit.id);

    // Clean up test doctor
    await prisma.auditLog.delete({ where: { id: audit.id } });
    await prisma.doctor.delete({ where: { id: doctor.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log("Cleaned up test doctor successfully!");
  } catch (err) {
    console.error("Error creating doctor:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testAddDoctor();
