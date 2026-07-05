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

// Admin is a system role, not a directory entry — the demo has exactly one.
export const ADMIN_USER = { id: "admin_1", role: "Admin", name: "Admin" };

export function personById(id) {
  if (id === ADMIN_USER.id) return ADMIN_USER;
  return hcpById(id) || repById(id);
}

// Seeded login personas: a handful the tester can pick from
export const PERSONAS = [
  { id: "rep_seed_1", kind: "Rep" },
  { id: "phy_seed_1", kind: "HCP" },
  { id: "pha_seed_1", kind: "HCP" },
  { id: "pur_seed_1", kind: "HCP" },
];

// The 5 "featured" demo personas shown on the login screen and the only ones
// the email+password form accepts. Pinned by literal id (the first-generated
// entry of each role — see gen-data.js) rather than array index, so directory
// regeneration can't silently swap who these are, as long as gen-data.js keeps
// the same per-role counts and generation order (documented there).
export const FEATURED_IDS = { rep: "rep_141", physician: "phy_1", pharmacist: "pha_101", purchaser: "pur_131", admin: ADMIN_USER.id };

// Resolve persona picker cards from the generated directory
export function pickerPersonas() {
  const rep = repById(FEATURED_IDS.rep);
  const physician = hcpById(FEATURED_IDS.physician);
  const pharmacist = hcpById(FEATURED_IDS.pharmacist);
  const purchaser = hcpById(FEATURED_IDS.purchaser);
  return [
    { ...rep, kind: "Rep", blurb: `${rep.role} · ${rep.company}` },
    { ...physician, kind: "HCP", blurb: `Physician · ${physician.specialty}` },
    { ...pharmacist, kind: "HCP", blurb: `Pharmacist · ${pharmacist.setting}` },
    { ...purchaser, kind: "HCP", blurb: `Purchaser · ${purchaser.sector}` },
    { ...ADMIN_USER, kind: "Admin", blurb: "Analytics dashboard" },
  ];
}

// Deterministic demo email for each featured persona: "<id>@vimed.demo".
export function personaEmail(id) {
  return `${id}@vimed.demo`;
}

// Looks up a featured persona by their demo email. Returns null for anyone
// else — only the 5 featured personas can sign in through the login form.
export function findByEmail(email) {
  const match = /^([^@]+)@vimed\.demo$/i.exec((email || "").trim());
  if (!match) return null;
  const id = match[1];
  if (!Object.values(FEATURED_IDS).includes(id)) return null;
  return personById(id);
}

export { directory };
