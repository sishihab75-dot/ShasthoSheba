"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Stethoscope, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  HeartPulse, 
  Users, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  FileText,
  UserCheck
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

const SPECIALTIES = [
  { name: "Cardiology", desc: "Heart & Vascular Care", icon: HeartPulse, color: "text-rose-600 bg-rose-50" },
  { name: "Neurology", desc: "Brain & Nervous System", icon: Activity, color: "text-purple-600 bg-purple-50" },
  { name: "Pediatrics", desc: "Infant & Child Health", icon: Users, color: "text-blue-600 bg-blue-50" },
  { name: "Gynecology", desc: "Women & Maternal Health", icon: ShieldCheck, color: "text-pink-600 bg-pink-50" },
  { name: "Orthopedics", desc: "Bones, Joints & Spine", icon: Award, color: "text-amber-600 bg-amber-50" },
  { name: "Internal Medicine", desc: "Complex Adult Care", icon: Stethoscope, color: "text-emerald-600 bg-emerald-50" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col antialiased">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-emerald-50/60 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left Col */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                Verified Specialist Doctors &bull; Bangladesh
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Smart Healthcare &amp; Doctor Appointments,{" "}
                <span className="text-emerald-600">Simplified.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Connect directly with certified specialist doctors across Bangladesh. Book real serials, avoid clinic waiting lines, and receive authentic digital prescriptions.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/doctors"
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2"
                >
                  <Stethoscope className="w-4 h-4" /> Find a Doctor Now
                </Link>

                <Link
                  href="/book"
                  className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-xl border border-slate-300 shadow-2xs transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-emerald-600" /> Book Consultation
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 text-xs">
                <div>
                  <div className="font-black text-slate-900 text-lg sm:text-xl">17+</div>
                  <div className="text-slate-500 font-medium">Specialist Doctors</div>
                </div>
                <div>
                  <div className="font-black text-emerald-600 text-lg sm:text-xl">100% Verified</div>
                  <div className="text-slate-500 font-medium">Authentic Profiles</div>
                </div>
                <div>
                  <div className="font-black text-teal-700 text-lg sm:text-xl">3 Roles</div>
                  <div className="text-slate-500 font-medium">Patient, Doctor, Admin</div>
                </div>
              </div>
            </motion.div>

            {/* Right Col: Interactive Visual Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="relative mx-auto max-w-md">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-20" />
                
                <div className="relative bg-white rounded-3xl border border-slate-200/80 shadow-2xl p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        H
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Prof. Dr. M. A. Hashem</div>
                        <div className="text-[11px] text-emerald-600 font-semibold">Cardiology Specialist</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Qualifications:</span>
                      <span className="font-bold text-slate-900">MBBS, FCPS, MD, FACC</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Experience:</span>
                      <span className="font-bold text-slate-900">22+ Years</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Consultation Fee:</span>
                      <span className="font-bold text-emerald-700">৳1,500 BDT</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Live Queue:</span>
                      <span className="font-bold text-blue-600">Serial #4 (Active)</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" /> Digital Prescription
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                        Issued
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Rx: Tab. Bisoprolol 2.5mg (1+0+0) - 30 Days
                    </p>
                  </div>

                  <Link
                    href="/book"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    Experience Live Booking <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3 Roles Showcase */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Unified Platform
            </h2>
            <h3 className="text-3xl font-black text-slate-900 mt-1">
              Engineered For 3 Core User Roles
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Every role has specialized features connected to real-time clinical workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Patient Role */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Patient Role</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Browse doctors by specialty, book guaranteed appointment serials, track consultation status, and download digital prescriptions.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Instant dynamic serial generation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> View medical history &amp; Rx
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Cancel waiting appointments
                  </li>
                </ul>
              </div>

              <Link
                href="/dashboard/patient"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800"
              >
                Go to Patient Portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Doctor Role */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-6">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Doctor Role</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Manage patient consultation queues, review patient symptoms and vitals, confirm visits, and issue clinical prescriptions.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Live patient queue management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Built-in Rx digital prescription editor
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Chamber schedule management
                  </li>
                </ul>
              </div>

              <Link
                href="/dashboard/doctor"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
              >
                Go to Doctor Console <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Admin Role */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Admin Role</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Full administrative oversight: add new doctors, audit platform analytics, view all appointments, and manage system users.
                </p>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Register and delete doctors
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real-time clinical metrics aggregation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> System-wide consultation audit
                  </li>
                </ul>
              </div>

              <Link
                href="/dashboard/admin"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-800"
              >
                Go to Admin Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Medical Specialties */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                Comprehensive Care
              </h2>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                Explore Clinical Departments
              </h3>
            </div>
            <Link
              href="/doctors"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View All 17+ Specialists <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {SPECIALTIES.map((spec) => {
              const Icon = spec.icon;
              return (
                <Link
                  key={spec.name}
                  href={`/doctors?specialization=${encodeURIComponent(spec.name)}`}
                  className="p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all text-center group bg-white"
                >
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${spec.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {spec.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {spec.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-white">
              Shastho<span className="text-emerald-400">Sheba</span>
            </span>
          </div>

          <p className="text-slate-500 text-center sm:text-left">
            &copy; 2026 ShasthoSheba BD. All health services certified under clinical standards.
          </p>

          <div className="flex items-center gap-4 text-slate-400 font-semibold">
            <Link href="/doctors" className="hover:text-white transition-colors">Doctors</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
