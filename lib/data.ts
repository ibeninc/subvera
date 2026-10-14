// Content taken from the Subvera app mockups. Findings are illustrative sample data.

export const SAMPLE_DOCUMENT = "Cross-Section Design Report Rev B.pdf";
export const SAMPLE_PROJECT = "Sample Project A";
/** Fixed "today" for the sample data, so relative dates render the same on server and client. */
export const SAMPLE_TODAY = Date.UTC(2026, 9, 14);

export type Severity = "High" | "Medium";

export const nonCompliant: {
  severity: Severity;
  title: string;
  detail: string;
  standard: string;
  section: string;
  clause: string;
  location: string;
}[] = [
  {
    severity: "High",
    title: "Tensile utilisation above the acceptance limit",
    detail: "The installation load case reports a utilisation of 0.82. The acceptance limit quoted in the design criteria is 0.75.",
    standard: "API 17E",
    section: "6.3",
    clause: "6.3.2",
    location: "Section 6.3, p. 28",
  },
  {
    severity: "High",
    title: "Design life is inconsistent",
    detail: "Section 2 states a design life of 20 years. Section 7 uses 25 years in the fatigue assessment.",
    standard: "API 17E",
    section: "5.1",
    clause: "5.1.4",
    location: "Sections 2 and 7",
  },
  {
    severity: "Medium",
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

export const standards = [
  { id: "API 17E", desc: "Subsea umbilicals" },
  { id: "API 17L1", desc: "Ancillary equipment" },
];

export const wizardSteps = ["Document", "Umbilical scope", "Project scope", "Standards and upload", "Review"];

export const progressSteps = [
  "Reading and structuring the document",
  "Selecting requirements for your project scope",
  "Checking against API 17E",
  "Checking against API 17L1",
  "Compiling findings",
];

/* ---------- App (illustrative sample data) ---------- */

export type MemberId = "AB" | "JK" | "RM";

export const members: { id: MemberId; name: string; email: string; role: string }[] = [
  { id: "AB", name: "Alex Bennett", email: "alex.bennett@company.com", role: "Lead engineer" },
  { id: "JK", name: "Jordan Kerr", email: "jordan.kerr@company.com", role: "Engineer" },
  { id: "RM", name: "Riley Moss", email: "riley.moss@company.com", role: "Engineer" },
];

export type FindingKind = "non-compliant" | "missing" | "met";
export type FindingStatus = "Open" | "In review" | "Resolved" | "Met";

export type Finding = {
  id: string;
  kind: FindingKind;
  severity?: Severity;
  title: string;
  detail?: string;
  standard: string;
  section: string;
  clause: string;
  location: string;
  status: FindingStatus;
  assignee?: MemberId;
};

const sampleFindings: Finding[] = [
  ...nonCompliant.map((f, i) => ({
    id: `nc-${i + 1}`,
    kind: "non-compliant" as const,
    severity: f.severity,
    title: f.title,
    detail: f.detail,
    standard: f.standard,
    section: f.section,
    clause: f.clause,
    location: f.location,
    status: (i === 0 ? "In review" : "Open") as FindingStatus,
    assignee: (["AB", "JK", "AB"] as const)[i],
  })),
  ...missingInfo.map((f, i) => ({
    id: `mi-${i + 1}`,
    kind: "missing" as const,
    title: f.title,
    detail: f.detail,
    standard: f.standard,
    section: f.section,
    clause: f.clause,
    location: f.expected,
    status: "Open" as FindingStatus,
    assignee: (["RM", "JK", "AB", "RM"] as const)[i],
  })),
  ...compliantChecks.map((f, i) => ({
    id: `met-${i + 1}`,
    kind: "met" as const,
    title: f.title,
    standard: f.standard,
    section: f.section,
    clause: f.clause,
    location: f.location,
    status: "Met" as FindingStatus,
  })),
];

export type Review = {
  id: string;
  document: string;
  docType: string;
  standards: string[];
  status: "Complete" | "Running";
  createdAt: string;
  createdBy: MemberId;
  /** Total compliant checks (only a sample is listed in `findings`). */
  metTotal: number;
  findings: Finding[];
};

export const sampleReviews: Review[] = [
  {
    id: "r-104",
    document: SAMPLE_DOCUMENT,
    docType: "Design report",
    standards: ["API 17E", "API 17L1"],
    status: "Complete",
    createdAt: "14 Oct 2026",
    createdBy: "AB",
    metTotal: COMPLIANT_TOTAL,
    findings: sampleFindings,
  },
  {
    id: "r-103",
    document: "Fatigue Analysis Report Rev A.pdf",
    docType: "Fatigue analysis report",
    standards: ["API 17E"],
    status: "Complete",
    createdAt: "9 Oct 2026",
    createdBy: "JK",
    metTotal: 41,
    findings: [
      {
        id: "nc-1",
        kind: "non-compliant",
        severity: "Medium",
        title: "Stress concentration factor not justified",
        detail: "An SCF of 1.0 is used at the bend stiffener interface with no supporting reference.",
        standard: "API 17E",
        section: "7.3",
        clause: "7.3.2",
        location: "Section 4.2, p. 14",
        status: "Resolved",
        assignee: "JK",
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
        status: "Open",
        assignee: "RM",
      },
    ],
  },
  {
    id: "r-102",
    document: "Umbilical FAT Procedure Rev C.pdf",
    docType: "FAT procedure",
    standards: ["API 17E", "API 17L1"],
    status: "Complete",
    createdAt: "29 Sep 2026",
    createdBy: "RM",
    metTotal: 52,
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
        status: "Resolved",
        assignee: "RM",
      },
    ],
  },
];

export const documents: { name: string; type: string; revision: string; uploadedBy: MemberId; date: string; reviews: number }[] = [
  { name: SAMPLE_DOCUMENT, type: "Design report", revision: "B", uploadedBy: "AB", date: "14 Oct 2026", reviews: 1 },
  { name: "Cross-Section Design Report Rev A.pdf", type: "Design report", revision: "A", uploadedBy: "AB", date: "22 Sep 2026", reviews: 0 },
  { name: "Fatigue Analysis Report Rev A.pdf", type: "Fatigue analysis report", revision: "A", uploadedBy: "JK", date: "9 Oct 2026", reviews: 1 },
  { name: "Umbilical FAT Procedure Rev C.pdf", type: "FAT procedure", revision: "C", uploadedBy: "RM", date: "29 Sep 2026", reviews: 1 },
  { name: "Installation Analysis Report Rev B.pdf", type: "Installation analysis report", revision: "B", uploadedBy: "JK", date: "18 Sep 2026", reviews: 0 },
  { name: "Load-out Procedure Rev A.pdf", type: "Load-out procedure", revision: "A", uploadedBy: "RM", date: "11 Sep 2026", reviews: 0 },
];

export function counts(r: Pick<Review, "findings" | "metTotal">) {
  return {
    nonCompliant: r.findings.filter((f) => f.kind === "non-compliant").length,
    missing: r.findings.filter((f) => f.kind === "missing").length,
    met: r.metTotal,
  };
}

/** Counts for a review's unresolved findings by severity, plus compliant checks. */
export function breakdown(r: Pick<Review, "findings" | "metTotal">) {
  const open = r.findings.filter((f) => f.kind !== "met" && f.status !== "Resolved");
  return {
    high: open.filter((f) => f.kind === "non-compliant" && f.severity === "High").length,
    medium: open.filter((f) => f.kind === "non-compliant" && f.severity !== "High").length,
    missing: open.filter((f) => f.kind === "missing").length,
    resolved: r.findings.filter((f) => f.status === "Resolved").length,
    met: r.metTotal,
  };
}
