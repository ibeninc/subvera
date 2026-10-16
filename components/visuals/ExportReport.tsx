"use client";

import { Download } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { SAMPLE_DOCUMENT } from "@/lib/data";
import { Badge } from "@/components/ui/Logo";

const lines = [
  ["Non-compliant", "Tensile utilisation above the acceptance limit"],
  ["Non-compliant", "Design life is inconsistent"],
  ["Non-compliant", "Minimum bend radius differs between sections"],
  ["Missing", "Hydrostatic test hold duration"],
  ["Missing", "Fatigue safety factor"],
];

const bar: Record<string, string> = {
  "Non-compliant": "bg-high-fg",
  Missing: "bg-missing",
};

/** Deep-blue panel: the exported report itself, with the format switch and download under it. */
export function ExportReport() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduce = useReducedMotion();
  const show = inView || reduce;

  return (
    <div ref={ref} className="bg-dots-dark relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-deep p-6 max-sm:p-4">
      <motion.div
        className="flex w-full max-w-[380px] flex-col gap-3"
        initial={reduce ? false : { y: 60, opacity: 0 }}
        animate={show ? { y: 0, opacity: 1 } : undefined}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* the report page */}
        <div className="rounded-md bg-white p-5 shadow-[0_24px_48px_-24px_rgba(0,0,0,.5)] max-sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <Badge size={22} />
            <span className="text-[11px] text-navy/50">Sample data</span>
          </div>
          <p className="mt-4 font-display text-[18px] leading-tight font-semibold">Findings report</p>
          <p className="mt-1 truncate text-[12px] text-navy/55">{SAMPLE_DOCUMENT}</p>

          <dl className="mt-4 grid grid-cols-3 divide-x divide-hairline rounded-sm bg-mist py-2.5 text-center">
            {[
              ["3", "Non-compliant"],
              ["4", "Missing"],
              ["38", "Compliant"],
            ].map(([v, l]) => (
              <div key={l} className="px-1">
                <dd className="font-display text-[18px] leading-none font-semibold">{v}</dd>
                <dt className="mt-1 text-[10px] text-navy/55">{l}</dt>
              </div>
            ))}
          </dl>

          <ul className="mt-3 divide-y divide-hairline">
            {lines.slice(0, 4).map(([sev, t], i) => (
              <li key={t} className={`flex items-center gap-2.5 py-2 ${i === 3 ? "max-sm:hidden" : ""}`}>
                <span className={`h-4 w-[3px] shrink-0 rounded-full ${bar[sev]}`} aria-hidden />
                <span className="min-w-0 flex-1 text-[12px] leading-snug font-medium">{t}</span>
                <span className="shrink-0 text-[10px] text-navy/45">{sev}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* export actions */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-pill bg-white/10 p-1 text-[12px] font-medium">
            <span className="rounded-pill bg-white px-3 py-1.5 text-navy">Comment sheet</span>
            <span className="px-3 py-1.5 text-white/70">PDF</span>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-pill bg-teal px-4 py-2 text-[12px] font-semibold text-navy">
            <Download size={13} aria-hidden /> Export
          </span>
        </div>
      </motion.div>
    </div>
  );
}
