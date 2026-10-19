import { StackCard } from "@/components/ui/StackCard";

const audiences = [
  {
    title: "Operators",
    body: "Check supplier documents consistently and identify non-compliances and missing information before they delay the schedule.",
    docs: "Supplier design reports and data books",
  },
  {
    title: "SURF contractors",
    body: "Maintain review coverage across several live projects without adding engineering resource.",
    docs: "Design, fabrication and FAT documents across projects",
  },
  {
    title: "Engineering consultancies",
    body: "Deliver third-party reviews faster, with the same checks applied to every document.",
    docs: "Third-party reviews delivered to clients",
  },
];

/** DESIGN.md S8 testimonial grid → the three audiences. */
export function WhoItIsFor() {
  return (
    <section id="who-it-is-for" className="section bg-white">
      <div className="container-x">
        <h2 className="t-h2 max-w-[720px] text-balance">Built for teams that review umbilical documents</h2>
        <p className="mt-6 max-w-[480px] text-[15px] leading-[1.6] text-navy/60 max-md:mt-4">
          Covers API 17E and API 17L1. Review against your own internal specifications is available as an{" "}
          <span className="whitespace-nowrap">add-on</span>.
        </p>

        {/* Phones: a quiet list with dividers. */}
        <ul className="mt-10 divide-y divide-line border-y border-line md:hidden">
          {audiences.map((a) => (
            <li key={a.title} className="py-7">
              <h3 className="font-display text-[22px] leading-[1.2] font-semibold">{a.title}</h3>
              <p className="mt-2 text-[16px] leading-[1.6] text-navy/70">{a.body}</p>
            </li>
          ))}
        </ul>

        {/* Desktop: stacked cards, with what each team typically sends through in the shell. */}
        <ul className="mt-16 hidden grid-cols-3 gap-6 md:grid">
          {audiences.map((a) => (
            <StackCard
              key={a.title}
              as="li"
              innerClassName="flex-1 p-8"
              footerClassName="px-6 pt-3.5 pb-2.5"
              footer={<p className="text-[13px] leading-[1.5] text-navy/55">{a.docs}</p>}
            >
              <h3 className="font-display text-[24px] leading-[1.2] font-semibold">{a.title}</h3>
              <p className="mt-3 text-[16px] leading-[1.6] text-navy/70">{a.body}</p>
            </StackCard>
          ))}
        </ul>
      </div>
    </section>
  );
}
