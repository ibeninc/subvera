import { Check, Clock } from "lucide-react";
import type { ReactNode } from "react";
import { StackCard } from "@/components/ui/StackCard";
import { ReportPage } from "@/components/visuals/ReportPage";
import { CrossSection } from "@/components/visuals/CrossSection";

type Pane = { label: string; tone: "before" | "after"; title: string; body: string; visual: ReactNode };

const panes: Pane[] = [
  {
    label: "Today",
    tone: "before",
    title: "Small mistakes hide in long reports",
    body: "A design life that changes between sections. A test pressure with no hold time. They tend to surface at FAT or offshore, when they cost the most to fix.",
    visual: <ReportPage />,
  },
  {
    label: "With Subvera",
    tone: "after",
    title: "Only what applies to your umbilical gets checked",
    body: "Tell Subvera what the umbilical is made of and which project phase you're in. It checks the requirements for those parts, the same way on every document.",
    visual: <CrossSection />,
  },
];

/*
 * DESIGN.md S3: centred H2, then the before/after pair side by side.
 * Both halves are always visible, because the contrast is the point. One markup for every
 * screen: two columns on desktop, stacked (Today first) on phones and tablets. Each visual
 * plays its own animation when it scrolls into view.
 */
export function ProblemSolution() {
  return (
    <section className="section bg-white">
      <div className="container-x">
        <div className="mx-auto max-w-[720px] text-center max-sm:text-left">
          <h2 className="t-h2 text-balance">A hundred documents a project, all checked by hand.</h2>
          <p className="t-body-lg mx-auto mt-6 max-w-[600px] text-pretty text-navy/70">
            Every umbilical project produces stacks of design reports, procedures and test plans. Someone has to read each one
            against the standard, usually with the schedule pressing. It takes hours, it costs real money, and things slip
            through.
          </p>
        </div>

        <ul className="mt-16 grid gap-4 max-md:mt-10 lg:grid-cols-2 lg:gap-5">
          {panes.map((p) => (
            <StackCard key={p.label} as="li" className="h-full" innerClassName="flex h-full flex-col overflow-hidden">
              {/* inset 6px with a 10px radius, concentric with the 16px card corner */}
              <div className="h-[290px] p-1.5 pb-0 sm:h-[340px] lg:h-[380px]">
                <div className="h-full overflow-hidden rounded-[10px]">{p.visual}</div>
              </div>
              <div className="flex-1 px-7 pt-6 pb-7 max-sm:px-5 max-sm:pt-5 max-sm:pb-6">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-medium ${
                    p.tone === "after" ? "bg-teal-tint text-teal-dark" : "bg-navy/[0.05] text-navy/65"
                  }`}
                >
                  {p.tone === "after" ? <Check size={13} strokeWidth={2.5} aria-hidden /> : <Clock size={13} strokeWidth={2} aria-hidden />}
                  {p.label}
                </span>
                <h3 className="mt-4 font-display text-[26px] leading-[1.15] font-semibold text-balance max-sm:text-[22px]">{p.title}</h3>
                <p className="mt-3 max-w-[52ch] text-[16px] leading-[1.6] text-pretty text-navy/70">{p.body}</p>
              </div>
            </StackCard>
          ))}
        </ul>
      </div>
    </section>
  );
}
