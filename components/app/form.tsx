import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { surface } from "@/components/app/ui";

/* Wizard form controls, on the same surfaces and borders as the rest of the app. */

export function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className={surface}>
      <div className="border-b border-hairline px-6 py-4 max-md:px-4">
        <h3 className="font-sans text-[15px] font-semibold tracking-normal">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] text-fg-subtle">{subtitle}</p>}
      </div>
      <div className="px-6 py-5 max-md:px-4">{children}</div>
    </section>
  );
}

export function Group({ title, hint, columns = 3, children }: { title: string; hint?: string; columns?: 2 | 3; children: ReactNode }) {
  return (
    <fieldset className="border-t border-hairline pt-5 first:border-t-0 first:pt-0 [&+&]:mt-5">
      <legend className="float-left w-full text-[14px] font-medium">{title}</legend>
      {hint && <p className="clear-both mt-0.5 text-[13px] text-fg-subtle">{hint}</p>}
      <div className={`clear-both mt-3 grid gap-2.5 sm:grid-cols-2 ${columns === 3 ? "xl:grid-cols-3" : ""}`}>{children}</div>
    </fieldset>
  );
}

/** Selectable option tile: a firm edge at rest, a teal ring and tint when picked. */
export function OptionTile({
  label,
  description,
  checked,
  onChange,
  disabled,
  badge,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  badge?: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-[10px] px-3.5 py-3 text-[14px] transition-[box-shadow,background-color] duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-teal ${
        disabled
          ? "cursor-not-allowed bg-mist/60 text-fg-subtle ring-1 ring-edge"
          : checked
            ? "bg-teal-tint/60 shadow-[0_1px_2px_rgba(14,42,71,.05)] ring-[1.5px] ring-teal"
            : "bg-white shadow-[0_1px_2px_rgba(14,42,71,.05)] ring-1 ring-edge hover:ring-navy/25"
      }`}
    >
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} disabled={disabled} />
      <span
        aria-hidden
        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[5px] transition-colors ${
          checked ? "bg-navy text-white" : "bg-white ring-1 ring-navy/25"
        }`}
      >
        {checked && <Check size={11} strokeWidth={3} />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={`flex items-center justify-between gap-2 leading-snug ${checked ? "font-medium" : ""}`}>
          {label}
          {badge && <span className="shrink-0 rounded-full px-1.5 text-[11px] font-medium ring-1 ring-navy/15">{badge}</span>}
        </span>
        {description && <span className="mt-1 block text-[13px] font-normal text-fg-subtle">{description}</span>}
      </span>
    </label>
  );
}

export function Select({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-[14px] font-medium">{label}</span>
      <span className="mt-0.5 block text-[13px] text-fg-subtle">{hint}</span>
      <span className="relative mt-2.5 block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full appearance-none rounded-[9px] bg-white pr-9 pl-3 text-[14px] shadow-[0_1px_2px_rgba(14,42,71,.05)] ring-1 ring-edge outline-none transition-shadow hover:ring-navy/25 focus:ring-2 focus:ring-teal"
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-fg-subtle" aria-hidden />
      </span>
    </label>
  );
}

/** Segmented progress: one bar per step, filled up to the current one, with the step names underneath. */
export function WizardStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div>
      <p className="mb-3 text-[13px] text-fg-subtle md:hidden">
        Step {current + 1} of {steps.length}: <span className="font-medium text-navy">{steps[current]}</span>
      </p>
      <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }} aria-label="Review steps">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={s} aria-current={active ? "step" : undefined}>
              <span className="block h-1 overflow-hidden rounded-full bg-navy/[0.08]">
                <span
                  className={`block h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${done ? "bg-teal" : active ? "bg-navy" : ""}`}
                  style={{ width: done || active ? "100%" : "0%" }}
                />
              </span>
              <span
                className={`mt-2.5 flex items-center gap-1.5 text-[13px] max-md:sr-only ${active ? "font-medium text-navy" : done ? "text-fg-muted" : "text-fg-subtle"}`}
              >
                {done && <Check size={13} strokeWidth={2.5} className="text-teal-dark" aria-hidden />}
                {s}
                {done && <span className="sr-only">, done</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
