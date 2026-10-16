"use client";

import { ChevronLeft, ChevronRight, FileText, Search } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";
import { useEffect, useId, useRef, type ReactNode } from "react";

/*
 * Page-level building blocks shared by the app screens:
 * an intro header with the brand swell, section titles, filter tabs, search, pagination.
 */

/** Page gutter, shared by the intro and the content so everything lines up. */
export const gutter = "px-10 max-lg:px-8 max-md:px-5";

/** Faint brand wave lines behind a page intro, fading out towards the title. */
function Swell() {
  const line = (y: number, a: number) => {
    let d = `M0 ${y} Q100 ${y - a} 200 ${y}`;
    for (let x = 400; x <= 1400; x += 200) d += ` T${x} ${y}`;
    return d;
  };
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] w-full [mask-image:linear-gradient(to_right,transparent_30%,black_85%)] print:hidden"
    >
      <path d={line(70, 16)} fill="none" stroke="#14b8a6" strokeOpacity=".22" strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
      <path d={line(98, 12)} fill="none" stroke="#0f8f81" strokeOpacity=".14" strokeWidth="1.25" vectorEffect="non-scaling-stroke" transform="translate(-90 0)" />
      <path d={line(124, 9)} fill="none" stroke="#0e2a47" strokeOpacity=".07" strokeWidth="1.25" vectorEffect="non-scaling-stroke" transform="translate(-40 0)" />
    </svg>
  );
}

/** The header at the top of each app page: eyebrow, title, one plain sentence, actions. */
export function PageIntro({
  eyebrow,
  title,
  summary,
  actions,
}: {
  eyebrow: ReactNode;
  title: string;
  summary?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden border-b border-hairline print:hidden">
      <Swell />
      <div className={`relative flex flex-wrap items-end justify-between gap-x-8 gap-y-5 pt-9 pb-8 max-md:pt-7 max-md:pb-6 ${gutter}`}>
        <div className="min-w-0">
          <p className="text-[13px] text-fg-subtle">{eyebrow}</p>
          <h1 className="mt-1 text-[26px] leading-tight font-semibold tracking-[-0.025em] max-md:text-[22px]">{title}</h1>
          {summary && <p className="mt-2 max-w-[72ch] text-[14.5px] leading-relaxed text-fg-muted">{summary}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
      </div>
    </header>
  );
}

/** The content column under a PageIntro. */
export function PageBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex max-w-[1180px] flex-col gap-14 pt-9 pb-16 max-md:gap-12 max-md:pt-7 ${gutter} ${className}`}>{children}</div>;
}

export function SectionTitle({ id, title, hint, action }: { id?: string; title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <h2 id={id} className="text-[18px] font-semibold tracking-[-0.015em]">
        {title}
        {hint && <span className="ml-3 font-sans text-[13px] font-normal tracking-normal text-fg-subtle max-sm:hidden">{hint}</span>}
      </h2>
      {action}
    </div>
  );
}

/** Segmented filter with counts and a sliding selection pill. Tabs with nothing in them are disabled. */
export function FilterTabs<K extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: K; label: string; count?: number }[];
  value: K;
  onChange: (key: K) => void;
}) {
  const id = useId();
  return (
    <LayoutGroup id={id}>
      <div role="tablist" aria-label={label} className="flex gap-0.5 overflow-x-auto rounded-[10px] bg-navy/[0.05] p-1 max-sm:w-full">
        {options.map((o) => {
          const on = value === o.key;
          return (
            <button
              key={o.key}
              role="tab"
              aria-selected={on}
              type="button"
              disabled={o.count === 0 && !on}
              onClick={() => onChange(o.key)}
              className={`relative flex h-7 shrink-0 items-center gap-1.5 rounded-[7px] px-2.5 text-[13px] whitespace-nowrap transition-colors disabled:opacity-40 max-sm:flex-1 max-sm:justify-center max-sm:px-1.5 ${
                on ? "font-medium text-navy" : "text-fg-muted hover:text-navy"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="pill"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                  className="absolute inset-0 rounded-[7px] bg-white shadow-[0_1px_2px_rgba(14,42,71,.12)] ring-1 ring-edge"
                />
              )}
              <span className="relative">{o.label}</span>
              {o.count !== undefined && (
                <span className={`relative text-[12px] tabular-nums ${on ? "text-fg-muted" : "text-fg-subtle"}`}>{o.count}</span>
              )}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export function SearchField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="flex h-9 w-full max-w-[320px] items-center gap-2 rounded-[9px] bg-white px-3 text-[14px] shadow-[0_1px_2px_rgba(14,42,71,.05)] ring-1 ring-edge transition-shadow focus-within:ring-2 focus-within:ring-teal max-sm:max-w-none">
      <Search size={15} className="shrink-0 text-fg-subtle" aria-hidden />
      <span className="sr-only">{placeholder}</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none placeholder:text-fg-subtle [&::-webkit-search-cancel-button]:hidden"
      />
    </label>
  );
}

/** Which page numbers to show: always first and last, the current page and its neighbours, gaps as null. */
function pageList(page: number, pages: number): (number | null)[] {
  const keep = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...keep].sort((a, b) => a - b);
  return sorted.flatMap((n, i) => (i > 0 && n - sorted[i - 1] > 1 ? [null, n] : [n]));
}

/**
 * Numbered pagination for full lists. Renders nothing for a single page.
 * Phones get previous / next with "Page 2 of 5"; wider screens add the page numbers.
 */
export function Pagination({
  page,
  pageSize,
  total,
  onPage,
  noun,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  noun: string;
}) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const step = "flex size-8 items-center justify-center rounded-[8px] text-[13px] tabular-nums transition-colors";

  return (
    <nav
      aria-label={`${noun} pages`}
      className="flex items-center justify-between gap-4 rounded-b-[14px] border-t border-hairline bg-mist/50 px-5 py-3"
    >
      <p className="text-[13px] text-fg-subtle tabular-nums">
        <span className="max-sm:hidden">
          {from}&ndash;{to} of {total} {noun}
        </span>
        <span className="sm:hidden">
          Page {page} of {pages}
        </span>
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className={`${step} text-fg-muted hover:bg-white hover:text-navy hover:ring-1 hover:ring-edge disabled:pointer-events-none disabled:opacity-35 max-sm:size-10`}
        >
          <ChevronLeft size={16} />
        </button>
        {pageList(page, pages).map((n, i) =>
          n === null ? (
            <span key={`gap-${i}`} className="w-6 text-center text-fg-subtle max-sm:hidden" aria-hidden>
              &hellip;
            </span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onPage(n)}
              aria-current={n === page ? "page" : undefined}
              className={`${step} max-sm:hidden ${
                n === page ? "bg-white font-medium text-navy shadow-[0_1px_2px_rgba(14,42,71,.1)] ring-1 ring-edge" : "text-fg-muted hover:bg-white hover:text-navy"
              }`}
            >
              {n}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page === pages}
          aria-label="Next page"
          className={`${step} text-fg-muted hover:bg-white hover:text-navy hover:ring-1 hover:ring-edge disabled:pointer-events-none disabled:opacity-35 max-sm:size-10`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}

/** Square file icon used in lists and cards. */
export function FileTile({ size = 36, tone = "mist" }: { size?: number; tone?: "mist" | "navy" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-[9px] ring-1 ${
        tone === "navy" ? "bg-navy text-white ring-navy" : "bg-mist text-fg-muted ring-edge"
      }`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <FileText size={Math.round(size * 0.47)} strokeWidth={1.6} />
    </span>
  );
}

/** Empty or no-results state inside a list surface. */
export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-[15px] font-medium">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-[46ch] text-[14px] text-fg-muted">{children}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

/** A small confirm dialog on the app's surfaces. Escape or the backdrop closes it. */
export function Dialog({
  title,
  children,
  actions,
  onClose,
}: {
  title: string;
  children: ReactNode;
  actions: ReactNode;
  onClose: () => void;
}) {
  const id = useId();
  const panel = useRef<HTMLDivElement>(null);

  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    window.addEventListener("keydown", onKey);
    // Start keyboard focus inside the dialog, on its last action (the confirm).
    const focusable = panel.current?.querySelectorAll<HTMLElement>("button, a");
    focusable?.[focusable.length - 1]?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden" role="dialog" aria-modal="true" aria-labelledby={id}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-navy/30" onClick={onClose} />
      <div
        ref={panel}
        className="relative w-full max-w-[540px] rounded-[14px] bg-white shadow-[0_24px_60px_-20px_rgba(14,42,71,.45)] ring-1 ring-edge"
      >
        <div className="px-6 pt-5 pb-4 max-md:px-5">
          <h2 id={id} className="text-[17px] font-semibold tracking-[-0.01em]">
            {title}
          </h2>
          <div className="mt-2 text-[14px] leading-relaxed text-fg-muted">{children}</div>
        </div>
        <div className="flex flex-wrap justify-end gap-2 rounded-b-[14px] border-t border-hairline bg-mist/50 px-6 py-3.5 max-md:px-5">{actions}</div>
      </div>
    </div>
  );
}
