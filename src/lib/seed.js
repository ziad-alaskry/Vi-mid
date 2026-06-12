import directory from "@/data/directory.json";

// All HCPs (availability providers) in one list
export function allHcps() {
  return [...directory.physicians, ...directory.pharmacists, ...directory.purchasers];
}

export function hcpById(id) {
  return allHcps().find((h) => h.id === id) || null;
}
export function repById(id) {
  return directory.reps.find((r) => r.id === id) || null;
}
export function personById(id) {
  return hcpById(id) || repById(id);
}

// Seeded login personas: a handful the tester can pick from
export const PERSONAS = [
  { id: "rep_seed_1", kind: "Rep" },
  { id: "phy_seed_1", kind: "HCP" },
  { id: "pha_seed_1", kind: "HCP" },
  { id: "pur_seed_1", kind: "HCP" },
];

// Resolve persona picker cards from the generated directory
export function pickerPersonas() {
  const d = directory;
  return [
    { ...d.reps[0], kind: "Rep", blurb: `${d.reps[0].role} · ${d.reps[0].company}` },
    { ...d.physicians[0], kind: "HCP", blurb: `Physician · ${d.physicians[0].specialty}` },
    { ...d.pharmacists[0], kind: "HCP", blurb: `Pharmacist · ${d.pharmacists[0].setting}` },
    { ...d.purchasers[0], kind: "HCP", blurb: `Purchaser · ${d.purchasers[0].sector}` },
  ];
}

export { directory };
