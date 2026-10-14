"use client";

import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { Children, useCallback, useEffect, useState, type KeyboardEvent, type ReactNode } from "react";

/**
 * Touch slider for phones, plain grid from `md` up.
 *
 * - Next card peeks in, so it's obvious there's more to swipe.
 * - Cards that aren't in focus ease down in scale and opacity as you drag (scroll-linked, not timed).
 * - Either a synced segmented switch (`tabs`) or a progress bar + "1 / 3" counter; arrow keys work when focused.
 * - Respects prefers-reduced-motion (no tween).
 */
export function Slider({
  children,
  label,
  gridClassName = "md:grid-cols-3",
  slideClassName = "",
  tone = "light",
  tabs,
}: {
  children: ReactNode;
  label: string;
  /** Grid columns used once the slider switches off (md and up). */
  gridClassName?: string;
  slideClassName?: string;
  tone?: "light" | "dark";
  /** Optional labels for a segmented switch above the slider, kept in sync with the swipe. */
  tabs?: string[];
}) {
  const slides = Children.toArray(children);
  const [viewportRef, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    skipSnaps: false,
    breakpoints: { "(min-width: 768px)": { active: false } },
  });
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(false);

  const tween = useCallback((api: EmblaCarouselType) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scroll = api.scrollProgress();
    setProgress(Math.max(0, Math.min(1, scroll)));
    if (reduce) return;
    const snaps = api.scrollSnapList();
    api.slideNodes().forEach((node, i) => {
      const snapIndex = Math.min(i, snaps.length - 1);
      const distance = Math.abs(snaps[snapIndex] - scroll) * (snaps.length > 1 ? snaps.length - 1 : 1);
      const t = Math.min(1, distance);
      node.style.transform = `scale(${1 - t * 0.05})`;
      node.style.opacity = String(1 - t * 0.35);
    });
  }, []);

  const reset = useCallback((api: EmblaCarouselType) => {
    api.slideNodes().forEach((node) => {
      node.style.transform = "";
      node.style.opacity = "";
    });
  }, []);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setIndex(embla.selectedScrollSnap());
    const onInit = () => {
      const isActive = embla.internalEngine().options.active !== false;
      setActive(isActive);
      if (isActive) tween(embla);
      else reset(embla);
      onSelect();
    };
    onInit();
    embla.on("reInit", onInit).on("scroll", tween).on("select", onSelect);
    return () => {
      embla.off("reInit", onInit).off("scroll", tween).off("select", onSelect);
    };
  }, [embla, tween, reset]);

  const onKeyDown = (e: KeyboardEvent) => {
    if (!embla || !active) return;
    if (e.key === "ArrowRight") embla.scrollNext();
    if (e.key === "ArrowLeft") embla.scrollPrev();
  };

  const track = tone === "dark" ? "bg-white/15" : "bg-navy/10";
  const fill = tone === "dark" ? "bg-teal" : "bg-navy";

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} onKeyDown={onKeyDown}>
      {active && tabs && (
        <div className="mb-6 flex justify-center md:hidden">
          <div className="relative inline-grid grid-flow-col rounded-pill bg-navy/[0.06] p-1">
            <span
              aria-hidden
              className="absolute inset-y-1 left-1 rounded-pill bg-white shadow-[0_1px_2px_rgba(14,42,71,.12),0_4px_12px_-4px_rgba(14,42,71,.18)]"
              style={{
                width: `calc((100% - 8px) / ${tabs.length})`,
                transform: `translateX(${progress * (tabs.length - 1) * 100}%)`,
              }}
            />
            {tabs.map((t, i) => (
              <button
                key={t}
                type="button"
                onClick={() => embla?.scrollTo(i)}
                aria-pressed={index === i}
                className={`relative z-10 min-w-[112px] rounded-pill px-4 py-2 text-[14px] font-medium transition-colors ${index === i ? "text-navy" : "text-navy/55"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
      <div ref={viewportRef} className="-mx-5 overflow-hidden px-5 md:mx-0 md:overflow-visible md:px-0">
        <div className={`flex touch-pan-y gap-3 md:grid md:gap-6 ${gridClassName}`}>
          {slides.map((slide, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
              className={`min-w-0 shrink-0 grow-0 origin-center will-change-transform md:basis-auto ${slideClassName || "basis-[84%]"}`}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {active && !tabs && (
        <div className="mt-6 flex items-center gap-4 md:hidden" aria-hidden>
          <div className={`relative h-[3px] flex-1 overflow-hidden rounded-pill ${track}`}>
            <div
              className={`absolute inset-y-0 left-0 rounded-pill ${fill}`}
              style={{ width: `${Math.max(1 / slides.length, progress) * 100}%`, transition: "width 120ms linear" }}
            />
          </div>
          <span className={`font-display text-[13px] tabular-nums ${tone === "dark" ? "text-white/70" : "text-navy/60"}`}>
            {index + 1} / {slides.length}
          </span>
        </div>
      )}
    </div>
  );
}
