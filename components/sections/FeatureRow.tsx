import type { ReactNode } from "react";

type FeatureRowProps = {
  id?: string;
  bg: "mist" | "white";
  reverse?: boolean;
  title: string;
  body: ReactNode;
  extra?: ReactNode;
  visual: ReactNode;
};

/** DESIGN.md S5–S7: 2-col text + 580×495 coloured visual, alternating sides and backgrounds. */
export function FeatureRow({ id, bg, reverse, title, body, extra, visual }: FeatureRowProps) {
  return (
    <section id={id} className={`section ${bg === "mist" ? "bg-mist" : "bg-white"}`}>
      <div className="container-x grid grid-cols-1 items-center gap-x-24 gap-y-14 lg:grid-cols-[minmax(0,1fr)_580px]">
        <div className={reverse ? "lg:order-2" : ""}>
          <h2 className="t-h2 max-w-[460px] text-balance">{title}</h2>
          <div className="t-body-lg mt-6 flex max-w-[440px] flex-col gap-4 text-pretty text-navy/70">{body}</div>
          {extra && <div className="mt-12">{extra}</div>}
        </div>
        <div className={`aspect-[580/495] w-full max-sm:aspect-auto max-sm:h-[420px] ${reverse ? "lg:order-1" : ""}`}>
          {visual}
        </div>
      </div>
    </section>
  );
}

/** Quiet stat row: big number, short label, hairline dividers. */
export function Stats({ items }: { items: { value: string; label: string }[] }) {
  return (
    <dl className="grid max-w-[480px] grid-cols-3 divide-x divide-line border-t border-line pt-6">
      {items.map((m) => (
        <div key={m.value} className="px-5 first:pl-0">
          <dt className="sr-only">{m.label}</dt>
          <dd className="font-display text-[28px] leading-none font-semibold">{m.value}</dd>
          <dd className="mt-2 text-[13px] leading-[1.45] text-navy/60">{m.label}</dd>
        </div>
      ))}
    </dl>
  );
}
