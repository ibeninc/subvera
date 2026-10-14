"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef, type ReactNode } from "react";

/*
 * A page from a design report with the two passages that disagree marked up,
 * and a test pressure with no hold time. This is what a manual review has to catch.
 */

function Lines({ widths }: { widths: number[] }) {
  return (
    <div className="flex flex-col gap-[7px]" aria-hidden>
      {widths.map((w, i) => (
        <span key={i} className="h-[5px] rounded-full bg-navy/10" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

function Mark({ children, show, delay }: { children: ReactNode; show: boolean; delay: number }) {
  return (
    <span className="relative inline-block">
      <motion.span
        aria-hidden
        className="absolute inset-x-[-2px] inset-y-[1px] origin-left rounded-[2px] bg-[#FDE68A]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: show ? 1 : 0 }}
        transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className="relative">{children}</span>
    </span>
  );
}

function Note({ children, show, delay }: { children: ReactNode; show: boolean; delay: number }) {
  return (
    <motion.p
      className="absolute top-0 -right-[138px] w-[120px] max-sm:-right-[110px] max-sm:w-[98px] rounded-sm bg-navy px-2.5 py-1.5 text-[11px] leading-[1.35] text-white shadow-[0_6px_16px_-6px_rgba(14,42,71,.5)] max-sm:text-[10px]"
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: show ? 1 : 0, x: show ? 0 : 8 }}
      transition={{ duration: 0.4, delay }}
    >
      {children}
    </motion.p>
  );
}

export function ReportPage() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const show = inView || !!reduce;
  const d = (n: number) => (reduce ? 0 : n);

  return (
    <div ref={ref} className="relative h-full w-full overflow-hidden rounded-lg bg-navy">
      <div className="absolute inset-x-6 top-6 bottom-0 rounded-t-md bg-white px-6 pt-5 pr-[150px] text-[12px] leading-[1.6] text-navy/80 max-sm:inset-x-3 max-sm:top-4 max-sm:px-4 max-sm:pr-[118px] max-sm:text-[11px]">
        <p className="font-display text-[13px] font-semibold text-navy">Cross-Section Design Report, Rev B</p>

        <p className="mt-4 font-semibold text-navy">2. Design basis</p>
        <p className="mt-1">
          The umbilical is designed for a service life of{" "}
          <Mark show={show} delay={d(0.3)}>20 years</Mark> in the stated environment.
        </p>
        <div className="mt-2">
          <Lines widths={[92, 80]} />
        </div>

        {/* extra room on the large desktop stage */}
        <div className="hidden lg:block">
          <p className="mt-4 font-semibold text-navy">4. Materials</p>
          <div className="relative mt-1">
            <p>
              Armour wires are galvanised steel to the grade in <Mark show={show} delay={d(1.8)}>Table 4.2</Mark>.
            </p>
            <Note show={show} delay={d(2.0)}>
              No certification or traceability reference
            </Note>
          </div>
          <div className="mt-2">
            <Lines widths={[85, 72, 90]} />
          </div>
        </div>
        <p className="mt-4 font-semibold text-navy">7. Fatigue assessment</p>
        <div className="relative mt-1">
          <p>
            Fatigue damage is calculated over a design life of <span className="whitespace-nowrap"><Mark show={show} delay={d(0.8)}>25 years</Mark>.</span>
          </p>
          <Note show={show} delay={d(1.0)}>
            Section 2 says 20 years
          </Note>
        </div>
        <div className="mt-2">
          <Lines widths={[88, 95, 60]} />
        </div>

        <p className="mt-4 font-semibold text-navy">9. Testing</p>
        <div className="relative mt-1">
          <p>
            Steel tubes are hydrotested at <span className="whitespace-nowrap"><Mark show={show} delay={d(1.3)}>1.5 × design pressure</Mark>.</span>
          </p>
          <Note show={show} delay={d(1.5)}>
            No hold time stated
          </Note>
        </div>
        <div className="mt-2">
          <Lines widths={[70, 90]} />
        </div>

      </div>

    </div>
  );
}
