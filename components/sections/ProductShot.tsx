"use client";

import { FileText, ListChecks, SlidersHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { DEMO_END, DEMO_START, Dashboard, type Demo, type View } from "@/components/sections/Dashboard";
import { DemoCursor, useDemoPlayer, usePageVisible, useTour, type Step } from "@/components/sections/demo";
import { MobileDemo } from "@/components/sections/MobileDemo";

const tabs: { id: View; label: string; icon: LucideIcon; chip: string; describe: string }[] = [
  {
    id: "findings",
    label: "Findings",
    icon: ListChecks,
    chip: "bg-teal text-navy",
    describe: "The findings list, filtered to non-compliant items, with the first finding opened and marked as in review.",
  },
  {
    id: "setup",
    label: "Review setup",
    icon: SlidersHorizontal,
    chip: "bg-navy text-white",
    describe: "Review setup: picking the umbilical's type, construction and components brings 45 requirements into scope.",
  },
  {
    id: "report",
    label: "Report",
    icon: FileText,
    chip: "bg-deep text-white",
    describe: "The findings report, exported as a PDF and added to the list of exports.",
  },
];

/*
 * Demo scripts: one short story per tab. Each step moves the cursor to an element tagged
 * data-demo="<target>" (measured at that moment, so it stays accurate if the layout changes),
 * clicks it unless click is false, applies the change to the mock, then holds for `hold` ms.
 * A step without a target just applies its change (something finishing on its own).
 */
const tick = (o: string) => (d: Demo) => ({ ...d, picked: [...d.picked, o] });

const SCRIPTS: Record<View, Step<Demo>[]> = {
  findings: [
    { target: "filter-1", apply: (d) => ({ ...d, filter: 1 }), hold: 900 },
    { target: "row-0", apply: (d) => ({ ...d, drawer: true }), hold: 1300 },
    { target: "mark-review", apply: (d) => ({ ...d, status: "In review" }), hold: 2200 },
  ],
  setup: [
    { target: "opt-Static", apply: tick("Static"), hold: 450 },
    { target: "opt-Armoured", apply: tick("Armoured"), hold: 450 },
    { target: "opt-Steel tubes", apply: tick("Steel tubes"), hold: 450 },
    { target: "opt-Electrical cables (LV)", apply: tick("Electrical cables (LV)"), hold: 1100 },
    { target: "continue", apply: (d) => ({ ...d, setupStep: 2 }), hold: 2000 },
  ],
  report: [
    { target: "export-pdf", apply: (d) => ({ ...d, exporting: true }), hold: 1300 },
    { apply: (d) => ({ ...d, exporting: false, exported: true }), hold: 900 },
    { target: "export-download-0", click: false, hold: 2200 },
  ],
};

const ORDER = ["findings", "setup", "report"] as const satisfies readonly View[];

/**
 * Product showcase under the hero: a tinted band with a curved notch holding three tabs,
 * and a framed, realistic app where a cursor demonstrates each tab (see demo.tsx).
 * Phones and tablets get MobileDemo: the same stories on a phone-shaped app, played with taps.
 */
export function ProductShot() {
  const hovering = useRef(false);
  const screen = useRef<HTMLDivElement>(null);
  const inView = useInView(screen, { amount: 0.4 });
  const pageVisible = usePageVisible();
  const reduce = useReducedMotion();
  const run = inView && pageVisible && !reduce;

  // Hovering the screen holds the current tab when its story ends.
  const { view, replay, next, pick } = useTour<View>(ORDER, hovering);
  const { state: demo, pointer, taps, progress } = useDemoPlayer({
    id: view,
    steps: SCRIPTS[view],
    start: DEMO_START,
    run,
    replay,
    root: screen,
    onDone: next,
    mode: "cursor",
  });
  const shown = reduce ? DEMO_END : demo;

  return (
    <section aria-label="Product preview" className="relative bg-white">
      {/* Phones and tablets: the same stories, built for a phone screen and played with taps */}
      <div className="container-x pb-4 lg:hidden">
        <MobileDemo />
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <div className="relative mx-auto max-w-[1600px] rounded-t-[56px] bg-[linear-gradient(180deg,#EDF1F6_0%,#F5F7FA_55%,#fff_100%)] px-10 pt-[120px]">
          {/* curved notch the tabs sit in */}
          <svg
            aria-hidden
            viewBox="0 0 820 104"
            preserveAspectRatio="none"
            className="absolute top-0 left-1/2 h-[104px] w-[820px] -translate-x-1/2 fill-white"
          >
            <path d="M0 0H820C752 0 744 104 668 104H152C76 104 68 0 0 0Z" />
          </svg>

          <div
            role="tablist"
            aria-label="Product screens"
            className="absolute top-[22px] left-1/2 z-10 flex -translate-x-1/2 gap-3"
          >
            {tabs.map((t) => {
              const on = view === t.id;
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={on}
                  aria-controls="product-screen"
                  onClick={() => pick(t.id)}
                  className={`relative flex items-center gap-2.5 overflow-hidden rounded-[12px] py-2 pr-4 pl-2 text-[15px] font-medium whitespace-nowrap transition-all duration-200 ${
                    on
                      ? "bg-white text-navy shadow-[0_1px_2px_rgba(14,42,71,.08),0_6px_16px_-8px_rgba(14,42,71,.25)] ring-1 ring-navy/10"
                      : "bg-navy/[0.04] text-navy/60 hover:bg-navy/[0.07] hover:text-navy"
                  }`}
                >
                  <span className={`flex size-6 items-center justify-center rounded-[7px] ${t.chip}`}>
                    <t.icon size={14} strokeWidth={2} aria-hidden />
                  </span>
                  {t.label}
                  {/* how far through this tab's demo we are */}
                  {on && !reduce && (
                    <span aria-hidden className="absolute inset-x-3 bottom-[3px] h-[2px] overflow-hidden rounded-full bg-navy/[0.08]">
                      <motion.span
                        className="block h-full rounded-full bg-teal"
                        initial={false}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto max-w-[1240px] rounded-[24px] bg-white/70 p-2 shadow-[0_40px_80px_-40px_rgba(14,42,71,.35)] ring-1 ring-navy/[0.06] [mask-image:linear-gradient(#000_80%,transparent)]">
              <div
                id="product-screen"
                role="tabpanel"
                ref={screen}
                onMouseEnter={() => (hovering.current = true)}
                onMouseLeave={() => (hovering.current = false)}
                className="relative overflow-hidden rounded-[16px] ring-1 ring-navy/[0.06]"
              >
                <p className="sr-only">{tabs.find((t) => t.id === view)?.describe}</p>
                <motion.div key={view} aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <Dashboard view={view} demo={shown} />
                </motion.div>
                {!reduce && <DemoCursor pointer={pointer} taps={taps} />}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
