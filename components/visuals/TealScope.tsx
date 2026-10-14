"use client";

import { FileText, ListChecks } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Connector, Cursor, Node, Tag } from "./Node";

/** Teal panel: document → standards workflow with two named cursors drifting (DESIGN.md YellowWorkflow). */
export function TealScope() {
  const reduce = useReducedMotion();
  const loop = { duration: 6, repeat: Infinity, ease: "easeInOut" } as const;

  return (
    <div className="bg-dots-tint relative h-full w-full overflow-hidden rounded-lg bg-teal">
      <div className="absolute inset-x-0 top-[12%] flex flex-col items-center">
        <Node icon={FileText} iconBg="bg-navy" title="Document">
          <span className="flex flex-wrap gap-1.5"><Tag>Design report</Tag><Tag>Static umbilical</Tag></span>
        </Node>
        <Connector />
        <motion.div
          className="flex w-full justify-center"
          animate={reduce ? undefined : { x: [0, 0, 6, 6, 0, 0], y: [0, 0, 3, 3, 0, 0] }}
          transition={loop}
        >
          <Node icon={ListChecks} iconBg="bg-deep" title="Standards" selected>
            <div className="flex flex-wrap gap-1.5">
              <Tag>API 17E</Tag>
              <Tag>API 17L1</Tag>
            </div>
          </Node>
        </motion.div>
      </div>

      <motion.div
        className="absolute top-[8%] left-[68%] max-sm:left-[60%]"
        animate={reduce ? undefined : { x: [0, -24, 10, 0], y: [0, 18, 30, 0] }}
        transition={loop}
      >
        <Cursor name="Engineer" color="#0e2a47" />
      </motion.div>
      <motion.div
        className="absolute top-[52%] left-[56%]"
        animate={reduce ? undefined : { x: [0, 0, 6, 6, -20, 0], y: [0, 0, 3, 3, 20, 0] }}
        transition={loop}
      >
        <Cursor name="Reviewer" color="#143a63" />
      </motion.div>

      <div className="absolute inset-x-6 bottom-6 flex items-center justify-between rounded-sm max-sm:inset-x-4 max-sm:bottom-4 bg-white/90 px-4 py-3 text-[13px] backdrop-blur-sm">
        <span className="font-semibold">Requirements selected for your scope</span>
        <span className="font-display text-[18px] font-bold">45</span>
      </div>
    </div>
  );
}
