"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  FileText, 
  Plus, 
  User, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MedicalLoader } from "@/components/Loader";
import { PrescriptionModal } from "@/components/PrescriptionModal";
import { formatTime } from "@/lib/utils";

export default function PatientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescriptionAppt, setSelectedPrescriptionAppt] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "PATIENT") {
        router.push("/login");
        return;
      }
      setUser(parsedUser);
      fetchAppointments(token);
    } catch {
      router.push("/login");
    }
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

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <MedicalLoader label="Loading patient profile and appointments..." />
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter((a) => a.status !== "CANCELLED");
  const prescriptions = appointments.filter((a) => a.prescription);

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold mb-3">
              <Activity className="w-3.5 h-3.5" /> Patient Portal BD
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user.name}
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
              Access real-time appointments, download official doctor prescriptions, and book hospital appointments.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/book"
              className="px-5 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Book Appointment
            </Link>
            <Link
              href="/doctors"
              className="px-5 py-2.5 bg-emerald-600/40 hover:bg-emerald-600/60 border border-white/20 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Stethoscope className="w-4 h-4" /> Browse Doctors
            </Link>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Appointments
                </p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {appointments.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Prescriptions Issued
                </p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {prescriptions.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Registered Role
                </p>
                <p className="text-2xl font-black text-teal-700 mt-1">
                  Patient
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Dynamic Appointments & Prescriptions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Your Health Records & Appointments
              </h2>
              <p className="text-xs text-slate-500">
                Track your consultation queue and download digital prescriptions
              </p>
            </div>
            <Link
              href="/dashboard/patient/appointments"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Full Appointment History <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                No appointments booked yet
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Choose from our verified network of doctors to book your first consultation.
              </p>
              <Link
                href="/book"
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700 transition-colors"
              >
                Book An Appointment
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {appointments.slice(0, 6).map((appt) => (
                <div
                  key={appt.id}
                  className="p-5 sm:px-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {appt.doctor?.user?.name?.charAt(0) || "D"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">
                          Dr. {appt.doctor?.user?.name}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadge(
                            appt.status
                          )}`}
                        >
                          {appt.status}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Serial #{appt.serialNo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 font-medium">
                        {appt.doctor?.specialization} - {appt.doctor?.qualification}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {appt.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatTime(appt.timeSlot)}
                        </span>
                        {appt.symptoms && (
                          <span className="text-slate-600 italic">
                            Symptoms: {appt.symptoms}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {appt.prescription ? (
                      <button
                        onClick={() => setSelectedPrescriptionAppt(appt)}
                        className="px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" /> View Rx
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                        {appt.status === "COMPLETED" ? "No Rx recorded" : "Pending Consultation"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Prescription View Modal */}
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
