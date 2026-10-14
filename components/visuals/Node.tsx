import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** White workflow node used across the feature visuals. */
export function Node({
  icon: Icon,
  iconBg,
  title,
  children,
  selected,
  className = "",
}: {
  icon: LucideIcon;
  iconBg: string;
  title: string;
  children?: ReactNode;
  selected?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`w-[330px] max-w-[85%] rounded-sm border bg-white p-3 shadow-[0_1px_2px_rgba(14,42,71,.08)] ${selected ? "border-teal" : "border-hairline"} ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`flex size-8 items-center justify-center rounded-xs ${iconBg}`}>
          <Icon size={16} className="text-white" aria-hidden />
        </span>
        <span className="text-[14px] font-semibold">{title}</span>
        <span className="ml-auto grid grid-cols-2 gap-[3px] opacity-30" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="size-[3px] rounded-full bg-navy" />
          ))}
        </span>
      </div>
      {children && <div className="mt-3 text-[13px] text-navy/80">{children}</div>}
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="rounded-chip bg-teal-tint px-1.5 py-0.5 text-[12px] font-medium text-teal-dark">{children}</span>;
}

export function Connector() {
  return (
    <div className="flex flex-col items-center" aria-hidden>
      <span className="size-2 rounded-full border border-navy/30 bg-white" />
      <span className="h-6 w-px bg-navy/30" />
      <span className="h-0 w-0 border-x-4 border-t-[6px] border-x-transparent border-t-navy/30" />
    </div>
  );
}

export function Cursor({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex items-start" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 18 18" fill={color}>
        <path d="M2 1.5 16 7.2l-6.2 1.9L7 15.5 2 1.5Z" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
      <span className="mt-3 -ml-1 rounded-chip px-1.5 py-0.5 text-[12px] font-medium text-white" style={{ background: color }}>
        {name}
      </span>
    </div>
  );
}
