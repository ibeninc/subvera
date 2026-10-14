"use client";

import { CircleCheck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { buttonClass } from "@/components/ui/Button";

const orgTypes = ["Operator", "SURF contractor", "Engineering consultancy", "Umbilical manufacturer", "Other"];

const field =
  "h-13 w-full rounded-lg border border-hairline bg-white px-4 text-[14px] text-navy placeholder:text-navy/50 outline-none transition-colors focus:border-teal";

/** DESIGN.md S9 final CTA card, with the mockup's demo request form. */
export function FinalCTA() {
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // No backend yet: wire this to your CRM / email endpoint.
    setSent(true);
  }

  return (
    <section id="demo" className="section bg-white">
      <div className="container-x">
        <div className="relative overflow-hidden rounded-2xl bg-mist p-16 max-lg:p-10 max-md:p-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_400px] lg:items-end">
            <div>
              <h2 className="t-display-lg max-w-[640px] text-balance">Try it on one of your own documents</h2>
              <p className="mt-10 max-w-[480px] text-[18px] leading-[1.6] text-pretty text-navy/70 max-md:mt-6 max-md:text-[16px]">
                Book a short demo and we&apos;ll run a review together. Tell us a little about your team and we&apos;ll shape it
                around your projects.
              </p>
            </div>

            {sent ? (
              <div role="status" className="flex flex-col items-start gap-3 rounded-md bg-white p-6">
                <CircleCheck className="text-teal-dark" aria-hidden />
                <p className="font-display text-[22px] font-semibold">Thanks, we&apos;ll be in touch.</p>
                <p className="text-[15px] text-navy/70">We&apos;ll email you to find a time that suits your team.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex flex-col gap-3">
                <label className="sr-only" htmlFor="demo-name">Name</label>
                <input id="demo-name" name="name" required placeholder="Name" autoComplete="name" className={field} />
                <label className="sr-only" htmlFor="demo-email">Work email</label>
                <input
                  id="demo-email"
                  name="email"
                  type="email"
                  required
                  placeholder="Work email"
                  autoComplete="email"
                  className={field}
                />
                <label className="sr-only" htmlFor="demo-org">Organisation type</label>
                <select id="demo-org" name="organisation" required defaultValue="" className={`${field} appearance-none`}>
                  <option value="" disabled>
                    Organisation type
                  </option>
                  {orgTypes.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
                <button type="submit" className={buttonClass("primary", "mt-3 w-full", "lg")}>
                  Request a demo
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
