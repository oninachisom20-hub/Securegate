"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { NewPasswordSchema } from "@/schemas/auth.schema";

export default function NewPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    mode: "onChange",
    defaultValues: { password: "" },
  });

  const onSubmit = async (values: z.infer<typeof NewPasswordSchema>) => {
    if (!token) {
      setError("Missing token!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const res = await fetch("/api/auth/new-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: values.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "An error occurred");
      } else {
        setSuccess(data.success);
        form.reset();
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
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
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Enter New Password</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Create a new, strong password for your account
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-300">New Password</label>
          <input
            {...form.register("password")}
            type="password"
            className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
            placeholder="••••••••"
            disabled={isLoading || !!success}
          />
          {form.formState.errors.password && (
            <p className="mt-1 text-sm text-red-400">{form.formState.errors.password.message}</p>
          )}
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
            {isLoading ? "Saving..." : "Reset Password"}
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
