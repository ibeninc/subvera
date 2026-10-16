"use client";

import Link from "next/link";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/components/app/AppContext";
import { Dialog } from "@/components/app/kit";
import { Avatar, PageHeader, appButton } from "@/components/app/ui";
import { ME, SEATS, findPerson, type MemberId } from "@/lib/data";

export function Members() {
  const { project, reviews, removeMember, toast } = useApp();
  const [removing, setRemoving] = useState<MemberId | null>(null);

  const active = (id: MemberId) => reviews.filter((r) => r.reviewedBy === id && r.status !== "Archived").length;
  const done = (id: MemberId) => reviews.filter((r) => r.reviewedBy === id).length;
  const person = removing ? findPerson(removing) : undefined;

  return (
    <>
      <PageHeader
        crumb="Team"
        title="Members"
        actions={
          <button type="button" onClick={() => toast("Ask your company administrator to add members")} className={appButton("primary")}>
            <UserPlus size={14} /> Invite
          </button>
        }
      />
      <div className="flex flex-col gap-8 p-6 max-md:p-4">
        <section>
          <p className="text-[13px] text-fg-muted">
            The Project licence covers up to {SEATS} engineers. {project.members.length} of {SEATS} seats are in use on {project.name}.
          </p>
          <ul className="mt-4 divide-y divide-hairline overflow-hidden rounded-[10px] ring-1 ring-hairline">
            {project.members.map((id) => {
              const m = findPerson(id);
              if (!m) return null;
              const n = active(id);
              return (
                <li key={id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
                  <Avatar id={id} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium">
                      {m.name}
                      {id === ME && <span className="ml-1.5 font-normal text-fg-subtle">(you)</span>}
                    </p>
                    <p className="truncate text-[12.5px] text-fg-subtle">{m.email}</p>
                  </div>
                  <span className="text-[13px] text-fg-muted">
                    {m.role}
                    {n > 0 && <span className="text-fg-subtle">, {n} in progress</span>}
                  </span>
                  {id !== ME && (
                    <button type="button" onClick={() => setRemoving(id)} className={appButton("ghost", "-mr-1.5")}>
                      Remove
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {project.former.length > 0 && (
          <section>
            <h2 className="text-[15px] font-semibold">Former members</h2>
            <p className="mt-1 text-[13px] text-fg-muted">They no longer use a seat. Their names stay on the reviews they did.</p>
            <ul className="mt-4 divide-y divide-hairline overflow-hidden rounded-[10px] ring-1 ring-hairline">
              {project.former.map((id) => {
                const m = findPerson(id);
                if (!m) return null;
                const n = done(id);
                return (
                  <li key={id} className="flex items-center gap-3 px-4 py-3 text-fg-muted">
                    <span className="opacity-60">
                      <Avatar id={id} size={32} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium">{m.name}</p>
                      <p className="truncate text-[12.5px] text-fg-subtle">{m.role}</p>
                    </div>
                    <span className="text-[13px] text-fg-subtle">
                      {n} {n === 1 ? "review" : "reviews"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      {removing && person && (
        <Dialog
          title={`Remove ${person.name} from ${project.name}?`}
          onClose={() => setRemoving(null)}
          actions={
            <>
              <button type="button" onClick={() => setRemoving(null)} className={appButton("ghost", "h-9 px-3.5")}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  removeMember(removing);
                  setRemoving(null);
                  toast(`${person.name} removed from the project`);
                }}
                className={appButton("primary", "h-9 px-3.5")}
              >
                Remove
              </button>
            </>
          }
        >
          <p>Their seat is freed and their name stays on every review they did, including archived reports.</p>
          {active(removing) > 0 && (
            <p className="mt-3 rounded-[10px] bg-missing-bg px-3.5 py-2.5 text-[13.5px] text-navy">
              {active(removing) === 1 ? "One review" : `${active(removing)} reviews`} in progress will need handing over. Open each one from{" "}
              <Link href="/reviews" className="font-medium underline underline-offset-4">
                Reviews
              </Link>{" "}
              and pick a new reviewer.
            </p>
          )}
        </Dialog>
      )}
    </>
  );
}
