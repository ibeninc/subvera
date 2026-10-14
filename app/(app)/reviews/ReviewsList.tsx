"use client";

import Link from "next/link";
import { LoaderCircle, Plus } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { EmptyState, FileTile, FilterTabs, PageBody, PageIntro, Pagination, SearchField } from "@/components/app/kit";
import { Person, SeverityIcon, StatusPill, appButton, docName, shortDate, surface } from "@/components/app/ui";
import { breakdown, type Review } from "@/lib/data";

const PAGE_SIZE = 10;

const issuesOf = (r: Review) => {
  const b = breakdown(r);
  return b.high + b.medium + b.missing;
};

const FILTERS = [
  { key: "all", label: "All", test: () => true },
  { key: "open", label: "Open", test: (r: Review) => r.status === "Complete" && issuesOf(r) > 0 },
  { key: "clear", label: "All clear", test: (r: Review) => r.status === "Complete" && issuesOf(r) === 0 },
  { key: "running", label: "Checking", test: (r: Review) => r.status === "Running" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];

const word = (n: number) => WORDS[n] ?? String(n);

function summarise(reviews: Review[]) {
  if (reviews.length === 0) return "No reviews yet. Start one and the results will show up here.";
  const running = reviews.filter((r) => r.status === "Running").length;
  const open = reviews.filter((r) => r.status === "Complete" && issuesOf(r) > 0).length;
  const first = `${word(reviews.length)} ${reviews.length === 1 ? "review" : "reviews"} so far.`;
  if (running > 0) return `${first} ${word(running)} ${running === 1 ? "is" : "are"} still being checked.`;
  if (open === 0) return `${first} None of them have anything left open.`;
  return `${first} ${word(open)} ${open === 1 ? "still has" : "still have"} findings to work through.`;
}

export function ReviewsList() {
  const { reviews } = useApp();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);

  const query = q.trim().toLowerCase();
  const matches = reviews.filter((r) => `${r.document} ${r.docType} ${r.standards.join(" ")}`.toLowerCase().includes(query));
  const test: (r: Review) => boolean = FILTERS.find((f) => f.key === filter)!.test;
  const list = matches.filter(test);
  const current = Math.min(page, Math.max(1, Math.ceil(list.length / PAGE_SIZE)));
  const rows = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <>
      <PageIntro
        eyebrow="Reviews"
        title="All reviews"
        summary={summarise(reviews)}
        actions={
          <Link href="/reviews/new" className={appButton("primary", "h-9 px-3.5")}>
            <Plus size={15} strokeWidth={2} /> New review
          </Link>
        }
      />

      <PageBody>
        <section aria-label="Reviews">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchField
              value={q}
              onChange={(v) => {
                setQ(v);
                setPage(1);
              }}
              placeholder="Search by document, type or standard"
            />
            <FilterTabs
              label="Filter reviews"
              options={FILTERS.map((f) => ({ key: f.key, label: f.label, count: matches.filter(f.test as (r: Review) => boolean).length }))}
              value={filter}
              onChange={(k) => {
                setFilter(k);
                setPage(1);
              }}
            />
          </div>

          <div className={`mt-4 ${surface}`}>
            <div
              aria-hidden
              className="hidden grid-cols-[minmax(0,1fr)_200px_120px_120px_80px] gap-x-6 border-b border-hairline px-5 py-2.5 text-[12.5px] text-fg-subtle lg:grid"
            >
              <span>Document</span>
              <span>Results</span>
              <span>Status</span>
              <span>Started by</span>
              <span className="text-right">Date</span>
            </div>

            {rows.length === 0 ? (
              query ? (
                <EmptyState title={`Nothing matches “${q.trim()}”`}>Try part of a document name, a type like &ldquo;FAT&rdquo;, or a standard.</EmptyState>
              ) : (
                <EmptyState title="No reviews here yet">Reviews you start will appear in this list.</EmptyState>
              )
            ) : (
              <ul className="divide-y divide-hairline">
                {rows.map((r) => (
                  <li key={r.id}>
                    <ReviewRow r={r} />
                  </li>
                ))}
              </ul>
            )}

            <Pagination page={current} pageSize={PAGE_SIZE} total={list.length} onPage={setPage} noun="reviews" />
          </div>
        </section>
      </PageBody>
    </>
  );
}

/*
 * Desktop: document | results | status | started by | date
 * Phone:   file tile, name and type, then results and status on one line
 */
function ReviewRow({ r }: { r: Review }) {
  const b = breakdown(r);
  const issues = b.high + b.medium + b.missing;
  const running = r.status === "Running";
  const met = b.met + b.resolved;

  const status = running ? (
    <StatusPill tone="blue" pulse>
      Checking
    </StatusPill>
  ) : issues > 0 ? (
    <StatusPill tone="neutral">{issues} open</StatusPill>
  ) : (
    <StatusPill tone="teal">All clear</StatusPill>
  );

  const results = running ? (
    <span className="inline-flex items-center gap-2 text-fg-muted">
      <LoaderCircle size={14} className="animate-spin text-[#1D4ED8] motion-reduce:animate-none" aria-hidden />
      In progress
    </span>
  ) : (
    <span className="flex flex-col gap-2">
      <span className="flex h-1.5 max-w-[180px] gap-[2px] overflow-hidden rounded-full" aria-hidden>
        {[
          { n: b.high, c: "bg-high-fg" },
          { n: b.medium, c: "bg-medium" },
          { n: b.missing, c: "bg-missing" },
          { n: met, c: "bg-teal/60" },
        ]
          .filter((s) => s.n > 0)
          .map((s, i) => (
            <span key={i} className={`h-full min-w-1.5 rounded-full ${s.c}`} style={{ flexGrow: s.n }} />
          ))}
      </span>
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-fg-subtle tabular-nums">
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
    </span>
  );

  return (
    <Link
      href={`/reviews/${r.id}`}
      className="group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-3 px-5 py-4 text-[14px] transition-colors duration-150 hover:bg-mist/60 lg:grid-cols-[minmax(0,1fr)_200px_120px_120px_80px] lg:gap-x-6"
    >
      <span className="col-span-2 flex min-w-0 items-center gap-3.5 lg:col-span-1">
        <FileTile />
        <span className="min-w-0">
          <span title={r.document} className="block leading-snug font-medium underline-offset-4 group-hover:underline lg:truncate">
            {docName(r.document)}
          </span>
          <span className="mt-0.5 block text-[13px] text-fg-subtle lg:truncate">
            {r.docType}, {r.standards.join(" and ")}
            <span className="lg:hidden">, {shortDate(r.createdAt) === "Today" ? "today" : shortDate(r.createdAt)}</span>
          </span>
        </span>
      </span>

      {/* phone: results and status share a line under the name */}
      <span className="col-span-2 flex items-end justify-between gap-4 pl-[50px] lg:hidden">
        {results}
        {status}
      </span>

      <span className="max-lg:hidden">{results}</span>
      <span className="max-lg:hidden">{status}</span>
      <span className="text-[13.5px] max-lg:hidden">
        <Person id={r.createdBy} />
      </span>
      <span className="text-right text-[13.5px] text-fg-muted tabular-nums max-lg:hidden">{shortDate(r.createdAt)}</span>
    </Link>
  );
}
