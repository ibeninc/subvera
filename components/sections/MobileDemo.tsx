"use client";

import { Check, ChevronRight, FileSpreadsheet, FileText, ListChecks, LoaderCircle, MessageSquareText, SlidersHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Avatar, ClauseRef, KindText } from "@/components/app/ui";
import { DemoTouch, useDemoPlayer, usePageVisible, useTour, type Step } from "@/components/sections/demo";
import { Badge } from "@/components/ui/Logo";
import { COMPLIANT_TOTAL, SAMPLE_DOCUMENT, SAMPLE_PROJECT, compliantChecks, missingInfo, nonCompliant, projectPhases, type FindingKind, type MemberId } from "@/lib/data";

/*
 * The hero demo on phones and tablets. Same three stories as the desktop mock, rebuilt as a
 * phone app (chips, a bottom sheet, a sticky action bar) and played with taps instead of a cursor.
 * Fixed screen height so switching tabs never shifts the page.
 */

type View = "findings" | "setup" | "report";

type M = {
  filter: number; // 0 All, 1 Non-compliant, 2 Missing, 3 Compliant
  sheet: boolean;
  comment: boolean; // comment added to the first finding
  picked: string[];
  step: number; // wizard step, 1-based
  exporting: boolean;
  exported: boolean;
  toast: string | null;
};

const START: M = { filter: 0, sheet: false, comment: false, picked: [], step: 2, exporting: false, exported: false, toast: null };
const END: M = {
  filter: 1,
  sheet: true,
  comment: true,
  picked: ["Static", "Armoured", "Steel tubes", "Electrical cables (LV)"],
  step: 2,
  exporting: false,
  exported: true,
  toast: null,
};

const tick = (o: string) => (m: M) => ({ ...m, picked: [...m.picked, o] });

const SCRIPTS: Record<View, Step<M>[]> = {
  findings: [
    { target: "chip-1", apply: (m) => ({ ...m, filter: 1 }), hold: 900 },
    { target: "item-0", apply: (m) => ({ ...m, sheet: true }), hold: 1400 },
    { target: "sheet-action", apply: (m) => ({ ...m, comment: true }), hold: 2300 },
  ],
  setup: [
    { target: "opt-Static", apply: tick("Static"), hold: 450 },
    { target: "opt-Armoured", apply: tick("Armoured"), hold: 450 },
    { target: "opt-Steel tubes", apply: tick("Steel tubes"), hold: 450 },
    { target: "opt-Electrical cables (LV)", apply: tick("Electrical cables (LV)"), hold: 1100 },
    { target: "continue", apply: (m) => ({ ...m, step: 3 }), hold: 2000 },
  ],
  report: [
    { target: "export", apply: (m) => ({ ...m, exporting: true }), hold: 1300 },
    { apply: (m) => ({ ...m, exporting: false, exported: true, toast: "Comment sheet downloaded" }), hold: 1800 },
    { apply: (m) => ({ ...m, toast: null }), hold: 1200 },
  ],
};

// Same order as the desktop demo and a real review.
const ORDER = ["setup", "findings", "report"] as const satisfies readonly View[];

const TABS: { id: View; label: string; icon: LucideIcon; describe: string }[] = [
  {
    id: "setup",
    label: "Setup",
    icon: SlidersHorizontal,
    describe: "Review setup on a phone: picking the umbilical's type, construction and components brings 45 requirements into scope.",
  },
  {
    id: "findings",
    label: "Findings",
    icon: ListChecks,
    describe: "Findings on a phone: filtered to non-compliant items, with the first one opened and a comment added for the comment sheet.",
  },
  { id: "report", label: "Export", icon: FileText, describe: "The findings on a phone, exported as a comment sheet and added to the exports." },
];

export function MobileDemo() {
  const holding = useRef(false);
  const screen = useRef<HTMLDivElement>(null);
  const inView = useInView(screen, { amount: 0.5 });
  const pageVisible = usePageVisible();
  const reduce = useReducedMotion();
  const run = inView && pageVisible && !reduce;

  // A finger resting on the phone holds the current tab when its story ends.
  const { view, replay, next, pick } = useTour<View>(ORDER, holding);
  const { state, pointer, taps, progress } = useDemoPlayer({
    id: view,
    steps: SCRIPTS[view],
    start: START,
    run,
    replay,
    root: screen,
    onDone: next,
    mode: "touch",
  });
  const m = reduce ? END : state;

  return (
    <div className="mx-auto w-full max-w-[400px]">
      <div role="tablist" aria-label="Product screens" className="grid grid-cols-3 gap-1 rounded-[14px] bg-navy/[0.05] p-1">
        {TABS.map((t) => {
          const on = view === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={on}
              aria-controls="mobile-screen"
              onClick={() => pick(t.id)}
              className={`relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-[10px] text-[14px] font-medium transition-colors ${
                on ? "bg-white text-navy shadow-[0_1px_2px_rgba(14,42,71,.1)] ring-1 ring-edge" : "text-navy/60"
              }`}
            >
              <t.icon size={15} strokeWidth={2} aria-hidden />
              {t.label}
              {on && !reduce && (
                <span aria-hidden className="absolute inset-x-3 bottom-[4px] h-[2px] overflow-hidden rounded-full bg-navy/[0.08]">
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

      {/* Device: a soft outer shell and the screen inside it */}
      <div className="mt-4 rounded-[36px] bg-navy/[0.035] p-2 ring-1 ring-navy/[0.06]">
        <div
          id="mobile-screen"
          role="tabpanel"
          ref={screen}
          onPointerDown={() => (holding.current = true)}
          onPointerUp={() => (holding.current = false)}
          onPointerCancel={() => (holding.current = false)}
          onPointerLeave={() => (holding.current = false)}
          className="relative h-[600px] overflow-hidden rounded-[28px] bg-white shadow-[0_30px_60px_-30px_rgba(14,42,71,.4)] ring-1 ring-navy/[0.06] max-[360px]:h-[560px]"
        >
          <p className="sr-only">{TABS.find((t) => t.id === view)?.describe}</p>
          <motion.div key={view} aria-hidden className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            {view === "findings" && <FindingsScreen m={m} />}
            {view === "setup" && <SetupScreen m={m} />}
            {view === "report" && <ReportScreen m={m} />}
          </motion.div>
          {!reduce && <DemoTouch pointer={pointer} taps={taps} />}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ screens */

function AppBar({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="px-5 pt-5">
      <div className="flex items-center justify-between">
        <Badge size={26} />
        <span className="text-[12px] text-fg-subtle">{SAMPLE_PROJECT}</span>
      </div>
      <p className="mt-5 truncate text-[12.5px] text-fg-subtle">{eyebrow}</p>
      <p className="mt-0.5 font-display text-[22px] leading-tight font-semibold tracking-[-0.02em]">{title}</p>
    </div>
  );
}

type Item = { kind: FindingKind; title: string; detail?: string; standard: string; clause: string; where: string };

const COMMENT = "Supplier to re-run the installation analysis or justify the higher utilisation.";

const ITEMS: Item[] = [
  ...nonCompliant.map((f) => ({ kind: "non-compliant" as const, title: f.title, detail: f.detail, standard: f.standard, clause: f.clause, where: f.location })),
  ...missingInfo.slice(0, 2).map((f) => ({ kind: "missing" as const, title: f.title, standard: f.standard, clause: f.clause, where: f.expected })),
  ...compliantChecks.slice(0, 2).map((f) => ({ kind: "compliant" as const, title: f.title, standard: f.standard, clause: f.clause, where: f.location })),
];

const CHIPS = [
  { label: "All", n: nonCompliant.length + missingInfo.length + COMPLIANT_TOTAL, test: () => true },
  { label: "Non-compliant", n: nonCompliant.length, test: (i: Item) => i.kind === "non-compliant" },
  { label: "Missing", n: missingInfo.length, test: (i: Item) => i.kind === "missing" },
  { label: "Compliant", n: COMPLIANT_TOTAL, test: (i: Item) => i.kind === "compliant" },
];

function FindingsScreen({ m }: { m: M }) {
  const first = ITEMS[0];
  const items = ITEMS.filter(CHIPS[m.filter].test);
  return (
    <div className="relative h-full">
      <AppBar eyebrow={SAMPLE_DOCUMENT.replace(/\.pdf$/i, "")} title="Findings" />

      <div className="mt-4 flex gap-2 overflow-hidden px-5 [mask-image:linear-gradient(to_right,#000_80%,transparent)]">
        {CHIPS.map((c, i) => (
          <span
            key={c.label}
            data-demo={`chip-${i}`}
            className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors duration-200 ${
              i === m.filter ? "bg-navy text-white" : "bg-white text-fg-muted ring-1 ring-edge"
            }`}
          >
            {c.label}
            <span className={`tabular-nums ${i === m.filter ? "text-white/70" : "text-fg-subtle"}`}>{c.n}</span>
          </span>
        ))}
      </div>

      <ul className="mt-4 border-t border-hairline [mask-image:linear-gradient(#000_85%,transparent)]">
        <AnimatePresence initial={false}>
          {items.map((it, i) => (
            <motion.li
              key={it.title}
              layout="position"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              data-demo={i === 0 ? "item-0" : undefined}
              className={`flex items-center gap-3 border-b border-hairline px-5 py-3.5 ${i === 0 && m.sheet ? "bg-teal-tint/50" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className={`text-[14.5px] leading-snug ${it.kind === "compliant" ? "text-fg-muted" : "font-medium"}`}>{it.title}</p>
                <p className="mt-1.5 flex items-center gap-2.5 text-[12.5px]">
                  <KindText kind={it.kind} short />
                  <ClauseRef standard={it.standard} clause={it.clause} />
                </p>
              </div>
              {it.title === first.title && m.comment ? (
                <MessageSquareText size={16} className="shrink-0 text-teal-dark" aria-label="Comment added" />
              ) : (
                <ChevronRight size={16} className="shrink-0 text-fg-subtle" />
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* Bottom sheet with the first finding */}
      <AnimatePresence>
        {m.sheet && (
          <>
            <motion.div
              className="absolute inset-0 bg-navy/25"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
            <motion.div
              className="absolute inset-x-0 bottom-0 rounded-t-[22px] bg-white px-5 pt-2.5 pb-5 shadow-[0_-12px_32px_-12px_rgba(14,42,71,.3)]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0.12, duration: 0.45 }}
            >
              <span className="mx-auto block h-1 w-10 rounded-full bg-navy/15" />
              <div className="mt-4 flex items-center justify-between text-[13px]">
                <KindText kind={first.kind} />
              </div>
              <p className="mt-2.5 text-[17px] leading-snug font-semibold">{first.title}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-fg-muted">{first.detail}</p>
              <dl className="mt-4 grid grid-cols-[76px_1fr] gap-y-2.5 text-[13px]">
                <dt className="text-fg-subtle">Clause</dt>
                <dd>
                  <ClauseRef standard={first.standard} clause={first.clause} />
                </dd>
                <dt className="text-fg-subtle">Location</dt>
                <dd>{first.where}</dd>
                <dt className="text-fg-subtle">Comment</dt>
                <dd className={m.comment ? "" : "text-fg-subtle"}>{m.comment ? COMMENT : "None yet"}</dd>
              </dl>
              <span
                data-demo="sheet-action"
                className={`mt-5 flex h-12 items-center justify-center gap-2 rounded-[12px] text-[15px] font-medium transition-colors duration-200 ${
                  m.comment ? "bg-met-bg text-teal-dark" : "bg-navy text-white"
                }`}
              >
                {m.comment && <Check size={16} strokeWidth={2.5} />}
                {m.comment ? "Comment saved" : "Add comment"}
              </span>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Each ticked component brings its own requirements into scope; ends at 45, as elsewhere on the page. */
const BASE_REQUIREMENTS = 12;
const ADDS: Record<string, number> = { Static: 9, Armoured: 8, "Steel tubes": 10, "Electrical cables (LV)": 6 };
const GROUPS = [
  { title: "Umbilical type", options: ["Dynamic", "Static"] },
  { title: "Construction", options: ["Armoured", "Extruded inner sheath", "Extruded outer sheath"] },
  { title: "Components", options: ["Steel tubes", "Thermoplastic hoses", "Electrical cables (LV)", "Fibre optic cables"] },
];
// What Continue leads to: the next wizard step, so the story ends on real progress.
const PHASE_GROUPS = projectPhases.slice(0, 3).map((p) => ({ title: p.title, options: p.options.slice(0, 3) }));

function SetupScreen({ m }: { m: M }) {
  const count = BASE_REQUIREMENTS + m.picked.reduce((n, o) => n + (ADDS[o] ?? 0), 0);
  const scope = m.step === 2;
  const groups = scope ? GROUPS : PHASE_GROUPS;
  return (
    <div className="relative flex h-full flex-col">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={m.step}
          className="flex min-h-0 flex-1 flex-col"
          initial={{ x: 48, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -48, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <AppBar eyebrow="New review" title={scope ? "Describe the umbilical" : "Which phases does it cover?"} />
          <div className="mt-4 px-5">
            <p className="text-[12.5px] text-fg-subtle">
              Step {m.step} of 5: <span className="font-medium text-navy">{scope ? "Umbilical scope" : "Project scope"}</span>
            </p>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`h-1 rounded-full ${n < m.step ? "bg-teal" : n === m.step ? "bg-navy" : "bg-navy/[0.08]"}`} />
              ))}
            </div>
          </div>

          <div className="mt-5 flex-1 overflow-hidden px-5">
            {groups.map((g) => (
              <div key={g.title} className="mb-4">
                <p className="text-[13.5px] font-medium">{g.title}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {g.options.map((o) => {
                    const on = m.picked.includes(o);
                    return (
                      <span
                        key={o}
                        data-demo={`opt-${o}`}
                        className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] transition-[background-color,box-shadow,color] duration-200 ${
                          on ? "bg-teal-tint font-medium text-navy ring-[1.5px] ring-teal" : "bg-white text-fg-muted ring-1 ring-edge"
                        }`}
                      >
                        {on && <Check size={13} strokeWidth={2.75} className="text-teal-dark" />}
                        {o}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Sticky action bar: what's in scope, and the way forward */}
      <div className="flex items-center justify-between gap-3 border-t border-hairline bg-white/95 px-5 py-3.5 backdrop-blur">
        <div>
          <p className="text-[12px] text-fg-subtle">Requirements in scope</p>
          <motion.p
            key={count}
            initial={{ scale: 1.2, color: "#0f8f81" }}
            animate={{ scale: 1, color: "#0e2a47" }}
            transition={{ duration: 0.35 }}
            className="origin-left font-display text-[20px] leading-tight font-semibold tabular-nums"
          >
            {count}
          </motion.p>
        </div>
        <span data-demo="continue" className="flex h-11 items-center rounded-[12px] bg-navy px-5 text-[15px] font-medium text-white">
          Continue
        </span>
      </div>
    </div>
  );
}

const PAST_EXPORTS: [string, string, MemberId][] = [
  ["Findings report, Rev B.pdf", "Yesterday", "AB"],
  ["Comment sheet, Rev A.csv", "3 weeks ago", "JK"],
];

function ReportScreen({ m }: { m: M }) {
  const exports: [string, string, MemberId][] = m.exported ? [["Comment sheet, Rev B.csv", "Just now", "AB"], ...PAST_EXPORTS] : PAST_EXPORTS;
  return (
    <div className="relative flex h-full flex-col">
      <AppBar eyebrow={SAMPLE_DOCUMENT.replace(/\.pdf$/i, "")} title="Export findings" />

      <div className="mt-5 flex-1 overflow-hidden px-5">
        <dl className="grid grid-cols-3 divide-x divide-hairline rounded-[14px] bg-mist/70 py-3.5 ring-1 ring-edge">
          {[
            ["Non-compliant", nonCompliant.length],
            ["Missing", missingInfo.length],
            ["Compliant", COMPLIANT_TOTAL],
          ].map(([l, v]) => (
            <div key={l} className="flex flex-col-reverse items-center">
              <dt className="mt-1 text-[12px] text-fg-muted">{l}</dt>
              <dd className="font-display text-[24px] leading-none font-semibold tabular-nums">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 text-[14px] font-semibold">Exports</p>
        <ul className="mt-2.5 overflow-hidden rounded-[14px] ring-1 ring-edge">
          <AnimatePresence initial={false}>
            {exports.map(([name, when, who], i) => (
              <motion.li
                key={name}
                layout="position"
                initial={{ opacity: 0, backgroundColor: "rgba(232,248,246,1)" }}
                animate={{ opacity: 1, backgroundColor: "rgba(232,248,246,0)" }}
                transition={{ opacity: { duration: 0.3 }, backgroundColor: { duration: 2.2, delay: 0.4 } }}
                className={`flex items-center gap-3 px-4 py-3.5 ${i ? "border-t border-hairline" : ""}`}
              >
                <span
                  className={`flex h-9 w-8 shrink-0 items-end justify-center rounded-[6px] pb-1 font-mono text-[9px] font-medium ring-1 ${
                    name.endsWith(".pdf") ? "bg-high-bg text-high-fg ring-high-fg/15" : "bg-met-bg text-teal-dark ring-teal-dark/15"
                  }`}
                >
                  {name.endsWith(".pdf") ? "PDF" : "CSV"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium">{name.replace(/^Findings report, /, "")}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-fg-subtle">
                    {when} <Avatar id={who} size={18} />
                  </span>
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      {/* Toast above the action bar */}
      <AnimatePresence>
        {m.toast && (
          <motion.div
            className="absolute inset-x-5 bottom-[84px] flex items-center gap-2.5 rounded-[12px] bg-navy px-4 py-3 text-[14px] text-white shadow-[0_12px_28px_-12px_rgba(14,42,71,.6)]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.25 }}
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-teal text-navy">
              <Check size={12} strokeWidth={3} />
            </span>
            {m.toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-t border-hairline bg-white/95 px-5 py-3.5 backdrop-blur">
        <span
          data-demo="export"
          className={`flex h-12 items-center justify-center gap-2 rounded-[12px] text-[15px] font-medium transition-colors duration-200 ${
            m.exported ? "bg-met-bg text-teal-dark" : "bg-navy text-white"
          }`}
        >
          {m.exporting ? (
            <>
              <LoaderCircle size={16} className="animate-spin" /> Exporting
            </>
          ) : m.exported ? (
            <>
              <Check size={16} strokeWidth={2.5} /> Exported
            </>
          ) : (
            <>
              <FileSpreadsheet size={16} /> Export comment sheet
            </>
          )}
        </span>
      </div>
    </div>
  );
}
