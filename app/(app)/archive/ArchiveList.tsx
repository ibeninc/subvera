"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { EmptyState, FileTile, FilterTabs, PageBody, PageIntro, Pagination, SearchField } from "@/components/app/kit";
import { Person, ResultsSummary, appButton, docName, shortDate, surface } from "@/components/app/ui";
import { ME, type Review } from "@/lib/data";

const PAGE_SIZE = 10;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
const word = (n: number) => WORDS[n] ?? String(n);

/** "14 Oct 2026" to a sortable number. */
const when = (d = "") => {
  const [day, mon, year] = d.split(" ");
  return Date.UTC(+year, MONTHS.indexOf(mon), +day) || 0;
};

const FILTERS = [
  { key: "all", label: "All", test: () => true },
  { key: "mine", label: "Reviewed by me", test: (r: Review) => r.reviewedBy === ME },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

export function ArchiveList() {
  const { reviews } = useApp();
  const archived = reviews.filter((r) => r.status === "Archived").sort((a, b) => when(b.archivedAt) - when(a.archivedAt));
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);

  const query = q.trim().toLowerCase();
  const matches = archived.filter((r) => `${r.document} ${r.docType} ${r.standards.join(" ")}`.toLowerCase().includes(query));
  const test: (r: Review) => boolean = FILTERS.find((f) => f.key === filter)!.test;
  const list = matches.filter(test);
  const current = Math.min(page, Math.max(1, Math.ceil(list.length / PAGE_SIZE)));
  const rows = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <>
      <PageIntro
        eyebrow="Archive"
        title="Archived reports"
        summary={
          archived.length === 0
            ? "Nothing archived yet. When you finish a review, its findings report is kept here."
            : `${word(archived.length)} finished ${archived.length === 1 ? "review" : "reviews"}. Each keeps its findings report, ready to download again or reopen.`
        }
      />

      <PageBody>
        <section aria-label="Archived reports">
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
              label="Filter archived reports"
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
              className="hidden grid-cols-[minmax(0,1fr)_200px_120px_80px_80px] gap-x-6 border-b border-hairline px-5 py-2.5 text-[12.5px] text-fg-subtle lg:grid"
            >
              <span>Document</span>
              <span>Results</span>
              <span>Reviewed by</span>
              <span className="text-right">Reviewed</span>
              <span className="text-right">Archived</span>
            </div>

            {rows.length === 0 ? (
              query ? (
                <EmptyState title={`Nothing matches “${q.trim()}”`}>Try part of a document name, a type like &ldquo;FAT&rdquo;, or a standard.</EmptyState>
              ) : (
                <EmptyState
                  title="Nothing archived yet"
                  action={
                    <Link href="/reviews" className={appButton("outline", "h-9 px-3.5")}>
                      Go to reviews
                    </Link>
                  }
                >
                  Finish a review and archive it to keep its report here.
                </EmptyState>
              )
            ) : (
              <ul className="divide-y divide-hairline">
                {rows.map((r) => (
                  <li key={r.id}>
                    <ArchiveRow r={r} />
                  </li>
                ))}
              </ul>
            )}

            <Pagination page={current} pageSize={PAGE_SIZE} total={list.length} onPage={setPage} noun="reports" />
          </div>
        </section>
      </PageBody>
    </>
  );
}

function ArchiveRow({ r }: { r: Review }) {
  const date = (d?: string) => (d ? shortDate(d) : "");
  return (
    <Link
      href={`/archive/${r.id}`}
      className="group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-3 px-5 py-4 text-[14px] transition-colors duration-150 hover:bg-mist/60 lg:grid-cols-[minmax(0,1fr)_200px_120px_80px_80px] lg:gap-x-6"
    >
      <span className="col-span-2 flex min-w-0 items-center gap-3.5 lg:col-span-1">
        <FileTile />
        <span className="min-w-0">
          <span title={r.document} className="block leading-snug font-medium underline-offset-4 group-hover:underline lg:truncate">
            {docName(r.document)}
          </span>
          <span className="mt-0.5 block text-[13px] text-fg-subtle lg:truncate">
            {r.docType}, {r.standards.join(", ")}
            <span className="lg:hidden">, archived {date(r.archivedAt) === "Today" ? "today" : date(r.archivedAt)}</span>
          </span>
        </span>
      </span>

      <span className="col-span-2 flex items-end justify-between gap-4 pl-[50px] lg:hidden">
        <ResultsSummary r={r} />
        <span className="text-[13px]">
          <Person id={r.reviewedBy} />
        </span>
      </span>

      <span className="max-lg:hidden">
        <ResultsSummary r={r} />
      </span>
      <span className="text-[13.5px] max-lg:hidden">
        <Person id={r.reviewedBy} />
      </span>
      <span className="text-right text-[13.5px] text-fg-muted tabular-nums max-lg:hidden">{date(r.createdAt)}</span>
      <span className="text-right text-[13.5px] text-fg-muted tabular-nums max-lg:hidden">{date(r.archivedAt)}</span>
    </Link>
  );
}
