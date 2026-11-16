"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  Copy, 
  Check, 
  Building, 
  KeyRound, 
  Mail, 
  ShieldCheck,
  Printer
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { ButtonSpinner } from "@/components/Loader";
import { TIME_SLOTS_12H } from "@/lib/utils";

const SPECIALIZATIONS = [
  "Cardiology",
  "Neurology",
  "Gynecology & Obstetrics",
  "Orthopedics",
  "Pediatrics",
  "Internal Medicine",
  "Dermatology & Venereology",
  "Gastroenterology & Hepatology",
  "General & Laparoscopic Surgery",
  "Nephrology & Kidney Care",
  "Pulmonology & Chest Medicine",
  "Endocrinology & Diabetes",
  "ENT & Head Neck Surgery",
  "Psychiatry & Mental Health",
  "Ophthalmology (Eye)",
  "Dental Surgery & Orthodontics",
  "Oncology (Cancer)",
];

export default function AddDoctorPage() {
  const router = useRouter();
  const [adminUser, setAdminUser] = useState<any>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "Cardiology",
    qualification: "",
    bmdcNumber: "",
    experience: "10",
    fee: "1200",
    chamberName: "",
    chamberAddress: "",
    availableDays: "Sat,Sun,Mon,Tue,Wed",
    startTime: "16:00",
    endTime: "21:00",
    appointmentDuration: "15",
    maxDailyPatients: "30",
    bio: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentialSlip, setCredentialSlip] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAuthChecking(false);
      return;
    }

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user && data.user.role === "ADMIN") {
          setAdminUser(data.user);
        }
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
      })
      .finally(() => {
        setAuthChecking(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Admin session expired. Please sign in as Admin (Saydul Islam) to register doctors.");
        setLoading(false);
        return;
      }

      // Generate a temporary password if empty
      const tempPass = formData.password.trim() || `doc${Math.floor(100000 + Math.random() * 900000)}`;

      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          fee: Number(formData.fee) || 500,
          experience: Number(formData.experience) || 0,
          appointmentDuration: Number(formData.appointmentDuration) || 15,
          maxDailyPatients: Number(formData.maxDailyPatients) || 30,
          password: tempPass,
          isDemo: false,
          verificationStatus: "VERIFIED",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create doctor account");
      }

      setCredentialSlip({
        name: data.doctor?.user?.name || formData.name,
        email: data.doctor?.user?.email || formData.email,
        temporaryPassword: data.credentials?.temporaryPassword || tempPass,
        specialization: data.doctor?.specialization || formData.specialization,
        bmdcNumber: data.doctor?.bmdcNumber || formData.bmdcNumber || "Verified",
        chamberName: data.doctor?.chamberName || formData.chamberName || "Hospital Consultation Chamber",
      });
    } catch (err: any) {
      setError(err.message || "Failed to create doctor account in database");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!credentialSlip) return;
    const text = `Hospital Doctor Onboarding Credentials:
Name: Dr. ${credentialSlip.name}
Department: ${credentialSlip.specialization}
Portal Login: ${credentialSlip.email}
Initial Password: ${credentialSlip.temporaryPassword}
Login Portal: https://shasthosheba.com/login

Please log in and update your chamber preferences and password in your Doctor Dashboard.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="mb-6">
          <Link
            href="/dashboard/admin"
            className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1.5 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Admin Console
          </Link>
          <h1 className="text-2xl font-black text-slate-900">
            Register New Specialist Doctor
          </h1>
          <p className="text-xs text-slate-500">
            Provision verified physician profile and generate initial portal access credentials
          </p>

          {!authChecking && !adminUser && (
            <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Admin authorization required. Please sign in as <strong>Saydul Islam (Admin)</strong> to add physicians.
                </span>
              </div>
              <Link
                href="/login?role=admin&redirect=/dashboard/admin/doctors/add"
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shrink-0 transition-colors shadow-2xs"
              >
                Sign In as Admin
              </Link>
            </div>
          )}

          {!authChecking && adminUser && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Authorized Admin: {adminUser.name} ({adminUser.email})
            </div>
          )}
        </div>

        {/* Credentials Modal / Receipt Card upon creation */}
        <AnimatePresence>
          {credentialSlip ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Physician Account Provisioned Successfully
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Provide the following access credentials to the doctor. They can immediately log in and access their individual consultation dashboard.
                  </p>
                </div>
              </div>

              {/* Credential Slip Card */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Doctor Name</span>
                  <span className="font-black text-slate-900 text-sm">Dr. {credentialSlip.name}</span>
                </div>

                <div className="flex justify-between border-b border-slate-200 pb-2.5">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Department &amp; BMDC</span>
                  <span className="font-bold text-teal-800">
                    {credentialSlip.specialization} &bull; BMDC: {credentialSlip.bmdcNumber}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-200 pb-2.5 items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Login Email</span>
                  <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                    {credentialSlip.email}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-200 pb-2.5 items-center">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Initial Password</span>
                  <span className="font-mono font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 text-sm">
                    {credentialSlip.temporaryPassword}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-slate-400 font-bold uppercase text-[10px]">Portal Address</span>
                  <span className="text-slate-600 font-medium">/login</span>
                </div>
              </div>

              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-700" /> How does the doctor log in?
                </p>
                <p className="text-[11px] leading-relaxed text-emerald-800">
                  The doctor navigates to the login page (<strong>/login</strong>), enters their registered email and the temporary password above, and immediately enters their private <strong>Doctor Consultation Console</strong>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" /> Credentials Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Doctor Onboarding Notice
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard/admin")}
                  className="py-3 px-6 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all text-center"
                >
                  Return to Doctor Management
                </button>
              </div>
            </motion.div>
          ) : (
            /* Creation Form */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8"
            >
              {error && (
                <div className="mb-6 p-3.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Physician Full Name (e.g. Dr. Mohammad Ali) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Dr. Jahangir Kabir"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Official Email Address (Login ID) *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. dr.kabir@shasthosheba.com"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contact Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+8801711223344"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Medical Department / Specialization *
                    </label>
                    <select
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden font-bold"
                    >
                      {SPECIALIZATIONS.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Degrees &amp; Qualifications *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      placeholder="e.g. MBBS, FCPS (Medicine), MD (Cardiology)"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      BMDC Reg. Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.bmdcNumber}
                      onChange={(e) => setFormData({ ...formData, bmdcNumber: e.target.value })}
                      placeholder="e.g. A-45892"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-bold"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hospital / Chamber Name
                    </label>
                    <input
                      type="text"
                      value={formData.chamberName}
                      onChange={(e) => setFormData({ ...formData, chamberName: e.target.value })}
                      placeholder="e.g. Popular Diagnostic Centre, Dhanmondi"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chamber Address
                    </label>
                    <input
                      type="text"
                      value={formData.chamberAddress}
                      onChange={(e) => setFormData({ ...formData, chamberAddress: e.target.value })}
                      placeholder="e.g. House 16, Road 2, Dhanmondi, Dhaka"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fee (BDT) *
                    </label>
                    <input
                      type="number"
                      step="50"
                      required
                      value={formData.fee}
                      onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chamber Start
                    </label>
                    <select
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    >
                      {TIME_SLOTS_12H.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Chamber End
                    </label>
                    <select
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    >
                      {TIME_SLOTS_12H.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Max Patients / Day
                    </label>
                    <input
                      type="number"
                      value={formData.maxDailyPatients}
                      onChange={(e) => setFormData({ ...formData, maxDailyPatients: e.target.value })}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-bold"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Weekly Visiting Days
                    </label>
                    <input
                      type="text"
                      value={formData.availableDays}
                      onChange={(e) => setFormData({ ...formData, availableDays: e.target.value })}
                      placeholder="e.g. Sat,Sun,Mon,Tue,Wed"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Initial Access Password (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Leave blank to auto-generate"
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Physician Professional Summary / Chamber Details
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="e.g. Senior Consultant Cardiologist at NICVD, specializing in clinical angioplasty and hypertension."
                    className="w-full p-3 text-xs border border-slate-300 rounded-2xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <Link
                    href="/dashboard/admin"
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <ButtonSpinner /> : <UserPlus className="w-4 h-4" />}
                    Create Doctor Account
                  </motion.button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
