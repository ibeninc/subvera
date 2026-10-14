"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { CircleCheck } from "lucide-react";
import { SAMPLE_DOCUMENT, sampleReviews, type Finding, type Review } from "@/lib/data";

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
const initialDraft: Draft = {
  category: "Design",
  docType: "Design report",
  scope: {
    type: ["Static"],
    construction: ["Armoured", "Extruded outer sheath"],
    components: ["Steel tubes", "Electrical cables (LV)"],
  },
  phases: ["Umbilical design", "Component design"],
  standards: ["API 17E", "API 17L1"],
  fileName: SAMPLE_DOCUMENT,
};

type Ctx = {
  draft: Draft;
  updateDraft: (patch: Partial<Draft>) => void;
  reviews: Review[];
  getReview: (id: string) => Review | undefined;
  /** Starts a review from the current draft and returns its id. */
  startReview: () => string;
  completeReview: (id: string) => void;
  cancelReview: (id: string) => void;
  updateFinding: (reviewId: string, findingId: string, patch: Partial<Finding>) => void;
  toast: (message: string) => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState(initialDraft);
  const [reviews, setReviews] = useState<Review[]>(sampleReviews);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(105);

  const toast = useCallback((message: string) => {
    setToastMsg(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      draft,
      updateDraft: (patch) => setDraft((d) => ({ ...d, ...patch })),
      reviews,
      getReview: (id) => reviews.find((r) => r.id === id),
      startReview: () => {
        const id = `r-${nextId.current++}`;
        // The prototype has one illustrative result set; new reviews reuse it.
        const template = sampleReviews[0];
        setReviews((rs) => [
          {
            ...template,
            id,
            document: draft.fileName ?? "Untitled.pdf",
            docType: draft.docType,
            standards: draft.standards,
            status: "Running",
            createdAt: "Today",
            createdBy: "AB",
            findings: template.findings.map((f) => ({ ...f })),
          },
          ...rs,
        ]);
        return id;
      },
      completeReview: (id) => setReviews((rs) => rs.map((r) => (r.id === id ? { ...r, status: "Complete" } : r))),
      cancelReview: (id) => setReviews((rs) => rs.filter((r) => r.id !== id)),
      updateFinding: (reviewId, findingId, patch) =>
        setReviews((rs) =>
          rs.map((r) =>
            r.id === reviewId ? { ...r, findings: r.findings.map((f) => (f.id === findingId ? { ...f, ...patch } : f)) } : r,
          ),
        ),
      toast,
    }),
    [draft, reviews, toast],
  );

  return (
    <AppCtx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
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
