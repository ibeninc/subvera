import Link from "next/link";
import { useId } from "react";
import { LOCKUP, LOGO_COLORS, MARK } from "./logo-geometry";

/*
 * The Subvera logo as inline SVG: sharp at any size, no image request, recolours per variant.
 * Geometry lives in logo-geometry.ts (generated with the files in /public/brand and the app icons).
 *
 * Below SMALL_AT px the mark switches to its icon cut: two thicker waves instead of three,
 * so it stays legible in a browser tab or a tight sidebar.
 */
const SMALL_AT = 26;

type Variant = "color" | "reversed";

const disc = (v: Variant) => (v === "reversed" ? LOGO_COLORS.deep : LOGO_COLORS.navy);

function Waves({ cut }: { cut: keyof typeof MARK }) {
  const m = MARK[cut];
  return (
    <>
      {m.waves.map((w) => (
        <path key={w.d} d={w.d} fill="none" stroke={w.color} strokeWidth={m.stroke} strokeLinecap="round" />
      ))}
    </>
  );
}

type LogoProps = {
  /** "color" for white/light backgrounds, "reversed" for navy/dark backgrounds. */
  variant?: Variant;
  /** Rendered width of the horizontal lockup in px. */
  width?: number;
  href?: string | null;
  className?: string;
  /** Kept for call-site compatibility; inline SVG needs no preloading. */
  priority?: boolean;
};

const [, , VB_W, VB_H] = LOCKUP.viewBox;

/** Horizontal lockup: mark + wordmark. */
export function Logo({ variant = "color", width = 120, href = "/", className = "" }: LogoProps) {
  const titleId = useId();
  const height = Math.round((width * VB_H) / VB_W);
  const markPx = (width * LOCKUP.disc.r * 2) / VB_W;

  const svg = (
    <svg
      viewBox={LOCKUP.viewBox.join(" ")}
      width={width}
      height={height}
      role="img"
      aria-labelledby={titleId}
      className={`block shrink-0 ${className}`}
    >
      <title id={titleId}>Subvera</title>
      <g transform={`translate(${LOCKUP.markOrigin.join(" ")}) scale(${LOCKUP.markScale})`}>
        <circle cx="50" cy="50" r="50" fill={disc(variant)} />
        <Waves cut={markPx < SMALL_AT ? "small" : "full"} />
      </g>
      <path d={LOCKUP.wordmark} fill={variant === "reversed" ? LOGO_COLORS.white : LOGO_COLORS.navy} />
    </svg>
  );

  if (!href) return svg;
  return (
    <Link href={href} aria-label="Subvera home" className="inline-flex shrink-0">
      {svg}
    </Link>
  );
}

/** The mark on its own (app rail, avatars of the product, report headers). Decorative by default. */
export function Badge({
  size = 32,
  variant = "color",
  className = "",
  label,
}: {
  size?: number;
  variant?: Variant;
  className?: string;
  /** Give it a label when the mark stands alone as the brand (otherwise it's hidden from screen readers). */
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`block shrink-0 ${className}`}
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <circle cx="50" cy="50" r="50" fill={disc(variant)} />
      <Waves cut={size < SMALL_AT ? "small" : "full"} />
    </svg>
  );
}
