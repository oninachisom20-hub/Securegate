"use client";

import { useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "@/schemas/auth.schema";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [error, setError] = useState<string | null>(
    urlError === "EmailNotVerified"
      ? "Please verify your email before logging in. Check your inbox for the verification link."
      : urlError === "CredentialsSignin"
      ? "Invalid email or password."
      : null
  );
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: z.infer<typeof LoginSchema>) => {
    setIsLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      ...values,
      redirect: false,
    });

    if (res?.error) {
      if (res.error === "EmailNotVerified") {
        setError(
          "Please verify your email before logging in. Check your inbox for the verification link."
        );
      } else {
        setError("Invalid email or password.");
      }
      setIsLoading(false);
    } else if (res?.ok) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div>
      <div className="text-center">
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">Sign In</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Enter your details to access your account
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300">Email Address</label>
            <input
              {...form.register("email")}
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
              placeholder="you@example.com"
              disabled={isLoading}
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300">Password</label>
            <input
              {...form.register("password")}
              type="password"
              className="mt-1 block w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
              placeholder="••••••••"
              disabled={isLoading}
            />
            {form.formState.errors.password && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.password.message}</p>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-900/50 p-3 ring-1 ring-red-500/50">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href="/auth/register" className="text-indigo-400 hover:text-indigo-300">
          Create an account
        </Link>
        <Link href="/auth/reset" className="text-zinc-400 hover:text-zinc-300">
          Forgot password?
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-zinc-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
