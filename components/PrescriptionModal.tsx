"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Stethoscope,
  Building,
  User,
  ShieldCheck
} from "lucide-react";
import { ButtonSpinner } from "./Loader";

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: any;
  isDoctorWriting?: boolean;
  onSuccess?: () => void;
}

export function PrescriptionModal({
  isOpen,
  onClose,
  appointment,
  isDoctorWriting = false,
  onSuccess,
}: PrescriptionModalProps) {
  const [diagnosis, setDiagnosis] = useState(appointment?.prescription?.diagnosis || "");
  const [medicines, setMedicines] = useState(
    appointment?.prescription?.medicines ||
      "1. Tab. Bisoprolol 2.5mg | 1+0+0 | 30 Days | Morning after breakfast\n2. Tab. Amlodipine 5mg | 0+0+1 | 30 Days | Night after dinner\n3. Tab. Aspirin 75mg | 0+1+0 | 30 Days | After lunch"
  );
  const [advice, setAdvice] = useState(
    appointment?.prescription?.advice ||
      "1. Strict low-salt diet (<2g sodium per day).\n2. 30 minutes daily brisk walking.\n3. Maintain blood pressure log daily in morning and evening."
  );
  const [nextVisit, setNextVisit] = useState(appointment?.prescription?.nextVisit || "After 30 days");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !appointment) return null;

  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId: appointment.id,
          diagnosis,
          medicines,
          advice,
          nextVisit,
          markCompleted: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save prescription");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create prescription");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const doctorName = appointment.doctor?.user?.name || "Dr. Medical Specialist";
  const doctorSpec = appointment.doctor?.specialization || "General Medicine";
  const doctorQual = appointment.doctor?.qualification || "MBBS";
  const doctorBmdc = appointment.doctor?.bmdcNumber || "Reg. Verified";
  const chamberName = appointment.doctor?.chamberName || "ShasthoSheba Diagnostic & Consultation Chamber";
  const chamberAddress = appointment.doctor?.chamberAddress || "Dhaka, Bangladesh";

  const patientName = appointment.patient?.user?.name || "Patient";
  const patientPhone = appointment.patient?.user?.phone || "N/A";
  const patientAge = appointment.patient?.age || "30";
  const patientGender = appointment.patient?.gender || "N/A";
  const patientBlood = appointment.patient?.bloodGroup || "N/A";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        >
          {/* Header Bar */}
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {isDoctorWriting ? "Clinical Prescription Writer" : "Digital Medical Prescription (Rx)"}
                </h2>
                <p className="text-[10px] text-slate-500">
                  Official Bangladesh Medical Consultation Document
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isDoctorWriting && appointment.prescription && (
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-600" /> Print / PDF
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Body */}
          <div className="p-6 sm:p-8 overflow-y-auto print:p-8 flex-1 space-y-6">
            {error && (
              <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Doctor & Clinic Pad Header */}
            <div className="border-b-2 border-emerald-600 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900">{doctorName}</h3>
                </div>
                <p className="text-xs font-bold text-emerald-700 mt-0.5">{doctorSpec}</p>
                <p className="text-xs text-slate-600 font-medium">{doctorQual}</p>
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> BMDC Reg: <strong>{doctorBmdc}</strong>
                </p>
              </div>

              <div className="sm:text-right text-xs space-y-0.5">
                <div className="font-bold text-slate-900 text-sm flex items-center sm:justify-end gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-600" /> {chamberName}
                </div>
                <div className="text-slate-500 text-[11px]">{chamberAddress}</div>
                <div className="text-slate-500 text-[11px]">
                  Date: <strong>{appointment.date}</strong> | Slot: <strong>{appointment.timeSlot}</strong>
                </div>
                <div className="text-xs font-extrabold text-emerald-700">
                  Appointment Serial: #{appointment.serialNo}
                </div>
              </div>
            </div>

            {/* Patient Vitals Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Patient Name</span>
                <span className="font-black text-slate-900">{patientName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Age / Gender</span>
                <span className="font-semibold">{patientAge} Yrs / {patientGender}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Blood Group</span>
                <span className="font-bold text-rose-600">{patientBlood}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Phone</span>
                <span className="font-semibold">{patientPhone}</span>
              </div>
            </div>

            {/* Doctor Form Mode */}
            {isDoctorWriting ? (
              <form onSubmit={handleSavePrescription} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Clinical Diagnosis / Findings *
                  </label>
                  <input
                    type="text"
                    required
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    placeholder="e.g. Essential Hypertension Stage 1 / Acute Pharyngitis"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-semibold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Rx - Medications (Medicine | Dosage | Duration | Instructions) *
                    </label>
                    <span className="text-[10px] text-slate-400">One medication per line</span>
                  </div>
                  <textarea
                    rows={5}
                    required
                    value={medicines}
                    onChange={(e) => setMedicines(e.target.value)}
                    placeholder="Tab. Bisoprolol 2.5mg | 1+0+0 | 30 Days | Morning after breakfast"
                    className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden bg-slate-50/50 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Physician Advice &amp; Dietary Guidelines
                  </label>
                  <textarea
                    rows={3}
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    placeholder="1. Low salt diet. 2. 30 min daily walking..."
                    className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Next Follow-up Consultation
                  </label>
                  <input
                    type="text"
                    value={nextVisit}
                    onChange={(e) => setNextVisit(e.target.value)}
                    placeholder="e.g. After 14 days with Blood Pressure chart"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden font-medium"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-60"
                  >
                    {submitting ? <ButtonSpinner /> : <CheckCircle2 className="w-4 h-4" />}
                    Save &amp; Complete Consultation
                  </button>
                </div>
              </form>
            ) : appointment.prescription ? (
              /* View / Print Mode */
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Clinical Diagnosis
                  </span>
                  <div className="text-sm font-bold text-slate-900 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 mt-1">
                    {appointment.prescription.diagnosis}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-serif font-black text-2xl text-emerald-700 mb-2">
                    <span>Rx</span>
                    <span className="font-sans text-xs font-normal text-slate-400">
                      (Prescribed Medications)
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 whitespace-pre-line text-xs font-bold text-slate-800 font-mono">
                    {appointment.prescription.medicines}
                  </div>
                </div>

                {appointment.prescription.advice && (
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Physician's Advice
                    </span>
                    <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-950 mt-1 whitespace-pre-line leading-relaxed">
                      {appointment.prescription.advice}
                    </div>
                  </div>
                )}

                {appointment.prescription.nextVisit && (
                  <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>Next Follow-up Visit:</strong> {appointment.prescription.nextVisit}
                    </span>
                  </div>
                )}

                {/* Signatory Footer */}
                <div className="pt-10 flex justify-end">
                  <div className="text-center border-t border-slate-400 pt-2 min-w-[200px]">
                    <div className="text-xs font-bold text-slate-900">{doctorName}</div>
                    <div className="text-[10px] text-slate-500 font-medium">BMDC: {doctorBmdc}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                No prescription record has been issued for this appointment yet.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
