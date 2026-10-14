"use client";

import { useState } from "react";
import { toggle, useApp } from "@/components/app/AppContext";
import { OptionTile, Section } from "@/components/app/form";
import { PageHeader, appButton } from "@/components/app/ui";
import { SAMPLE_PROJECT, standards } from "@/lib/data";

export function SettingsPage() {
  const { toast } = useApp();
  const [name, setName] = useState(SAMPLE_PROJECT);
  const [defaults, setDefaults] = useState(["API 17E", "API 17L1"]);

  return (
    <>
      <PageHeader crumb="Team" title="Project settings" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          toast("Settings saved");
        }}
        className="mx-auto flex max-w-[720px] flex-col gap-4 p-6 max-md:p-4"
      >
        <Section title="Project">
          <label className="block text-[12.5px]">
            <span className="font-semibold">Project name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 h-10 w-full rounded-[8px] bg-white px-3 text-[13px] ring-1 ring-line outline-none focus:ring-2 focus:ring-teal"
            />
          </label>
        </Section>

        <Section title="Default standards" subtitle="Pre-selected when someone starts a new review.">
          <div className="grid gap-2 sm:grid-cols-2">
            {standards.map((s) => (
              <OptionTile
                key={s.id}
                label={s.id}
                description={s.desc}
                checked={defaults.includes(s.id)}
                onChange={() => setDefaults((d) => toggle(d, s.id))}
              />
            ))}
          </div>
        </Section>

        <div className="flex justify-end">
          <button type="submit" className={appButton("primary", "px-4 py-2")}>
            Save changes
          </button>
        </div>
      </form>
    </>
  );
}
