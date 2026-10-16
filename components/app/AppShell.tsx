"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, Check, ChevronsUpDown, ListChecks, LogOut, Menu, Settings, Users, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Avatar } from "@/components/app/ui";
import { useApp } from "@/components/app/AppContext";
import { ME, findPerson } from "@/lib/data";
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
const me = findPerson(ME)!;

/** The project name at the top of the sidebar; opens a list of the engineer's projects. */
function ProjectSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const { project, projects, switchProject } = useApp();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative -mt-1">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-[8px] px-2.5 py-1.5 text-left transition-colors hover:bg-navy/[0.04]"
      >
        <span className="min-w-0">
          <span className="block text-[12px] text-fg-subtle">Project{project.operator && `, ${project.operator}`}</span>
          <span className="block truncate text-[14px] font-semibold">{project.name}</span>
        </span>
        <ChevronsUpDown size={14} className="shrink-0 text-fg-subtle" />
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Projects"
          className="absolute inset-x-0 top-full z-20 mt-1 rounded-[10px] bg-white p-1 shadow-[0_12px_32px_-12px_rgba(14,42,71,.35)] ring-1 ring-edge"
        >
          {projects.map((p) => {
            const on = p.id === project.id;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => {
                    setOpen(false);
                    if (on) return;
                    switchProject(p.id);
                    onNavigate?.();
                    router.push("/reviews");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-left transition-colors hover:bg-mist"
                >
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[13.5px] ${on ? "font-medium" : ""}`}>{p.name}</span>
                    <span className="block truncate text-[12px] text-fg-subtle">{p.operator ?? "No operator set"}</span>
                  </span>
                  {on && <Check size={14} strokeWidth={2.5} className="shrink-0 text-teal-dark" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Sidebar({ pathname = "", onNavigate, brand }: { pathname?: string; onNavigate?: () => void; brand?: boolean }) {
  const { reviews } = useApp();
  const is = (p: string) => pathname === p || pathname.startsWith(p + "/");
  const archived = reviews.filter((r) => r.status === "Archived").length;

  return (
    <nav aria-label="Project" className="flex h-full flex-col gap-7 px-3 pt-5 pb-3">
      {brand && (
        <div className="px-2.5 pt-1">
          <Logo width={108} href="/reviews" />
        </div>
      )}

      <ProjectSwitcher onNavigate={onNavigate} />

      <div className="flex flex-col gap-0.5">
        <NavLink
          href="/reviews"
          icon={ListChecks}
          label="Reviews"
          count={reviews.length - archived}
          active={is("/reviews")}
          onNavigate={onNavigate}
        />
        <NavLink href="/archive" icon={Archive} label="Archive" count={archived} active={is("/archive")} onNavigate={onNavigate} />
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
  const { project } = useApp();
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
          <Link href="/reviews" className="flex min-w-0 items-center gap-2.5">
            <Badge size={28} />
            <span className="truncate text-[14px] font-semibold">{project.name}</span>
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
