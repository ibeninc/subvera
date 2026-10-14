"use client";

import { SearchX, TriangleAlert } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Node } from "./Node";

/** Navy panel: a finding drops in tilted, the missing-info node slides under it, connector draws (DESIGN.md PinkWebhook). */
export function NavyFindings() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const reduce = useReducedMotion();
  const show = inView || reduce;

  return (
    <div ref={ref} className="bg-dots-dark relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-navy">
      <motion.div
        className="flex w-full justify-center"
        initial={reduce ? false : { rotate: 2, opacity: 0.7, filter: "blur(4px)" }}
        animate={show ? { rotate: 0, opacity: 1, filter: "blur(0px)" } : undefined}
        transition={{ duration: 0.6 }}
      >
        <Node icon={TriangleAlert} iconBg="bg-[#E5322D]" title="Non-compliant, high">
          <p className="font-medium text-navy">Tensile utilisation above the acceptance limit</p>
          <p className="mt-1">API 17E clause 6.3.2, found in section 6.3, page 28</p>
        </Node>
      </motion.div>

      <svg width="20" height="44" viewBox="0 0 20 44" aria-hidden className="text-white/40">
        <motion.path
          d="M10 0 V44"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
          initial={reduce ? false : { pathLength: 0 }}
          animate={show ? { pathLength: 1 } : undefined}
          transition={{ duration: 0.5, delay: 0.9 }}
        />
      </svg>

      <motion.div
        className="flex w-full justify-center"
        initial={reduce ? false : { y: 40, rotate: -3, opacity: 0 }}
        animate={show ? { y: 0, rotate: 0, opacity: 1 } : undefined}
        transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.6 }}
      >
        <Node icon={SearchX} iconBg="bg-[#E8890C]" title="Missing information">
          <p className="font-medium text-navy">Hydrostatic test hold duration</p>
          <p className="mt-1">API 17E clause 9.2.3, expected in section 9</p>
        </Node>
      </motion.div>
    </div>
  );
}
