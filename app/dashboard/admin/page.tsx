"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  UserPlus, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  FileText, 
  Activity, 
  RefreshCw,
  Search,
  KeyRound,
  X,
  Copy,
  Check
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MedicalLoader, ButtonSpinner } from "@/components/Loader";
import { formatTime } from "@/lib/utils";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"doctors" | "appointments" | "audit">("doctors");
  const [doctorSearch, setDoctorSearch] = useState("");

  // Modal to inspect doctor access credentials
  const [inspectDoctor, setInspectDoctor] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "ADMIN") {
        router.push("/login");
        return;
      }
      setUser(parsedUser);
      fetchAdminData(token);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const fetchAdminData = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data.stats);
      setRecentAppointments(data.recentAppointments || []);
      setDoctors(data.doctors || []);
      setAuditLogs(data.recentAuditLogs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorAction = async (doctorId: string, action: "APPROVE" | "REJECT" | "SUSPEND" | "REACTIVATE") => {
    try {
      setActionLoadingId(doctorId);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/doctors/${doctorId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Action failed");
      }

      if (token) fetchAdminData(token);
    } catch (err: any) {
      alert(err.message || "Failed to process doctor action");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteDoctor = async (doctorId: string, name: string) => {
    if (!confirm(`Are you sure you want to completely remove ${name}'s profile and account?`)) {
      return;
    }

    try {
      setActionLoadingId(doctorId);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/doctors/${doctorId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      setDoctors((prev) => prev.filter((d) => d.id !== doctorId));
    } catch (err: any) {
      alert(err.message || "Delete failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const term = doctorSearch.toLowerCase();
    return (
      doc.user?.name.toLowerCase().includes(term) ||
      doc.specialization.toLowerCase().includes(term) ||
      (doc.bmdcNumber && doc.bmdcNumber.toLowerCase().includes(term))
    );
  });

  const handleCopyOnboardingNote = (doc: any) => {
    const note = `Doctor Portal Access Details:
Physician: Dr. ${doc.user?.name}
Department: ${doc.specialization}
BMDC Reg: ${doc.bmdcNumber || "Verified"}
Login Email: ${doc.user?.email}
Portal Link: https://shasthosheba.com/login

Log in to access your patient queue, confirm appointments, and issue digital prescriptions.`;

    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <MedicalLoader label="Loading hospital management analytics..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Administrative Master Console
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Administration: {user?.name || "Saydul Islam"}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              Real-time clinical operations: audit consultations, verify doctor credentials, and supervise hospital activities.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/admin/doctors/add"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Add Specialist Doctor
            </Link>
            <button
              onClick={() => {
                const token = localStorage.getItem("token");
                if (token) fetchAdminData(token);
              }}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
            </button>
          </div>
        </motion.div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Doctors
                </p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {stats?.totalDoctors || 0}
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  {stats?.verifiedDoctors || 0} Verified &bull; {stats?.pendingDoctorApplications || 0} Pending
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Registered Patients
                </p>
                <p className="text-2xl font-black text-blue-600 mt-1">
                  {stats?.totalPatients || 0}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Verified Patient Records
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Total Bookings
                </p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {stats?.totalAppointments || 0}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {stats?.todayAppointments || 0} Scheduled Today
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Prescriptions Issued
                </p>
                <p className="text-2xl font-black text-teal-700 mt-1">
                  {stats?.totalPrescriptions || 0}
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                  {stats?.completedAppointments || 0} Consultations Done
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-bold text-slate-500">
          <button
            onClick={() => setActiveTab("doctors")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "doctors"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent hover:text-slate-800"
            }`}
          >
            <Stethoscope className="w-4 h-4" /> Doctor Management ({doctors.length})
          </button>

          <button
            onClick={() => setActiveTab("appointments")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "appointments"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent hover:text-slate-800"
            }`}
          >
            <Calendar className="w-4 h-4" /> Platform Appointments ({recentAppointments.length})
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "audit"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent hover:text-slate-800"
            }`}
          >
            <Activity className="w-4 h-4" /> Audit Logs ({auditLogs.length})
          </button>
        </div>

        {/* Tab 1: Doctors Management */}
        {activeTab === "doctors" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  placeholder="Filter by name, BMDC, or department..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <Link
                href="/dashboard/admin/doctors/add"
                className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5" /> Register Specialist Doctor
              </Link>
            </div>

            {filteredDoctors.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No doctor records matching your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Physician</th>
                      <th className="px-4 py-3">Department &amp; BMDC</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Fee / Hours</th>
                      <th className="px-4 py-3">Bookings</th>
                      <th className="px-4 py-3 text-right">Verification &amp; Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredDoctors.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{doc.user?.name}</div>
                          <div className="text-[11px] text-slate-400">{doc.user?.email}</div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md text-[11px]">
                            {doc.specialization}
                          </span>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            BMDC: <strong>{doc.bmdcNumber || "Verified"}</strong>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                              doc.verificationStatus === "VERIFIED"
                                ? "bg-emerald-100 text-emerald-800"
                                : doc.verificationStatus === "PENDING"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}>
                              {doc.verificationStatus}
                            </span>
                            {doc.accountStatus === "SUSPENDED" && (
                              <span className="px-2 py-0.2 bg-rose-50 text-rose-700 text-[9px] font-bold rounded">
                                SUSPENDED
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">৳{doc.fee} BDT</div>
                          <div className="text-[11px] text-slate-400">
                            {formatTime(doc.startTime)} - {formatTime(doc.endTime)}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full font-bold">
                            {doc._count?.appointments || 0}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectDoctor(doc)}
                              className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="View Onboarding Access Info"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {doc.verificationStatus === "PENDING" && (
                              <button
                                disabled={actionLoadingId === doc.id}
                                onClick={() => handleDoctorAction(doc.id, "APPROVE")}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                              >
                                Approve
                              </button>
                            )}

                            {doc.accountStatus === "ACTIVE" ? (
                              <button
                                disabled={actionLoadingId === doc.id}
                                onClick={() => handleDoctorAction(doc.id, "SUSPEND")}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold rounded-lg transition-colors"
                                title="Suspend Consultation Privileges"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                disabled={actionLoadingId === doc.id}
                                onClick={() => handleDoctorAction(doc.id, "REACTIVATE")}
                                className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold rounded-lg transition-colors"
                              >
                                Reactivate
                              </button>
                            )}

                            <button
                              disabled={actionLoadingId === doc.id}
                              onClick={() => handleDeleteDoctor(doc.id, doc.user?.name)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Doctor Profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Recent Appointments */}
        {activeTab === "appointments" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
            {recentAppointments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No appointment records found.
              </div>
            ) : (
              recentAppointments.map((appt) => (
                <div key={appt.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        Patient: {appt.patient?.user?.name || "Patient"}
                      </span>
                      <span className="text-slate-400 text-xs">➔</span>
                      <span className="font-bold text-teal-800 text-sm">
                        Dr. {appt.doctor?.user?.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                        Serial #{appt.serialNo}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
                      <span>Date: <strong>{appt.date}</strong></span>
                      <span>Time: <strong>{formatTime(appt.timeSlot)}</strong></span>
                      <span>Status: <strong className="text-emerald-700">{appt.status}</strong></span>
                      {appt.symptoms && (
                        <span className="italic text-slate-600">Symptoms: {appt.symptoms}</span>
                      )}
                    </div>
                  </div>

                  {appt.prescription && (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
                      Prescription Recorded
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Audit Logs */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No audit events logged yet.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                      <span className="text-slate-500">
                        by <strong>{log.actor?.name || "System"}</strong> ({log.actorRole})
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-slate-600 text-[11px] mt-1 font-medium">{log.details}</p>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Inspect Doctor Credentials & Onboarding Slip Modal */}
      {inspectDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Physician Onboarding &amp; Access</h3>
              </div>
              <button
                onClick={() => setInspectDoctor(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-400">Physician:</span>
                <span className="font-bold text-slate-900">{inspectDoctor.user?.name}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-400">Department:</span>
                <span className="font-semibold text-teal-800">{inspectDoctor.specialization}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-400">BMDC Number:</span>
                <span className="font-mono font-bold text-slate-800">{inspectDoctor.bmdcNumber || "Verified"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-400">Login Email:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {inspectDoctor.user?.email}
                </span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Portal Address:</span>
                <span className="font-semibold text-emerald-700">/login</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              The physician accesses the platform at <strong>/login</strong> using this email. You can copy the onboarding notice below to deliver to Dr. {inspectDoctor.user?.name}.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleCopyOnboardingNote(inspectDoctor)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied Onboarding Note!" : "Copy Onboarding Instructions"}
              </button>
              <button
                onClick={() => setInspectDoctor(null)}
                className="px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
