import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Waterline } from "@/components/visuals/Waterline";

/*
 * Centred hero with a drifting teal waterline along its bottom edge: audience pill, one-line headline,
 * two-line explanation, two actions. The product showcase follows directly below.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-[136px] pb-32 max-md:pt-[104px] max-md:pb-24">
      <Waterline className="bottom-0 h-[120px] max-md:h-[96px]" />
      <div className="container-x relative flex flex-col items-center text-center">
        <Link
          href="#pricing"
          className="group inline-flex items-center rounded-pill bg-white text-[13px] ring-1 ring-line transition-shadow hover:ring-navy/25"
        >
          <span className="py-1.5 pr-3 pl-4 font-medium max-sm:py-2 max-sm:pr-2 max-sm:pl-4 max-sm:text-[14px]">
            For subsea umbilical engineering teams
          </span>
          {/* desktop: divided "Learn more" segment */}
          <span className="flex items-center gap-1 border-l border-line py-1.5 pr-3.5 pl-3 text-navy/55 group-hover:text-navy max-sm:hidden">
            Learn more <ArrowUpRight size={13} aria-hidden />
          </span>
          {/* phones: a small round arrow button inside the pill */}
          <span
            aria-hidden
            className="mr-1.5 flex size-7 items-center justify-center rounded-full bg-navy/[0.06] text-navy/60 transition-colors group-hover:bg-navy group-hover:text-white sm:hidden"
          >
            <ArrowUpRight size={14} />
          </span>
          <span className="sr-only sm:hidden">Learn more</span>
        </Link>

        <h1 className="t-display-xl mt-8 max-w-[16ch] text-balance">Document reviews in minutes, not hours</h1>

        <p className="t-body-lg mt-6 max-w-[620px] text-pretty text-navy/70">
          Subvera checks subsea umbilical documents against API 17E and API 17L1, then flags what doesn&apos;t comply and
          what&apos;s missing, clause by clause.
        </p>

        <div id="hero-actions" className="mt-9 flex gap-3 max-sm:grid max-sm:w-full max-sm:grid-cols-2">
          <ButtonLink href="#demo" size="lg" className="max-sm:px-4">
            Book a demo
          </ButtonLink>
          <ButtonLink href="#how-it-works" size="lg" variant="outline" className="max-sm:px-4">
            How it works
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
