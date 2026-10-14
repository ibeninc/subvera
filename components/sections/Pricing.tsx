import { Check } from "lucide-react";
import { Slider } from "@/components/ui/Slider";
import { StackCard } from "@/components/ui/StackCard";
import { ButtonLink } from "@/components/ui/Button";

const plans = [
  {
    name: "Project",
    price: "£6,000",
    blurb: "For a single project and up to five engineers.",
    features: ["API 17E and API 17L1 reviews", "Up to 5 engineers on one project", "PDF and Word report export"],
    featured: false,
  },
  {
    name: "Business",
    price: "£32,000",
    blurb: "For a business unit or region running several projects at once.",
    features: ["Unlimited users and projects", "API 17E and API 17L1 reviews", "Early access to the internal specs add-on"],
    featured: true,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="section bg-mist">
      <div className="container-x">
        <div className="mx-auto max-w-[620px] text-center max-sm:text-left">
          <h2 className="t-h2">Pricing</h2>
          <p className="t-body-lg mt-6 text-pretty text-navy/70">
            One annual licence, paid up front. You won&apos;t be charged per document.
          </p>
        </div>

        <div className="mx-auto mt-20 max-w-[980px] max-md:mt-12">
          <Slider label="Licences" gridClassName="md:grid-cols-2" slideClassName="basis-[88%]" tabs={["Project", "Business"]}>
          {plans.map((p) => (
            <StackCard
              key={p.name}
              tone={p.featured ? "dark" : "onMist"}
              className="h-full"
              innerClassName="flex-1 p-9 max-md:p-6"
              footerClassName="p-1.5 pt-2.5"
              footer={
                <ButtonLink href="#demo" size="lg" variant={p.featured ? "primary" : "navy"} className="w-full">
                  Book a demo
                </ButtonLink>
              }
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-[20px] font-semibold">{p.name}</h3>
                {p.featured && (
                  <span className="rounded-pill bg-white/10 px-3 py-1 text-[12px] font-medium whitespace-nowrap text-white/80 max-sm:px-2.5 max-sm:text-[11px]">
                    Best for several projects
                  </span>
                )}
              </div>
              <p className="mt-8 flex items-baseline gap-2">
                <span className="font-display text-[52px] leading-none font-semibold tracking-[-0.03em] max-sm:text-[44px]">{p.price}</span>
                <span className="text-[14px] opacity-60">a year</span>
              </p>
              <p className="mt-4 text-[16px] leading-[1.6] opacity-70">{p.blurb}</p>
              <ul className={`mt-8 flex flex-col gap-3.5 border-t pt-8 ${p.featured ? "border-white/15" : "border-line"}`}>
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[15px] leading-[1.5]">
                    <Check size={16} strokeWidth={2.5} className="mt-0.5 shrink-0 text-teal" aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            </StackCard>
          ))}
          </Slider>
        </div>

        <div className="mx-auto mt-6 max-w-[980px]">
          <StackCard tone="onMist" innerClassName="flex flex-wrap items-center justify-between gap-6 px-9 py-7 max-md:px-6">
            <div className="max-w-[560px]">
              <h3 className="font-display text-[20px] font-semibold">Internal specs add-on</h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-navy/70">
                Check documents against your own company specifications as well as the industry standards. We set your
                specs up for you, and it works with either licence. Pricing to be confirmed.
              </p>
            </div>
            <ButtonLink href="#demo" variant="outline">
              Ask about it
            </ButtonLink>
          </StackCard>
        </div>
      </div>
    </section>
  );
}
