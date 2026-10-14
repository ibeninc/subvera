import type { CSSProperties } from "react";

/*
 * The hero's waterline: three long, smooth wave lines (bright teal above, deeper teal below,
 * like the bands in the Subvera badge) with a soft teal wash under the surface.
 *
 * Two motions per line, so it reads as water rather than a sliding pattern:
 *  - drift: each line is drawn two screens wide with whole periods and slides left by half
 *    its width on a loop (seamless). Faster on phones so the speed feels the same everywhere.
 *  - swell: the line rises and falls a few pixels while its waves grow and flatten, each line
 *    out of step with the others. Stroke width stays constant (non-scaling stroke).
 * Pure SVG + CSS; no script. Still for prefers-reduced-motion.
 */

const W = 2400; // viewBox width: two copies of the visible width
const PERIOD = 800; // long, calm swells
const H = 120;

function wave(y: number, amp: number, phase = 0) {
  // Smooth sine-like curve from quadratic segments, starting at x = -phase so layers don't line up.
  let d = `M${-phase} ${y} Q${-phase + PERIOD / 4} ${y - amp} ${-phase + PERIOD / 2} ${y}`;
  for (let x = -phase + PERIOD; x <= W + PERIOD; x += PERIOD / 2) d += ` T${x} ${y}`;
  return d;
}

type Line = {
  y: number;
  amp: number;
  phase: number;
  color: string;
  opacity: number;
  drift: string; // desktop loop
  driftSm: string; // phone loop
  swell: string;
  delay: string;
  reverse?: boolean;
};

const lines: Line[] = [
  { y: 36, amp: 18, phase: 0, color: "#14b8a6", opacity: 0.6, drift: "12s", driftSm: "7s", swell: "4.5s", delay: "0s" },
  { y: 58, amp: 15, phase: 150, color: "#119e90", opacity: 0.45, drift: "16s", driftSm: "9s", swell: "5.5s", delay: "-1.8s", reverse: true },
  { y: 80, amp: 12, phase: 300, color: "#0f7f75", opacity: 0.32, drift: "20s", driftSm: "11s", swell: "6.5s", delay: "-3.2s" },
];

const vars = (l: Line) =>
  ({ "--drift": l.drift, "--drift-sm": l.driftSm, "--swell": l.swell, "--swell-delay": l.delay }) as CSSProperties;

/** `fade` is the background colour the line ends melt into (white on the hero, navy on dark panels). */
export function Waterline({ className = "", fade = "#fff" }: { className?: string; fade?: string }) {
  const surface = lines[0];
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 overflow-hidden ${className}`}>
      {/* soft wash under the surface line, moving with it */}
      <div className="waterline-swell absolute inset-0" style={vars(surface)}>
        <svg className="waterline-drift absolute inset-y-0 left-0 h-full w-[200%]" style={vars(surface)} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <defs>
            <linearGradient id="waterline-wash" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${wave(surface.y, surface.amp)} L${W + PERIOD} ${H} L0 ${H} Z`} fill="url(#waterline-wash)" />
        </svg>
      </div>

      {lines.map((l) => (
        <div key={l.y} className="waterline-swell absolute inset-0" style={vars(l)}>
          <svg
            className={`waterline-drift absolute inset-y-0 left-0 h-full w-[200%] ${l.reverse ? "waterline-reverse" : ""}`}
            style={vars(l)}
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
          >
            <path
              d={wave(l.y, l.amp, l.phase)}
              fill="none"
              stroke={l.color}
              strokeOpacity={l.opacity}
              strokeWidth={2.25}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      ))}

      {/* fade the ends so the lines melt into the page instead of stopping at the edge */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${fade} 0%, transparent 12%, transparent 88%, ${fade} 100%)` }} />
    </div>
  );
}
