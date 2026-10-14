"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { EmptyState, FileTile, FilterTabs, PageBody, PageIntro, Pagination, SearchField } from "@/components/app/kit";
import { Person, StatusPill, appButton, docName, shortDate, surface } from "@/components/app/ui";
import { documentCategories, documents } from "@/lib/data";

type Doc = (typeof documents)[number];

const PAGE_SIZE = 10;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
const word = (n: number) => WORDS[n] ?? String(n);

/** "14 Oct 2026" to a sortable number. */
const when = (d: string) => {
  const [day, mon, year] = d.split(" ");
  return Date.UTC(+year, MONTHS.indexOf(mon), +day);
};

/** The document name without its revision, so Rev A and Rev B of the same report match up. */
const family = (name: string) => docName(name).replace(/\s+Rev\s+\w+$/i, "");

/** The newer revision that replaces this one, if one has been uploaded. */
function supersededBy(d: Doc) {
  return documents.filter((x) => family(x.name) === family(d.name) && x.revision > d.revision).sort((a, b) => (a.revision < b.revision ? 1 : -1))[0];
}

const FILTERS = [
  { key: "all", label: "All", test: () => true },
  { key: "reviewed", label: "Reviewed", test: (d: Doc) => d.reviews > 0 },
  { key: "pending", label: "To review", test: (d: Doc) => d.reviews === 0 && !supersededBy(d) },
  { key: "old", label: "Replaced", test: (d: Doc) => Boolean(supersededBy(d)) },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function summarise() {
  const pending = documents.filter((d) => d.reviews === 0 && !supersededBy(d)).length;
  const first = `${word(documents.length)} ${documents.length === 1 ? "document" : "documents"} in this project.`;
  if (pending === 0) return `${first} Every current revision has been reviewed.`;
  return `${first} ${word(pending)} ${pending === 1 ? "hasn't" : "haven't"} been reviewed yet.`;
}

export function Documents() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [page, setPage] = useState(1);

  const query = q.trim().toLowerCase();
  const sorted = [...documents].sort((a, b) => when(b.date) - when(a.date));
  const matches = sorted.filter((d) => `${d.name} ${d.type}`.toLowerCase().includes(query));
  const test: (d: Doc) => boolean = FILTERS.find((f) => f.key === filter)!.test;
  const list = matches.filter(test);
  const current = Math.min(page, Math.max(1, Math.ceil(list.length / PAGE_SIZE)));
  const rows = list.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <>
      <PageIntro
        eyebrow="Documents"
        title="Project documents"
        summary={summarise()}
        actions={
          <Link href="/reviews/new" className={appButton("primary", "h-9 px-3.5")}>
            <Plus size={15} strokeWidth={2} /> Upload and review
          </Link>
        }
      />

      <PageBody>
        <section aria-label="Documents">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchField
              value={q}
              onChange={(v) => {
                setQ(v);
                setPage(1);
              }}
              placeholder="Search by name or type"
            />
            <FilterTabs
              label="Filter documents"
              options={FILTERS.map((f) => ({ key: f.key, label: f.label, count: matches.filter(f.test as (d: Doc) => boolean).length }))}
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
              className="hidden grid-cols-[minmax(0,1fr)_150px_150px_170px] gap-x-6 border-b border-hairline px-5 py-2.5 text-[12.5px] text-fg-subtle lg:grid"
            >
              <span>Document</span>
              <span>Revision</span>
              <span>Review</span>
              <span>Uploaded</span>
            </div>

            {rows.length === 0 ? (
              <EmptyState title={query ? `Nothing matches “${q.trim()}”` : "Nothing in this view"}>
                {query ? "Try part of the file name or a document type." : "Try another filter."}
              </EmptyState>
            ) : (
              <ul className="divide-y divide-hairline">
                {rows.map((d) => (
                  <li key={d.name}>
                    <DocumentRow d={d} />
                  </li>
                ))}
              </ul>
            )}

            <Pagination page={current} pageSize={PAGE_SIZE} total={list.length} onPage={setPage} noun="documents" />
          </div>
        </section>
      </PageBody>
    </>
  );
}

function DocumentRow({ d }: { d: Doc }) {
  const router = useRouter();
  const { reviews, updateDraft } = useApp();
  const newer = supersededBy(d);
  const review = reviews.find((r) => r.document === d.name);

  // Start a review with this document and its type already filled in.
  function startReview() {
    const category = Object.keys(documentCategories).find((c) => documentCategories[c].includes(d.type));
    updateDraft({ fileName: d.name, ...(category ? { category, docType: d.type } : {}) });
    router.push("/reviews/new");
  }

  const reviewCell = review ? (
    <Link href={`/reviews/${review.id}`} className="group/r inline-flex items-center gap-1.5">
      <StatusPill tone="teal">Reviewed</StatusPill>
      <ArrowRight size={14} className="text-fg-subtle opacity-0 transition-opacity group-hover/r:opacity-100" aria-hidden />
    </Link>
  ) : newer ? (
    <span className="text-[13px] text-fg-subtle">Not needed</span>
  ) : (
    <button type="button" onClick={startReview} className={appButton("outline", "h-8 py-0")}>
      Review
    </button>
  );

  return (
    <div className="grid grid-cols-1 items-center gap-y-3 px-5 py-4 text-[14px] lg:grid-cols-[minmax(0,1fr)_150px_150px_170px] lg:gap-x-6">
      <span className={`flex min-w-0 items-center gap-3.5 ${newer ? "opacity-60" : ""}`}>
        <FileTile />
        <span className="min-w-0">
          <span title={d.name} className="block leading-snug font-medium lg:truncate">
            {docName(d.name)}
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-fg-subtle">
            {d.type}
            <span className="lg:hidden">, {shortDate(d.date) === "Today" ? "today" : shortDate(d.date)}</span>
          </span>
        </span>
      </span>

      {/* phone: revision on the left, the review action on the right, under the name */}
      <span className="flex items-center justify-between gap-3 max-lg:pl-[50px] lg:block">
        <span className="flex flex-wrap items-center gap-2">
          <span className="rounded-[6px] bg-navy/[0.04] px-1.5 py-0.5 font-mono text-[12px] text-fg-muted ring-1 ring-navy/[0.06] ring-inset">
            Rev {d.revision}
          </span>
          {newer && <span className="text-[13px] text-fg-subtle">Replaced by Rev {newer.revision}</span>}
        </span>
        <span className="shrink-0 lg:hidden">{reviewCell}</span>
      </span>

      <span className="max-lg:hidden">{reviewCell}</span>
      <span className="flex items-center justify-between gap-3 text-[13.5px] max-lg:hidden">
        <Person id={d.uploadedBy} />
        <span className="text-fg-muted tabular-nums">{shortDate(d.date)}</span>
      </span>
    </div>
  );
}
