"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { appButton } from "@/components/app/ui";

const field =
  "h-11 w-full rounded-[10px] bg-white px-3.5 text-[14.5px] shadow-[0_1px_2px_rgba(14,42,71,.05)] ring-1 ring-edge outline-none transition-shadow placeholder:text-fg-subtle hover:ring-navy/25 focus:ring-2 focus:ring-teal aria-[invalid=true]:ring-high-fg/60";

type Errors = { email?: string; password?: string };

export function SignInForm() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState<"email" | "sso" | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const next: Errors = {};
    if (!email) next.email = "Enter your work email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "That doesn’t look like an email address. Check for typos.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    if (next.email || next.password) {
      (e.currentTarget.elements.namedItem(next.email ? "email" : "password") as HTMLInputElement)?.focus();
      return;
    }
    // Prototype: no auth backend yet. Go straight to the project overview.
    setBusy("email");
    router.push("/dashboard");
  }

  function sso() {
    if (busy) return;
    setBusy("sso");
    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-[380px]">
      <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.025em]">Welcome back</h1>
      <p className="mt-2 text-[15px] text-fg-muted">Sign in with your work account to get to your reviews.</p>

      <button
        type="button"
        onClick={sso}
        aria-busy={busy === "sso"}
        className={appButton("outline", "mt-8 h-11 w-full gap-2 rounded-[10px] text-[14.5px]")}
      >
        {busy === "sso" ? <LoaderCircle size={16} className="animate-spin" aria-hidden /> : <KeyRound size={16} aria-hidden />}
        Continue with company SSO
      </button>

      <div className="my-6 flex items-center gap-3 text-[12.5px] text-fg-subtle">
        <span className="h-px flex-1 bg-hairline" />
        or use your email
        <span className="h-px flex-1 bg-hairline" />
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <div>
          <label htmlFor="email" className="text-[14px] font-medium">
            Work email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="name@company.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            onChange={() => errors.email && setErrors((x) => ({ ...x, email: undefined }))}
            className={`mt-2 ${field}`}
          />
          {errors.email && (
            <p id="email-error" className="mt-1.5 text-[13px] text-high-fg">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="password" className="text-[14px] font-medium">
              Password
            </label>
            <Link href="#" className="text-[13px] text-fg-muted underline-offset-4 hover:text-navy hover:underline">
              Forgot it?
            </Link>
          </div>
          <div className="relative mt-2">
            <input
              id="password"
              type={show ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              onChange={() => errors.password && setErrors((x) => ({ ...x, password: undefined }))}
              className={`${field} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
              className="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-[7px] text-fg-subtle transition-colors hover:bg-mist hover:text-navy"
            >
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1.5 text-[13px] text-high-fg">
              {errors.password}
            </p>
          )}
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-[14px] text-fg-muted select-none">
          <input type="checkbox" name="remember" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="peer sr-only" />
          <span
            aria-hidden
            className={`flex size-4 items-center justify-center rounded-[5px] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-teal ${
              remember ? "bg-navy text-white" : "bg-white ring-1 ring-navy/25"
            }`}
          >
            {remember && <Check size={11} strokeWidth={3} />}
          </span>
          Keep me signed in on this device
        </label>

        <button type="submit" aria-busy={busy === "email"} className={appButton("primary", "mt-1 h-11 w-full rounded-[10px] text-[14.5px]")}>
          {busy === "email" && <LoaderCircle size={16} className="animate-spin" aria-hidden />}
          {busy === "email" ? "Signing in" : "Sign in"}
        </button>
      </form>

      <p className="mt-8 text-[13.5px] text-fg-muted">
        New to Subvera? Ask your company admin to invite you.
      </p>
    </div>
  );
}
