"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronsUpDown,
  Files,
  FileText,
  LayoutGrid,
  ListChecks,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Avatar } from "@/components/app/ui";
import { useApp } from "@/components/app/AppContext";
import { SAMPLE_PROJECT, documents, members } from "@/lib/data";
import { Badge, Logo } from "@/components/ui/Logo";

function NavLink({
  href,
  icon: Icon,
  label,
  count,
  active,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  count?: number;
  active?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`flex h-9 items-center gap-3 rounded-[8px] px-2.5 text-[14px] transition-colors duration-150 ${
        active
          ? "bg-white font-medium text-navy shadow-[0_1px_2px_rgba(14,42,71,.08)] ring-1 ring-navy/[0.06]"
          : "text-fg-muted hover:bg-navy/[0.04] hover:text-navy"
      }`}
    >
      <Icon size={16} strokeWidth={1.75} className={active ? "text-navy" : "text-fg-subtle"} />
      <span className="flex-1 truncate">{label}</span>
      {count !== undefined && <span className="text-[13px] text-fg-subtle tabular-nums">{count}</span>}
    </Link>
  );
}

/*
 * Only the small pieces that read the URL use usePathname, each inside <Suspense>,
 * so the rest of the shell still prerenders on dynamic routes like /reviews/[id].
 * The fallback renders the same links without the active highlight.
 */
const me = members[0];

function Sidebar({ pathname = "", onNavigate, brand }: { pathname?: string; onNavigate?: () => void; brand?: boolean }) {
  const { reviews } = useApp();
  const is = (p: string) => pathname === p || pathname.startsWith(p + "/");

  return (
    <nav aria-label="Project" className="flex h-full flex-col gap-7 px-3 pt-5 pb-3">
      {brand && (
        <div className="px-2.5 pt-1">
          <Logo width={108} href="/dashboard" />
        </div>
      )}

      <button
        type="button"
        className="-mt-1 flex items-center justify-between gap-2 rounded-[8px] px-2.5 py-1.5 text-left transition-colors hover:bg-navy/[0.04]"
      >
        <span className="min-w-0">
          <span className="block text-[12px] text-fg-subtle">Project</span>
          <span className="block truncate text-[14px] font-semibold">{SAMPLE_PROJECT}</span>
        </span>
        <ChevronsUpDown size={14} className="shrink-0 text-fg-subtle" />
      </button>

      <div className="flex flex-col gap-0.5">
        <NavLink href="/dashboard" icon={LayoutGrid} label="Overview" active={is("/dashboard")} onNavigate={onNavigate} />
        <NavLink
          href="/reviews"
          icon={ListChecks}
          label="Reviews"
          count={reviews.length}
          active={is("/reviews")}
          onNavigate={onNavigate}
        />
        <NavLink
          href="/documents"
          icon={Files}
          label="Documents"
          count={documents.length}
          active={is("/documents")}
          onNavigate={onNavigate}
        />
        <NavLink href="/reports" icon={FileText} label="Reports" active={is("/reports")} onNavigate={onNavigate} />
      </div>

      <div>
        <p className="px-2.5 pb-2 text-[12.5px] text-fg-subtle">Team</p>
        <div className="flex flex-col gap-0.5">
          <NavLink href="/members" icon={Users} label="Members" active={is("/members")} onNavigate={onNavigate} />
          <NavLink href="/settings" icon={Settings} label="Settings" active={is("/settings")} onNavigate={onNavigate} />
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <p className="px-2.5 text-[12px] leading-[1.5] text-fg-subtle">Subvera flags issues for your engineers to judge. It doesn&rsquo;t certify compliance.</p>
        <div className="flex items-center gap-2.5 border-t border-navy/[0.07] px-1.5 pt-3">
          <Avatar id={me.id} size={28} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] leading-tight font-medium">{me.name}</span>
            <span className="block truncate text-[11px] leading-tight text-fg-subtle">{me.role}</span>
          </span>
          <Link
            href="/sign-in"
            aria-label="Sign out"
            title="Sign out"
            className="flex size-8 items-center justify-center rounded-[8px] text-fg-subtle transition-colors hover:bg-navy/[0.05] hover:text-navy"
          >
            <LogOut size={15} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

function SidebarNav({ onNavigate, brand }: { onNavigate?: () => void; brand?: boolean }) {
  return (
    <Suspense fallback={<Sidebar onNavigate={onNavigate} brand={brand} />}>
      <SidebarWithPath onNavigate={onNavigate} brand={brand} />
    </Suspense>
  );
}

function SidebarWithPath({ onNavigate, brand }: { onNavigate?: () => void; brand?: boolean }) {
  const pathname = usePathname();
  return <Sidebar pathname={pathname} onNavigate={onNavigate} brand={brand} />;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen bg-canvas lg:h-screen lg:py-2 lg:pr-2 print:block print:h-auto print:bg-white print:p-0">
      {/* Sidebar (desktop): flush on the canvas, no panel of its own */}
      <aside className="hidden w-[248px] shrink-0 overflow-y-auto lg:block print:hidden">
        <SidebarNav brand />
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (phones and tablets) */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-hairline bg-white px-4 lg:hidden print:hidden">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <Badge size={28} />
            <span className="text-[14px] font-semibold">{SAMPLE_PROJECT}</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex size-10 items-center justify-center rounded-[10px] hover:bg-navy/[0.05]"
          >
            <Menu size={20} />
          </button>
        </header>

        <main className="min-w-0 flex-1 bg-white lg:overflow-y-auto lg:rounded-[14px] lg:shadow-[0_1px_3px_rgba(14,42,71,.06)] lg:ring-1 lg:ring-navy/[0.07] print:overflow-visible print:ring-0">{children}</main>
      </div>

      {/* Slide-out menu (phones and tablets) */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button aria-label="Close menu" className="absolute inset-0 bg-navy/30" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[288px] max-w-[85%] flex-col bg-canvas shadow-xl">
            <div className="flex h-14 items-center justify-between border-b border-hairline px-4">
              <Logo width={108} href={null} />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="flex size-9 items-center justify-center rounded-[10px] hover:bg-navy/[0.05]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
