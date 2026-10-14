import type { ReactNode } from "react";

/*
 * Two-layer card: a tinted outer shell with a raised inner card set inside it.
 * Radii are concentric (inner = outer − padding: 22 − 6 = 16px) so the gap between
 * the layers stays even all the way round the corners.
 * `footer` sits in the shell under the inner card, for an action or a caption.
 */

const shells = {
  light: "bg-navy/[0.035] ring-1 ring-navy/[0.06]",
  onMist: "bg-white/60 ring-1 ring-navy/[0.07]",
  dark: "bg-navy ring-1 ring-navy",
};

const inners = {
  light:
    "bg-white ring-1 ring-navy/[0.06] shadow-[0_1px_2px_rgba(14,42,71,.05),0_12px_28px_-16px_rgba(14,42,71,.18)]",
  onMist:
    "bg-white ring-1 ring-navy/[0.06] shadow-[0_1px_2px_rgba(14,42,71,.05),0_12px_28px_-16px_rgba(14,42,71,.18)]",
  dark: "bg-[#133457] text-white ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.08)]",
};

export function StackCard({
  children,
  footer,
  tone = "light",
  className = "",
  innerClassName = "",
  footerClassName = "px-1.5 pt-1.5",
  as: Tag = "div",
}: {
  children: ReactNode;
  footer?: ReactNode;
  tone?: keyof typeof shells;
  className?: string;
  innerClassName?: string;
  footerClassName?: string;
  as?: "div" | "article" | "li";
}) {
  return (
    <Tag className={`flex flex-col rounded-[22px] p-1.5 ${shells[tone]} ${className}`}>
      <div className={`rounded-[16px] ${inners[tone]} ${innerClassName}`}>{children}</div>
      {footer && <div className={footerClassName}>{footer}</div>}
    </Tag>
  );
}
