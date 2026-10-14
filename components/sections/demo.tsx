"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/*
 * Scripted product demos for the hero mock-ups (desktop and phone).
 *
 * A script is a list of steps. Each step points at an element tagged data-demo="<target>",
 * measured at that moment so it stays accurate whatever the layout, then taps or clicks it,
 * applies a change to the mock's state and holds. A step without a target just applies its
 * change (something finishing on its own, like an export).
 *
 * Two pointer styles:
 *  - "cursor" (desktop): glides between targets and clicks, like a mouse.
 *  - "touch" (phones): a fingertip appears on the target, presses and lifts. Fingers don't
 *    hover or travel across the screen, so it never glides.
 */

export type Step<S> = { target?: string; click?: boolean; apply?: (s: S) => S; hold: number };
export type Pointer = { x: number; y: number; shown: boolean; jump: boolean };

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const MOVE_MS = 750;

/** False while the browser tab is hidden, including a page that was opened in the background. */
export function usePageVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === "visible");
    onChange();
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  return visible;
}

/**
 * Which tab is showing, plus autoplay: `next` moves on when a story ends (waiting while
 * `holding` is true, e.g. a hovered or touched mock), `pick` jumps to a tab and replays it.
 */
export function useTour<V>(order: readonly V[], holding: RefObject<boolean>) {
  const [view, setView] = useState<V>(order[0]);
  const [replay, setReplay] = useState(0);
  const next = useCallback(async () => {
    while (holding.current) await sleep(300);
    setView((v) => order[(order.indexOf(v) + 1) % order.length]);
  }, [order, holding]);
  const pick = useCallback((v: V) => {
    setView(v);
    setReplay((r) => r + 1);
  }, []);
  return { view, replay, next, pick };
}

/** Plays one script while `run` is true; restarts when `id` or `replay` change. */
export function useDemoPlayer<S>({
  id,
  steps,
  start,
  run,
  replay,
  root,
  onDone,
  mode,
}: {
  id: string;
  steps: Step<S>[];
  start: S;
  run: boolean;
  replay: number;
  root: RefObject<HTMLElement | null>;
  onDone: () => void;
  mode: "cursor" | "touch";
}) {
  const [state, setState] = useState<S>(start);
  const [pointer, setPointer] = useState<Pointer>({ x: 0, y: 0, shown: false, jump: true });
  const [taps, setTaps] = useState(0);
  const [step, setStep] = useState(0);
  const latest = useRef({ steps, start, onDone });
  useEffect(() => {
    latest.current = { steps, start, onDone };
  });

  useEffect(() => {
    if (!run) return;
    let dead = false;
    const { steps, start } = latest.current;
    const locate = (key: string) => {
      const box = root.current;
      const el = box?.querySelector<HTMLElement>(`[data-demo="${CSS.escape(key)}"]`);
      if (!box || !el) return null;
      const a = box.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      return { x: b.left - a.left + b.width / 2, y: b.top - a.top + b.height / 2 };
    };

    (async () => {
      setState(start);
      setStep(0);
      if (mode === "cursor") {
        // appear in place on the lower right, then start moving
        const box = root.current?.getBoundingClientRect();
        if (box) setPointer({ x: box.width * 0.72, y: box.height * 0.78, shown: true, jump: true });
      }
      await sleep(600);

      for (const [i, s] of steps.entries()) {
        if (dead) return;
        const p = s.target ? locate(s.target) : null;
        if (p && mode === "cursor") {
          setPointer({ ...p, shown: true, jump: false });
          await sleep(MOVE_MS);
          if (dead) return;
          if (s.click !== false) {
            setTaps((t) => t + 1);
            await sleep(140);
          }
        } else if (p && mode === "touch") {
          setPointer({ ...p, shown: true, jump: true }); // finger lands
          await sleep(260);
          if (dead) return;
          setTaps((t) => t + 1); // press
          await sleep(160);
        }
        if (dead) return;
        if (s.apply) setState(s.apply);
        setStep(i + 1);
        if (p && mode === "touch") {
          await sleep(180);
          setPointer((q) => ({ ...q, shown: false })); // finger lifts
        }
        await sleep(s.hold);
      }
      if (!dead) latest.current.onDone();
    })();

    return () => {
      dead = true;
    };
  }, [id, run, replay, root, mode]);

  // A paused demo hides its pointer (off screen, hidden tab).
  return { state, pointer: run ? pointer : { ...pointer, shown: false }, taps, progress: step / steps.length };
}

/** Desktop pointer: glides between targets, dips and sends out a ring on each click. */
export function DemoCursor({ pointer, taps }: { pointer: Pointer; taps: number }) {
  const glide = { duration: pointer.jump ? 0 : MOVE_MS / 1000, ease: [0.45, 0, 0.2, 1] as const };
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-20"
      initial={false}
      animate={{ x: pointer.x, y: pointer.y, opacity: pointer.shown ? 1 : 0 }}
      transition={{ x: glide, y: glide, opacity: { duration: 0.3 } }}
    >
      {taps > 0 && (
        <motion.span
          key={taps}
          className="absolute -top-4 -left-4 size-8 rounded-full border-2 border-teal"
          initial={{ scale: 0.3, opacity: 0.9 }}
          animate={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}
      <motion.svg
        key={`p${taps}`}
        width="20"
        height="20"
        viewBox="0 0 18 18"
        className="-translate-x-[2px] -translate-y-[1.5px] drop-shadow-[0_2px_3px_rgba(0,0,0,.25)]"
        initial={{ scale: taps > 0 ? 0.82 : 1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        style={{ originX: 0.1, originY: 0.1 }}
      >
        <path d="M2 1.5 16 7.2l-6.2 1.9L7 15.5 2 1.5Z" fill="#0e2a47" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
      </motion.svg>
    </motion.div>
  );
}

/** Phone pointer: a fingertip that lands on the target, presses (with a ring) and lifts. */
export function DemoTouch({ pointer, taps }: { pointer: Pointer; taps: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute top-0 left-0 z-30" style={{ transform: `translate(${pointer.x}px, ${pointer.y}px)` }}>
      <motion.span
        className="absolute -top-[22px] -left-[22px] size-11 rounded-full border border-white/70 bg-navy/25 shadow-[0_4px_14px_rgba(14,42,71,.25)] backdrop-blur-[1px]"
        initial={false}
        animate={{ opacity: pointer.shown ? 1 : 0, scale: pointer.shown ? 1 : 1.25 }}
        transition={{ duration: 0.18 }}
      />
      {taps > 0 && (
        <motion.span
          key={taps}
          className="absolute -top-[22px] -left-[22px] size-11 rounded-full border-2 border-teal"
          initial={{ scale: 0.6, opacity: 0.9 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}
    </div>
  );
}
