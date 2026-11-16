"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Stethoscope, 
  ShieldCheck, 
  Building,
  MapPin,
  CalendarOff
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MedicalLoader, ButtonSpinner } from "@/components/Loader";
import { formatTime } from "@/lib/utils";

function BookContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const doctorIdParam = searchParams.get("doctorId");

  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctorIdParam || "");
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Form State
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [timeSlot, setTimeSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [successBooking, setSuccessBooking] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
    }

    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctor(true);
      const res = await fetch("/api/doctors");
      const data = await res.json();
      const docs = data.doctors || [];
      setDoctors(docs);

      if (doctorIdParam) {
        setSelectedDoctorId(doctorIdParam);
      } else if (docs.length > 0) {
        setSelectedDoctorId(docs[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDoctor(false);
    }
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  // Generate dynamic chamber slots based on startTime, endTime & appointmentDuration
  const availableSlots = (() => {
    if (!selectedDoctor) return [];
    const [startH, startM] = (selectedDoctor.startTime || "16:00").split(":").map(Number);
    const [endH, endM] = (selectedDoctor.endTime || "21:00").split(":").map(Number);
    const step = selectedDoctor.appointmentDuration || 15;

    const startTotalMin = startH * 60 + startM;
    const endTotalMin = endH * 60 + endM;

    const slots: string[] = [];
    for (let m = startTotalMin; m < endTotalMin; m += step) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`);
    }
    return slots;
  })();

  useEffect(() => {
    if (availableSlots.length > 0 && (!timeSlot || !availableSlots.includes(timeSlot))) {
      setTimeSlot(availableSlots[0]);
    }
  }, [selectedDoctorId, availableSlots.length]);

  // Check if selected date is on leave
  const isDoctorOnLeave = selectedDoctor?.leaves?.some((l: any) => l.date === date);

  // Check if selected date matches chamber available days
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const selectedDayName = dayNames[new Date(date).getDay()];
  const isDayAvailable = selectedDoctor?.availableDays
    ? selectedDoctor.availableDays.split(",").map((d: string) => d.trim()).includes(selectedDayName)
    : true;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      router.push(`/login?redirect=/book?doctorId=${selectedDoctorId}`);
      return;
    }

    if (!selectedDoctorId || !date || !timeSlot) {
      setError("Please choose doctor, date, and preferred time slot.");
      return;
    }

    if (isDoctorOnLeave) {
      setError(`Dr. ${selectedDoctor?.user?.name} is on leave on ${date}. Please select another date.`);
      return;
    }

    if (!isDayAvailable) {
      setError(`${selectedDayName} is not a chamber day for Dr. ${selectedDoctor?.user?.name}. Available days: (${selectedDoctor?.availableDays})`);
      return;
    }

    try {
      setBookingLoading(true);
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          date,
          timeSlot,
          symptoms,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }

      setSuccessBooking(data.appointment);
    } catch (err: any) {
      setError(err.message || "Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loadingDoctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <MedicalLoader label="Checking physician schedule and real-time availability..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/doctors"
            className="text-xs font-semibold text-slate-500 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Doctor Directory
          </Link>
          <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Real-time Slot Protection
          </span>
        </div>

        <AnimatePresence mode="wait">
          {successBooking ? (
            /* Success confirmation card */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center max-w-lg mx-auto"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">
                Appointment Registered!
              </h2>
              <p className="text-xs text-slate-500 mb-6">
                Your consultation serial has been reserved and confirmed with the hospital chamber.
              </p>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-2.5 text-xs text-slate-700 mb-6">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-400">Physician</span>
                  <span className="font-bold text-slate-900">
                    {successBooking.doctor?.user?.name || selectedDoctor?.user?.name}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-400">Dynamic Serial Number</span>
                  <span className="font-black text-emerald-700 text-sm">
                    #{successBooking.serialNo}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-400">Date</span>
                  <span className="font-semibold text-slate-800">{successBooking.date}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-400">Time Slot</span>
                  <span className="font-semibold text-slate-800">
                    {formatTime(successBooking.timeSlot)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Consultation Status</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                    {successBooking.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard/patient/appointments"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm text-center"
                >
                  View My Appointments
                </Link>
                <Link
                  href="/doctors"
                  className="flex-1 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all text-center"
                >
                  Browse Other Doctors
                </Link>
              </div>
            </motion.div>
          ) : (
            /* Booking Form */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid md:grid-cols-3 gap-8"
            >
              {/* Doctor Details Column */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-600" /> Physician Details
                  </h3>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Choose Specialist
                    </label>
                    <select
                      value={selectedDoctorId}
                      onChange={(e) => setSelectedDoctorId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    >
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.user.name} ({doc.specialization})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedDoctor && (
                    <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                          {selectedDoctor.user.name}
                        </div>
                        <div className="text-emerald-700 font-bold text-xs mt-0.5">
                          {selectedDoctor.specialization}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {selectedDoctor.qualification}
                        </div>
                        {selectedDoctor.bmdcNumber && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            BMDC: {selectedDoctor.bmdcNumber}
                          </div>
                        )}
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-[11px] text-slate-600">
                        {selectedDoctor.chamberName && (
                          <div className="flex items-start gap-1.5">
                            <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-slate-800 block">{selectedDoctor.chamberName}</strong>
                              <span className="text-[10px] text-slate-400">{selectedDoctor.chamberAddress}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between pt-1 border-t border-slate-200">
                          <span className="text-slate-400">Available Days:</span>
                          <span className="font-bold text-slate-800">{selectedDoctor.availableDays}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Chamber Hours:</span>
                          <span className="font-bold text-slate-800">
                            {formatTime(selectedDoctor.startTime)} - {formatTime(selectedDoctor.endTime)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Slot Duration:</span>
                          <span className="font-bold text-slate-800">{selectedDoctor.appointmentDuration || 15} mins</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-slate-200">
                          <span className="font-bold text-slate-700">Fee (BDT):</span>
                          <span className="font-black text-emerald-700 text-xs">
                            ৳{selectedDoctor.fee}
                          </span>
                        </div>
                      </div>

                      {selectedDoctor.bio && (
                        <p className="text-[11px] text-slate-500 italic bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                          "{selectedDoctor.bio}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Form Column */}
              <div className="md:col-span-2">
                <form
                  onSubmit={handleBooking}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
                >
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      Select Appointment Schedule
                    </h2>
                    <p className="text-xs text-slate-500">
                      Live slot availability verified against doctor's schedule &amp; leaves
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  {/* Leave Warning */}
                  {isDoctorOnLeave && (
                    <div className="p-3 text-xs bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-center gap-2">
                      <CalendarOff className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Notice: <strong>Dr. {selectedDoctor?.user?.name}</strong> has declared official leave on this date. Please pick another date.
                      </span>
                    </div>
                  )}

                  {/* Day Availability Notice */}
                  {!isDayAvailable && (
                    <div className="p-3 text-xs bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>
                        Notice: {selectedDayName} is not a regular chamber day for this doctor.
                      </span>
                    </div>
                  )}

                  {/* Date Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <CalendarIcon className="w-4 h-4 text-emerald-600" />
                      Select Appointment Date *
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-bold"
                    />
                  </div>

                  {/* Dynamic Time Slots */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      Chamber Time Slot *
                    </label>
                    {availableSlots.length === 0 ? (
                      <p className="text-xs text-slate-400">No slots available for this doctor schedule.</p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            disabled={isDoctorOnLeave || !isDayAvailable}
                            onClick={() => setTimeSlot(slot)}
                            className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all disabled:opacity-30 ${
                              timeSlot === slot
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                            }`}
                          >
                            {formatTime(slot)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Symptoms Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Primary Health Symptoms / Reason for Visit *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="e.g. Chest discomfort during physical exertion, persistent dry cough, or joint stiffness..."
                      className="w-full p-3 text-xs border border-slate-300 rounded-2xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                    />
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Special Notes / Past Medical History (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Diabetic for 5 years, previous ECG report available"
                      className="w-full p-2.5 text-xs border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>

                  {/* Submit Bar */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-500">
                      Total Consultation Fee:{" "}
                      <span className="font-black text-slate-900 text-sm">
                        ৳{selectedDoctor?.fee || 500} BDT
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={bookingLoading || isDoctorOnLeave || !isDayAvailable}
                      className="w-full sm:w-auto px-7 py-3 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {bookingLoading ? (
                        <>
                          <ButtonSpinner /> Generating Serial Number...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Confirm &amp; Reserve Serial
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<MedicalLoader label="Loading booking console..." />}>
      <BookContent />
    </Suspense>
  );
}
