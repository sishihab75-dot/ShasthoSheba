"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Activity, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight
} from "lucide-react";
import { ButtonSpinner, MedicalLoader } from "@/components/Loader";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const initialRole = searchParams.get("role");

  const [activeTab, setActiveTab] = useState<"general" | "admin">(
    initialRole === "admin" ? "admin" : "general"
  );
  const [formData, setFormData] = useState({
    email: initialRole === "admin" ? "admin@shasthosheba.com" : "",
    password: initialRole === "admin" ? "admin123" : "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSelectTab = (tab: "general" | "admin") => {
    setActiveTab(tab);
    setError("");
    if (tab === "admin") {
      setFormData({
        email: "admin@shasthosheba.com",
        password: "admin123",
      });
    } else {
      setFormData({
        email: "",
        password: "",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials provided");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (redirect) {
        router.push(redirect);
      } else if (data.user.role === "DOCTOR") {
        router.push("/dashboard/doctor");
      } else if (data.user.role === "ADMIN") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/patient");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
              Shastho<span className="text-emerald-600">Sheba</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900">
            {activeTab === "admin" ? "Hospital Administrator Sign In" : "Sign In to Your Account"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === "admin"
              ? "Official Hospital Executive Console (Admin: Saydul Islam)"
              : "Access your secure patient portal or physician clinical workspace"}
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-2xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => handleSelectTab("general")}
            className={`py-2 rounded-xl transition-all ${
              activeTab === "general"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Patient / Physician
          </button>
          <button
            type="button"
            onClick={() => handleSelectTab("admin")}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === "admin"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Admin: Saydul Islam
          </button>
        </div>

        {/* Administrator Profile Card when in Admin mode */}
        {activeTab === "admin" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white shadow-md border border-emerald-700/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
                SI
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white">Saydul Islam</h3>
                  <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    Administrator
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/80 truncate">
                  Director of Hospital Operations &bull; Master Authority
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* High Security Badge */}
        <div className="mb-6 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-center gap-2 text-slate-600 text-[11px] font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-bit Encrypted Session &bull; Role-Verified Authentication</span>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@shasthosheba.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden text-xs font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                />
                Remember this device
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-3"
            >
              {loading ? (
                <>
                  <ButtonSpinner /> Authenticating...
                </>
              ) : (
                <>
                  Sign In to ShasthoSheba <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Need a patient account?{" "}
            <Link href="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
              Create Patient Account
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-6">
          Are you a physician joining our network? Your access credentials are provided by hospital administration.
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<MedicalLoader label="Loading security console..." />}>
      <LoginContent />
    </Suspense>
  );
}
