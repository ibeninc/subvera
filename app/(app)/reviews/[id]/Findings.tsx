"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Check, CircleCheck, Download, LoaderCircle, Search, Share2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { Avatar, Card, Checkbox, PageHeader, SevDot, StatusText, appButton, kindLabel } from "@/components/app/ui";
import { counts, members, progressSteps, type Finding, type FindingStatus, type MemberId, type Review } from "@/lib/data";
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

  useEffect(() => {
    if (pct >= 100) {
      completeReview(review.id);
      toast("Review complete");
      return;
    }
    const t = setTimeout(() => setPct(Math.min(100, Math.round(((Date.now() - startedAt) / RUN_MS) * 100))), 120);
    return () => clearTimeout(t);
  }, [pct, startedAt, review.id, completeReview, toast]);

  const per = 100 / progressSteps.length;
  const activeIndex = Math.min(progressSteps.length, Math.floor(pct / per));

  return (
    <>
      <PageHeader crumb={<Link href="/reviews">Reviews</Link>} title="Review in progress" />
      <div className="mx-auto flex max-w-[620px] flex-col items-center p-6 pt-12 text-center max-md:p-4 max-md:pt-8">
        <Badge size={52} />
        <h2 className="mt-5 font-sans text-[22px] font-semibold tracking-normal">Checking your document</h2>
        <p className="mt-1 text-[13px] text-navy/60">
          {review.document}, {review.standards.join(" and ")}
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
            {progressSteps.map((s, i) => {
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

type Filter = "all" | "non-compliant" | "missing" | "met";

function Results({ review }: { review: Review }) {
  const { toast, updateFinding } = useApp();
  const params = useSearchParams();
  const c = counts(review);

  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [openId, setOpenId] = useState<string | null>(params.get("finding"));

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return review.findings.filter(
      (f) =>
        (filter === "all" || f.kind === filter) &&
        (!term || `${f.title} ${f.standard} ${f.clause} ${f.location}`.toLowerCase().includes(term)),
    );
  }, [review.findings, filter, q]);

  const open = review.findings.find((f) => f.id === openId) ?? null;
  const actionable = visible.filter((f) => f.kind !== "met");
  const allSelected = actionable.length > 0 && actionable.every((f) => selected.includes(f.id));

  const filters: [Filter, string, number][] = [
    ["all", "All", c.nonCompliant + c.missing + c.met],
    ["non-compliant", "Non-compliant", c.nonCompliant],
    ["missing", "Missing", c.missing],
    ["met", "Met", c.met],
  ];

  function share() {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    toast("Link copied");
  }

  function bulk(status: FindingStatus) {
    selected.forEach((id) => updateFinding(review.id, id, { status }));
    toast(`${selected.length} ${selected.length === 1 ? "finding" : "findings"} marked ${status.toLowerCase()}`);
    setSelected([]);
  }

  return (
    <>
      <PageHeader
        crumb={
          <>
            <Link href="/reviews" className="hover:text-navy">
              Reviews
            </Link>{" "}
            / {review.document}
          </>
        }
        title="Findings"
        actions={
          <>
            <button type="button" onClick={share} className={appButton("outline")}>
              <Share2 size={13} /> Share
            </button>
            <Link href={`/reports?review=${review.id}`} className={appButton("primary")}>
              <Download size={13} /> Export report
            </Link>
          </>
        }
      />

      <div className="flex flex-col gap-4 p-6 max-md:p-4">
        <p className="text-[12.5px] text-navy/55">
          {review.docType}, checked against {review.standards.join(" and ")}. Illustrative sample data.
        </p>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            ["Non-compliant", c.nonCompliant, "text-high-fg", "Need correction or justification"],
            ["Missing information", c.missing, "text-medium-fg", "Required content not found"],
            ["Compliant checks", c.met, "text-teal-dark", "Requirements met in the document"],
          ].map(([l, v, tone, d]) => (
            <Card key={l as string} className="p-4 max-sm:p-3">
              <p className={`text-[12px] font-medium max-sm:text-[11px] max-sm:leading-tight ${tone}`}>{l}</p>
              <p className="mt-2 font-display text-[28px] leading-none font-semibold max-sm:text-[24px]">{v}</p>
              <p className="mt-1.5 text-[11.5px] text-navy/45 max-sm:hidden">{d}</p>
            </Card>
          ))}
        </div>

        <p className="rounded-[10px] bg-mist px-4 py-3 text-[12.5px] leading-[1.55] text-navy/70">
          This summary supports your review. It does not confirm compliance. Check each finding against the source document. The
          responsible engineer keeps final approval.
        </p>

        {/* toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex w-full max-w-[280px] items-center gap-2 rounded-[8px] px-3 py-2 text-[12.5px] ring-1 ring-line focus-within:ring-2 focus-within:ring-teal">
            <Search size={14} className="text-navy/40" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search findings or clauses"
              className="w-full bg-transparent outline-none placeholder:text-navy/40"
            />
          </label>
          <div role="tablist" aria-label="Filter findings" className="flex gap-1 overflow-x-auto rounded-[9px] bg-mist p-1 text-[12px]">
            {filters.map(([key, label, n]) => (
              <button
                key={key}
                role="tab"
                aria-selected={filter === key}
                onClick={() => setFilter(key)}
                className={`rounded-[6px] px-2.5 py-1 whitespace-nowrap transition-colors ${
                  filter === key ? "bg-white font-medium text-navy shadow-[0_1px_2px_rgba(14,42,71,.1)]" : "text-navy/55 hover:text-navy"
                }`}
              >
                {label} <span className="text-navy/40 tabular-nums">{n}</span>
              </button>
            ))}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-[10px] bg-navy px-4 py-2.5 text-[12.5px] text-white">
            <span className="font-medium">{selected.length} selected</span>
            <span className="h-4 w-px bg-white/20" />
            <button type="button" onClick={() => bulk("In review")} className="text-white/80 hover:text-white">
              Mark in review
            </button>
            <button type="button" onClick={() => bulk("Resolved")} className="text-white/80 hover:text-white">
              Mark resolved
            </button>
            <button type="button" onClick={() => setSelected([])} className="ml-auto text-white/60 hover:text-white">
              Clear
            </button>
          </div>
        )}

        {/* table */}
        <div className="overflow-x-auto rounded-[10px] ring-1 ring-hairline">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[28px_minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] items-center gap-3 bg-mist/70 px-4 py-2.5 text-[11.5px] font-medium text-navy/55">
              <button
                type="button"
                aria-label={allSelected ? "Clear selection" : "Select all open findings"}
                onClick={() => setSelected(allSelected ? [] : actionable.map((f) => f.id))}
              >
                <Checkbox checked={allSelected} />
              </button>
              <span>Finding</span>
              <span>Clause</span>
              <span>Location</span>
              <span>Status</span>
            </div>

            {visible.map((f) => {
              const isSel = selected.includes(f.id);
              return (
                <div
                  key={f.id}
                  className={`grid grid-cols-[28px_minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] items-center gap-3 border-t border-hairline px-4 py-3 text-[12.5px] ${
                    isSel ? "bg-teal-tint/40" : "hover:bg-mist/50"
                  } ${f.kind === "met" ? "text-navy/60" : ""}`}
                >
                  {f.kind === "met" ? (
                    <span />
                  ) : (
                    <button
                      type="button"
                      aria-label={`Select ${f.title}`}
                      onClick={() => setSelected((s) => (isSel ? s.filter((x) => x !== f.id) : [...s, f.id]))}
                    >
                      <Checkbox checked={isSel} />
                    </button>
                  )}
                  <button type="button" onClick={() => setOpenId(f.id)} className="flex min-w-0 items-center gap-2.5 text-left">
                    <SevDot kind={f.kind} severity={f.severity} />
                    <span className={`truncate hover:underline ${f.kind === "met" ? "" : "font-medium"}`}>{f.title}</span>
                  </button>
                  <span className="truncate text-navy/60">
                    {f.standard} {f.clause}
                  </span>
                  <span className="truncate text-navy/60">{f.location}</span>
                  <span className="flex items-center gap-1.5">
                    {f.assignee ? <Avatar id={f.assignee} /> : <CircleCheck size={15} className="text-teal-dark" />}
                    <StatusText status={f.status} />
                  </span>
                </div>
              );
            })}

            {visible.length === 0 && (
              <p className="border-t border-hairline px-4 py-10 text-center text-[12.5px] text-navy/50">
                Nothing matches &ldquo;{q}&rdquo;. Try a clause number such as 6.3.2.
              </p>
            )}
            {(filter === "met" || filter === "all") && c.met > review.findings.filter((f) => f.kind === "met").length && (
              <p className="border-t border-hairline px-4 py-3 text-[12px] text-navy/50">
                Showing {review.findings.filter((f) => f.kind === "met").length} of {c.met} compliant checks. The full list is in
                the exported report.
              </p>
            )}
          </div>
        </div>
      </div>

      {open && <FindingPanel review={review} finding={open} onClose={() => setOpenId(null)} />}
    </>
  );
}

/* ------------------------------------------------------------ detail panel */

function FindingPanel({ review, finding, onClose }: { review: Review; finding: Finding; onClose: () => void }) {
  const { updateFinding, toast } = useApp();
  const [note, setNote] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (patch: Partial<Finding>) => updateFinding(review.id, finding.id, patch);

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={finding.title}>
      <button aria-label="Close" className="absolute inset-0 bg-navy/20" onClick={onClose} />
      <aside className="absolute inset-y-0 right-0 flex w-[440px] max-w-full flex-col bg-white shadow-[-20px_0_60px_-20px_rgba(14,42,71,.35)]">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-3.5">
          <span className="flex items-center gap-2 text-[12px] font-medium text-navy/60">
            <SevDot kind={finding.kind} severity={finding.severity} />
            {kindLabel(finding.kind, finding.severity)}
          </span>
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-8 items-center justify-center rounded-[8px] hover:bg-mist">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <h2 className="font-sans text-[18px] leading-snug font-semibold tracking-normal">{finding.title}</h2>
          {finding.detail && <p className="mt-2 text-[13.5px] leading-[1.6] text-navy/70">{finding.detail}</p>}

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 rounded-[10px] bg-mist p-4 text-[12.5px]">
            <div>
              <dt className="text-navy/50">Standard</dt>
              <dd className="mt-0.5 font-medium">{finding.standard}</dd>
            </div>
            <div>
              <dt className="text-navy/50">Section and clause</dt>
              <dd className="mt-0.5 font-medium">
                {finding.section}, clause {finding.clause}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-navy/50">{finding.kind === "missing" ? "Where it is expected" : "Location in the document"}</dt>
              <dd className="mt-0.5 font-medium">{finding.location}</dd>
            </div>
          </dl>

          {finding.kind !== "met" && (
            <div className="mt-5 flex flex-col gap-4">
              <label className="block text-[12.5px]">
                <span className="font-semibold">Status</span>
                <select
                  value={finding.status}
                  onChange={(e) => set({ status: e.target.value as FindingStatus })}
                  className="mt-1.5 h-9 w-full rounded-[8px] bg-white px-2.5 ring-1 ring-line outline-none focus:ring-2 focus:ring-teal"
                >
                  {(["Open", "In review", "Resolved"] as const).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="block text-[12.5px]">
                <span className="font-semibold">Assigned to</span>
                <select
                  value={finding.assignee ?? ""}
                  onChange={(e) => set({ assignee: (e.target.value || undefined) as MemberId | undefined })}
                  className="mt-1.5 h-9 w-full rounded-[8px] bg-white px-2.5 ring-1 ring-line outline-none focus:ring-2 focus:ring-teal"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[12.5px]">
                <span className="font-semibold">Engineer&apos;s note</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="Record your justification or the correction requested from the supplier."
                  className="mt-1.5 w-full resize-none rounded-[8px] bg-white px-3 py-2 ring-1 ring-line outline-none placeholder:text-navy/35 focus:ring-2 focus:ring-teal"
                />
              </label>
            </div>
          )}
        </div>

        {finding.kind !== "met" && (
          <div className="flex justify-end gap-2 border-t border-hairline px-5 py-3.5">
            <button
              type="button"
              disabled={!note.trim()}
              onClick={() => {
                toast("Note saved");
                setNote("");
              }}
              className={appButton("outline", "px-4 py-2")}
            >
              Save note
            </button>
            <button
              type="button"
              disabled={finding.status === "Resolved"}
              onClick={() => {
                set({ status: "Resolved" });
                toast("Finding marked resolved");
              }}
              className={appButton("primary", "px-4 py-2")}
            >
              {finding.status === "Resolved" ? "Resolved" : "Mark resolved"}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
