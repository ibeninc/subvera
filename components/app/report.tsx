"use client";

import { useApp } from "@/components/app/AppContext";
import { ClauseRef, KindIcon, docName, surface } from "@/components/app/ui";
import { Logo } from "@/components/ui/Logo";
import { counts, findPerson, revisionOf, type Finding, type Project, type Review } from "@/lib/data";

/*
 * The findings report and the comment sheet export, shared by the review and the archive.
 * The comment sheet is the engineer's hand-off: one row per non-compliance or missing item,
 * ready to paste into the project's own comment sheet. Its columns are a placeholder until
 * we have a sample of the client's sheet to match.
 */

export const COMMENT_SHEET_COLUMNS = [
  "Item",
  "Project",
  "Document",
  "Revision",
  "Document type",
  "Result",
  "Standard",
  "Clause",
  "Section",
  "Finding",
  "Detail",
  "Location in document",
  "Reviewer comment",
  "Reviewed by",
  "Review date",
] as const;

const RESULT_LABEL: Record<Finding["kind"], string> = {
  "non-compliant": "Non-compliance",
  missing: "Missing information",
  compliant: "Compliant",
};

/** The comment sheet rows for a review: issues only, compliant checks stay in the PDF report. */
export function commentSheetRows(review: Review, project: Project) {
  const reviewer = findPerson(review.reviewedBy)?.name ?? review.reviewedBy;
  return review.findings
    .filter((f) => f.kind !== "compliant")
    .map((f, i) => [
      String(i + 1),
      project.name,
      docName(review.document),
      revisionOf(review.document) ?? "",
      review.docType,
      RESULT_LABEL[f.kind],
      f.standard,
      f.clause,
      f.section,
      f.title,
      f.detail ?? "",
      f.location,
      f.comment ?? "",
      reviewer,
      review.createdAt,
    ]);
}

/** Download the comment sheet as CSV. The byte-order mark makes Excel read it as UTF-8. */
function downloadCommentSheet(review: Review, project: Project) {
  const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [COMMENT_SHEET_COLUMNS, ...commentSheetRows(review, project)].map((row) => row.map(cell).join(","));
  const url = URL.createObjectURL(new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `Comment sheet, ${docName(review.document)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Export actions for a review. Each one is recorded in the review's history. */
export function useReportActions(review: Review) {
  const { project, logActivity, toast } = useApp();
  return {
    commentSheet() {
      downloadCommentSheet(review, project);
      logActivity(review.id, "Comment sheet exported");
      toast("Comment sheet downloaded");
    },
    pdf() {
      logActivity(review.id, "PDF report downloaded");
      // The page carries a print-only copy of the report, so printing saves just that.
      window.print();
    },
  };
}

const SECTIONS: { kind: Finding["kind"]; title: string }[] = [
  { kind: "non-compliant", title: "Non-compliant" },
  { kind: "missing", title: "Missing information" },
  { kind: "compliant", title: "Compliant checks" },
];

export function ReportPaper({ review, project }: { review: Review; project: Project }) {
  const c = counts(review);
  const reviewer = findPerson(review.reviewedBy);
  return (
    <article
      className={`p-10 max-md:p-5 print:rounded-none print:p-0 print:shadow-none print:ring-0 ${surface} shadow-[0_1px_2px_rgba(14,42,71,.05),0_12px_32px_-16px_rgba(14,42,71,.16)]`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-hairline pb-5">
        <Logo width={116} href={null} />
        <span className="text-right text-[12.5px] text-fg-subtle">
          {project.name}
          {project.operator && <span className="block">{project.operator}</span>}
        </span>
      </div>

      <h2 className="mt-7 text-[24px] font-semibold tracking-[-0.02em]">Findings report</h2>
      <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">
        {docName(review.document)}, {review.docType.toLowerCase()}, checked against {review.standards.join(", ")}.
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-[13px] sm:grid-cols-3">
        <div>
          <dt className="text-fg-subtle">Reviewed by</dt>
          <dd className="mt-0.5 font-medium">
            {reviewer?.name ?? review.reviewedBy}
            {reviewer && <span className="font-normal text-fg-subtle">, {reviewer.role.toLowerCase()}</span>}
          </dd>
        </div>
        <div>
          <dt className="text-fg-subtle">Review date</dt>
          <dd className="mt-0.5 font-medium">{review.createdAt}</dd>
        </div>
        {review.archivedAt && (
          <div>
            <dt className="text-fg-subtle">Archived</dt>
            <dd className="mt-0.5 font-medium">{review.archivedAt}</dd>
          </div>
        )}
      </dl>

      <dl className="mt-6 grid grid-cols-3 divide-x divide-hairline rounded-[12px] bg-mist/70 ring-1 ring-edge max-sm:grid-cols-1 max-sm:divide-x-0 max-sm:divide-y">
        {[
          { kind: "non-compliant" as const, label: "Non-compliant", value: c.nonCompliant },
          { kind: "missing" as const, label: "Missing information", value: c.missing },
          { kind: "compliant" as const, label: "Compliant checks", value: c.compliant },
        ].map((s) => (
          <div key={s.label} className="flex flex-col-reverse px-5 py-4">
            <dt className="mt-1 flex items-center gap-1.5 text-[13px] text-fg-muted">
              <KindIcon kind={s.kind} />
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
                {kind === "compliant" && items.length < c.compliant ? `${items.length} of ${c.compliant} shown` : items.length}
              </span>
            </h3>
            <ul className="divide-y divide-hairline">
              {items.map((f) => (
                <li key={f.id} className="grid grid-cols-[18px_minmax(0,1fr)] gap-x-3 py-4 break-inside-avoid sm:grid-cols-[18px_minmax(0,1fr)_auto]">
                  <span className="pt-0.5">
                    <KindIcon kind={f.kind} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[14px] font-medium">{f.title}</p>
                    {f.detail && <p className="mt-1 text-[13.5px] leading-relaxed text-fg-muted">{f.detail}</p>}
                    <p className="mt-1.5 text-[12.5px] text-fg-subtle">{f.location}</p>
                    {f.comment && (
                      <p className="mt-2 border-l-2 border-edge pl-3 text-[13px] leading-relaxed text-fg-muted">
                        <span className="font-medium text-navy">Comment: </span>
                        {f.comment}
                      </p>
                    )}
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
