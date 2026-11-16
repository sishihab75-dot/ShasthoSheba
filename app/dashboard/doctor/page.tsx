"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Stethoscope, 
  Check, 
  Plus, 
  Trash2, 
  CalendarOff,
  Building,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MedicalLoader, ButtonSpinner } from "@/components/Loader";
import { PrescriptionModal } from "@/components/PrescriptionModal";
import { formatTime } from "@/lib/utils";

export default function DoctorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApptForRx, setSelectedApptForRx] = useState<any>(null);
  const [isWritingRx, setIsWritingRx] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"queue" | "leaves">("queue");

  // Leave Form
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "DOCTOR") {
        router.push("/login");
        return;
      }
      setUser(parsedUser);
      fetchDoctorData(token);
    } catch {
      router.push("/login");
    }
  }, [router]);

  const fetchDoctorData = async (token: string) => {
    try {
      setLoading(true);
      const [apptRes, leaveRes] = await Promise.all([
        fetch("/api/appointments", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/doctor/leaves", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const apptData = await apptRes.json();
      const leaveData = await leaveRes.json();

      setAppointments(apptData.appointments || []);
      setLeaves(leaveData.leaves || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    try {
      setActionLoadingId(appointmentId);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      setAppointments((prev) =>
        prev.map((a) => (a.id === appointmentId ? { ...a, status } : a))
      );
    } catch (err: any) {
      alert(err.message || "Failed to update appointment");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAddLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveDate) return;

    try {
      setLeaveSubmitting(true);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/doctor/leaves", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: leaveDate, reason: leaveReason }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to declare leave");
      }

      setLeaves((prev) => [...prev, data.leave]);
      setLeaveDate("");
      setLeaveReason("");
    } catch (err: any) {
      alert(err.message || "Failed to save leave date");
    } finally {
      setLeaveSubmitting(false);
    }
  };

  const handleDeleteLeave = async (leaveId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/doctor/leaves?id=${leaveId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete leave");
      }

      setLeaves((prev) => prev.filter((l) => l.id !== leaveId));
    } catch (err: any) {
      alert(err.message || "Delete leave failed");
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <MedicalLoader label="Retrieving individual physician consultation console..." />
        </div>
      </div>
    );
  }

  const waitingList = appointments.filter((a) => a.status === "WAITING");
  const confirmedList = appointments.filter((a) => a.status === "CONFIRMED");
  const completedList = appointments.filter((a) => a.status === "COMPLETED");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "WAITING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-teal-100 text-xs font-semibold mb-3">
              <Stethoscope className="w-3.5 h-3.5" /> Certified Practitioner Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {user.name}
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-xl">
              Strictly isolated consultation workspace. Only your assigned patients and consultation history are accessible.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-xs space-y-1">
            <div className="text-teal-200 uppercase font-bold text-[10px]">Session Status</div>
            <div className="font-bold text-white text-sm">{user.email}</div>
            <div className="text-teal-200 text-[11px]">
              Profile ID: <span className="font-mono">{user.doctorId || "Connected"}</span>
            </div>
          </div>
        </motion.div>

        {/* Live Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Assigned Patients
                </p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {appointments.length}
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
                  Waiting Queue
                </p>
                <p className="text-2xl font-black text-amber-600 mt-1">
                  {waitingList.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Confirmed
                </p>
                <p className="text-2xl font-black text-blue-600 mt-1">
                  {confirmedList.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Consulted &amp; Rx Done
                </p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {completedList.length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 gap-6 text-xs font-bold text-slate-500">
          <button
            onClick={() => setActiveTab("queue")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "queue"
                ? "border-teal-600 text-teal-800"
                : "border-transparent hover:text-slate-800"
            }`}
          >
            <Users className="w-4 h-4" /> Patient Queue &amp; Consultations ({appointments.length})
          </button>

          <button
            onClick={() => setActiveTab("leaves")}
            className={`pb-3 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "leaves"
                ? "border-teal-600 text-teal-800"
                : "border-transparent hover:text-slate-800"
            }`}
          >
            <CalendarOff className="w-4 h-4" /> Chamber Leaves &amp; Unavailability ({leaves.length})
          </button>
        </div>

        {/* Tab 1: Queue */}
        {activeTab === "queue" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Patient Consultation Queue
                </h2>
                <p className="text-xs text-slate-500">
                  Dynamically queried appointments booked with your profile
                </p>
              </div>
              <button
                onClick={() => {
                  const token = localStorage.getItem("token");
                  if (token) fetchDoctorData(token);
                }}
                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <Users className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No patients currently queued.</p>
                <p className="text-xs text-slate-400 mt-1">
                  When patients book an appointment for your chamber, they will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-5 sm:px-6 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-900 flex items-center justify-center font-black text-sm shrink-0">
                        #{appt.serialNo}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">
                            {appt.patient?.user?.name || "Patient"}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadge(
                              appt.status
                            )}`}
                          >
                            {appt.status}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                          <span>Phone: <strong>{appt.patient?.user?.phone || "N/A"}</strong></span>
                          <span>Age/Gender: <strong>{appt.patient?.age || "N/A"} Yrs / {appt.patient?.gender || "N/A"}</strong></span>
                          <span>Blood Group: <strong className="text-rose-600">{appt.patient?.bloodGroup || "N/A"}</strong></span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-teal-600" />
                            {appt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-teal-600" />
                            {formatTime(appt.timeSlot)}
                          </span>
                        </div>

                        {appt.symptoms && (
                          <p className="text-xs text-slate-700 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <strong>Symptoms:</strong> {appt.symptoms}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                      {appt.status === "WAITING" && (
                        <button
                          disabled={actionLoadingId === appt.id}
                          onClick={() => handleUpdateStatus(appt.id, "CONFIRMED")}
                          className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl flex items-center gap-1 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" /> Confirm Patient
                        </button>
                      )}

                      {appt.status !== "COMPLETED" && (
                        <button
                          onClick={() => {
                            setSelectedApptForRx(appt);
                            setIsWritingRx(true);
                          }}
                          className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" /> Issue Rx &amp; Complete
                        </button>
                      )}

                      {appt.prescription && (
                        <button
                          onClick={() => {
                            setSelectedApptForRx(appt);
                            setIsWritingRx(false);
                          }}
                          className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" /> View Rx
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Leaves Management */}
        {activeTab === "leaves" && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs md:col-span-1">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <CalendarOff className="w-4 h-4 text-rose-600" /> Declare Leave Date
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Patients will be automatically prevented from booking appointments on these dates.
              </p>

              <form onSubmit={handleAddLeave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Select Leave Date *
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={leaveDate}
                    onChange={(e) => setLeaveDate(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal-500 outline-hidden font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="e.g. Attending Medical Symposium"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-teal-500 outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={leaveSubmitting}
                  className="w-full py-2.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {leaveSubmitting ? <ButtonSpinner /> : <Plus className="w-4 h-4" />}
                  Register Unavailable Date
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs md:col-span-2 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">
                  Scheduled Leave &amp; Holidays ({leaves.length})
                </h3>
              </div>

              {leaves.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  No upcoming leave dates registered. You are fully available per your weekly schedule.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {leaves.map((leave) => (
                    <div key={leave.id} className="p-4 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-rose-600" />
                          {leave.date}
                        </div>
                        {leave.reason && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{leave.reason}</div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteLeave(leave.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Remove leave"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Prescription Modal (Write or View) */}
      {selectedApptForRx && (
        <PrescriptionModal
          isOpen={!!selectedApptForRx}
          onClose={() => setSelectedApptForRx(null)}
          appointment={selectedApptForRx}
          isDoctorWriting={isWritingRx}
          onSuccess={() => {
            const token = localStorage.getItem("token");
            if (token) fetchDoctorData(token);
          }}
        />
      )}
    </div>
  );
}
