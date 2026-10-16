// Content taken from the Subvera app mockups. Findings are illustrative sample data.

export const SAMPLE_DOCUMENT = "Cross-Section Design Report Rev B.pdf";
export const SAMPLE_PROJECT = "Sample Project A";
/** Fixed "today" for the sample data, so relative dates render the same on server and client. */
export const SAMPLE_TODAY = Date.UTC(2026, 9, 14);

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The sample "today" in the "14 Oct 2026" form used across the data. */
export function todayLabel() {
  const d = new Date(SAMPLE_TODAY);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/*
 * A review has three possible results per requirement. There is no severity and no status:
 * the engineer exports the findings to the project's comment sheet and tracks them there.
 */
export const nonCompliant = [
  {
    title: "Tensile utilisation above the acceptance limit",
    detail: "The installation load case reports a utilisation of 0.82. The acceptance limit quoted in the design criteria is 0.75.",
    standard: "API 17E",
    section: "6.3",
    clause: "6.3.2",
    location: "Section 6.3, p. 28",
  },
  {
    title: "Design life is inconsistent",
    detail: "Section 2 states a design life of 20 years. Section 7 uses 25 years in the fatigue assessment.",
    standard: "API 17E",
    section: "5.1",
    clause: "5.1.4",
    location: "Sections 2 and 7",
  },
  {
    title: "Minimum bend radius differs between sections",
    detail: "The storage and installation bend radii differ. No justification is given for the lower value.",
    standard: "API 17L1",
    section: "5.2",
    clause: "5.2.1",
    location: "Section 5.1, p. 19",
  },
];

export const missingInfo = [
  {
    title: "Hydrostatic test hold duration",
    detail: "A test pressure is given for the steel tubes, but no hold time is stated.",
    standard: "API 17E",
    section: "9.2",
    clause: "9.2.3",
    expected: "Testing requirements, Section 9",
  },
  {
    title: "Fatigue safety factor",
    detail: "The fatigue results are reported without the design fatigue factor used.",
    standard: "API 17E",
    section: "7.4",
    clause: "7.4.1",
    expected: "Fatigue assessment, Section 7",
  },
  {
    title: "Hang-off load case definition",
    detail: "The termination scope is selected, but no hang-off load case is defined.",
    standard: "API 17L1",
    section: "6.1",
    clause: "6.1.5",
    expected: "Load cases, Section 6",
  },
  {
    title: "Armour wire material traceability",
    detail: "No reference to material certification or traceability for the armour wires.",
    standard: "API 17E",
    section: "4.3",
    clause: "4.3.6",
    expected: "Materials, Section 4",
  },
];

export const compliantChecks = [
  { title: "Design pressure defined for each steel tube", standard: "API 17E", section: "5.2", clause: "5.2.1", location: "Section 3.2" },
  { title: "Operating temperature range stated", standard: "API 17E", section: "5.1", clause: "5.1.2", location: "Section 2.4" },
  { title: "Materials specified with grade", standard: "API 17E", section: "4.1", clause: "4.1.1", location: "Section 4.1" },
  { title: "Fluid compatibility statement included", standard: "API 17E", section: "4.5", clause: "4.5.2", location: "Section 4.5" },
  { title: "Document revision control present", standard: "API 17L1", section: "3.4", clause: "3.4.1", location: "Cover page" },
];

export const COMPLIANT_TOTAL = 38;

/* ---------- Standards library ---------- */

export const operators = ["TotalEnergies", "BP"] as const;
export type Operator = (typeof operators)[number];

export type Standard = {
  id: string;
  desc: string;
  /** "Industry" standards apply to every project; operator specifications only to that operator's projects. */
  owner: "Industry" | Operator;
  /** A placeholder entry until the operator's specification has been supplied and loaded. */
  sample?: boolean;
};

export const standardsLibrary: Standard[] = [
  { id: "API 17E", desc: "Subsea umbilicals", owner: "Industry" },
  { id: "API 17L1", desc: "Ancillary equipment", owner: "Industry" },
  { id: "TotalEnergies umbilical spec", desc: "Company specification for umbilical systems", owner: "TotalEnergies", sample: true },
  { id: "TotalEnergies ancillaries spec", desc: "Company specification for ancillary equipment", owner: "TotalEnergies", sample: true },
  { id: "BP umbilical spec", desc: "Company specification for umbilical systems", owner: "BP", sample: true },
  { id: "BP ancillaries spec", desc: "Company specification for ancillary equipment", owner: "BP", sample: true },
];

/** The standards a project can check against: every industry standard plus its operator's own specifications. */
export function standardsFor(operator: Operator | null) {
  return standardsLibrary.filter((s) => s.owner === "Industry" || s.owner === operator);
}

/* ---------- Review wizard ---------- */

export const documentCategories: Record<string, string[]> = {
  Design: ["Design report", "Cross-section design report", "Fatigue analysis report", "Installation analysis report"],
  Procurement: ["Material specification", "Purchase specification", "Supplier data book"],
  Fabrication: ["Fabrication procedure", "Welding procedure specification", "Inspection and test plan"],
  "Qualification and testing": ["Qualification test procedure", "FAT procedure", "Test report"],
  "Storage and installation": ["Storage procedure", "Load-out procedure", "Installation procedure"],
};

export const umbilicalScope = [
  { key: "type", title: "Umbilical type", options: ["Dynamic", "Static"] },
  {
    key: "construction",
    title: "Umbilical construction",
    options: ["Armoured", "Extruded inner sheath", "Extruded outer sheath", "Inner rovings", "Outer rovings"],
  },
  {
    key: "components",
    title: "Umbilical components",
    options: ["Steel tubes", "Thermoplastic hoses", "Electrical cables (LV)", "Electrical cables (MV)", "Fibre optic cables"],
  },
] as const;

export const projectPhases = [
  { title: "Design phase", options: ["Umbilical design", "Component design", "Ancillaries design"] },
  { title: "Procurement phase", options: ["Component procurement", "Ancillaries procurement"] },
  {
    title: "Fabrication phase",
    options: [
      "Component fabrication",
      "Component fabrication - Corrosion protection (Steel tubes)",
      "Component fabrication - Welding (Steel tubes)",
      "Umbilical fabrication",
      "Ancillaries fabrication",
    ],
  },
  {
    title: "Qualification/Verification phase",
    options: ["Component qualification/verification", "Umbilical qualification/verification", "Ancillaries qualification"],
  },
  { title: "FAT and termination phase", options: ["Component FAT", "Umbilical FAT", "Umbilical termination", "Ancillaries FAT"] },
  { title: "Storage phase", options: ["Umbilical storage", "Umbilical storage (reel)", "Umbilical wet storage"] },
  {
    title: "Load-out and installation phase",
    options: ["Umbilical load-out", "Umbilical load-out (carousel)", "Umbilical load-out (reel)", "Installation"],
  },
];

export const wizardSteps = ["Document", "Umbilical scope", "Project scope", "Standards and upload", "Review"];

/** What the progress screen shows while a review runs: one step per standard. */
export function progressSteps(standards: string[]) {
  return [
    "Reading and structuring the document",
    "Selecting requirements for your project scope",
    ...standards.map((s) => `Checking against ${s}`),
    "Compiling findings",
  ];
}

/* ---------- People and projects (illustrative sample data) ---------- */

export type MemberId = string;

export type Person = { id: MemberId; name: string; email: string; role: string };

/** Everyone who has worked on a project, including people who have since left it. */
export const people: Person[] = [
  { id: "AB", name: "Alex Bennett", email: "alex.bennett@company.com", role: "Lead engineer" },
  { id: "JK", name: "Jordan Kerr", email: "jordan.kerr@company.com", role: "Engineer" },
  { id: "RM", name: "Riley Moss", email: "riley.moss@company.com", role: "Engineer" },
  { id: "SO", name: "Sam Ortiz", email: "sam.ortiz@company.com", role: "Engineer" },
  { id: "TN", name: "Taylor Nash", email: "taylor.nash@company.com", role: "Engineer" },
];

export const findPerson = (id?: MemberId) => people.find((p) => p.id === id);

/** The signed-in engineer. */
export const ME: MemberId = "AB";

export const SEATS = 5;

export type Project = {
  id: string;
  name: string;
  operator: Operator | null;
  /** Pre-selected when someone starts a review on this project. */
  standards: string[];
  members: MemberId[];
  /** People who have left the project. Their names stay on the reviews they did. */
  former: MemberId[];
};

export const sampleProjects: Project[] = [
  {
    id: "p-a",
    name: SAMPLE_PROJECT,
    operator: "TotalEnergies",
    standards: ["API 17E", "API 17L1", "TotalEnergies umbilical spec"],
    members: ["AB", "JK", "RM"],
    former: ["SO"],
  },
  {
    id: "p-b",
    name: "Sample Project B",
    operator: "BP",
    standards: ["API 17E", "BP umbilical spec"],
    members: ["AB", "TN"],
    former: [],
  },
];

/* ---------- Reviews ---------- */

export type FindingKind = "non-compliant" | "missing" | "compliant";

export type Finding = {
  id: string;
  kind: FindingKind;
  title: string;
  detail?: string;
  standard: string;
  section: string;
  clause: string;
  location: string;
  /** The engineer's comment, carried into the comment sheet export. */
  comment?: string;
};

export type ActivityKind = "Comment sheet exported" | "PDF report downloaded" | "Archived" | "Reopened" | "Reviewer changed";

export type Activity = { kind: ActivityKind; when: string; by: MemberId };

export type Review = {
  id: string;
  projectId: string;
  document: string;
  docType: string;
  standards: string[];
  /** Running while Subvera checks it, Complete once results are in, Archived once the engineer has finished with it. */
  status: "Running" | "Complete" | "Archived";
  createdAt: string;
  /** The one engineer responsible for the review. */
  reviewedBy: MemberId;
  archivedAt?: string;
  /** Total compliant checks (only a sample is listed in `findings`). */
  compliantTotal: number;
  findings: Finding[];
  /** Exports, archiving and reopening, newest first. */
  activity: Activity[];
};

const sampleFindings: Finding[] = [
  ...nonCompliant.map((f, i) => ({ id: `nc-${i + 1}`, kind: "non-compliant" as const, ...f })),
  ...missingInfo.map(({ expected, ...f }, i) => ({ id: `mi-${i + 1}`, kind: "missing" as const, ...f, location: expected })),
  ...compliantChecks.map((f, i) => ({ id: `ok-${i + 1}`, kind: "compliant" as const, ...f })),
];

export const sampleReviews: Review[] = [
  {
    id: "r-104",
    projectId: "p-a",
    document: SAMPLE_DOCUMENT,
    docType: "Cross-section design report",
    standards: ["API 17E", "API 17L1"],
    status: "Complete",
    createdAt: "14 Oct 2026",
    reviewedBy: "AB",
    compliantTotal: COMPLIANT_TOTAL,
    findings: sampleFindings.map((f) =>
      f.id === "nc-1" ? { ...f, comment: "Supplier to re-run the installation analysis or justify the higher utilisation." } : f,
    ),
    activity: [],
  },
  {
    id: "r-103",
    projectId: "p-a",
    document: "Fatigue Analysis Report Rev A.pdf",
    docType: "Fatigue analysis report",
    standards: ["API 17E"],
    status: "Complete",
    createdAt: "9 Oct 2026",
    reviewedBy: "JK",
    compliantTotal: 41,
    findings: [
      {
        id: "nc-1",
        kind: "non-compliant",
        title: "Stress concentration factor not justified",
        detail: "An SCF of 1.0 is used at the bend stiffener interface with no supporting reference.",
        standard: "API 17E",
        section: "7.3",
        clause: "7.3.2",
        location: "Section 4.2, p. 14",
        comment: "Provide the reference for the SCF used, or apply a value from the design basis.",
      },
      {
        id: "mi-1",
        kind: "missing",
        title: "Fatigue safety factor",
        detail: "The fatigue results are reported without the design fatigue factor used.",
        standard: "API 17E",
        section: "7.4",
        clause: "7.4.1",
        location: "Fatigue assessment, Section 5",
      },
    ],
    activity: [{ kind: "Comment sheet exported", when: "10 Oct 2026", by: "JK" }],
  },
  {
    id: "r-102",
    projectId: "p-a",
    document: "Umbilical FAT Procedure Rev C.pdf",
    docType: "FAT procedure",
    standards: ["API 17E", "API 17L1", "TotalEnergies umbilical spec"],
    status: "Archived",
    createdAt: "29 Sep 2026",
    reviewedBy: "RM",
    archivedAt: "2 Oct 2026",
    compliantTotal: 52,
    findings: [
      {
        id: "mi-1",
        kind: "missing",
        title: "Hydrostatic test hold duration",
        detail: "A test pressure is given for the steel tubes, but no hold time is stated.",
        standard: "API 17E",
        section: "9.2",
        clause: "9.2.3",
        location: "Testing requirements, Section 6",
        comment: "State the hold time for the steel tube hydrostatic test.",
      },
    ],
    activity: [
      { kind: "Archived", when: "2 Oct 2026", by: "RM" },
      { kind: "PDF report downloaded", when: "2 Oct 2026", by: "RM" },
      { kind: "Comment sheet exported", when: "1 Oct 2026", by: "RM" },
    ],
  },
  {
    id: "r-101",
    projectId: "p-a",
    document: "Installation Analysis Report Rev A.pdf",
    docType: "Installation analysis report",
    standards: ["API 17E", "API 17L1"],
    status: "Archived",
    createdAt: "18 Sep 2026",
    reviewedBy: "SO",
    archivedAt: "21 Sep 2026",
    compliantTotal: 33,
    findings: [
      {
        id: "nc-1",
        kind: "non-compliant",
        title: "Vessel motion data not referenced",
        detail: "The installation analysis uses vessel RAOs without stating their source or revision.",
        standard: "API 17E",
        section: "8.2",
        clause: "8.2.1",
        location: "Section 3.1, p. 9",
        comment: "Reference the vessel RAO source and revision.",
      },
      {
        id: "mi-1",
        kind: "missing",
        title: "Weather window criteria",
        detail: "Limiting sea states for installation are not stated.",
        standard: "API 17E",
        section: "8.3",
        clause: "8.3.4",
        location: "Installation criteria, Section 4",
      },
    ],
    activity: [
      { kind: "Archived", when: "21 Sep 2026", by: "SO" },
      { kind: "Comment sheet exported", when: "21 Sep 2026", by: "SO" },
    ],
  },
  {
    id: "r-201",
    projectId: "p-b",
    document: "Umbilical Design Basis Rev A.pdf",
    docType: "Design report",
    standards: ["API 17E", "BP umbilical spec"],
    status: "Complete",
    createdAt: "12 Oct 2026",
    reviewedBy: "TN",
    compliantTotal: 27,
    findings: [
      {
        id: "mi-1",
        kind: "missing",
        title: "Design life not stated",
        detail: "The design basis does not state the service life the umbilical is designed for.",
        standard: "API 17E",
        section: "5.1",
        clause: "5.1.4",
        location: "Design data, Section 2",
      },
    ],
    activity: [],
  },
];

export function counts(r: Pick<Review, "findings" | "compliantTotal">) {
  return {
    nonCompliant: r.findings.filter((f) => f.kind === "non-compliant").length,
    missing: r.findings.filter((f) => f.kind === "missing").length,
    compliant: r.compliantTotal,
  };
}

/** "Rev B" from "Cross-Section Design Report Rev B.pdf". */
export const revisionOf = (file: string) => /\bRev\s+(\w+)(?:\.pdf)?$/i.exec(file)?.[1];

/** True when two file names are the same revision of the same document. */
export const sameRevision = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Whether the comment sheet has been exported since the review was last reopened. */
export function isExported(r: Pick<Review, "activity">) {
  for (const a of r.activity) {
    if (a.kind === "Comment sheet exported") return true;
    if (a.kind === "Reopened") return false;
  }
  return false;
}
