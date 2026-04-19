"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/lib/schemas";
import { useAuth } from "@/hooks/useAuth";
import { email } from "zod";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    setIsLoading(true);

    try {
      // await login(data.email, data.password);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || "Login failed");
        return;
      }

      window.location.href = "/dashboard";
    } catch {
      setServerError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            TaskFlow
          </h1>
          <p className="text-[11px] font-semibold tracking-widest uppercase text-on-surface-variant mt-1">
            Editorial Workspace
          </p>
        </div>

        <div className="bg-surface-container rounded-[2rem] p-8">
          <h2 className="text-xl font-bold text-on-surface mb-6">
            Welcome back
          </h2>

          {serverError && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl">
              <p className="text-sm text-error">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-error">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">
                Password
              </label>
              <input
                type="password"
                {...register("password")}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary"
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-error">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-primary hover:underline font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
