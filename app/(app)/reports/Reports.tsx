"use client";

import { useSearchParams } from "next/navigation";
import { Check, Download } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { FileTile, PageBody, PageIntro, SectionTitle } from "@/components/app/kit";
import { ClauseRef, Person, SeverityIcon, appButton, docName, kindLabel, shortDate, surface } from "@/components/app/ui";
import { SAMPLE_PROJECT, breakdown, counts, type Finding, type MemberId, type Review } from "@/lib/data";
import { Logo } from "@/components/ui/Logo";

type ExportRow = { name: string; kind: "PDF" | "Word"; when: string; by: MemberId };

const initialExports: ExportRow[] = [{ name: "Findings report, Fatigue Analysis Report Rev A.pdf", kind: "PDF", when: "9 Oct 2026", by: "JK" }];

/** Build a simple Word-compatible HTML document of the findings and download it. */
function downloadWord(review: Review) {
  const esc = (s: string) => s.replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[ch]!);
  const c = counts(review);
  const rows = review.findings
    .map(
      (f) =>
        `<tr><td style="border:1px solid #ccc;padding:4px">${esc(kindLabel(f.kind, f.severity))}</td><td style="border:1px solid #ccc;padding:4px"><b>${esc(f.title)}</b>${f.detail ? `<br>${esc(f.detail)}` : ""}</td><td style="border:1px solid #ccc;padding:4px">${esc(`${f.standard} ${f.clause}`)}</td><td style="border:1px solid #ccc;padding:4px">${esc(f.location)}</td><td style="border:1px solid #ccc;padding:4px">${esc(f.status)}</td></tr>`,
    )
    .join("");
  const html = `<html><head><meta charset="utf-8"><title>Subvera findings report</title></head><body style="font-family:Arial">
<h1>Findings report</h1><p>${esc(review.document)}, ${esc(review.docType)}, checked against ${esc(review.standards.join(" and "))}</p>
<p>Non-compliant: ${c.nonCompliant}. Missing information: ${c.missing}. Compliant checks: ${c.met}.</p>
<p>This report supports your review. It does not confirm compliance. The responsible engineer keeps final approval.</p>
<table style="border-collapse:collapse">${rows}</table></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "application/msword" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `Findings report, ${docName(review.document)}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

export function Reports() {
  const { reviews, toast } = useApp();
  const params = useSearchParams();
  const complete = reviews.filter((r) => r.status === "Complete");
  const [reviewId, setReviewId] = useState(params.get("review") ?? complete[0]?.id);
  const [exports, setExports] = useState<ExportRow[]>(initialExports);
  const review = complete.find((r) => r.id === reviewId) ?? complete[0];

  if (!review) {
    return (
      <>
        <PageIntro eyebrow="Reports" title="Reports" summary="Run a review first. Its report will show up here, ready to export." />
      </>
    );
  }

  const base = `Findings report, ${docName(review.document)}`;

  function exportPdf() {
    setExports((e) => [{ name: `${base}.pdf`, kind: "PDF", when: "Just now", by: "AB" }, ...e]);
    window.print();
  }

  function exportWord() {
    downloadWord(review);
    setExports((e) => [{ name: `${base}.doc`, kind: "Word", when: "Just now", by: "AB" }, ...e]);
    toast("Word report downloaded");
  }

  return (
    <>
      <PageIntro
        eyebrow="Reports"
        title="Findings report"
        summary="Pick a review, check the preview, then export it as a PDF or Word file for sign-off."
        actions={
          <>
            <button type="button" onClick={exportWord} className={appButton("outline", "h-9 px-3.5")}>
              Export Word
            </button>
            <button type="button" onClick={exportPdf} className={appButton("primary", "h-9 px-3.5")}>
              <Download size={15} strokeWidth={2} /> Export PDF
            </button>
          </>
        }
      />

      <PageBody className="print:block print:p-0">
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-8 print:block">
          {/* left: pick a review, past exports */}
          <aside className="flex min-w-0 flex-col gap-10 print:hidden">
            <section aria-labelledby="pick-review">
              <SectionTitle id="pick-review" title="Review" />
              <div role="radiogroup" aria-labelledby="pick-review" className="mt-4 flex flex-col gap-2">
                {complete.map((r) => (
                  <ReviewOption key={r.id} r={r} selected={r.id === review.id} onSelect={() => setReviewId(r.id)} />
                ))}
              </div>
            </section>

            <section aria-labelledby="exports">
              <SectionTitle id="exports" title="Exports" />
              <ul className={`mt-4 divide-y divide-hairline ${surface}`}>
                {exports.map((e, i) => (
                  <li key={e.name + i} className="flex items-center gap-3 px-4 py-3.5 text-[13.5px]">
                    <span
                      className={`flex h-9 w-8 shrink-0 items-end justify-center rounded-[6px] pb-1 font-mono text-[9.5px] font-medium ring-1 ${
                        e.kind === "PDF" ? "bg-high-bg text-high-fg ring-high-fg/15" : "bg-[#E8EFF8] text-deep ring-deep/15"
                      }`}
                      aria-hidden
                    >
                      {e.kind === "PDF" ? "PDF" : "DOC"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium" title={e.name}>
                        {e.name.replace(/^Findings report, /, "")}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-fg-subtle">
                        {e.when === "Just now" ? "Just now" : shortDate(e.when)}, by <Person id={e.by} />
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </aside>

          {/* right: the report itself. This is what prints. */}
          <section aria-labelledby="preview" className="min-w-0">
            <div className="mb-4 print:hidden">
              <SectionTitle id="preview" title="Preview" hint="This is exactly what the PDF will look like" />
            </div>
            <ReportPaper review={review} />
          </section>
        </div>
      </PageBody>
    </>
  );
}

function ReviewOption({ r, selected, onSelect }: { r: Review; selected: boolean; onSelect: () => void }) {
  const b = breakdown(r);
  const issues = b.high + b.medium + b.missing;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex w-full min-w-0 items-center gap-3 rounded-[12px] bg-white p-3 text-left transition-[box-shadow,background-color] duration-150 ${
        selected
          ? "bg-teal-tint/50 shadow-[0_1px_2px_rgba(14,42,71,.05)] ring-[1.5px] ring-teal"
          : "shadow-[0_1px_2px_rgba(14,42,71,.05)] ring-1 ring-edge hover:ring-navy/25"
      }`}
    >
      <FileTile size={34} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium" title={r.document}>
          {docName(r.document)}
        </span>
        <span className="mt-0.5 block text-[12.5px] text-fg-subtle tabular-nums">
          {issues > 0 ? `${issues} open` : "Nothing open"}, {b.met + b.resolved} met
        </span>
      </span>
      <span
        className={`flex size-5 shrink-0 items-center justify-center rounded-full ${selected ? "bg-teal text-navy" : "ring-1 ring-edge"}`}
        aria-hidden
      >
        {selected && <Check size={12} strokeWidth={3} />}
      </span>
    </button>
  );
}

const SECTIONS: { kind: Finding["kind"]; title: string }[] = [
  { kind: "non-compliant", title: "Non-compliant" },
  { kind: "missing", title: "Missing information" },
  { kind: "met", title: "Compliant checks" },
];

function ReportPaper({ review }: { review: Review }) {
  const c = counts(review);
  return (
    <article className={`p-10 max-md:p-5 print:rounded-none print:p-0 print:shadow-none print:ring-0 ${surface} shadow-[0_1px_2px_rgba(14,42,71,.05),0_12px_32px_-16px_rgba(14,42,71,.16)]`}>
      <div className="flex items-center justify-between gap-4 border-b border-hairline pb-5">
        <Logo width={116} href={null} />
        <span className="text-[12.5px] text-fg-subtle">{SAMPLE_PROJECT}</span>
      </div>

      <h2 className="mt-7 text-[24px] font-semibold tracking-[-0.02em]">Findings report</h2>
      <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">
        {docName(review.document)}, {review.docType.toLowerCase()}, checked against {review.standards.join(" and ")} on{" "}
        {review.createdAt === "Today" ? "today's date" : review.createdAt}.
      </p>

      <dl className="mt-6 grid grid-cols-3 divide-x divide-hairline rounded-[12px] bg-mist/70 ring-1 ring-edge max-sm:grid-cols-1 max-sm:divide-x-0 max-sm:divide-y">
        {[
          { label: "Non-compliant", value: c.nonCompliant, icon: <SeverityIcon kind="non-compliant" severity="High" /> },
          { label: "Missing information", value: c.missing, icon: <SeverityIcon kind="missing" /> },
          { label: "Compliant checks", value: c.met, icon: <SeverityIcon kind="met" /> },
        ].map((s) => (
          <div key={s.label} className="flex flex-col-reverse px-5 py-4">
            <dt className="mt-1 flex items-center gap-1.5 text-[13px] text-fg-muted">
              {s.icon}
              {s.label}
            </dt>
            <dd className="font-display text-[28px] leading-none font-semibold tabular-nums">{s.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 rounded-[10px] border-l-2 border-teal bg-teal-tint/40 px-4 py-3 text-[13px] leading-relaxed text-fg-muted">
        This report supports your review. It doesn&rsquo;t confirm compliance, and the responsible engineer keeps final approval.
      </p>

      {SECTIONS.map(({ kind, title }) => {
        const items = review.findings.filter((f) => f.kind === kind);
        if (items.length === 0) return null;
        return (
          <section key={kind} className="mt-9 break-inside-avoid-page">
            <h3 className="flex items-baseline gap-2.5 border-b border-hairline pb-2.5 font-sans text-[15px] font-semibold tracking-normal">
              {title}
              <span className="text-[13px] font-normal text-fg-subtle tabular-nums">
                {kind === "met" && items.length < c.met ? `${items.length} of ${c.met} shown` : items.length}
              </span>
            </h3>
            <ul className="divide-y divide-hairline">
              {items.map((f) => (
                <li key={f.id} className="grid grid-cols-[18px_minmax(0,1fr)] gap-x-3 py-4 break-inside-avoid sm:grid-cols-[18px_minmax(0,1fr)_auto]">
                  <span className="pt-0.5">
                    <SeverityIcon kind={f.kind} severity={f.severity} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium">
                      {f.title}
                      {f.severity && <span className="ml-2 text-[12.5px] font-normal text-fg-subtle">{f.severity} severity</span>}
                    </p>
                    {f.detail && <p className="mt-1 text-[13.5px] leading-relaxed text-fg-muted">{f.detail}</p>}
                    <p className="mt-1.5 text-[12.5px] text-fg-subtle">
                      {f.location}
                      {f.kind !== "met" && `, ${f.status.toLowerCase()}`}
                    </p>
                  </div>
                  <span className="col-start-2 mt-2 sm:col-start-3 sm:mt-0">
                    <ClauseRef standard={f.standard} clause={f.clause} />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </article>
  );
}
