"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronRight, FileText, LoaderCircle, Plus } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { FileTile, FilterTabs, PageBody, PageIntro, SectionTitle } from "@/components/app/kit";
import {
  Avatar,
  ClauseRef,
  Person,
  SeverityIcon,
  SeverityText,
  StatusPill,
  appButton,
  surface,
  surfaceHover,
  docName,
  shortDate,
} from "@/components/app/ui";
import { SAMPLE_PROJECT, breakdown, members, type Finding, type Review } from "@/lib/data";

const rank = (f: Finding) => (f.kind === "non-compliant" ? (f.severity === "High" ? 0 : 1) : 2);

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
const word = (n: number) => WORDS[n] ?? String(n); // small counts read better as words in a sentence

/** The line under the page title, written the way a colleague would say it. */
function summarise(open: number, high: number, docs: string[]) {
  if (open === 0) return "Nothing is open right now. New findings will show up here after your next review.";
  const where = docs.length === 1 ? `in ${docs[0]}` : `across ${word(docs.length).toLowerCase()} documents`;
  const first = `${word(open)} ${open === 1 ? "finding is" : "findings are"} still open ${where}.`;
  if (high === 0) return `${first} None of them are high severity.`;
  if (high === open) return `${first} ${open === 1 ? "It's" : "All of them are"} high severity.`;
  return `${first} ${word(high)} ${high === 1 ? "is" : "are"} high severity, so start there.`;
}

type Group = { r: Review; items: Finding[] };

export function Overview() {
  const { reviews } = useApp();

  // Unresolved findings per document, worst first. Documents with nothing open drop out.
  const groups: Group[] = reviews
    .filter((r) => r.status === "Complete")
    .map((r) => ({
      r,
      items: r.findings.filter((f) => f.kind !== "met" && f.status !== "Resolved").sort((a, b) => rank(a) - rank(b)),
    }))
    .filter((g) => g.items.length > 0);
  const open = groups.flatMap((g) => g.items.map((f) => ({ f, r: g.r })));
  const urgent = open.filter(({ f }) => rank(f) === 0);

  return (
    <>
      <PageIntro
        eyebrow="Project overview"
        title={SAMPLE_PROJECT}
        summary={summarise(open.length, urgent.length, groups.map((g) => docName(g.r.document)))}
        actions={
          <>
            <Link href="/members" className="mr-1.5 flex -space-x-1.5" title={members.map((m) => m.name).join(", ")}>
              {members.map((m) => (
                <span key={m.id} className="rounded-full ring-2 ring-white">
                  <Avatar id={m.id} size={28} />
                </span>
              ))}
              <span className="sr-only">Project members</span>
            </Link>
            <Link href="/reviews/new" className={appButton("primary", "h-9 px-3.5")}>
              <Plus size={15} strokeWidth={2} /> New review
            </Link>
          </>
        }
      />

      <PageBody>
        {urgent.length > 0 && (
          <section aria-labelledby="start-here">
            <SectionTitle id="start-here" title="Start here" hint="High severity and still open" />
            <ul className="mt-4 grid gap-4 md:grid-cols-2">
              {urgent.map(({ f, r }) => (
                <li key={r.id + f.id}>
                  <UrgentCard f={f} r={r} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <OpenFindings groups={groups} />

        <section aria-labelledby="recent-reviews">
          <SectionTitle
            id="recent-reviews"
            title="Recent reviews"
            action={
              <Link href="/reviews" className="text-[13.5px] text-fg-muted underline-offset-4 hover:text-navy hover:underline">
                See all
              </Link>
            }
          />
          {/* Cards on desktop; a swipeable row on phones */}
          <ul className="-mx-5 mt-4 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-3">
            {reviews.slice(0, 6).map((r) => (
              <li key={r.id} className="w-[82%] shrink-0 snap-start md:w-auto">
                <ReviewCard r={r} />
              </li>
            ))}
          </ul>
        </section>
      </PageBody>
    </>
  );
}

/* ---------- pieces ---------- */

function UrgentCard({ f, r }: { f: Finding; r: Review }) {
  return (
    <Link
      href={`/reviews/${r.id}?finding=${f.id}`}
      className={`group relative flex h-full flex-col p-5 hover:-translate-y-px motion-reduce:hover:translate-y-0 ${surface} ${surfaceHover}`}
    >
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <SeverityText kind={f.kind} severity={f.severity} />
        {f.status === "In review" ? (
          <StatusPill tone="blue">In review</StatusPill>
        ) : (
          <ArrowUpRight size={16} className="text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
        )}
      </div>
      <h3 className="mt-3 font-sans text-[16px] leading-snug font-semibold tracking-[-0.005em]">{f.title}</h3>
      {f.detail && <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-fg-muted">{f.detail}</p>}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-5 text-[13px]">
        <span className="flex min-w-0 items-center gap-2">
          <ClauseRef standard={f.standard} clause={f.clause} />
          <span className="truncate text-fg-subtle">{f.location}</span>
        </span>
        <Person id={f.assignee} />
      </div>
    </Link>
  );
}

/* ---------- Open findings: filter tabs, grouped list, "Show more" ---------- */

/*
 * Short lists show in full. Past LIST_LIMIT the list opens at PAGE_SIZE and grows with "Show more",
 * which keeps your place on a phone better than numbered pages. Hiding only one or two rows behind
 * a button is worse than showing them, hence the gap between the two numbers.
 */
const PAGE_SIZE = 8;
const LIST_LIMIT = 12;

const FILTERS = [
  { key: "all", label: "All", test: () => true },
  { key: "high", label: "High", test: (f: Finding) => rank(f) === 0 },
  { key: "medium", label: "Medium", test: (f: Finding) => rank(f) === 1 },
  { key: "missing", label: "Missing info", test: (f: Finding) => f.kind === "missing" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function OpenFindings({ groups }: { groups: Group[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [extra, setExtra] = useState(0); // pages added with "Show more"

  const test: (f: Finding) => boolean = FILTERS.find((x) => x.key === filter)!.test;
  const filtered = groups.map((g) => ({ ...g, items: g.items.filter(test) })).filter((g) => g.items.length > 0);
  const total = filtered.reduce((n, g) => n + g.items.length, 0);
  const limit = total > LIST_LIMIT ? PAGE_SIZE * (1 + extra) : Infinity;

  // Slice across groups in order, so a document header only shows when at least one of its rows does.
  const visible = filtered
    .map((g, gi) => {
      const before = filtered.slice(0, gi).reduce((n, x) => n + x.items.length, 0);
      return { ...g, items: g.items.slice(0, Math.max(0, limit - before)) };
    })
    .filter((g) => g.items.length > 0);
  const shown = Math.min(total, limit);
  const remaining = total - shown;
  const counts = Object.fromEntries(
    FILTERS.map((x) => [x.key, groups.reduce((n, g) => n + g.items.filter(x.test as (f: Finding) => boolean).length, 0)]),
  ) as Record<FilterKey, number>;

  return (
    <section aria-labelledby="open-findings">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <h2 id="open-findings" className="text-[18px] font-semibold tracking-[-0.015em]">
          Open findings
        </h2>
        {counts.all > 0 && (
          <FilterTabs
            label="Filter by severity"
            options={FILTERS.map((x) => ({ key: x.key, label: x.label, count: counts[x.key] }))}
            value={filter}
            onChange={(k) => {
              setFilter(k);
              setExtra(0);
            }}
          />
        )}
      </div>

      {total === 0 ? (
        <div className="mt-4 rounded-[14px] bg-mist px-6 py-10 text-center">
          <p className="text-[15px] font-medium">You&rsquo;re all caught up</p>
          <p className="mt-1 text-[14px] text-fg-muted">Anything a review flags will land here.</p>
        </div>
      ) : (
        <div className={`mt-4 ${surface}`}>
          {/* Column labels for the desktop grid. Phones get a stacked layout that labels itself. */}
          <div
            aria-hidden
            className="hidden grid-cols-[124px_minmax(0,1fr)_150px_112px_16px] gap-x-6 border-b border-hairline px-5 py-2.5 text-[12.5px] text-fg-subtle md:grid"
          >
            <span>Severity</span>
            <span>Finding</span>
            <span>Clause</span>
            <span>Owner</span>
            <span />
          </div>

          {visible.map(({ r, items }, gi) => {
            const openHere = filtered.find((g) => g.r.id === r.id)?.items.length ?? items.length;
            return (
              <div key={r.id} role="group" aria-labelledby={`doc-${r.id}`}>
                {/* Sticks under the phone top bar while you scroll that document's findings */}
                <div
                  className={`sticky top-14 z-10 flex items-center justify-between gap-4 border-b border-hairline bg-mist/95 px-5 py-2 backdrop-blur lg:static ${
                    gi > 0 ? "border-t" : "max-md:rounded-t-[14px]"
                  }`}
                >
                  <Link
                    id={`doc-${r.id}`}
                    href={`/reviews/${r.id}`}
                    title={r.document}
                    className="flex min-w-0 items-center gap-2 text-[13px] font-medium text-fg-muted hover:text-navy"
                  >
                    <FileText size={14} strokeWidth={1.75} className="shrink-0" />
                    <span className="truncate">{docName(r.document)}</span>
                  </Link>
                  <span className="shrink-0 text-[12.5px] text-fg-subtle tabular-nums">{openHere} open</span>
                </div>

                <ul className="divide-y divide-hairline/70">
                  {items.map((f) => (
                    <li key={f.id}>
                      <FindingRow f={f} reviewId={r.id} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {remaining > 0 && (
            <div className="flex items-center justify-between gap-4 rounded-b-[14px] border-t border-hairline bg-mist/50 px-5 py-3 max-sm:flex-col-reverse max-sm:items-stretch">
              <p className="text-[13px] text-fg-subtle tabular-nums max-sm:text-center" aria-live="polite">
                Showing {shown} of {total}
              </p>
              <div className="flex gap-2 max-sm:flex-col">
                <button type="button" onClick={() => setExtra((e) => e + 1)} className={appButton("outline", "max-sm:h-11 max-sm:w-full")}>
                  Show {Math.min(PAGE_SIZE, remaining)} more
                </button>
                {remaining > PAGE_SIZE && (
                  <button
                    type="button"
                    onClick={() => setExtra(Math.ceil(total / PAGE_SIZE))}
                    className={appButton("ghost", "max-sm:h-11 max-sm:w-full")}
                  >
                    Show all {total}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/*
 * One row, two layouts from the same markup.
 * Desktop: severity | finding | clause | owner | chevron
 * Phone:   severity ........ clause
 *          finding title (full width)
 *          owner ........ status
 */
function FindingRow({ f, reviewId }: { f: Finding; reviewId: string }) {
  const inReview = f.status === "In review";
  return (
    <Link
      href={`/reviews/${reviewId}?finding=${f.id}`}
      className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-4 text-[14px] transition-colors duration-150 hover:bg-mist/60 md:grid-cols-[124px_minmax(0,1fr)_150px_112px_16px] md:gap-x-6 md:py-3.5"
    >
      <SeverityText kind={f.kind} severity={f.severity} />
      <span className="md:hidden">
        <ClauseRef standard={f.standard} clause={f.clause} />
      </span>

      <span className="col-span-2 flex min-w-0 items-center gap-2.5 md:col-span-1">
        <span className="leading-snug">{f.title}</span>
        {inReview && (
          <span className="max-md:hidden">
            <StatusPill tone="blue">In review</StatusPill>
          </span>
        )}
      </span>

      <span className="max-md:hidden">
        <ClauseRef standard={f.standard} clause={f.clause} />
      </span>
      <span className="min-w-0 text-[13.5px] max-md:hidden">
        <Person id={f.assignee} />
      </span>
      <ChevronRight size={16} className="text-fg-subtle opacity-0 transition-opacity group-hover:opacity-100 max-md:hidden" aria-hidden />

      <span className="col-span-2 flex items-center justify-between gap-3 text-[13px] md:hidden">
        <Person id={f.assignee} />
        {inReview && <StatusPill tone="blue">In review</StatusPill>}
      </span>
    </Link>
  );
}

/* ---------- Recent reviews ---------- */

function ReviewCard({ r }: { r: Review }) {
  const b = breakdown(r);
  const issues = b.high + b.medium + b.missing;
  const running = r.status === "Running";
  const met = b.met + b.resolved;
  const segments = [
    { n: b.high, c: "bg-high-fg" },
    { n: b.medium, c: "bg-medium" },
    { n: b.missing, c: "bg-missing" },
    { n: met, c: "bg-teal/60" },
  ].filter((s) => s.n > 0);

  return (
    <div className={`group relative flex h-full flex-col p-5 ${surface} ${surfaceHover}`}>
      <div className="flex items-start justify-between gap-3">
        <FileTile />
        {running ? (
          <StatusPill tone="blue" pulse>
            Checking
          </StatusPill>
        ) : issues > 0 ? (
          <StatusPill tone="neutral">{issues} open</StatusPill>
        ) : (
          <StatusPill tone="teal">All clear</StatusPill>
        )}
      </div>

      {/* The whole card opens the review; the Report link sits above this layer */}
      <Link
        href={`/reviews/${r.id}`}
        title={r.document}
        className="mt-4 line-clamp-2 text-[15px] leading-snug font-semibold after:absolute after:inset-0 after:rounded-[14px]"
      >
        {docName(r.document)}
      </Link>
      <p className="mt-1 text-[13px] text-fg-subtle">
        {r.docType}, {shortDate(r.createdAt) === "Today" ? "today" : shortDate(r.createdAt)}
      </p>

      <div className="mt-auto pt-5">
        {running ? (
          <p className="flex items-center gap-2 text-[13px] text-fg-muted">
            <LoaderCircle size={14} className="animate-spin text-[#1D4ED8] motion-reduce:animate-none" />
            Checking against {r.standards.join(" and ")}
          </p>
        ) : (
          <>
            <div className="flex h-1.5 gap-[2px] overflow-hidden rounded-full" aria-hidden>
              {segments.map((s, i) => (
                <span key={i} className={`h-full min-w-1.5 rounded-full ${s.c}`} style={{ flexGrow: s.n }} />
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-[13px]">
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-fg-subtle tabular-nums">
                {b.high > 0 && (
                  <span className="inline-flex items-center gap-1.5" title="High severity">
                    <SeverityIcon kind="non-compliant" severity="High" /> {b.high}
                  </span>
                )}
                {b.medium > 0 && (
                  <span className="inline-flex items-center gap-1.5" title="Medium severity">
                    <SeverityIcon kind="non-compliant" severity="Medium" /> {b.medium}
                  </span>
                )}
                {b.missing > 0 && (
                  <span className="inline-flex items-center gap-1.5" title="Missing information">
                    <SeverityIcon kind="missing" /> {b.missing}
                  </span>
                )}
                <span>{met} met</span>
              </span>
              <Link
                href={`/reports?review=${r.id}`}
                className="relative z-10 -m-1.5 rounded-[6px] p-1.5 text-fg-muted underline-offset-4 hover:text-navy hover:underline"
              >
                Report
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
