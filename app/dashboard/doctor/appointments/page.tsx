"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  ArrowLeft, 
  Check, 
  X,
  Stethoscope
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MedicalLoader, ButtonSpinner } from "@/components/Loader";
import { PrescriptionModal } from "@/components/PrescriptionModal";
import { formatTime } from "@/lib/utils";

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedApptForRx, setSelectedApptForRx] = useState<any>(null);
  const [isWritingRx, setIsWritingRx] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchDoctorAppointments(token);
  }, [router]);

  const fetchDoctorAppointments = async (token: string) => {
    try {
      setLoading(true);
      const res = await fetch("/api/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAppointments(data.appointments || []);
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

  const filtered = appointments.filter((a) => {
    if (filter === "ALL") return true;
    return a.status === filter;
  });

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <MedicalLoader label="Loading consultation records..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/doctor"
            className="text-xs font-semibold text-slate-500 hover:text-teal-700 flex items-center gap-1.5 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Doctor Dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900">
            Consultation Appointments Queue
          </h1>
          <p className="text-xs text-slate-500">
            Complete consultation logs retrieved dynamically for your chamber
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["ALL", "WAITING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === tab
                  ? "bg-teal-700 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab === "ALL" ? `All Consultations (${appointments.length})` : tab}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No patient appointments in this status.
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((appt) => (
              <motion.div
                key={appt.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-teal-200 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-base shrink-0">
                    #{appt.serialNo}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {appt.patient?.user?.name || "Patient"}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadge(
                          appt.status
                        )}`}
                      >
                        {appt.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                      <span>Phone: <strong>{appt.patient?.user?.phone || "N/A"}</strong></span>
                      <span>Age: <strong>{appt.patient?.age || "30"} yrs</strong></span>
                      <span>Blood Group: <strong className="text-rose-600">{appt.patient?.bloodGroup || "O+"}</strong></span>
                      <span>Address: <strong>{appt.patient?.address || "N/A"}</strong></span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        {appt.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        {formatTime(appt.timeSlot)}
                      </span>
                    </div>

                    {appt.symptoms && (
                      <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <strong className="text-slate-800">Symptoms:</strong> {appt.symptoms}
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
                      <Check className="w-3.5 h-3.5" /> Confirm
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
                      <FileText className="w-4 h-4" /> Issue Rx
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
                      <FileText className="w-4 h-4 text-emerald-600" /> View Rx
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Prescription Modal */}
      {selectedApptForRx && (
        <PrescriptionModal
          isOpen={!!selectedApptForRx}
          onClose={() => setSelectedApptForRx(null)}
          appointment={selectedApptForRx}
          isDoctorWriting={isWritingRx}
          onSuccess={() => {
            const token = localStorage.getItem("token");
            if (token) fetchDoctorAppointments(token);
          }}
        />
      )}
    </div>
  );
}
