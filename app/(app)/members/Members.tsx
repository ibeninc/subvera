"use client";

import { UserPlus } from "lucide-react";
import { useApp } from "@/components/app/AppContext";
import { Avatar, PageHeader, appButton } from "@/components/app/ui";
import { members } from "@/lib/data";

export function Members() {
  const { toast } = useApp();
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
      <div className="p-6 max-md:p-4">
        <p className="text-[12.5px] text-navy/55">The Project licence covers up to five engineers. {members.length} of 5 seats are in use.</p>
        <ul className="mt-4 divide-y divide-hairline overflow-hidden rounded-[10px] ring-1 ring-hairline">
          {members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar id={m.id} size={32} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium">{m.name}</p>
                <p className="truncate text-[12px] text-navy/50">{m.email}</p>
              </div>
              <span className="text-[12.5px] text-navy/60">{m.role}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
