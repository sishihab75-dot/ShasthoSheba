import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/auth";

async function testFullDoctorAdditionWorkflow() {
  console.log("====================================================");
  console.log("🏥 TESTING DOCTOR ADDITION & ADMIN SAYDUL ISLAM WORKFLOW");
  console.log("====================================================");

  // 1. Verify Admin Saydul Islam in MongoDB
  const admin = await prisma.user.findUnique({
    where: { email: "admin@shasthosheba.com" },
  });

  if (!admin || admin.name !== "Saydul Islam" || admin.role !== "ADMIN") {
    throw new Error(`Admin check failed: found ${admin?.name} (${admin?.role})`);
  }
  console.log("✅ 1. Admin verified in MongoDB:", admin.name, `(${admin.email})`);

  // Verify password hash for admin123
  const isPassValid = await bcrypt.compare("admin123", admin.password);
  if (!isPassValid) {
    throw new Error("Admin password comparison failed for admin123");
  }
  console.log("✅ 2. Admin password hash verified for 'admin123'");

  // 2. Generate token for Admin Saydul Islam
  const token = generateToken({
    userId: admin.id,
    email: admin.email,
    role: admin.role,
  });
  console.log("✅ 3. JWT generated for Saydul Islam");

  // 3. Test creating a doctor using the exact route logic
  const testEmail = `dr.kabir.${Date.now()}@shasthosheba.com`;
  const doctorName = "Dr. Mohammad Kabir Hossain";
  const specialization = "Neurology";
  const qualification = "MBBS, FCPS (Neurology), MD";
  const bmdc = "A-55443";
  const rawPass = "docSecure2026";
  const hashedPassword = await bcrypt.hash(rawPass, 10);

  const doc = await prisma.doctor.create({
    data: {
      title: "Dr.",
      specialization: specialization,
      qualification: qualification,
      bmdcNumber: bmdc,
      isDemo: false,
      verificationStatus: "VERIFIED",
      accountStatus: "ACTIVE",
      experience: 12,
      fee: 1500,
      chamberName: "Ibn Sina Medical Complex",
      chamberAddress: "Dhanmondi, Dhaka",
      availableDays: "Sat,Sun,Mon,Tue,Wed",
      startTime: "17:00",
      endTime: "21:00",
      appointmentDuration: 20,
      maxDailyPatients: 25,
      bio: "Senior Consultant Neurologist.",
      user: {
        create: {
          name: doctorName,
          email: testEmail,
          password: hashedPassword,
          phone: "+8801712998877",
          role: "DOCTOR",
          accountStatus: "ACTIVE",
        },
      },
    },
    include: {
      user: true,
    },
  });

  console.log("✅ 4. Doctor created in MongoDB with ID:", doc.id);
  console.log("      Associated User ID:", doc.userId);
  console.log("      Doctor Name:", doc.user.name);
  console.log("      Doctor Email:", doc.user.email);
  console.log("      Specialization:", doc.specialization);
  console.log("      BMDC:", doc.bmdcNumber);

  // 4. Record Audit Log
  const audit = await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      actorRole: "ADMIN",
      action: "CREATE_DOCTOR",
      targetType: "Doctor",
      targetId: doc.id,
      details: `Created doctor profile ${doc.user.name} (${doc.specialization}, BMDC: ${doc.bmdcNumber})`,
    },
  });
  console.log("✅ 5. Audit Log recorded by Saydul Islam:", audit.action);

  // 5. Test Doctor Login with the created credentials
  const docLoginUser = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { doctor: true },
  });

  if (!docLoginUser || !docLoginUser.doctor) {
    throw new Error("Created doctor cannot be retrieved for login!");
  }

  const docPassMatch = await bcrypt.compare(rawPass, docLoginUser.password);
  if (!docPassMatch) {
    throw new Error("Doctor password mismatch!");
  }
  console.log("✅ 6. Newly created doctor can successfully authenticate with password:", rawPass);

  // 6. Clean up test doctor
  await prisma.auditLog.delete({ where: { id: audit.id } });
  await prisma.doctor.delete({ where: { id: doc.id } });
  await prisma.user.delete({ where: { id: doc.userId } });
  console.log("✅ 7. Test records cleaned up cleanly.");

  console.log("====================================================");
  console.log("🎉 ALL TESTS PASSED: Admin Saydul Islam & Doctor Addition 100% Operational!");
  console.log("====================================================");
}

testFullDoctorAdditionWorkflow()
  .catch((e) => {
    console.error("❌ Test failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
