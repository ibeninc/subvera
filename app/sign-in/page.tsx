import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";
import { ClauseRef, KindText } from "@/components/app/ui";
import { Waterline } from "@/components/visuals/Waterline";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = { title: "Sign in" };

/*
 * The form is the page. The brand panel beside it makes a single point about the product
 * over the hero's waterline, rather than a marketing headline.
 */
export default function SignInPage() {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="flex min-h-screen flex-col px-10 py-9 max-md:px-5 max-md:py-6">
        <Logo width={118} priority />

        <div className="flex flex-1 items-center justify-center py-12">
          <SignInForm />
        </div>

        <p className="text-center text-[12.5px] leading-relaxed text-fg-subtle lg:text-left">
          Subvera flags issues for your engineers to judge. It doesn&rsquo;t certify compliance.
        </p>
      </div>

      <BrandPanel />
    </main>
  );
}

/** One idea, shown once: a finding and the clause it points to, then the line that says so. */
function BrandPanel() {
  return (
    <aside aria-hidden className="relative m-3 hidden overflow-hidden rounded-[24px] bg-navy text-white lg:flex lg:flex-col">
      <div className="flex flex-1 flex-col justify-center px-14 xl:px-20">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="rounded-[14px] bg-white px-5 py-4 text-navy shadow-[0_24px_48px_-24px_rgba(0,0,0,.5)]">
            <p className="text-[13px]">
              <KindText kind="non-compliant" />
            </p>
            <p className="mt-2 text-[15.5px] leading-snug font-semibold">Tensile utilisation above the acceptance limit</p>
            <p className="mt-3">
              <ClauseRef standard="API 17E" clause="6.3.2" />
            </p>
          </div>

          <h2 className="mt-12 text-[26px] leading-[1.2] font-semibold tracking-[-0.02em]">Every finding points to the clause behind it.</h2>
        </div>
      </div>

      <div className="relative h-[150px] shrink-0">
        <Waterline className="inset-y-0" fade="#0e2a47" />
      </div>
    </aside>
  );
}
