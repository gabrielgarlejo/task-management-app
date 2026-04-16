"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, SignupFormData } from "@/lib/schemas";

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: SignupFormData) => {
    setServerError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const result = await res.json();

      if (!res.ok) {
        setServerError(result.error || "Signup failed");
        return;
      }

      setSuccess(true);
    } catch {
      setServerError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
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

          <div className="bg-surface-container rounded-[2rem] p-8 text-center">
            <div className="mb-6 flex justify-center">
              <span className="material-symbols-outlined text-5xl text-primary">
                check_circle
              </span>
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-4">
              Check your email
            </h2>
            <p className="text-on-surface-variant mb-6">
              We&apos;ve sent a confirmation link to{" "}
              <span className="text-on-surface font-semibold">
                {/* Get email from form state or show generic */}
                your email
              </span>
            </p>
            <Link
              href="/login"
              className="inline-block py-3 px-6 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            Create account
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
                <p className="mt-2 text-sm text-error">{errors.email.message}</p>
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
                placeholder="At least 6 characters"
              />
              {errors.password && (
                <p className="mt-2 text-sm text-error">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                {...register("confirmPassword")}
                className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-error">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-primary text-on-primary font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}