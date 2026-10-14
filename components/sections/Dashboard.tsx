"use client";

import {
  Check,
  ChevronDown,
  CircleCheck,
  Download,
  FileText,
  Files,
  FolderKanban,
  LayoutGrid,
  ListChecks,
  MoreHorizontal,
  Search,
  Settings,
  SlidersHorizontal,
  Users,
  LoaderCircle,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { COMPLIANT_TOTAL, SAMPLE_DOCUMENT, SAMPLE_PROJECT, compliantChecks, missingInfo, nonCompliant, projectPhases } from "@/lib/data";
import { Badge } from "@/components/ui/Logo";

export type View = "findings" | "setup" | "report";

/*
 * What the demo cursor can change in the mock. ProductShot drives it; the views just render it.
 * Elements the cursor aims at carry data-demo="<key>" so it can find them wherever they are.
 */
export type Demo = {
  filter: number; // findings: 0 All, 1 Non-compliant, 2 Missing, 3 Met
  drawer: boolean; // findings: detail panel open
  status: "Open" | "In review"; // findings: first finding
  picked: string[]; // setup: ticked components
  setupStep: number; // setup: wizard step
  exporting: boolean; // report
  exported: boolean; // report
};

export const DEMO_START: Demo = {
  filter: 0,
  drawer: false,
  status: "Open",
  picked: [],
  setupStep: 1,
  exporting: false,
  exported: false,
};

/** Where each story ends; shown as-is when motion is reduced. */
export const DEMO_END: Demo = {
  filter: 1,
  drawer: true,
  status: "In review",
  picked: ["Static", "Armoured", "Steel tubes", "Electrical cables (LV)"],
  setupStep: 1,
  exporting: false,
  exported: true,
};

/* ------------------------------------------------------------------ chrome */

function RailIcon({ icon: Icon, active }: { icon: LucideIcon; active?: boolean }) {
  return (
    <span
      className={`flex size-9 items-center justify-center rounded-[10px] ${active ? "bg-white text-navy shadow-[0_1px_2px_rgba(14,42,71,.12)] ring-1 ring-navy/[0.06]" : "text-navy/45"}`}
    >
      <Icon size={17} strokeWidth={1.75} />
    </span>
  );
}

function NavItem({ icon: Icon, label, count, active }: { icon: LucideIcon; label: string; count?: number; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-[8px] px-2.5 py-[7px] text-[12.5px] ${active ? "bg-navy/[0.06] font-medium text-navy" : "text-navy/70"}`}
    >
      <Icon size={14} strokeWidth={1.75} className={active ? "text-navy" : "text-navy/50"} />
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className="rounded-[5px] bg-teal-tint px-1.5 text-[10.5px] font-semibold text-teal-dark tabular-nums">{count}</span>
      )}
    </div>
  );
}

function Sidebar({ view }: { view: View }) {
  return (
    <aside className="flex w-[228px] shrink-0 flex-col gap-5 rounded-[12px] bg-white px-3 py-4 ring-1 ring-navy/[0.06]">
      <div className="flex items-center justify-between px-2">
        <span className="text-[13.5px] font-semibold">{SAMPLE_PROJECT}</span>
        <ChevronDown size={14} className="text-navy/40" />
      </div>
      <div className="flex flex-col gap-0.5">
        <NavItem icon={LayoutGrid} label="Overview" />
        <NavItem icon={ListChecks} label="Reviews" count={3} active={view !== "report"} />
        <NavItem icon={Files} label="Documents" count={12} />
        <NavItem icon={FileText} label="Reports" active={view === "report"} />
      </div>
      <div>
        <p className="px-2.5 pb-1.5 text-[11px] text-navy/45">Standards</p>
        <div className="flex flex-col gap-0.5">
          <NavItem icon={CircleCheck} label="API 17E" />
          <NavItem icon={CircleCheck} label="API 17L1" />
          <div className="flex items-center gap-2.5 px-2.5 py-[7px] text-[12.5px] text-navy/45">
            <SlidersHorizontal size={14} strokeWidth={1.75} />
            <span className="flex-1">Internal specs</span>
            <span className="rounded-[5px] bg-navy px-1.5 text-[9.5px] font-semibold tracking-wide text-white">ADD-ON</span>
          </div>
        </div>
      </div>
      <div>
        <p className="px-2.5 pb-1.5 text-[11px] text-navy/45">Team</p>
        <NavItem icon={Users} label="Members" />
        <NavItem icon={Settings} label="Settings" />
      </div>
    </aside>
  );
}

function Header({ title, crumb, actions }: { title: string; crumb: string; actions?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
      <div className="min-w-0">
        <p className="text-[11.5px] text-navy/45">{crumb}</p>
        <p className="mt-0.5 text-[16px] font-semibold">{title}</p>
      </div>
      {actions}
    </div>
  );
}

/* ------------------------------------------------------------------ views */

const sevDot: Record<string, string> = {
  High: "bg-high-fg",
  Medium: "bg-[#D97706]",
  Missing: "bg-[#E8A33D]",
  Met: "bg-teal",
};

const people = {
  AB: "bg-[#DCE7F3] text-navy",
  JK: "bg-[#E0F2EF] text-teal-dark",
  RM: "bg-[#FBE9D7] text-[#92570B]",
};

function Avatar({ who }: { who: keyof typeof people }) {
  return (
    <span className={`flex size-[22px] items-center justify-center rounded-full text-[9.5px] font-semibold ${people[who]}`}>{who}</span>
  );
}

type Row = { sev: string; title: string; detail?: string; ref: string; where: string; who: keyof typeof people | null; state: string };

const ROWS: Row[] = [
  ...nonCompliant.map((f, i) => ({
    sev: f.severity as string,
    title: f.title,
    detail: f.detail,
    ref: `${f.standard} ${f.clause}`,
    where: f.location,
    who: (["AB", "JK", "AB"] as const)[i],
    state: "Open",
  })),
  ...missingInfo.slice(0, 2).map((f, i) => ({
    sev: "Missing",
    title: f.title,
    ref: `${f.standard} ${f.clause}`,
    where: f.expected,
    who: (["RM", "JK"] as const)[i],
    state: "Open",
  })),
  ...compliantChecks.slice(0, 2).map((f) => ({
    sev: "Met",
    title: f.title,
    ref: `${f.standard} ${f.clause}`,
    where: f.location,
    who: null,
    state: "Met",
  })),
];

const FILTER_TEST = [
  () => true,
  (r: Row) => r.sev === "High" || r.sev === "Medium",
  (r: Row) => r.sev === "Missing",
  (r: Row) => r.sev === "Met",
];

function FindingsView({ demo }: { demo: Demo }) {
  const first = { ...ROWS[0], state: demo.status };
  const rows = [first, ...ROWS.slice(1)].filter(FILTER_TEST[demo.filter]);

  const filters = [
    ["All", nonCompliant.length + missingInfo.length + COMPLIANT_TOTAL],
    ["Non-compliant", nonCompliant.length],
    ["Missing", missingInfo.length],
    ["Met", COMPLIANT_TOTAL],
  ] as const;

  return (
    <div className="relative h-full">
      <Header
        crumb={`Reviews / ${SAMPLE_DOCUMENT}`}
        title="Findings"
        actions={
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-medium ring-1 ring-line">
              <Download size={13} /> Export
            </span>
            <span className="rounded-[8px] bg-navy px-3 py-1.5 text-[12px] font-medium text-white">Share with team</span>
          </div>
        }
      />
      <div className="flex items-center justify-between gap-4 px-6 pt-4">
        <div className="flex w-[260px] items-center gap-2 rounded-[8px] px-3 py-2 text-[12px] text-navy/40 ring-1 ring-line">
          <Search size={13} /> Search findings or clauses
        </div>
        <div className="flex gap-1 rounded-[9px] bg-mist p-1 text-[11.5px]">
          {filters.map(([label, n], i) => (
            <span
              key={label}
              data-demo={`filter-${i}`}
              className={`rounded-[6px] px-2.5 py-1 transition-colors duration-200 ${
                i === demo.filter ? "bg-white font-medium text-navy shadow-[0_1px_2px_rgba(14,42,71,.1)]" : "text-navy/55"
              }`}
            >
              {label} <span className="tabular-nums text-navy/40">{n}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-6 mt-4 overflow-hidden rounded-[10px] ring-1 ring-hairline">
        <div className="grid grid-cols-[28px_minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,0.9fr)_28px] items-center gap-3 bg-mist/70 px-4 py-2.5 text-[11px] font-medium text-navy/55">
          <span className="size-3.5 rounded-[4px] ring-1 ring-navy/25" />
          <span>Finding</span>
          <span>Clause</span>
          <span>Location</span>
          <span>Status</span>
          <Settings size={13} className="justify-self-end text-navy/35" />
        </div>
        <AnimatePresence initial={false}>
          {rows.map((r, i) => {
            const selected = i === 0 && demo.drawer && r.title === first.title;
            return (
              <motion.div
                key={r.title}
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                data-demo={i === 0 ? "row-0" : undefined}
                className={`grid grid-cols-[28px_minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,0.9fr)_28px] items-center gap-3 border-t border-hairline px-4 py-[11px] text-[12px] transition-colors ${
                  selected ? "bg-teal-tint/50" : ""
                } ${r.state === "Met" ? "text-navy/55" : ""}`}
              >
                <span className="size-3.5 rounded-[4px] ring-1 ring-navy/25" />
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className={`size-2 shrink-0 rounded-full ${sevDot[r.sev]}`} />
                  <span className={`truncate ${r.state === "Met" ? "" : "font-medium"}`}>{r.title}</span>
                </span>
                <span className="truncate text-navy/60">{r.ref}</span>
                <span className="truncate text-navy/60">{r.where}</span>
                <span className="flex items-center gap-1.5">
                  {r.who ? <Avatar who={r.who} /> : <CircleCheck size={15} className="text-teal-dark" />}
                  <span className={r.state === "In review" ? "font-medium text-[#1D4ED8]" : "text-navy/60"}>{r.state}</span>
                </span>
                <MoreHorizontal size={15} className="justify-self-end text-navy/35" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Detail panel for the first finding */}
      <AnimatePresence>
        {demo.drawer && (
          <motion.aside
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[73px] right-0 bottom-0 w-[340px] border-l border-hairline bg-white px-5 py-5 shadow-[-16px_0_32px_-20px_rgba(14,42,71,.25)]"
          >
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-2 font-medium text-high-fg">
                <span className="size-2 rounded-full bg-high-fg" /> Non-compliant, high
              </span>
              <X size={14} className="text-navy/40" />
            </div>
            <p className="mt-3 text-[15px] leading-snug font-semibold">{first.title}</p>
            <p className="mt-2 text-[12.5px] leading-relaxed text-navy/65">{first.detail}</p>
            <dl className="mt-4 grid grid-cols-[80px_1fr] gap-y-2 text-[12px]">
              <dt className="text-navy/45">Clause</dt>
              <dd className="font-mono text-[11.5px]">{first.ref}</dd>
              <dt className="text-navy/45">Location</dt>
              <dd>{first.where}</dd>
              <dt className="text-navy/45">Owner</dt>
              <dd className="flex items-center gap-1.5">
                <Avatar who="AB" /> Alex Bennett
              </dd>
            </dl>
            <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4">
              <span className="text-[12px] text-navy/55">
                Status:{" "}
                <span className={demo.status === "In review" ? "font-medium text-[#1D4ED8]" : "font-medium text-navy"}>{demo.status}</span>
              </span>
              <span
                data-demo="mark-review"
                className={`flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-medium transition-colors duration-200 ${
                  demo.status === "In review" ? "bg-[#EEF3FF] text-[#1D4ED8]" : "bg-navy text-white"
                }`}
              >
                {demo.status === "In review" && <Check size={13} strokeWidth={2.5} />}
                {demo.status === "In review" ? "In review" : "Mark in review"}
              </span>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Each ticked component brings its own requirements into scope. Ends at 45, as elsewhere on the page. */
const BASE_REQUIREMENTS = 12;
const ADDS: Record<string, number> = { Static: 9, Armoured: 8, "Steel tubes": 10, "Electrical cables (LV)": 6 };

function SetupView({ demo }: { demo: Demo }) {
  const steps = ["Document", "Umbilical scope", "Project scope", "Standards and upload", "Review"];
  const current = demo.setupStep;
  const scope = current === 1;
  // Continue really moves on: the next step's options replace the umbilical ones.
  const groups: { title: string; options: string[] }[] = scope
    ? [
        { title: "Umbilical type", options: ["Dynamic", "Static"] },
        { title: "Construction", options: ["Armoured", "Extruded inner sheath", "Extruded outer sheath"] },
        { title: "Components", options: ["Steel tubes", "Thermoplastic hoses", "Electrical cables (LV)", "Fibre optic cables"] },
      ]
    : projectPhases.slice(0, 3).map((p) => ({ title: p.title, options: p.options.slice(0, 3) }));
  const count = BASE_REQUIREMENTS + demo.picked.reduce((n, o) => n + (ADDS[o] ?? 0), 0);
  return (
    <>
      <Header
        crumb="Reviews / New review"
        title={scope ? "Describe the umbilical" : "Which phases does it cover?"}
        actions={
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-[8px] bg-mist px-3 py-1.5 text-[12px] text-navy/60">
              Requirements in scope
              <motion.span
                key={count}
                initial={{ scale: 1.25, color: "#0f8f81" }}
                animate={{ scale: 1, color: "#0e2a47" }}
                transition={{ duration: 0.35 }}
                className="inline-block min-w-[2ch] text-right font-semibold tabular-nums"
              >
                {count}
              </motion.span>
            </span>
            <span data-demo="continue" className="rounded-[8px] bg-navy px-3 py-1.5 text-[12px] font-medium text-white">
              Continue
            </span>
          </div>
        }
      />
      <div className="px-6 pt-4">
        <ol className="flex items-center gap-2 text-[11.5px]">
          {steps.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span
                className={`flex size-[18px] items-center justify-center rounded-full text-[10px] font-semibold transition-colors duration-300 ${
                  i < current ? "bg-teal text-navy" : i === current ? "bg-navy text-white" : "text-navy/45 ring-1 ring-navy/20"
                }`}
              >
                {i < current ? <Check size={10} strokeWidth={3} /> : i + 1}
              </span>
              <span className={i === current ? "font-medium" : "text-navy/50"}>{s}</span>
              {i < steps.length - 1 && <span className={`h-px w-5 transition-colors duration-300 ${i < current ? "bg-teal" : "bg-navy/15"}`} />}
            </li>
          ))}
        </ol>
        <motion.div
          key={current}
          className="mt-5 flex flex-col gap-4"
          initial={{ x: 32, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {groups.map((g) => (
            <div key={g.title}>
              <p className="text-[12.5px] font-semibold">{g.title}</p>
              <p className="text-[11px] text-navy/45">Pick all that apply.</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {g.options.map((o) => {
                  const on = demo.picked.includes(o);
                  return (
                    <span
                      key={o}
                      data-demo={`opt-${o}`}
                      className={`flex items-center gap-2 rounded-[8px] px-3 py-2 text-[12px] transition-[background-color,box-shadow] duration-200 ${
                        on ? "bg-teal-tint font-medium ring-1 ring-teal" : "ring-1 ring-line"
                      }`}
                    >
                      <span
                        className={`flex size-3.5 items-center justify-center rounded-[4px] transition-colors duration-200 ${
                          on ? "bg-navy text-white" : "ring-1 ring-navy/25"
                        }`}
                      >
                        {on && <Check size={10} strokeWidth={3} />}
                      </span>
                      {o}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </>
  );
}

const PAST_EXPORTS = [
  ["Findings report, Rev B.docx", "Word", "Yesterday", "AB"],
  ["Findings report, Rev A.pdf", "PDF", "3 weeks ago", "JK"],
] as const;

function ReportView({ demo }: { demo: Demo }) {
  const exports = demo.exported ? ([["Findings report, Rev B.pdf", "PDF", "Just now", "AB"], ...PAST_EXPORTS] as const) : PAST_EXPORTS;
  return (
    <>
      <Header
        crumb={`Reports / ${SAMPLE_DOCUMENT}`}
        title="Findings report"
        actions={
          <div className="flex gap-2">
            <span className="rounded-[8px] px-3 py-1.5 text-[12px] font-medium ring-1 ring-line">Export Word</span>
            <span
              data-demo="export-pdf"
              className="flex min-w-[112px] items-center justify-center gap-1.5 rounded-[8px] bg-navy px-3 py-1.5 text-[12px] font-medium text-white"
            >
              {demo.exporting ? (
                <>
                  <LoaderCircle size={13} className="animate-spin" /> Exporting
                </>
              ) : demo.exported ? (
                <>
                  <Check size={13} strokeWidth={2.5} /> Exported
                </>
              ) : (
                <>
                  <Download size={13} /> Export PDF
                </>
              )}
            </span>
          </div>
        }
      />
      <div className="px-6 pt-5">
        <div className="grid grid-cols-3 gap-3">
          {[
            ["Non-compliant", nonCompliant.length, "text-high-fg", "Need correction or justification"],
            ["Missing information", missingInfo.length, "text-medium-fg", "Required content not found"],
            ["Compliant checks", COMPLIANT_TOTAL, "text-teal-dark", "Requirements met"],
          ].map(([l, v, c, d]) => (
            <div key={l as string} className="rounded-[10px] p-4 ring-1 ring-hairline">
              <p className={`text-[11.5px] font-medium ${c}`}>{l}</p>
              <p className="mt-1.5 font-display text-[26px] leading-none font-semibold">{v}</p>
              <p className="mt-1.5 text-[11px] text-navy/50">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-[12.5px] font-semibold">Exports</p>
        <div className="mt-2 overflow-hidden rounded-[10px] ring-1 ring-hairline">
          <AnimatePresence initial={false}>
            {exports.map(([name, kind, when, who], i) => (
              <motion.div
                key={name}
                layout="position"
                initial={{ opacity: 0, backgroundColor: "rgba(232,248,246,1)" }}
                animate={{ opacity: 1, backgroundColor: "rgba(232,248,246,0)" }}
                transition={{ opacity: { duration: 0.3 }, backgroundColor: { duration: 2.2, delay: 0.4 } }}
                data-demo={i === 0 ? "export-row-0" : undefined}
                className={`flex items-center gap-3 px-4 py-3 text-[12px] ${i ? "border-t border-hairline" : ""}`}
              >
                <span
                  className={`flex size-7 items-center justify-center rounded-[7px] ${kind === "PDF" ? "bg-high-bg text-high-fg" : "bg-[#E3ECF7] text-deep"}`}
                >
                  <FileText size={14} />
                </span>
                <span className="flex-1 font-medium">{name}</span>
                <span className="text-navy/50">{when}</span>
                <Avatar who={who} />
                <Download size={14} data-demo={i === 0 ? "export-download-0" : undefined} className="text-navy/40" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <p className="mt-4 text-[11px] text-navy/45">
          This report supports your review. It does not confirm compliance. The responsible engineer keeps final approval.
        </p>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ app */

export function Dashboard({ view, demo = DEMO_END }: { view: View; demo?: Demo }) {
  return (
    <div className="flex h-[600px] gap-2 bg-[#F1F4F8] p-2">
      {/* icon rail */}
      <div className="flex w-[52px] shrink-0 flex-col items-center gap-3 py-3">
        <Badge size={28} />
        <span className="mt-2 flex flex-col gap-2">
          <RailIcon icon={FolderKanban} active />
          <RailIcon icon={Files} />
          <RailIcon icon={Users} />
        </span>
        <span className="mt-auto flex size-8 items-center justify-center rounded-full bg-deep text-[11px] font-semibold text-white">
          AB
        </span>
      </div>

      <Sidebar view={view} />

      <main className="relative min-w-0 flex-1 overflow-hidden rounded-[12px] bg-white ring-1 ring-navy/[0.06]">
        {view === "findings" && <FindingsView demo={demo} />}
        {view === "setup" && <SetupView demo={demo} />}
        {view === "report" && <ReportView demo={demo} />}
      </main>
    </div>
  );
}
