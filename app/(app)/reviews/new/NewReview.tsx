"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CloudUpload, Play, X } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { toggle, useApp } from "@/components/app/AppContext";
import { Group, OptionTile, Section, Select, WizardStepper } from "@/components/app/form";
import { FileTile, PageIntro, gutter } from "@/components/app/kit";
import { appButton, docName, shortDate, surface } from "@/components/app/ui";
import { documentCategories, findPerson, projectPhases, standardsFor, umbilicalScope, wizardSteps } from "@/lib/data";

const headings = [
  {
    title: "What kind of document is it?",
    sub: "This decides which requirements apply, so the review only checks what’s relevant.",
    next: "Next: umbilical scope",
  },
  {
    title: "Which umbilical does it cover?",
    sub: "Pick everything the document describes. You can choose more than one in each group.",
    next: "Next: project scope",
  },
  { title: "Which project phases does it cover?", sub: "Pick the phases and activities the document deals with.", next: "Next: standards and upload" },
  { title: "Pick the standards and add the file", sub: "Choose what to check against, then upload the PDF.", next: "Start review" },
];

export function NewReview() {
  const router = useRouter();
  const { draft, startReview, findReviewOf } = useApp();
  const [step, setStep] = useState(0);
  const top = useRef<HTMLDivElement>(null);
  // One review per revision: the findings would be the same, so a second one adds nothing.
  const existing = draft.fileName ? findReviewOf(draft.fileName) : undefined;

  const canContinue = [
    Boolean(draft.category && draft.docType),
    Object.values(draft.scope).every((v) => v.length > 0),
    draft.phases.length > 0,
    draft.standards.length > 0 && Boolean(draft.fileName) && !existing,
  ][step];

  const missing = [
    "Pick a category and a type to continue.",
    "Pick at least one option in each group.",
    "Pick at least one phase to continue.",
    !draft.fileName ? "Add the PDF to continue." : existing ? "This revision has already been reviewed." : "Pick at least one standard.",
  ][step];

  function go(to: number) {
    setStep(to);
    top.current?.scrollIntoView({ block: "start" });
  }

  function next() {
    if (step < 3) return go(step + 1);
    const id = startReview();
    router.push(`/reviews/${id}`);
  }

  const h = headings[step];

  return (
    <div ref={top}>
      <PageIntro
        eyebrow={
          <>
            <Link href="/reviews" className="underline-offset-4 hover:text-navy hover:underline">
              Reviews
            </Link>
            <span aria-hidden> / </span>New review
          </>
        }
        title="Start a new review"
        summary="Tell us about the document so Subvera only checks the requirements that apply."
      />

      <div className={`max-w-[920px] pt-9 max-md:pt-7 ${gutter}`}>
        <WizardStepper steps={wizardSteps} current={step} />

        <h2 className="mt-9 text-[20px] font-semibold tracking-[-0.015em]">{h.title}</h2>
        <p className="mt-1.5 text-[14.5px] leading-relaxed text-fg-muted">{h.sub}</p>

        <div className="mt-6 flex flex-col gap-5">
          {step === 0 && <DocumentStep />}
          {step === 1 && <UmbilicalStep />}
          {step === 2 && <ProjectStep />}
          {step === 3 && <UploadStep />}
        </div>

        {step === 3 && (
          <p className="mt-5 rounded-[10px] border-l-2 border-teal bg-teal-tint/40 px-4 py-3 text-[13.5px] leading-relaxed text-fg-muted">
            Subvera helps you catch missed non-compliances and missing information. It doesn&rsquo;t confirm compliance. Your engineers review every
            finding and keep final approval.
          </p>
        )}
      </div>

      {/* Action bar stays in reach at the bottom of the screen while you work through a long step */}
      <div className="sticky bottom-0 z-20 mt-10 border-t border-hairline bg-white/90 backdrop-blur-md">
        <div className={`flex max-w-[920px] items-center justify-between gap-4 py-3.5 ${gutter}`}>
          {step === 0 ? (
            <Link href="/reviews" className={appButton("ghost", "h-9 px-3.5")}>
              Cancel
            </Link>
          ) : (
            <button type="button" onClick={() => go(step - 1)} className={appButton("outline", "h-9 px-3.5")}>
              <ArrowLeft size={15} /> Back
            </button>
          )}
          <div className="flex min-w-0 items-center gap-4">
            {!canContinue && <span className="truncate text-[13px] text-fg-subtle max-sm:hidden">{missing}</span>}
            <button type="button" onClick={next} disabled={!canContinue} className={appButton("primary", "h-9 px-3.5")}>
              {step === 3 && <Play size={14} />}
              {h.next}
              {step < 3 && <ArrowRight size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentStep() {
  const { draft, updateDraft } = useApp();
  return (
    <Section title="Document" subtitle="How would you classify it?">
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Document category"
          hint="The broad area the document belongs to"
          value={draft.category}
          options={Object.keys(documentCategories)}
          onChange={(category) => updateDraft({ category, docType: documentCategories[category][0] })}
        />
        <Select
          label="Document type"
          hint="The options change with the category"
          value={draft.docType}
          options={documentCategories[draft.category]}
          onChange={(docType) => updateDraft({ docType })}
        />
      </div>
    </Section>
  );
}

function UmbilicalStep() {
  const { draft, updateDraft } = useApp();
  return (
    <Section title="Umbilical scope">
      {umbilicalScope.map((g) => (
        <Group key={g.key} title={g.title}>
          {g.options.map((o) => (
            <OptionTile
              key={o}
              label={o}
              checked={draft.scope[g.key].includes(o)}
              onChange={() => updateDraft({ scope: { ...draft.scope, [g.key]: toggle(draft.scope[g.key], o) } })}
            />
          ))}
        </Group>
      ))}
    </Section>
  );
}

function ProjectStep() {
  const { draft, updateDraft } = useApp();
  return (
    <Section title="Project phase" subtitle="Pick everything that applies in each phase.">
      {projectPhases.map((p) => (
        <Group key={p.title} title={p.title} hint="">
          {p.options.map((o) => (
            <OptionTile key={o} label={o} checked={draft.phases.includes(o)} onChange={() => updateDraft({ phases: toggle(draft.phases, o) })} />
          ))}
        </Group>
      ))}
    </Section>
  );
}

function UploadStep() {
  const { draft, updateDraft, project, findReviewOf } = useApp();
  const available = standardsFor(project.operator);
  const existing = draft.fileName ? findReviewOf(draft.fileName) : undefined;
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function accept(file?: File) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("That file isn't a PDF. Save it as a PDF and try again.");
      return;
    }
    setError(null);
    updateDraft({ fileName: file.name });
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    accept(e.dataTransfer.files[0]);
  }

  return (
    <>
      <Section title="Standards" subtitle={`The review checks the document against each one you pick. ${project.name}'s defaults are already ticked.`}>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {available.map((s) => (
            <OptionTile
              key={s.id}
              label={s.id}
              description={s.desc}
              badge={s.sample ? "Sample" : undefined}
              checked={draft.standards.includes(s.id)}
              onChange={() => updateDraft({ standards: toggle(draft.standards, s.id) })}
            />
          ))}
        </div>
        <p className="mt-3 text-[13px] text-fg-subtle">
          {project.operator ? `Showing industry standards and ${project.operator} specifications. ` : "Showing industry standards. "}
          <Link href="/settings" className="font-medium text-navy underline-offset-4 hover:underline">
            Change the project defaults
          </Link>
        </p>
      </Section>

      <Section title="File" subtitle="PDF only. Text-based PDFs give the best results.">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center rounded-[12px] border-[1.5px] border-dashed px-6 py-10 text-center transition-colors ${
            dragging ? "border-teal bg-teal-tint/60" : "border-navy/20 bg-mist/50 hover:border-navy/30"
          }`}
        >
          <span className={`flex size-11 items-center justify-center rounded-full bg-white ring-1 ring-edge shadow-[0_1px_2px_rgba(14,42,71,.06)] ${dragging ? "text-teal-dark" : "text-fg-muted"}`}>
            <CloudUpload size={20} strokeWidth={1.75} aria-hidden />
          </span>
          <p className="mt-4 text-[15px] font-medium">Drop the PDF here</p>
          <p className="mt-1 text-[13px] text-fg-subtle">or pick it from your computer</p>
          <button type="button" onClick={() => input.current?.click()} className={appButton("outline", "mt-4 h-9 px-4")}>
            Browse files
          </button>
          <input ref={input} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => accept(e.target.files?.[0])} />
          {error && (
            <p role="alert" className="mt-3 text-[13px] font-medium text-high-fg">
              {error}
            </p>
          )}
        </div>

        {draft.fileName && (
          <div className={`mt-3 flex items-center gap-3.5 p-3.5 ${surface}`}>
            <FileTile tone="navy" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium">{draft.fileName}</p>
              <p className="mt-0.5 text-[13px] text-fg-subtle">{existing ? "Already reviewed" : "Ready to review"}</p>
            </div>
            <button
              type="button"
              aria-label="Remove file"
              onClick={() => updateDraft({ fileName: null })}
              className="flex size-9 items-center justify-center rounded-[8px] text-fg-subtle transition-colors hover:bg-mist hover:text-navy"
            >
              <X size={16} aria-hidden />
            </button>
          </div>
        )}

        {existing && (
          <div role="status" className="mt-3 rounded-[10px] border-l-2 border-missing bg-missing-bg px-4 py-3 text-[13.5px] leading-relaxed text-fg-muted">
            <p>
              <span className="font-medium text-navy">This revision has already been reviewed</span> by{" "}
              {findPerson(existing.reviewedBy)?.name ?? existing.reviewedBy} on {shortDate(existing.createdAt) === "Today" ? "today" : shortDate(existing.createdAt)}. The requirements are fixed for the document
              type, so a second review would give the same findings.
            </p>
            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <Link
                href={existing.status === "Archived" ? `/archive/${existing.id}` : `/reviews/${existing.id}`}
                className="font-medium text-navy underline underline-offset-4"
              >
                Open {docName(existing.document)}
              </Link>
              <span>Reviewing a newer revision? Upload that file instead.</span>
            </p>
          </div>
        )}
      </Section>
    </>
  );
}

