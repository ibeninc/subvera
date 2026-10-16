"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { CircleCheck } from "lucide-react";
import {
  ME,
  sameRevision,
  sampleProjects,
  sampleReviews,
  todayLabel,
  type ActivityKind,
  type Finding,
  type MemberId,
  type Project,
  type Review,
} from "@/lib/data";

/* Prototype state, held in memory for the session. Swap for API calls when the backend exists. */

export type Draft = {
  category: string;
  docType: string;
  scope: Record<string, string[]>; // umbilical type / construction / components
  phases: string[];
  standards: string[];
  fileName: string | null;
};

// Pre-filled to match the mockups so the flow can be clicked straight through.
// Rev C is a new revision, so it hasn't been reviewed yet.
const initialDraft: Draft = {
  category: "Design",
  docType: "Cross-section design report",
  scope: {
    type: ["Static"],
    construction: ["Armoured", "Extruded outer sheath"],
    components: ["Steel tubes", "Electrical cables (LV)"],
  },
  phases: ["Umbilical design", "Component design"],
  standards: sampleProjects[0].standards,
  fileName: "Cross-Section Design Report Rev C.pdf",
};

type Ctx = {
  /** The project the sidebar has selected. Everything below is scoped to it. */
  project: Project;
  projects: Project[];
  switchProject: (id: string) => void;
  updateProject: (patch: Partial<Omit<Project, "id">>) => void;
  removeMember: (id: MemberId) => void;

  draft: Draft;
  updateDraft: (patch: Partial<Draft>) => void;

  /** Reviews in the current project, newest first. */
  reviews: Review[];
  getReview: (id: string) => Review | undefined;
  /** A review of this exact revision in the current project, if there is one. */
  findReviewOf: (fileName: string) => Review | undefined;
  /** Starts a review from the current draft and returns its id. */
  startReview: () => string;
  completeReview: (id: string) => void;
  cancelReview: (id: string) => void;
  updateFinding: (reviewId: string, findingId: string, patch: Partial<Finding>) => void;
  setReviewer: (reviewId: string, reviewer: MemberId) => void;
  logActivity: (reviewId: string, kind: ActivityKind) => void;
  archiveReview: (id: string) => void;
  reopenReview: (id: string) => void;

  toast: (message: string) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState(sampleProjects);
  const [projectId, setProjectId] = useState(sampleProjects[0].id);
  const [draft, setDraft] = useState(initialDraft);
  const [allReviews, setAllReviews] = useState<Review[]>(sampleReviews);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(105);

  const toast = useCallback((message: string) => {
    setToastMsg(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600);
  }, []);

  const value = useMemo<Ctx>(() => {
    const project = projects.find((p) => p.id === projectId) ?? projects[0];
    const reviews = allReviews.filter((r) => r.projectId === project.id);

    const patchReview = (id: string, fn: (r: Review) => Review) => setAllReviews((rs) => rs.map((r) => (r.id === id ? fn(r) : r)));
    const log = (r: Review, kind: ActivityKind): Review => ({ ...r, activity: [{ kind, when: todayLabel(), by: ME }, ...r.activity] });

    return {
      project,
      projects,
      switchProject: (id) => {
        const next = projects.find((p) => p.id === id);
        if (!next) return;
        setProjectId(id);
        setDraft((d) => ({ ...d, standards: next.standards }));
      },
      updateProject: (patch) => {
        setProjects((ps) => ps.map((p) => (p.id === project.id ? { ...p, ...patch } : p)));
        // New defaults apply to the next review someone starts.
        if (patch.standards) setDraft((d) => ({ ...d, standards: patch.standards! }));
      },
      removeMember: (id) =>
        setProjects((ps) =>
          ps.map((p) => (p.id === project.id ? { ...p, members: p.members.filter((m) => m !== id), former: [...p.former.filter((m) => m !== id), id] } : p)),
        ),

      draft,
      updateDraft: (patch) => setDraft((d) => ({ ...d, ...patch })),

      reviews,
      getReview: (id) => reviews.find((r) => r.id === id),
      findReviewOf: (fileName) => reviews.find((r) => sameRevision(r.document, fileName)),
      startReview: () => {
        const id = `r-${nextId.current++}`;
        // The prototype has one illustrative result set; new reviews reuse it.
        const template = sampleReviews[0];
        setAllReviews((rs) => [
          {
            ...template,
            id,
            projectId: project.id,
            document: draft.fileName ?? "Untitled.pdf",
            docType: draft.docType,
            standards: draft.standards,
            status: "Running",
            createdAt: todayLabel(),
            reviewedBy: ME,
            findings: template.findings.map((f) => ({ ...f, comment: undefined })),
            activity: [],
          },
          ...rs,
        ]);
        return id;
      },
      completeReview: (id) => patchReview(id, (r) => ({ ...r, status: "Complete" })),
      cancelReview: (id) => setAllReviews((rs) => rs.filter((r) => r.id !== id)),
      updateFinding: (reviewId, findingId, patch) =>
        patchReview(reviewId, (r) => ({ ...r, findings: r.findings.map((f) => (f.id === findingId ? { ...f, ...patch } : f)) })),
      setReviewer: (reviewId, reviewer) => patchReview(reviewId, (r) => log({ ...r, reviewedBy: reviewer }, "Reviewer changed")),
      logActivity: (reviewId, kind) => patchReview(reviewId, (r) => log(r, kind)),
      archiveReview: (id) => patchReview(id, (r) => log({ ...r, status: "Archived", archivedAt: todayLabel() }, "Archived")),
      reopenReview: (id) => patchReview(id, (r) => log({ ...r, status: "Complete", archivedAt: undefined }, "Reopened")),

      toast,
    };
  }, [projects, projectId, draft, allReviews, toast]);

  return (
    <AppCtx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 print:hidden">
        {toastMsg && (
          <div className="flex items-center gap-2 rounded-pill bg-navy px-4 py-2.5 text-[13px] font-medium text-white shadow-[0_12px_32px_-12px_rgba(14,42,71,.6)]">
            <CircleCheck size={15} className="text-teal" aria-hidden />
            {toastMsg}
          </div>
        )}
      </div>
    </AppCtx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

export function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
