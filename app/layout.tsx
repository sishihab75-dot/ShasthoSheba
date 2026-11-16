import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShasthoSheba - Digital Healthcare & Doctor Appointments in Bangladesh",
  description: "Connect with verified doctors, book clinic consultations, and manage digital prescriptions seamlessly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
