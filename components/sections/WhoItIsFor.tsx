import { StackCard } from "@/components/ui/StackCard";

const audiences = [
  {
    title: "Operators",
    body: "Check what suppliers send you, consistently, and catch gaps before they hold up the schedule.",
    docs: "Supplier design reports and data books",
  },
  {
    title: "SURF contractors",
    body: "Keep on top of review across several live projects without adding engineers to do it.",
    docs: "Design, fabrication and FAT documents across projects",
  },
  {
    title: "Engineering consultancies",
    body: "Give clients quicker reviews that hold to the same standard every time.",
    docs: "Third-party reviews delivered to clients",
  },
];

/** DESIGN.md S8 testimonial grid → the three audiences. */
export function WhoItIsFor() {
  return (
    <section id="who-it-is-for" className="section bg-white">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-6">
          <h2 className="t-h2 max-w-[560px] text-balance">Made for the people who review umbilical documents</h2>
          <p className="max-w-[340px] text-[15px] leading-[1.6] text-navy/60">
            Works with API 17E and API 17L1 today. Your own company specifications can be added on request.
          </p>
        </div>

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
