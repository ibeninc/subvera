"use client";

import { FileText } from "lucide-react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef, type ReactNode } from "react";

/* Small previews of what you actually see at each step, built from the app's own UI. */

function Chip({ children, on }: { children: ReactNode; on?: boolean }) {
  return (
    <span
      className={`rounded-pill px-2.5 py-1 text-[12px] font-medium ${on ? "bg-teal-tint text-teal-dark ring-1 ring-teal/40" : "bg-white text-navy/50 ring-1 ring-line"}`}
    >
      {children}
    </span>
  );
}

function DescribePreview() {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Chip on>Design report</Chip>
      <Chip on>Static</Chip>
      <Chip>Dynamic</Chip>
      <Chip on>Steel tubes</Chip>
      <Chip>Hoses</Chip>
      <Chip on>Umbilical design</Chip>
    </div>
  );
}

function UploadPreview() {
  return (
    <div className="rounded-sm bg-white p-3 ring-1 ring-line">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-xs bg-navy text-white">
          <FileText size={15} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold">Cross-Section Design Report Rev B.pdf</p>
          <p className="text-[11px] text-navy/55">Checking against API 17E</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-pill bg-navy/10">
        <div className="h-full w-[62%] rounded-pill bg-teal" />
      </div>
    </div>
  );
}

function ResultPreview() {
  return (
    <div className="flex gap-3 rounded-sm bg-white p-3 ring-1 ring-line">
      <span className="mt-0.5 h-9 w-[3px] shrink-0 rounded-full bg-high-fg" aria-hidden />
      <div className="min-w-0">
        <p className="text-[13px] leading-snug font-semibold">Design life is inconsistent</p>
        <p className="mt-1 text-[11px] text-navy/55">API 17E clause 5.1.4, sections 2 and 7</p>
      </div>
    </div>
  );
}

const steps = [
  {
    title: "Describe the document",
    body: "Select the document type, the umbilical type, and the project phase.",
    preview: <DescribePreview />,
  },
  {
    title: "Upload the PDF",
    body: "Choose the standards to check against and upload the document. Subvera reads the full document, which takes a few minutes.",
    preview: <UploadPreview />,
  },
  {
    title: "Review the findings",
    body: "Each finding identifies the clause concerned and where it applies in the document. Export the findings as PDF or Word.",
    preview: <ResultPreview />,
  },
];

/** DESIGN.md S4 (control layer) → Subvera's three-step flow, told with the app's own UI. */
export function HowItWorks() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // The timeline line fills in as the steps scroll past (phones only).
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start 75%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <section id="how-it-works" className="section bg-white pt-0">
      <div className="container-x">
        <div className="flex flex-col items-center text-center max-sm:items-start max-sm:text-left">
          <h2 className="t-h2 max-w-[640px] text-balance">How a review works</h2>
          <p className="t-body-lg mt-6 max-w-[480px] text-pretty text-navy/70 max-md:mt-4">
            Three steps that take minutes, most of which is spent reviewing the findings.
          </p>
        </div>

        <div ref={trackRef} className="relative mt-20 max-md:mt-12">
          {/* phone timeline: faint track + teal fill that follows the scroll */}
          <span aria-hidden className="absolute top-4 bottom-4 left-[15px] w-[2px] rounded-full bg-navy/10 md:hidden" />
          <motion.span
            aria-hidden
            className="absolute top-4 bottom-4 left-[15px] w-[2px] origin-top rounded-full bg-teal md:hidden"
            style={{ scaleY: reduce ? 1 : fill }}
          />

          <ol className="grid grid-cols-1 gap-y-12 md:grid-cols-3 md:gap-x-10">
            {steps.map((s, i) => (
              <li key={s.title} className="relative pl-14 md:border-t-2 md:border-navy md:pt-8 md:pl-0">
                <span className="absolute top-0 left-0 flex size-8 items-center justify-center rounded-full bg-navy font-display text-[13px] font-semibold text-white ring-4 ring-white md:static md:size-auto md:justify-start md:bg-transparent md:text-[14px] md:text-teal-dark md:ring-0">
                  {i + 1}
                </span>
                <h3 className="font-display text-[22px] leading-[1.2] font-semibold md:mt-4 md:text-[24px]">{s.title}</h3>
                <p className="mt-2 max-w-[360px] text-[15px] leading-[1.6] text-navy/70 md:mt-3 md:text-[16px]">{s.body}</p>
                <div className="mt-5 rounded-[14px] bg-mist p-3 md:mt-6 md:p-4">{s.preview}</div>
              </li>
            ))}
          </ol>
        </div>

        <p className="mx-auto mt-20 max-w-[620px] text-center text-[15px] leading-[1.6] text-balance text-navy/60 max-md:mt-14 max-sm:text-left">
          {/* Keep "non-compliances" whole: breaking at its hyphen reads as two words */}
          Subvera does not confirm or certify compliance. It identifies <span className="whitespace-nowrap">non-compliances</span>{" "}
          and missing information for the engineer to assess. The engineer reviews every finding and retains final approval.
        </p>
      </div>
    </section>
  );
}
