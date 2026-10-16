"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Archive, Download, FileSpreadsheet, RotateCcw, UserRound } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { Dialog, PageBody, PageIntro, SectionTitle } from "@/components/app/kit";
import { ReportPaper, useReportActions } from "@/components/app/report";
import { PageHeader, Person, appButton, docName, shortDate, surface } from "@/components/app/ui";
import { findPerson, type Review } from "@/lib/data";

export function ArchivedReport() {
  const { id } = useParams<{ id: string }>();
  const { getReview } = useApp();
  const review = getReview(id);

  if (!review || review.status !== "Archived") {
    return (
      <>
        <PageHeader crumb={<Link href="/archive">Archive</Link>} title={review ? "Not in the archive" : "Report not found"} />
        <div className="p-6 text-[13.5px] text-navy/60">
          {review ? "This review has been reopened. " : "This report doesn't exist in this project. "}
          <Link href={review ? `/reviews/${review.id}` : "/archive"} className="font-medium text-navy underline">
            {review ? "Go to the review" : "Go to the archive"}
          </Link>
          .
        </div>
      </>
    );
  }

  return <Report review={review} />;
}

function Report({ review }: { review: Review }) {
  const router = useRouter();
  const { project, reopenReview, toast } = useApp();
  const actions = useReportActions(review);
  const [confirmReopen, setConfirmReopen] = useState(false);
  const reviewer = findPerson(review.reviewedBy);

  function reopen() {
    reopenReview(review.id);
    toast("Review reopened");
    router.push(`/reviews/${review.id}`);
  }

  return (
    <>
      <PageIntro
        eyebrow={
          <>
            <Link href="/archive" className="underline-offset-4 hover:text-navy hover:underline">
              Archive
            </Link>
            <span aria-hidden> / </span>
            {docName(review.document)}
          </>
        }
        title="Findings report"
        summary={`Reviewed by ${reviewer?.name ?? review.reviewedBy} on ${review.createdAt}, archived on ${review.archivedAt}.`}
        actions={
          <>
            <button type="button" onClick={() => setConfirmReopen(true)} className={appButton("ghost", "h-9 px-3.5")}>
              <RotateCcw size={14} /> Reopen
            </button>
            <button type="button" onClick={actions.commentSheet} className={appButton("outline", "h-9 px-3.5")}>
              <FileSpreadsheet size={14} /> Comment sheet
            </button>
            <button type="button" onClick={actions.pdf} className={appButton("primary", "h-9 px-3.5")}>
              <Download size={15} strokeWidth={2} /> Download PDF
            </button>
          </>
        }
      />

      <PageBody className="print:block print:p-0">
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-10 xl:grid-cols-[300px_minmax(0,1fr)] xl:gap-8 print:block">
          <aside className="flex min-w-0 flex-col gap-10 print:hidden">
            <section aria-labelledby="details">
              <SectionTitle id="details" title="Details" />
              <dl className={`mt-4 divide-y divide-hairline text-[13.5px] ${surface}`}>
                {[
                  ["Document", review.document],
                  ["Type", review.docType],
                  ["Standards", review.standards.join(", ")],
                ].map(([k, v]) => (
                  <div key={k} className="px-4 py-3">
                    <dt className="text-[12.5px] text-fg-subtle">{k}</dt>
                    <dd className="mt-0.5 font-medium break-words">{v}</dd>
                  </div>
                ))}
                <div className="px-4 py-3">
                  <dt className="text-[12.5px] text-fg-subtle">Reviewed by</dt>
                  <dd className="mt-1">
                    <Person id={review.reviewedBy} full />
                    {!project.members.includes(review.reviewedBy) && (
                      <span className="mt-1 block text-[12.5px] text-fg-subtle">No longer on this project</span>
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            <section aria-labelledby="history">
              <SectionTitle id="history" title="History" />
              <ol className={`mt-4 divide-y divide-hairline ${surface}`}>
                {review.activity.map((a, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-3 text-[13.5px]">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-mist text-fg-muted ring-1 ring-edge" aria-hidden>
                      {a.kind === "Archived" ? (
                        <Archive size={12} />
                      ) : a.kind === "Reopened" ? (
                        <RotateCcw size={12} />
                      ) : a.kind === "Comment sheet exported" ? (
                        <FileSpreadsheet size={12} />
                      ) : a.kind === "Reviewer changed" ? (
                        <UserRound size={12} />
                      ) : (
                        <Download size={12} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{a.kind}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-fg-subtle">
                        {shortDate(a.when)}, by {findPerson(a.by)?.name ?? a.by}
                      </span>
                    </span>
                  </li>
                ))}
                <li className="flex items-start gap-3 px-4 py-3 text-[13.5px]">
                  <span className="mt-0.5 size-6 shrink-0 rounded-full bg-mist ring-1 ring-edge" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">Reviewed</span>
                    <span className="mt-0.5 block text-[12.5px] text-fg-subtle">
                      {shortDate(review.createdAt)}, by {reviewer?.name ?? review.reviewedBy}
                    </span>
                  </span>
                </li>
              </ol>
            </section>
          </aside>

          {/* The report itself. This is what prints. */}
          <section aria-labelledby="preview" className="min-w-0">
            <div className="mb-4 print:hidden">
              <SectionTitle id="preview" title="Report" hint="Exactly what the PDF looks like" />
            </div>
            <ReportPaper review={review} project={project} />
          </section>
        </div>
      </PageBody>

      {confirmReopen && (
        <Dialog
          title="Reopen this review?"
          onClose={() => setConfirmReopen(false)}
          actions={
            <>
              <button type="button" onClick={() => setConfirmReopen(false)} className={appButton("ghost", "h-9 px-3.5")}>
                Cancel
              </button>
              <button type="button" onClick={reopen} className={appButton("primary", "h-9 px-3.5")}>
                <RotateCcw size={14} /> Reopen review
              </button>
            </>
          }
        >
          It moves back to Reviews so you can change comments or the reviewer. Export the comment sheet again before you archive it, so the
          project comment sheet matches. The reopening is recorded in the report&rsquo;s history.
        </Dialog>
      )}
    </>
  );
}
