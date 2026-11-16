"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Stethoscope, 
  Clock, 
  Award, 
  Calendar, 
  Filter, 
  Building,
  ChevronRight,
  ShieldCheck 
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { MedicalLoader, SkeletonCard } from "@/components/Loader";
import { formatTime } from "@/lib/utils";

interface Doctor {
  id: string;
  title: string;
  specialization: string;
  qualification: string;
  bmdcNumber: string | null;
  experience: number;
  fee: number;
  chamberName: string | null;
  chamberAddress: string | null;
  availableDays: string;
  startTime: string;
  endTime: string;
  bio: string | null;
  isDemo: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

function DoctorsDirectoryContent() {
  const searchParams = useSearchParams();
  const initialSpec = searchParams.get("specialization") || "all";

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSpec, setSelectedSpec] = useState(initialSpec);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/doctors");
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    "all",
    ...Array.from(new Set(doctors.map((d) => d.specialization))),
  ];

  const filteredDoctors = doctors.filter((doctor) => {
    const term = search.toLowerCase();
    const matchesSearch =
      doctor.user.name.toLowerCase().includes(term) ||
      doctor.specialization.toLowerCase().includes(term) ||
      (doctor.qualification && doctor.qualification.toLowerCase().includes(term)) ||
      (doctor.chamberName && doctor.chamberName.toLowerCase().includes(term)) ||
      (doctor.bmdcNumber && doctor.bmdcNumber.toLowerCase().includes(term));
    const matchesFilter = selectedSpec === "all" || doctor.specialization === selectedSpec;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl mx-auto mb-8"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-3 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Database-Verified Specialist Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Consult With Certified Specialists
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Verified medical specialists across major clinical disciplines. Choose your department and reserve your chamber serial.
          </p>
        </motion.div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 mb-8 flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by physician name, degree, BMDC registration or chamber..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-hidden text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedSpec}
              onChange={(e) => setSelectedSpec(e.target.value)}
              className="px-3.5 py-2.5 border border-slate-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden bg-white min-w-[200px] text-xs font-bold"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec === "all" ? "All Clinical Specialties" : spec}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Realistic Empty State */}
        {!loading && filteredDoctors.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 max-w-md mx-auto p-8">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              No Physicians Available
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {doctors.length === 0
                ? "No verified doctors have been registered in the database yet."
                : "No doctors match the selected search or department filter."}
            </p>
            {doctors.length > 0 && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedSpec("all");
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
              >
                Reset Search Filters
              </button>
            )}
          </div>
        )}

        {/* Doctors Grid */}
        {!loading && filteredDoctors.length > 0 && (
          <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredDoctors.map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
                        {doctor.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                            {doctor.user.name}
                          </h3>
                        </div>
                        <p className="text-xs font-bold text-emerald-700 mt-0.5">
                          {doctor.specialization}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5" title={doctor.qualification}>
                          {doctor.qualification}
                        </p>
                        {doctor.bmdcNumber && (
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> BMDC: {doctor.bmdcNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Chamber Details */}
                    <div className="space-y-2 mb-4 text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                      {doctor.chamberName && (
                        <div className="flex items-start gap-1.5">
                          <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-800 block text-[11px]">{doctor.chamberName}</strong>
                            <span className="text-[10px] text-slate-400">{doctor.chamberAddress}</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          {formatTime(doctor.startTime)} - {formatTime(doctor.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{doctor.availableDays}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{doctor.experience} Years Clinical Experience</span>
                      </div>
                    </div>

                    {doctor.bio && (
                      <p className="text-xs text-slate-500 line-clamp-2 italic mb-4">
                        "{doctor.bio}"
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-2">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Consultation Fee</div>
                      <div className="text-base font-black text-slate-900">৳{doctor.fee} BDT</div>
                    </div>

                    <Link
                      href={`/book?doctorId=${doctor.id}`}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs group-hover:shadow-md"
                    >
                      Book Serial <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<MedicalLoader label="Loading specialist directory..." />}>
      <DoctorsDirectoryContent />
    </Suspense>
  );
}
