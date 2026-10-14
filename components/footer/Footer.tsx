import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "What you get", href: "/#what-you-get" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Start a review", href: "/reviews/new" },
    ],
  },
  {
    title: "Standards",
    links: [
      { label: "API 17E, subsea umbilicals", href: "/#how-it-works" },
      { label: "API 17L1, ancillary equipment", href: "/#how-it-works" },
      { label: "Internal specs add-on", href: "/#pricing" },
    ],
  },
  {
    title: "Who it is for",
    links: [
      { label: "Operators", href: "/#who-it-is-for" },
      { label: "SURF contractors", href: "/#who-it-is-for" },
      { label: "Engineering consultancies", href: "/#who-it-is-for" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/#about" },
      { label: "Book a demo", href: "/#demo" },
      { label: "Sign in", href: "/sign-in" },
    ],
  },
];

/** Navy footer with link columns and a giant bleeding wordmark (DESIGN.md §S10). */
export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy pt-10 text-mist">
      <div className="container-x">
        <div className="flex flex-wrap justify-between gap-10">
          <div className="max-w-[260px]">
            <Logo variant="reversed" width={140} />
            <p className="mt-5 text-[14px] leading-[1.5] text-white/70">
              Subvera assists engineers and does not certify compliance.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:flex sm:flex-wrap sm:gap-[50px]">
            {columns.map((c) => (
              <div key={c.title}>
                <p className="text-[16px] font-semibold text-mist">{c.title}</p>
                <ul className="mt-5 flex flex-col gap-1">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-[16px] leading-[26px] text-mist transition-opacity hover:opacity-50">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-[14px] text-white/70">
          <p>© Subvera Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-white">Terms</Link>
            <Link href="/sign-in" className="hover:text-white">Sign in</Link>
          </div>
        </div>

        {/* Giant wordmark, bottom-aligned and bleeding off the page */}
        <div aria-hidden className="pointer-events-none mt-[60px] -mb-[4%] flex justify-center select-none">
          <Logo variant="reversed" href={null} width={2400} className="h-auto w-[85%] opacity-95" />
        </div>
      </div>
    </footer>
  );
}
