import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { SAMPLE_TODAY, counts, findPerson, type FindingKind, type MemberId, type Review } from "@/lib/data";

/* Shared building blocks for the app screens, matching the hero dashboard. */

const avatarTones = ["bg-[#DCE7F3] text-navy", "bg-[#E0F2EF] text-teal-dark", "bg-[#FBE9D7] text-[#92570B]", "bg-[#ECE7F6] text-[#5B3E96]", "bg-[#E7EEF0] text-[#2F5560]"];

/** A steady tone per person, so the same engineer always gets the same colour. */
function toneFor(id: MemberId) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return avatarTones[h % avatarTones.length];
}

export function Avatar({ id, size = 22 }: { id: MemberId; size?: number }) {
  const m = findPerson(id);
  return (
    <span
      title={m?.name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${toneFor(id)}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.43) }}
    >
      {id}
    </span>
  );
}

export function kindColor(kind: FindingKind) {
  if (kind === "compliant") return "bg-teal";
  if (kind === "missing") return "bg-missing";
  return "bg-high-fg";
}

export function KindDot({ kind }: { kind: FindingKind }) {
  return <span className={`size-2 shrink-0 rounded-full ${kindColor(kind)}`} aria-hidden />;
}

/**
 * One icon per result: a crossed circle for non-compliant, a dashed ring for missing
 * information (it's a gap, not a failure), a check for compliant.
 */
export function KindIcon({ kind, className = "" }: { kind: FindingKind; className?: string }) {
  if (kind === "compliant") return <Check size={14} strokeWidth={2.25} className={`text-teal-dark ${className}`} aria-hidden />;
  if (kind === "missing")
    return (
      <svg viewBox="0 0 14 14" className={`size-3.5 text-missing ${className}`} aria-hidden>
        <circle cx="7" cy="7" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2.6 2" />
      </svg>
    );
  return (
    <svg viewBox="0 0 14 14" className={`size-3.5 text-high-fg ${className}`} aria-hidden>
      <circle cx="7" cy="7" r="6" fill="currentColor" />
      <path d="M4.9 4.9l4.2 4.2M9.1 4.9l-4.2 4.2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Result icon plus its word. Colour and shape back up the label, they never replace it. */
export function KindText({ kind, short }: { kind: FindingKind; short?: boolean }) {
  const tone = kind === "compliant" ? "text-teal-dark" : kind === "missing" ? "text-fg-muted" : "font-medium text-high-fg";
  return (
    <span className={`inline-flex items-center gap-2 ${tone}`}>
      <KindIcon kind={kind} />
      {short && kind === "missing" ? "Missing info" : kindLabel(kind)}
    </span>
  );
}

/** The three result counts as a proportional bar with icons under it. */
export function ResultsSummary({ r }: { r: Pick<Review, "findings" | "compliantTotal"> }) {
  const c = counts(r);
  return (
    <span className="flex flex-col gap-2">
      <span className="flex h-1.5 max-w-[180px] gap-[2px] overflow-hidden rounded-full" aria-hidden>
        {[
          { n: c.nonCompliant, cls: "bg-high-fg" },
          { n: c.missing, cls: "bg-missing" },
          { n: c.compliant, cls: "bg-teal/60" },
        ]
          .filter((s) => s.n > 0)
          .map((s, i) => (
            <span key={i} className={`h-full min-w-1.5 rounded-full ${s.cls}`} style={{ flexGrow: s.n }} />
          ))}
      </span>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-fg-subtle tabular-nums">
        {c.nonCompliant > 0 && (
          <span className="inline-flex items-center gap-1.5" title="Non-compliant">
            <KindIcon kind="non-compliant" /> {c.nonCompliant}
          </span>
        )}
        {c.missing > 0 && (
          <span className="inline-flex items-center gap-1.5" title="Missing information">
            <KindIcon kind="missing" /> {c.missing}
          </span>
        )}
        <span>{c.compliant} compliant</span>
      </span>
    </span>
  );
}

/** A clause reference, set in mono so section numbers line up and read as identifiers. */
export function ClauseRef({ standard, clause }: { standard: string; clause: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-navy/[0.04] px-1.5 py-0.5 font-mono text-[12px] whitespace-nowrap text-fg-muted ring-1 ring-navy/[0.06] ring-inset">
      <span className="text-fg-subtle">{standard}</span>
      {clause}
    </span>
  );
}

/** Avatar with a first name beside it. */
export function Person({ id, full }: { id?: MemberId; full?: boolean }) {
  const m = findPerson(id);
  if (!id || !m) return <span className="text-fg-subtle">Unknown</span>;
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Avatar id={id} size={22} />
      <span className="truncate text-fg-muted">{full ? m.name : m.name.split(" ")[0]}</span>
    </span>
  );
}

/** Small status pill with a dot; `pulse` for work that's still happening. */
export function StatusPill({ tone, children, pulse }: { tone: "blue" | "teal" | "neutral"; children: ReactNode; pulse?: boolean }) {
  const t = {
    blue: ["bg-[#EEF3FF] text-[#1D4ED8]", "bg-[#1D4ED8]"],
    teal: ["bg-met-bg text-teal-dark", "bg-teal-dark"],
    neutral: ["bg-navy/[0.05] text-fg-muted", "bg-fg-subtle"],
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[12px] font-medium whitespace-nowrap ${t[0]}`}>
      <span className={`size-1.5 rounded-full ${t[1]} ${pulse ? "animate-pulse motion-reduce:animate-none" : ""}`} aria-hidden />
      {children}
    </span>
  );
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Today" for the sample data's current day, otherwise "9 Oct". The year shows only when it differs. */
export function shortDate(value: string) {
  const m = /^(\d{1,2}) (\w{3}) (\d{4})$/.exec(value);
  if (!m) return value;
  const today = new Date(SAMPLE_TODAY);
  if (Date.UTC(+m[3], MONTHS.indexOf(m[2]), +m[1]) === SAMPLE_TODAY) return "Today";
  return +m[3] === today.getUTCFullYear() ? `${+m[1]} ${m[2]}` : value;
}

/** Drops the file extension for display; the full name stays in the title attribute. */
export function docName(file: string) {
  return file.replace(/\.pdf$/i, "");
}

export function kindLabel(kind: FindingKind) {
  if (kind === "compliant") return "Compliant";
  if (kind === "missing") return "Missing information";
  return "Non-compliant";
}

/** Page header inside the main panel. `meta` is a quiet line under the title. */
export function PageHeader({
  crumb,
  title,
  meta,
  actions,
  className = "px-6 py-5 max-md:px-4 max-md:py-4",
}: {
  crumb?: ReactNode;
  title: string;
  meta?: ReactNode;
  actions?: ReactNode;
  /** Padding; pass the page's own gutter so the title lines up with the content below. */
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-b border-hairline ${className}`}>
      <div className="min-w-0">
        {crumb && <p className="mb-1 truncate text-[12px] text-fg-subtle">{crumb}</p>}
        <h1 className="truncate font-display text-[22px] leading-tight font-semibold tracking-[-0.02em]">{title}</h1>
        {meta && <p className="mt-1.5 max-w-[72ch] text-[14px] leading-relaxed text-fg-muted">{meta}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Small square app buttons (the dashboard uses 8px radius, not the marketing pills). */
const appBtn = {
  primary: "bg-navy text-white hover:bg-deep",
  outline: "bg-white text-navy ring-1 ring-edge shadow-[0_1px_2px_rgba(14,42,71,.05)] hover:bg-mist/60 hover:ring-navy/25",
  ghost: "text-navy/70 hover:bg-navy/[0.05] hover:text-navy",
};

export function appButton(variant: keyof typeof appBtn = "outline", className = "") {
  return `inline-flex items-center justify-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[13px] leading-5 font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-40 ${appBtn[variant]} ${className}`;
}

/*
 * Surfaces. The outer edge uses `edge` plus a 1px shadow so a card separates from the page;
 * dividers inside a surface stay on the lighter `hairline`, so structure reads outside-in.
 */
export const surface = "rounded-[14px] bg-white ring-1 ring-edge shadow-[0_1px_2px_rgba(14,42,71,.05)]";
export const surfaceHover =
  "transition-[box-shadow,transform] duration-200 hover:shadow-[0_8px_24px_-12px_rgba(14,42,71,.2)] hover:ring-navy/20";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`${surface} ${className}`}>{children}</div>;
}
