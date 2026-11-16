"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Stethoscope, 
  Calendar, 
  Menu, 
  X,
  ShieldCheck,
  UserCheck
} from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch {
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    router.push("/login");
  };

  const getDashboardLink = () => {
    if (!currentUser) return "/login";
    if (currentUser.role === "ADMIN") return "/dashboard/admin";
    if (currentUser.role === "DOCTOR") return "/dashboard/doctor";
    return "/dashboard/patient";
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "DOCTOR":
        return "bg-teal-100 text-teal-800 border-teal-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20"
          >
            <Activity className="w-5 h-5" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
              Shastho<span className="text-emerald-600">Sheba</span>
            </span>
            <span className="text-[10px] -mt-1 font-medium text-slate-400 tracking-wider uppercase">
              Digital Healthcare BD
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === "/" ? "text-emerald-600 font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Home
          </Link>
          <Link
            href="/doctors"
            className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
              pathname.startsWith("/doctors") ? "text-emerald-600 font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Stethoscope className="w-4 h-4 text-emerald-500" />
            Find Doctors
          </Link>

          {currentUser && (
            <Link
              href={getDashboardLink()}
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                pathname.startsWith("/dashboard") ? "text-emerald-600 font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-500" />
              Dashboard
            </Link>
          )}

          {currentUser && currentUser.role === "PATIENT" && (
            <Link
              href="/dashboard/patient/appointments"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-emerald-500" />
              My Appointments
            </Link>
          )}

          {currentUser && currentUser.role === "DOCTOR" && (
            <Link
              href="/dashboard/doctor/appointments"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-emerald-500" />
              Patient Queue
            </Link>
          )}
        </nav>

        {/* User Auth Buttons / User Pill */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <Link
                href={getDashboardLink()}
                className="flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-full border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight">
                    {currentUser.name}
                  </div>
                  <span
                    className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getRoleBadge(
                      currentUser.role
                    )}`}
                  >
                    {currentUser.role}
                  </span>
                </div>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="text-xs font-semibold text-slate-700 hover:text-emerald-700 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg shadow-xs hover:shadow transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3"
          >
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700"
            >
              Home
            </Link>
            <Link
              href="/doctors"
              onClick={() => setMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700"
            >
              Find Doctors
            </Link>
            {currentUser && (
              <Link
                href={getDashboardLink()}
                onClick={() => setMenuOpen(false)}
                className="block py-2 text-sm font-medium text-emerald-600 font-semibold"
              >
                Go to {currentUser.role} Dashboard
              </Link>
            )}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              {currentUser ? (
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs text-slate-500 font-medium">{currentUser.email}</span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    className="text-xs text-rose-600 font-semibold flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 w-full">
                  <Link
                    href="/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center py-2 text-xs font-semibold border border-slate-300 rounded-lg"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
