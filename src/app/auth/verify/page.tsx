"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyContent() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Missing token!");
      return;
    }

    fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setSuccess(data.success);
        }
      })
      .catch(() => setError("An error occurred during verification."));
  }, [token]);

  return (
    <div className="text-center">
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Email Verification</h2>
      
      <div className="mt-8">
        {!error && !success && (
          <div className="flex flex-col items-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="mt-4 text-zinc-400">Verifying your email...</p>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-900/50 p-4 ring-1 ring-red-500/50">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-900/50 p-4 ring-1 ring-green-500/50">
            <p className="text-green-200">{success}</p>
          </div>
        )}

        <div className="mt-8">
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="text-center text-zinc-400">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
