// ───────────────────────────────────────────────────────────
// src/utils/roleUtils.ts  ✨ UPDATED (adds Super Admin)
// ───────────────────────────────────────────────────────────

/* ------------------------------------------------------------------
 * 1. Canonical role list (single source of truth)
 * ------------------------------------------------------------------ */
export const ALL_ROLES = [
  /* Ultimate authority */
  "Super Admin",

  /* Top‑tier */
  "Rector",
  "Deputy Rector",
  "Secretary of the Institute",
  "Director of Internal Audit",

  /* Academic leadership */
  "Deans of Schools and Faculty",
  "Associate Deans",
  "Dean of Students",

  /* Academic directorates (Deputy‑Rector stream) */
  "Director of APQA",
  "Director of GTC",
  "Head of IP&D",
  "Librarian",
  "Director of Academic Affairs",

  /* Non‑academic directorates (Secretary stream) */
  "Director of Human Resource",
  "Director of Estate and Municipal Services",
  "Director of Hospitality",
  "Director of Corporate Affairs & Institutional Advancement",
  "Director of Finance",
  "Director of Information Management Services",
  "Director of Medical and Health Services",
  "Director of Legal Compliance Office",

  /* Mid‑tier academic */
  "Heads of Departments",
  "Campus Managers",
  "Heads of Centers",
  "Professors",
  "Institute's Scholars & Fellows",
  "Associate Professors / Principal Lecturers",
  "Senior Lecturers / Senior Teaching / Senior Research Fellows",
  "Lecturers / Teaching / Research Fellows",
  "Assistant Lecturers",

  /* Registrar stream */
  "Directors",
  "Deputy Registrars",
  "Heads of Units / Senior Assistant Registrars",
  "Assistant Registrars / Programme Coordinators",
  "Junior Assistant Registrars",
  "Middle & Junior Staff"
] as const satisfies readonly string[];

/** Type derived from the tuple above (literals, not string). */
export type SystemRole = (typeof ALL_ROLES)[number];

/** Mutable copy when you need a plain string[] (e.g. Zod enum). */
export const ALL_ROLES_ARRAY: string[] = [...ALL_ROLES];

/* ------------------------------------------------------------------
 * 2. Hierarchy map (direct reports only – read‑only arrays)        
 * ------------------------------------------------------------------ */
type ReportsMap = Partial<Record<SystemRole, readonly SystemRole[]>>;

export const DIRECT_REPORTS: ReportsMap = {
  /* Super Admin oversees everything */
  "Super Admin": [
    "Rector",
    "Deputy Rector",
    "Secretary of the Institute",
    "Director of Internal Audit"
  ],

  /* Rector */
  "Rector": [
    "Deputy Rector",
    "Secretary of the Institute",
    "Director of Internal Audit"
  ],

  /* Deputy Rector */
  "Deputy Rector": [
    "Deans of Schools and Faculty",
    "Dean of Students",
    "Director of APQA",
    "Director of GTC",
    "Head of IP&D",
    "Librarian",
    "Director of Academic Affairs"
  ],

  /* Secretary */
  "Secretary of the Institute": [
    "Director of Academic Affairs",
    "Director of Human Resource",
    "Director of Estate and Municipal Services",
    "Director of Hospitality",
    "Director of Corporate Affairs & Institutional Advancement",
    "Director of Finance",
    "Director of Information Management Services",
    "Director of Medical and Health Services",
    "Director of Legal Compliance Office"
  ],

  /* Director of Internal Audit */
  "Director of Internal Audit": [],

  /* Dean */
  "Deans of Schools and Faculty": [
    "Associate Deans",
    "Deputy Registrars",
    "Heads of Units / Senior Assistant Registrars"
  ],

  /* Associate Dean */
  "Associate Deans": [
    "Heads of Departments",
    "Campus Managers",
    "Heads of Centers"
  ],

  /* HoDs / Campus / Centers */
  "Heads of Departments": ["Professors", "Institute's Scholars & Fellows"],
  "Campus Managers": ["Professors", "Institute's Scholars & Fellows"],
  "Heads of Centers": ["Professors", "Institute's Scholars & Fellows"],

  /* Professors & Scholars */
  "Professors": ["Associate Professors / Principal Lecturers"],
  "Institute's Scholars & Fellows": ["Associate Professors / Principal Lecturers"],

  /* Associate Professors / Principals */
  "Associate Professors / Principal Lecturers": [
    "Senior Lecturers / Senior Teaching / Senior Research Fellows"
  ],

  /* Senior Lecturers */
  "Senior Lecturers / Senior Teaching / Senior Research Fellows": [
    "Lecturers / Teaching / Research Fellows"
  ],

  /* Lecturers */
  "Lecturers / Teaching / Research Fellows": ["Assistant Lecturers"],
  "Assistant Lecturers": [],

  /* Non‑academic director chain */
  "Directors": ["Deputy Registrars"],
  "Director of Academic Affairs": ["Deputy Registrars"],
  "Director of Human Resource": ["Deputy Registrars"],
  "Director of Estate and Municipal Services": ["Deputy Registrars"],
  "Director of Hospitality": ["Deputy Registrars"],
  "Director of Corporate Affairs & Institutional Advancement": ["Deputy Registrars"],
  "Director of Finance": ["Deputy Registrars"],
  "Director of Information Management Services": ["Deputy Registrars"],
  "Director of Medical and Health Services": ["Deputy Registrars"],
  "Director of Legal Compliance Office": ["Deputy Registrars"],

  /* Deputy Registrars */
  "Deputy Registrars": ["Heads of Units / Senior Assistant Registrars"],

  /* Heads of Units / SARs */
  "Heads of Units / Senior Assistant Registrars": [
    "Assistant Registrars / Programme Coordinators"
  ],

  /* Assistant Registrars */
  "Assistant Registrars / Programme Coordinators": [
    "Junior Assistant Registrars"
  ],

  /* Junior Assistant Registrars */
  "Junior Assistant Registrars": ["Middle & Junior Staff"],

  /* Bottom */
  "Middle & Junior Staff": []
} as const;

/* ------------------------------------------------------------------
 * 3. Helper utilities                                               
 * ------------------------------------------------------------------ */
export function getAccessibleRoles(caller: SystemRole): SystemRole[] {
  return (DIRECT_REPORTS[caller] ?? []) as SystemRole[];
}

export function canAssignTo(caller: SystemRole, target: SystemRole): boolean {
  return getAccessibleRoles(caller).includes(target);
}

// A convenience check
export const isSuperAdmin = (role?: string): role is 'Super Admin' => role === 'Super Admin';
