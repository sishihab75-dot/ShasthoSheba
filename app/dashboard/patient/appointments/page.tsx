"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  FileText, 
  XCircle, 
  Plus, 
  AlertCircle,
  CheckCircle2,
  Filter
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MedicalLoader, ButtonSpinner } from "@/components/Loader";
import { PrescriptionModal } from "@/components/PrescriptionModal";
import { formatTime } from "@/lib/utils";

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [selectedPrescriptionAppt, setSelectedPrescriptionAppt] = useState<any>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchAppointments(token);
  }, [router]);

  const fetchAppointments = async (token: string) => {
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

  const handleCancelAppointment = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      setCancellingId(id);
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel");
      }

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a))
      );
    } catch (err: any) {
      alert(err.message || "Failed to cancel appointment");
    } finally {
      setCancellingId(null);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
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
          <MedicalLoader label="Loading appointment records..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <Link
              href="/dashboard/patient"
              className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1.5 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-black text-slate-900">
              My Appointments History
            </h1>
            <p className="text-xs text-slate-500">
              Real-time booking and prescription records for your consultations
            </p>
          </div>

          <Link
            href="/book"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Book New Appointment
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {["ALL", "WAITING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === tab
                  ? "bg-emerald-700 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {tab === "ALL" ? `All (${appointments.length})` : tab}
            </button>
          ))}
        </div>

        {/* Appointments List */}
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">
              No appointments found in this category
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Book an appointment with any verified specialist doctor.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
            >
              Book Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appt) => (
              <motion.div
                key={appt.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-emerald-200 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base shrink-0">
                    {appt.doctor?.user?.name?.charAt(0) || "D"}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        Dr. {appt.doctor?.user?.name}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadge(
                          appt.status
                        )}`}
                      >
                        {appt.status}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                        Serial #{appt.serialNo}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                      {appt.doctor?.specialization} - {appt.doctor?.qualification}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-2 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        {appt.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        {formatTime(appt.timeSlot)}
                      </span>
                      <span className="text-slate-700 font-bold">
                        Fee: ৳{appt.doctor?.fee} BDT
                      </span>
                    </div>

                    {appt.symptoms && (
                      <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <strong className="text-slate-700">Symptoms:</strong> {appt.symptoms}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 self-end md:self-center">
                  {appt.prescription && (
                    <button
                      onClick={() => setSelectedPrescriptionAppt(appt)}
                      className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <FileText className="w-4 h-4 text-emerald-600" /> View Prescription
                    </button>
                  )}

                  {appt.status === "WAITING" && (
                    <button
                      disabled={cancellingId === appt.id}
                      onClick={() => handleCancelAppointment(appt.id)}
                      className="px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {cancellingId === appt.id ? (
                        <ButtonSpinner />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      )}
                      Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Prescription Modal */}
      {selectedPrescriptionAppt && (
        <PrescriptionModal
          isOpen={!!selectedPrescriptionAppt}
          onClose={() => setSelectedPrescriptionAppt(null)}
          appointment={selectedPrescriptionAppt}
          isDoctorWriting={false}
        />
      )}
    </div>
  );
}
