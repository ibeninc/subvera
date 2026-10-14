import { LockKeyhole, RefreshCw } from "lucide-react";

const notes = [
  {
    icon: LockKeyhole,
    title: "Your documents stay yours",
    body: "Subvera runs as a cloud service, and your documents are handled under the security terms you agree with us.",
  },
  {
    icon: RefreshCw,
    title: "Always the latest version",
    body: "We roll out updates centrally, so every team on every project is working with the same thing.",
  },
];

/*
 * Who is behind Subvera: navy band.
 * Desktop: story on the left, the two notes as ruled rows on the right.
 * Phones: the story keeps full weight; the notes compress into one panel of
 * compact rows so the section stays about a screen tall.
 */
export function About() {
  return (
    <section id="about" className="section bg-navy text-white max-md:py-16">
      <div className="container-x grid grid-cols-1 gap-x-24 gap-y-10 lg:grid-cols-2 lg:gap-y-16">
        <div>
          <h2 className="t-h2 max-w-[520px] text-balance">Built by people who have done this job</h2>
          <p className="t-body-lg mt-6 max-w-[500px] text-pretty text-white/70 max-md:mt-4">
            Subvera brings together 15 years of hands-on umbilical design and SURF project work with specialist software
            development. We built it because the same review problem came up on every project we worked on.
          </p>
        </div>

        <ul className="divide-y divide-white/10 rounded-[18px] bg-white/[0.05] ring-1 ring-white/10 lg:flex lg:flex-col lg:gap-10 lg:divide-y-0 lg:rounded-none lg:bg-transparent lg:pt-3 lg:ring-0">
          {notes.map((n) => (
            <li key={n.title} className="flex gap-4 p-5 lg:block lg:border-t lg:border-white/15 lg:p-0 lg:pt-8">
              <n.icon size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-teal lg:hidden" aria-hidden />
              <div>
                <h3 className="font-display text-[17px] leading-snug font-semibold lg:text-[22px]">{n.title}</h3>
                <p className="mt-1.5 max-w-[460px] text-[14px] leading-[1.55] text-white/65 lg:mt-3 lg:text-[16px] lg:leading-[1.6]">
                  {n.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
