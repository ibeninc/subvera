"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Archive, Check, Download, FileSpreadsheet, LoaderCircle, MessageSquareText, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { Dialog, EmptyState, FilterTabs, PageBody, PageIntro, SearchField, SectionTitle } from "@/components/app/kit";
import { ReportPaper, useReportActions } from "@/components/app/report";
import { Card, ClauseRef, KindDot, KindText, PageHeader, Person, appButton, docName, kindLabel, shortDate, surface } from "@/components/app/ui";
import { counts, findPerson, isExported, progressSteps, type Finding, type FindingKind, type Review } from "@/lib/data";
import { Badge } from "@/components/ui/Logo";

export function Findings() {
  const { id } = useParams<{ id: string }>();
  const { getReview } = useApp();
  const review = getReview(id);

  if (!review) {
    return (
      <>
        <PageHeader crumb={<Link href="/reviews">Reviews</Link>} title="Review not found" />
        <div className="p-6 text-[13.5px] text-navy/60">
          This review doesn&apos;t exist in this project.{" "}
          <Link href="/reviews" className="font-medium text-navy underline">
            Go to all reviews
          </Link>
          .
        </div>
      </>
    );
  }

  return review.status === "Running" ? <Progress review={review} /> : <Results review={review} />;
}

/* ------------------------------------------------------------ progress */

// Simulated run, about 9 seconds. Replace with polling of the real review job.
// Progress comes from elapsed time, so it stays correct even if the browser throttles timers.
const RUN_MS = 9000;

function Progress({ review }: { review: Review }) {
  const router = useRouter();
  const { completeReview, cancelReview, toast } = useApp();
  const [pct, setPct] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const steps = progressSteps(review.standards);

  useEffect(() => {
    if (pct >= 100) {
      completeReview(review.id);
      toast("Review complete");
      return;
    }
    const t = setTimeout(() => setPct(Math.min(100, Math.round(((Date.now() - startedAt) / RUN_MS) * 100))), 120);
    return () => clearTimeout(t);
  }, [pct, startedAt, review.id, completeReview, toast]);

  const per = 100 / steps.length;
  const activeIndex = Math.min(steps.length, Math.floor(pct / per));

  return (
    <>
      <PageHeader crumb={<Link href="/reviews">Reviews</Link>} title="Review in progress" />
      <div className="mx-auto flex max-w-[620px] flex-col items-center p-6 pt-12 text-center max-md:p-4 max-md:pt-8">
        <Badge size={52} />
        <h2 className="mt-5 font-sans text-[22px] font-semibold tracking-normal">Checking your document</h2>
        <p className="mt-1 text-[13px] text-navy/60">
          {review.document}, {review.standards.join(", ")}
        </p>

        <div className="mt-8 w-full text-left">
          <div className="flex items-center justify-between text-[12.5px] font-medium">
            <span>Checking requirements</span>
            <span aria-live="polite" className="tabular-nums">
              {pct}%
            </span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-pill bg-navy/10"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-pill bg-teal transition-[width] duration-100 ease-linear" style={{ width: `${pct}%` }} />
          </div>

          <ol className="mt-5 overflow-hidden rounded-[10px] ring-1 ring-hairline">
            {steps.map((s, i) => {
              const done = i < activeIndex;
              const active = i === activeIndex;
              return (
                <li
                  key={s}
                  className={`flex items-center gap-3 border-t border-hairline px-4 py-3 text-[13px] first:border-t-0 ${
                    active ? "bg-teal-tint/60 font-medium" : done ? "" : "text-navy/50"
                  }`}
                >
                  {done ? (
                    <span className="flex size-[18px] items-center justify-center rounded-full bg-teal">
                      <Check size={11} strokeWidth={3} aria-hidden />
                    </span>
                  ) : active ? (
                    <LoaderCircle size={18} className="animate-spin text-teal-dark" aria-hidden />
                  ) : (
                    <span className="size-[18px] rounded-full ring-[1.5px] ring-navy/20" aria-hidden />
                  )}
                  {s}
                </li>
              );
            })}
          </ol>
        </div>

        <p className="mt-6 text-[12.5px] text-navy/55">
          You can leave this page. The review keeps running and your results will be saved to this project.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => {
              cancelReview(review.id);
              router.push("/reviews");
            }}
            className={appButton("outline", "px-4 py-2")}
          >
            Cancel review
          </button>
          <button type="button" onClick={() => setPct(100)} className={appButton("primary", "px-4 py-2")}>
            Skip to results (demo)
          </button>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------ results */

type Filter = "all" | FindingKind;

function Results({ review }: { review: Review }) {
  const router = useRouter();
  const { project, archiveReview, reopenReview, toast } = useApp();
  const actions = useReportActions(review);
  const params = useSearchParams();
  const c = counts(review);
  const archived = review.status === "Archived";
  const exported = isExported(review);

  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(params.get("finding"));
  const [confirmArchive, setConfirmArchive] = useState(false);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return review.findings.filter(
      (f) =>
        (filter === "all" || f.kind === filter) &&
        (!term || `${f.title} ${f.standard} ${f.clause} ${f.location} ${f.comment ?? ""}`.toLowerCase().includes(term)),
    );
  }, [review.findings, filter, q]);

  const open = review.findings.find((f) => f.id === openId) ?? null;
  const listedCompliant = review.findings.filter((f) => f.kind === "compliant").length;

  function archive() {
    setConfirmArchive(false);
    archiveReview(review.id);
    toast("Review archived");
    router.push(`/archive/${review.id}`);
  }

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: c.nonCompliant + c.missing + c.compliant },
    { key: "non-compliant", label: "Non-compliant", count: c.nonCompliant },
    { key: "missing", label: "Missing information", count: c.missing },
    { key: "compliant", label: "Compliant", count: c.compliant },
  ];

  return (
    <>
      <div className="print:hidden">
        <PageIntro
          eyebrow={
            <>
              <Link href={archived ? "/archive" : "/reviews"} className="underline-offset-4 hover:text-navy hover:underline">
                {archived ? "Archive" : "Reviews"}
              </Link>
              <span aria-hidden> / </span>Findings
            </>
          }
          title={docName(review.document)}
          summary={`${review.docType}, checked against ${review.standards.join(", ")}. Illustrative sample data.`}
          actions={
            archived ? (
              <>
                <Link href={`/archive/${review.id}`} className={appButton("outline", "h-9 px-3.5")}>
                  Open in archive
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    reopenReview(review.id);
                    toast("Review reopened");
                  }}
                  className={appButton("primary", "h-9 px-3.5")}
                >
                  <RotateCcw size={14} /> Reopen review
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={actions.pdf} className={appButton("outline", "h-9 px-3.5")}>
                  <Download size={14} /> PDF report
                </button>
                <button type="button" onClick={actions.commentSheet} className={appButton("outline", "h-9 px-3.5")}>
                  <FileSpreadsheet size={14} /> Comment sheet
                </button>
                <button type="button" onClick={() => setConfirmArchive(true)} className={appButton("primary", "h-9 px-3.5")}>
                  <Archive size={14} /> Finish and archive
                </button>
              </>
            )
          }
        />

        <PageBody>
          <div className="flex flex-col gap-5">
            {archived && (
              <p className="rounded-[10px] border-l-2 border-teal bg-teal-tint/40 px-4 py-3 text-[13.5px] leading-relaxed text-fg-muted">
                Archived on {review.archivedAt}. The report is read-only. Reopen the review to change comments or the reviewer.
              </p>
            )}

            <ReviewDetails review={review} exported={exported} readOnly={archived} />

            <div className="grid grid-cols-3 gap-3 max-sm:gap-2">
              {(
                [
                  ["non-compliant", c.nonCompliant, "Need correction or justification"],
                  ["missing", c.missing, "Required content not found"],
                  ["compliant", c.compliant, "Requirements met in the document"],
                ] as const
              ).map(([kind, value, hint]) => (
                <Card key={kind} className="p-4 max-sm:p-3">
                  <p className="text-[13px] max-sm:text-[12px] max-sm:leading-tight">
                    <KindText kind={kind} short />
                  </p>
                  <p className="mt-2.5 font-display text-[28px] leading-none font-semibold tabular-nums max-sm:text-[24px]">{value}</p>
                  <p className="mt-1.5 text-[12.5px] text-fg-subtle max-sm:hidden">{hint}</p>
                </Card>
              ))}
            </div>

            <p className="rounded-[10px] bg-mist px-4 py-3 text-[13px] leading-[1.55] text-fg-muted">
              This summary supports your review. It does not confirm compliance. Check each finding against the source document. The
              responsible engineer keeps final approval.
            </p>
          </div>

          <section aria-labelledby="findings-title">
            <SectionTitle id="findings-title" title="Findings" hint="Add a comment to any finding and it goes into the comment sheet" />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <SearchField value={q} onChange={setQ} placeholder="Search findings, clauses or comments" />
              <FilterTabs label="Filter findings" options={filters} value={filter} onChange={setFilter} />
            </div>

            <div className={`mt-4 ${surface}`}>
              <div
                aria-hidden
                className="hidden grid-cols-[150px_minmax(0,2fr)_130px_minmax(0,1.2fr)_90px] gap-x-5 border-b border-hairline px-5 py-2.5 text-[12.5px] text-fg-subtle lg:grid"
              >
                <span>Result</span>
                <span>Finding</span>
                <span>Clause</span>
                <span>Location</span>
                <span>Comment</span>
              </div>

              {visible.length === 0 ? (
                <EmptyState title={`Nothing matches “${q.trim()}”`}>Try a clause number such as 6.3.2.</EmptyState>
              ) : (
                <ul className="divide-y divide-hairline">
                  {visible.map((f) => (
                    <li key={f.id}>
                      <FindingRow f={f} onOpen={() => setOpenId(f.id)} />
                    </li>
                  ))}
                </ul>
              )}

              {(filter === "compliant" || filter === "all") && c.compliant > listedCompliant && (
                <p className="rounded-b-[14px] border-t border-hairline bg-mist/50 px-5 py-3 text-[13px] text-fg-subtle">
                  Showing {listedCompliant} of {c.compliant} compliant checks. The full list is in the PDF report.
                </p>
              )}
            </div>
          </section>
        </PageBody>
      </div>

      {/* What "PDF report" prints */}
      <div className="hidden print:block">
        <ReportPaper review={review} project={project} />
      </div>

      {open && <FindingPanel key={open.id} review={review} finding={open} readOnly={archived} onClose={() => setOpenId(null)} />}

      {confirmArchive && (
        <Dialog
          title="Finish and archive this review?"
          onClose={() => setConfirmArchive(false)}
          actions={
            <>
              <button type="button" onClick={() => setConfirmArchive(false)} className={appButton("ghost", "h-9 px-3.5")}>
                Cancel
              </button>
              {!exported && (
                <button
                  type="button"
                  onClick={() => {
                    actions.commentSheet();
                    archive();
                  }}
                  className={appButton("outline", "h-9 px-3.5")}
                >
                  Export comment sheet and archive
                </button>
              )}
              <button type="button" onClick={archive} className={appButton("primary", "h-9 px-3.5")}>
                {exported ? "Archive review" : "Archive without exporting"}
              </button>
            </>
          }
        >
          <p>The findings report moves to the archive, read-only. You can reopen it later if something needs to change.</p>
          {!exported && (
            <p className="mt-3 rounded-[10px] bg-missing-bg px-3.5 py-2.5 text-[13.5px] text-navy">
              The comment sheet hasn&rsquo;t been exported yet, so these findings aren&rsquo;t in the project comment sheet.
            </p>
          )}
        </Dialog>
      )}
    </>
  );

}

/** Who reviewed it, when, against what, and whether the comment sheet is out. */
function ReviewDetails({ review, exported, readOnly }: { review: Review; exported: boolean; readOnly: boolean }) {
  const { project, setReviewer, toast } = useApp();
  const reviewer = findPerson(review.reviewedBy);
  const left = !project.members.includes(review.reviewedBy);
  const lastExport = review.activity.find((a) => a.kind === "Comment sheet exported");

  return (
    <div className={`${surface} px-5 py-4`}>
      <dl className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-8 gap-y-4 text-[13.5px]">
        <div>
          <dt className="text-[12.5px] text-fg-subtle">Reviewed by</dt>
          <dd className="mt-1">
            {readOnly ? (
              <Person id={review.reviewedBy} full />
            ) : (
              <label className="relative block max-w-[220px]">
                <span className="sr-only">Reviewer</span>
                <select
                  value={left ? "" : review.reviewedBy}
                  onChange={(e) => {
                    setReviewer(review.id, e.target.value);
                    toast(`Handed over to ${findPerson(e.target.value)?.name}`);
                  }}
                  className="h-8 w-full appearance-none rounded-[8px] bg-white pr-8 pl-2.5 text-[13.5px] font-medium ring-1 ring-edge outline-none transition-shadow hover:ring-navy/25 focus:ring-2 focus:ring-teal"
                >
                  {left && <option value="">{reviewer?.name ?? review.reviewedBy} (left the project)</option>}
                  {project.members.map((id) => (
                    <option key={id} value={id}>
                      {findPerson(id)?.name}
                    </option>
                  ))}
                </select>
                <svg aria-hidden viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-fg-subtle">
                  <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </label>
            )}
            {left && !readOnly && <p className="mt-1.5 text-[12.5px] text-fg-subtle">Hand it over to someone still on the project.</p>}
          </dd>
        </div>
        <div>
          <dt className="text-[12.5px] text-fg-subtle">Review date</dt>
          <dd className="mt-1 font-medium">{review.createdAt}</dd>
        </div>
        <div>
          <dt className="text-[12.5px] text-fg-subtle">Comment sheet</dt>
          <dd className="mt-1 font-medium">
            {exported && lastExport ? (
              <span className="inline-flex items-center gap-1.5 text-teal-dark">
                <Check size={14} strokeWidth={2.5} aria-hidden /> Exported {shortDate(lastExport.when) === "Today" ? "today" : shortDate(lastExport.when)}
              </span>
            ) : (
              <span className="text-fg-muted">Not exported yet</span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/*
 * Desktop: result | finding | clause | location | comment
 * Phone:   finding, then result and clause on one line
 */
function FindingRow({ f, onOpen }: { f: Finding; onOpen: () => void }) {
  const ok = f.kind === "compliant";
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group grid w-full grid-cols-1 items-center gap-x-5 gap-y-2 px-5 py-3.5 text-left text-[14px] transition-colors duration-150 hover:bg-mist/60 lg:grid-cols-[150px_minmax(0,2fr)_130px_minmax(0,1.2fr)_90px]"
    >
      <span className="text-[13px] max-lg:order-2">
        <KindText kind={f.kind} short />
      </span>
      <span className={`min-w-0 leading-snug underline-offset-4 group-hover:underline max-lg:order-1 lg:truncate ${ok ? "text-fg-muted" : "font-medium"}`}>
        {f.title}
      </span>
      <span className="max-lg:order-3">
        <ClauseRef standard={f.standard} clause={f.clause} />
      </span>
      <span className="truncate text-[13.5px] text-fg-muted max-lg:hidden">{f.location}</span>
      <span className="text-[13px] max-lg:order-4">
        {f.comment ? (
          <span className="inline-flex items-center gap-1.5 text-fg-muted" title={f.comment}>
            <MessageSquareText size={14} className="text-teal-dark" aria-hidden /> Added
          </span>
        ) : ok ? null : (
          <span className="text-fg-subtle max-lg:hidden">None</span>
        )}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------ detail panel */

function FindingPanel({ review, finding, readOnly, onClose }: { review: Review; finding: Finding; readOnly: boolean; onClose: () => void }) {
  const { updateFinding, toast } = useApp();
  const [comment, setComment] = useState(finding.comment ?? "");
  const saved = comment.trim() === (finding.comment ?? "");
  const issue = finding.kind !== "compliant";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 print:hidden" role="dialog" aria-modal="true" aria-label={finding.title}>
      <button aria-label="Close" className="absolute inset-0 bg-navy/20" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-[440px] max-w-full flex-col bg-white shadow-[-20px_0_60px_-20px_rgba(14,42,71,.35)]">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-3.5">
          <span className="flex items-center gap-2 text-[12.5px] font-medium text-fg-muted">
            <KindDot kind={finding.kind} />
            {kindLabel(finding.kind)}
          </span>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-8 items-center justify-center rounded-[8px] hover:bg-mist">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <h2 className="font-sans text-[18px] leading-snug font-semibold tracking-normal">{finding.title}</h2>
          {finding.detail && <p className="mt-2 text-[14px] leading-[1.6] text-fg-muted">{finding.detail}</p>}

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 rounded-[10px] bg-mist p-4 text-[13px]">
            <div>
              <dt className="text-fg-subtle">Standard</dt>
              <dd className="mt-0.5 font-medium">{finding.standard}</dd>
            </div>
            <div>
              <dt className="text-fg-subtle">Section and clause</dt>
              <dd className="mt-0.5 font-medium">
                {finding.section}, clause {finding.clause}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-fg-subtle">{finding.kind === "missing" ? "Where it is expected" : "Location in the document"}</dt>
              <dd className="mt-0.5 font-medium">{finding.location}</dd>
            </div>
          </dl>

          {issue && (
            <label className="mt-5 block text-[13px]">
              <span className="font-semibold">Comment for the comment sheet</span>
              <span className="mt-0.5 block text-fg-subtle">Goes into the Reviewer comment column when you export.</span>
              {readOnly ? (
                <p className="mt-2 rounded-[8px] bg-mist px-3 py-2.5 text-[14px] leading-relaxed text-fg-muted">{finding.comment || "No comment."}</p>
              ) : (
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={5}
                  placeholder="The correction or justification you want from the supplier."
                  className="mt-2 w-full resize-none rounded-[8px] bg-white px-3 py-2 text-[14px] ring-1 ring-edge outline-none placeholder:text-fg-subtle focus:ring-2 focus:ring-teal"
                />
              )}
            </label>
          )}
        </div>

        {issue && !readOnly && (
          <div className="flex justify-end gap-2 border-t border-hairline px-5 py-3.5">
            <button type="button" onClick={onClose} className={appButton("ghost", "px-4 py-2")}>
              Close
            </button>
            <button
              type="button"
              disabled={saved}
              onClick={() => {
                updateFinding(review.id, finding.id, { comment: comment.trim() || undefined });
                toast(comment.trim() ? "Comment saved" : "Comment removed");
              }}
              className={appButton("primary", "px-4 py-2")}
            >
              Save comment
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
