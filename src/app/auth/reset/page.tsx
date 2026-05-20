"use client";

import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "An error occurred");
      } else {
        setSuccess(data.success);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center">
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Reset Password</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
            placeholder="you@example.com"
            disabled={isLoading || !!success}
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-900/50 p-3 ring-1 ring-red-500/50">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-900/50 p-3 ring-1 ring-green-500/50">
            <p className="text-sm text-green-200">{success}</p>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading || !!success}
            className="flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm">
        <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Back to login
        </Link>
      </div>
    </div>
  );
}
