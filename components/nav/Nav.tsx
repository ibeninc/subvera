"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#who-it-is-for", label: "Who it is for" },
  { href: "/#pricing", label: "Pricing" },
];

/** Fixed translucent nav (DESIGN.md §4.2): logo left, centred links, Sign in + Book a demo right. */
export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-40 h-[64px] border-b border-hairline/70 bg-white/80 backdrop-blur-md">
      <div className="relative mx-auto flex h-full max-w-[100rem] items-center justify-between px-5 md:px-10">
        <Logo width={120} priority className="h-auto max-[360px]:w-[100px]" />

        <nav aria-label="Main" className="absolute left-1/2 hidden -translate-x-1/2 items-center lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-4 py-2 text-[14px] font-medium text-navy/70 transition-colors hover:text-navy"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ButtonLink href="/sign-in" variant="login">
            Sign in
          </ButtonLink>
          <ButtonLink href="/#demo">
            Book a demo
          </ButtonLink>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-pill hover:bg-mist"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
        </div>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-full flex h-[calc(100dvh-64px)] flex-col gap-2 bg-white px-5 pt-6 lg:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-display text-[24px] leading-[1.4] font-semibold"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-6 flex flex-col gap-3">
            <ButtonLink href="/sign-in" variant="login" onClick={() => setOpen(false)}>
              Sign in
            </ButtonLink>
            <ButtonLink href="/#demo" onClick={() => setOpen(false)}>
              Book a demo
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
