"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

/*
 * Umbilical cross-section. The components picked in the review scope light up in teal;
 * everything else stays as a faint outline, because Subvera won't check requirements for it.
 * Matches the sample review: static, armoured, steel tubes + LV electrical cables.
 */

type Kind = "steel" | "hose" | "elec" | "filler";

const C = 200; // centre of the 400×400 drawing
const RING = 88;
const layout: Kind[] = ["steel", "hose", "elec", "steel", "hose", "elec", "steel", "filler"];

const inScope: Record<Kind | "fibre" | "armour", boolean> = {
  steel: true,
  elec: true,
  armour: true,
  hose: false,
  fibre: false,
  filler: false,
};

const order: (Kind | "fibre" | "armour")[] = ["armour", "steel", "elec"];

const legend = [
  { label: "Steel tubes", on: true },
  { label: "Electrical cables (LV)", on: true },
  { label: "Armour", on: true },
  { label: "Thermoplastic hoses", on: false },
  { label: "Fibre optic", on: false },
];

const TEAL = "#14b8a6";
// Round so server and browser render identical coordinates (avoids hydration mismatch).
const r2 = (n: number) => Math.round(n * 100) / 100;
const LINE = "rgba(255,255,255,.28)";

export function CrossSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const lit = inView || reduce;

  const delayFor = (kind: Kind | "fibre" | "armour") => 0.3 + Math.max(0, order.indexOf(kind)) * 0.35;

  const fill = (kind: Kind | "fibre" | "armour") => ({
    initial: reduce ? false : { fill: "rgba(20,184,166,0)", stroke: LINE },
    animate: lit && inScope[kind] ? { fill: "rgba(20,184,166,.9)", stroke: TEAL } : { fill: "rgba(20,184,166,0)", stroke: LINE },
    transition: { duration: 0.5, delay: reduce ? 0 : delayFor(kind) },
  });

  return (
    <div
      ref={ref}
      className="relative flex h-full w-full items-center gap-6 overflow-hidden rounded-lg bg-deep px-6 max-sm:gap-4 max-sm:px-4"
    >
      <svg
        viewBox="0 0 400 400"
        className="aspect-square h-[88%] max-h-[290px] shrink-0 max-sm:h-auto max-sm:w-[52%] lg:max-h-[400px]"
        role="img"
        aria-label="Umbilical cross-section with steel tubes, electrical cables and armour highlighted as in scope"
      >
        {/* outer and inner sheath */}
        <circle cx={C} cy={C} r={186} fill="none" stroke={LINE} strokeWidth={2} />
        <circle cx={C} cy={C} r={128} fill="none" stroke={LINE} strokeWidth={1.5} strokeDasharray="3 5" />

        {/* armour wires */}
        {Array.from({ length: 60 }).map((_, i) => {
          const a = (i / 60) * Math.PI * 2;
          return (
            <motion.circle
              key={i}
              cx={r2(C + Math.cos(a) * 157)}
              cy={r2(C + Math.sin(a) * 157)}
              r={6.5}
              strokeWidth={1.2}
              {...fill("armour")}
            />
          );
        })}

        {/* functional components around the core */}
        {layout.map((kind, i) => {
          const a = (i / layout.length) * Math.PI * 2 - Math.PI / 2;
          const x = r2(C + Math.cos(a) * RING);
          const y = r2(C + Math.sin(a) * RING);
          if (kind === "steel")
            return (
              <g key={i}>
                <motion.circle cx={x} cy={y} r={26} strokeWidth={2} {...fill("steel")} />
                <circle cx={x} cy={y} r={14} fill="#143a63" stroke={LINE} strokeWidth={1} />
              </g>
            );
          if (kind === "hose")
            return (
              <g key={i}>
                <motion.circle cx={x} cy={y} r={25} strokeWidth={6} {...fill("hose")} />
                <circle cx={x} cy={y} r={12} fill="#143a63" />
              </g>
            );
          if (kind === "elec")
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={27} fill="none" stroke={LINE} strokeWidth={1.5} />
                {[0, 1, 2].map((k) => {
                  const b = (k / 3) * Math.PI * 2 - Math.PI / 2;
                  return (
                    <motion.circle
                      key={k}
                      cx={r2(x + Math.cos(b) * 11)}
                      cy={r2(y + Math.sin(b) * 11)}
                      r={9}
                      strokeWidth={1.5}
                      {...fill("elec")}
                    />
                  );
                })}
              </g>
            );
          return <circle key={i} cx={x} cy={y} r={20} fill="none" stroke={LINE} strokeWidth={1} strokeDasharray="2 4" />;
        })}

        {/* fibre optic at the centre */}
        <motion.circle cx={C} cy={C} r={20} strokeWidth={2} {...fill("fibre")} />
        <circle cx={C} cy={C} r={6} fill={LINE} />
      </svg>

      <ul className="flex min-w-0 flex-col gap-3 text-[14px] max-sm:gap-2 max-sm:text-[12px] lg:gap-4 lg:text-[15px]">
        {legend.map((l, i) => (
          <motion.li
            key={l.label}
            className="flex items-center gap-2.5"
            initial={reduce ? false : { opacity: 0.45 }}
            animate={{ opacity: lit ? (l.on ? 1 : 0.5) : 0.45 }}
            transition={{ duration: 0.4, delay: reduce ? 0 : 0.3 + i * 0.2 }}
          >
            <span
              className={`size-2.5 shrink-0 rounded-full ${l.on ? "bg-teal" : "border border-white/40"}`}
              aria-hidden
            />
            <span className="text-white">{l.label}</span>
            <span className="sr-only">{l.on ? "in scope" : "not in scope"}</span>
          </motion.li>
        ))}
        <li className="mt-2 border-t border-white/15 pt-3 text-[13px] leading-[1.45] text-white/60 max-sm:text-[11px]">
          Only the lit parts get checked.
        </li>
      </ul>
    </div>
  );
}
