"use client";

import { signOut, useSession, getSession } from "next-auth/react";
import { useEffect, useState } from "react";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const { status } = useSession();
  const [formattedDate, setFormattedDate] = useState("");
  const [userName, setUserName] = useState<string | null>(null);

  // Force reload when restored from BFCache (back/forward navigation)
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  useEffect(() => {
    // Force fresh session fetch to override any stale cached session
    getSession().then((freshSession) => {
      if (freshSession?.user?.name) {
        setUserName(freshSession.user.name);
      }
    });
  }, []);

  useEffect(() => {
    const date = new Date();
    const dateStr = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    setFormattedDate(`${dateStr}, ${timeStr}`);
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-[#1e293b] font-sans antialiased pb-12">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#e5e7eb] bg-white px-5 py-4 shadow-sm">
        {/* Hamburger Menu Icon */}
        <button className="rounded-lg p-1.5 hover:bg-gray-100 transition text-[#4b5563]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* SecureGate Shield Logo */}
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-[#2563eb]"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M2.166 4.9L10 1.154l7.834 3.746a1 1 0 01.586.904v5.39c0 5.864-3.593 9.261-7.834 10.3a1 1 0 01-.586 0C5.76 20.455 2.166 17.058 2.166 11.194V5.804a1 1 0 01.586-.904zM10 3.324L4.166 6.115v5.079c0 4.747 2.827 7.502 5.834 8.44 3.007-.938 5.834-3.693 5.834-8.44V6.115L10 3.324z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xl font-bold tracking-tight text-[#0f172a]">SecureGate</span>
        </div>

        {/* Log Out Icon Button */}
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="rounded-lg p-2 text-[#4b5563] hover:bg-gray-100 transition duration-150"
          title="Sign Out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-lg px-4 pt-6 space-y-5">
        {/* Identity & Access Panel Title */}
        <div className="flex items-center justify-between px-1">
          <h1 className="text-[17px] font-bold text-[#1f2937]">Identity & Access Panel</h1>
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981]"></span>
            </span>
            <span className="text-[12px] font-semibold text-[#4b5563]">Session Active</span>
          </div>
        </div>

        {/* Greeting Card */}
        <div className="rounded-xl border border-[#e5e7eb]/80 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <h2 className="text-xl font-bold text-[#111827]">
            Hello, {status === "loading" ? "..." : userName || "User"}
          </h2>
          <p className="mt-2 text-[14.5px] leading-relaxed text-[#4b5563]">
            Welcome to your secure identity console. Below is an audit of your account access controls.
          </p>
        </div>

        {/* Card 2: Verification Audit */}
        <div className="rounded-xl border border-[#e5e7eb]/80 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-bold tracking-wider text-[#9ca3af] uppercase">
            Verification Audit
          </span>
          <div className="mt-1 text-[22px] font-bold text-[#047857]">Verified</div>
          <div className="mt-2 text-[13px] text-[#6b7280]">
            Confirmed on: {formattedDate || "5/19/2026, 3:14:20 PM"}
          </div>
          <div className="mt-4 rounded-lg bg-[#f0fdf4] border border-[#dcfce7] p-3 text-[13.5px] text-[#166534] flex items-start space-x-1">
            <span className="font-semibold">✓</span>
            <span>Email verification prevents account duplication and phishing vectors.</span>
          </div>
        </div>

        {/* Card 3: Credential Protection */}
        <div className="rounded-xl border border-[#e5e7eb]/80 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-bold tracking-wider text-[#9ca3af] uppercase">
            Credential Protection
          </span>
          <div className="mt-1 text-[22px] font-bold text-[#1f2937]">Bcryptjs Hashed</div>
          <div className="mt-2 text-[13px] text-[#6b7280]">Work factor (salt rounds): 12</div>
          <div className="mt-4 rounded-lg bg-[#eff6ff] border border-[#dbeafe] p-3 text-[13.5px] text-[#1e40af] flex items-start space-x-1">
            <span className="font-semibold">✓</span>
            <span>Password hashes are one-way and salted to defend against rainbow table lookups.</span>
          </div>
        </div>

        {/* Card 4: Session Configuration */}
        <div className="rounded-xl border border-[#e5e7eb]/80 bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
          <span className="text-[11px] font-bold tracking-wider text-[#9ca3af] uppercase">
            Session Configuration
          </span>
          <div className="mt-1 text-[22px] font-bold text-[#1f2937]">JWT Strategy</div>
          <div className="mt-4 rounded-lg bg-[#eff6ff] border border-[#dbeafe] p-3 text-[13.5px] text-[#1e40af] flex items-start space-x-1">
            <span className="font-semibold">✓</span>
            <span>JSON Web Tokens are signed cryptographically to prevent session tampering.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
