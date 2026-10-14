import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

/*
 * Button variants from DESIGN.md §4.1, re-coloured to the Subvera palette.
 * Primary = Sea Teal with navy text (teal is too light for white text).
 */
export type ButtonVariant = "primary" | "navy" | "outline" | "login" | "ghostDark";
export type ButtonSize = "md" | "lg";

const base =
  "group/btn inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-medium leading-[1.2] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:pointer-events-none disabled:opacity-50";

const sizes: Record<ButtonSize, string> = {
  md: "text-[14px] px-5 py-2.5",
  lg: "text-[15px] px-6 py-3.5",
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-teal text-navy hover:bg-navy hover:text-white",
  navy: "bg-navy text-white border border-navy hover:bg-mist hover:text-navy",
  outline: "bg-white text-navy border border-line hover:border-navy",
  login: "text-navy hover:bg-mist",
  ghostDark: "border border-white/25 text-white hover:bg-white hover:text-navy",
};

export function buttonClass(variant: ButtonVariant = "primary", className = "", size: ButtonSize = "md") {
  return `${base} ${sizes[size]} ${variants[variant]} ${className}`;
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; arrow?: boolean; children: ReactNode; className?: string };

function Arrow() {
  return (
    <ArrowRight
      size={15}
      strokeWidth={2}
      aria-hidden
      className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  arrow,
  children,
  className,
  ...rest
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={buttonClass(variant, className, size)} {...rest}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  arrow,
  children,
  className,
  type = "button",
  ...rest
}: Common & ComponentProps<"button">) {
  return (
    <button type={type} className={buttonClass(variant, className, size)} {...rest}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}
