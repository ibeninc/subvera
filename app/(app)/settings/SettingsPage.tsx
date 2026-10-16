"use client";

import { useState } from "react";
import { toggle, useApp } from "@/components/app/AppContext";
import { Group, OptionTile, Section, Select } from "@/components/app/form";
import { PageHeader, appButton } from "@/components/app/ui";
import { operators, standardsFor, standardsLibrary, type Operator, type Project } from "@/lib/data";

const NO_OPERATOR = "None";

export function SettingsPage() {
  const { project } = useApp();
  // Keyed by project, so switching projects starts the form from that project's settings.
  return <SettingsForm key={project.id} project={project} />;
}

function SettingsForm({ project }: { project: Project }) {
  const { updateProject, toast } = useApp();
  const [name, setName] = useState(project.name);
  const [operator, setOperator] = useState<Operator | null>(project.operator);
  const [defaults, setDefaults] = useState(project.standards);

  const industry = standardsLibrary.filter((s) => s.owner === "Industry");
  const specs = operator ? standardsLibrary.filter((s) => s.owner === operator) : [];
  const hasSample = specs.some((s) => s.sample);

  function pickOperator(value: string) {
    const next = value === NO_OPERATOR ? null : (value as Operator);
    setOperator(next);
    // Keep the industry standards that were ticked, swap the old operator's specifications for the new one's.
    const allowed = new Set(standardsFor(next).map((s) => s.id));
    const kept = defaults.filter((id) => allowed.has(id));
    const added = standardsLibrary.filter((s) => next && s.owner === next).map((s) => s.id);
    setDefaults([...new Set([...kept, ...added])]);
  }

  return (
    <>
      <PageHeader crumb="Team" title="Project settings" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateProject({ name: name.trim() || project.name, operator, standards: defaults });
          toast("Settings saved");
        }}
        className="mx-auto flex max-w-[720px] flex-col gap-4 p-6 max-md:p-4"
      >
        <Section title="Project">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-[14px] font-medium">Project name</span>
              <span className="mt-0.5 block text-[13px] text-fg-subtle">Shown in the sidebar and on reports</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2.5 h-10 w-full rounded-[9px] bg-white px-3 text-[14px] shadow-[0_1px_2px_rgba(14,42,71,.05)] ring-1 ring-edge outline-none transition-shadow hover:ring-navy/25 focus:ring-2 focus:ring-teal"
              />
            </label>
            <Select
              label="Operator"
              hint="Whose specifications apply on this project"
              value={operator ?? NO_OPERATOR}
              options={[...operators, NO_OPERATOR]}
              onChange={pickOperator}
            />
          </div>
        </Section>

        <Section
          title="Default standards and specifications"
          subtitle="Ticked when someone starts a new review on this project. Engineers can still change them per review."
        >
          <Group title="Industry standards" columns={2}>
            {industry.map((s) => (
              <OptionTile
                key={s.id}
                label={s.id}
                description={s.desc}
                checked={defaults.includes(s.id)}
                onChange={() => setDefaults((d) => toggle(d, s.id))}
              />
            ))}
          </Group>
          {operator && (
            <Group title={`${operator} specifications`} columns={2} hint="Company requirements that apply on top of the industry standards.">
              {specs.map((s) => (
                <OptionTile
                  key={s.id}
                  label={s.id}
                  description={s.desc}
                  badge={s.sample ? "Sample" : undefined}
                  checked={defaults.includes(s.id)}
                  onChange={() => setDefaults((d) => toggle(d, s.id))}
                />
              ))}
            </Group>
          )}
          {hasSample && (
            <p className="mt-5 rounded-[10px] border-l-2 border-teal bg-teal-tint/40 px-4 py-3 text-[13.5px] leading-relaxed text-fg-muted">
              Entries marked Sample stand in for {operator}&rsquo;s own specifications. Subvera checks against them once {operator} or your company
              supplies the documents and they&rsquo;re loaded into your library.
            </p>
          )}
        </Section>

        <div className="flex justify-end">
          <button type="submit" disabled={defaults.length === 0} className={appButton("primary", "px-4 py-2")}>
            Save changes
          </button>
        </div>
      </form>
    </>
  );
}
