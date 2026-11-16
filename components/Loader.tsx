"use client";

import { motion } from "framer-motion";

interface LoaderProps {
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function MedicalLoader({ label = "Loading ShasthoSheba...", size = "md" }: LoaderProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-14 h-14",
    lg: "w-20 h-20",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <motion.div
          className={`absolute rounded-full border-2 border-emerald-500/30 ${sizeClasses[size]}`}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.6, 0, 0.6],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Spinning gradient ring */}
        <motion.div
          className={`rounded-full border-3 border-transparent border-t-emerald-600 border-r-teal-500 ${sizeClasses[size]}`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* Central Pulse Heartbeat Cross */}
        <motion.div
          className="absolute text-emerald-600"
          animate={{ scale: [0.85, 1.15, 0.85] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </motion.div>
      </div>

      {label && (
        <motion.p
          className="mt-4 text-xs font-medium text-slate-500 tracking-wide"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}

export function ButtonSpinner() {
  return (
    <motion.svg
      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </motion.svg>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-200 rounded-full" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-3 bg-slate-200 rounded w-1/3" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-4/5" />
      </div>
      <div className="pt-3 border-t border-slate-100 flex justify-between">
        <div className="h-6 bg-slate-200 rounded w-1/4" />
        <div className="h-8 bg-slate-200 rounded w-1/4" />
      </div>
    </div>
  );
}
