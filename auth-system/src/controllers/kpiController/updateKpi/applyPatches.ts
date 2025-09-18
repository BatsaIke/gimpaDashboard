// controllers/kpiController/updateKpi/applyPatches.ts
import { Patch } from "./parsePatches";

type Args = {
  kpi: any;
  patches: Patch[];
  callerId?: string;       // <-- use this for creatorScore.enteredBy
  isCreator?: boolean;
  safeAssigneeId: string;
};

export async function applyPatchesToKpi({
  kpi,
  patches,
  safeAssigneeId,
  callerId,                // <-- pull it in
}: Args): Promise<{ deliverablesUpdated: boolean }> {
  if (!patches?.length) return { deliverablesUpdated: false };

  // ensure maps
  const us: any = kpi.userSpecific || {};
  us.deliverables =
    us.deliverables instanceof Map
      ? us.deliverables
      : new Map<string, any[]>(Object.entries(us.deliverables || {}));
  kpi.userSpecific = us;

  // seed per-user slice from global deliverables if missing
  const seedFromGlobal = () =>
    (kpi.deliverables || []).map((d: any) => ({
      deliverableId: d._id,
      evidence: [],
      occurrences: [],
      status: "Pending",
    }));

  const ensureUserArr = (uid: string) => {
    let arr = us.deliverables.get(uid);
    if (!Array.isArray(arr)) {
      arr = seedFromGlobal();
      us.deliverables.set(uid, arr);
    }
    return arr as any[];
  };

  const addAll = (arr: string[] | undefined, items?: string[]) =>
    Array.from(new Set([...(arr || []), ...(items || [])]));

  // Ensure ScoreSubmissionSchema-required fields
  const normalizeScore = (raw: any, userId: string) => {
    if (raw == null) return undefined;
    if (typeof raw === "number") {
      return {
        value: raw,
        notes: "",
        supportingDocuments: [],
        enteredBy: userId,
        timestamp: new Date(),
      };
    }
    const out: any = { ...raw };
    if (out.value == null && typeof out.score === "number") out.value = out.score;

    if (!Array.isArray(out.supportingDocuments) && Array.isArray(out.evidence)) {
      out.supportingDocuments = out.evidence;
    }
    if (!out.supportingDocuments) out.supportingDocuments = [];

    if (!out.enteredBy) out.enteredBy = userId;
    if (!out.timestamp) out.timestamp = new Date();
    return out;
  };

  let changed = false;
  const view = ensureUserArr(String(safeAssigneeId));

  for (const p of patches) {
    // resolve (or create) state by deliverableId
    let state = view.find((s: any) => String(s.deliverableId) === String(p.deliverableId));
    if (!state) {
      state = { deliverableId: p.deliverableId, evidence: [], occurrences: [], status: "Pending" };
      view.push(state);
      changed = true;
    }

    if (p.scope === "occurrence") {
      state.occurrences = Array.isArray(state.occurrences) ? state.occurrences : [];
      let occ = state.occurrences.find((o: any) => o?.periodLabel === p.occurrenceLabel);
      if (!occ) {
        occ = { periodLabel: p.occurrenceLabel, status: "Pending", evidence: [] };
        state.occurrences.push(occ);
        changed = true;
      }

      if (p.data.assigneeScore != null) {
        const snap = normalizeScore(p.data.assigneeScore, String(safeAssigneeId));
        if (snap) {
          occ.assigneeScore = { ...(occ.assigneeScore || {}), ...snap };
          changed = true;
        }
      }
      if (p.data.creatorScore != null) {
        // 🔑 creatorScore should be attributed to the creator (callerId), not the assignee
        const snap = normalizeScore(p.data.creatorScore, String(callerId || safeAssigneeId));
        if (snap) {
          occ.creatorScore = { ...(occ.creatorScore || {}), ...snap };
          changed = true;
        }
      }
      if (p.data.status) {
        occ.status = p.data.status;
        changed = true;
      }
      if (typeof p.data.hasSavedAssignee === "boolean") {
        (occ as any).hasSavedAssignee = p.data.hasSavedAssignee;
        changed = true;
      }
      if (p.data.evidence?.length) {
        occ.evidence = addAll(occ.evidence, p.data.evidence);
        changed = true;
      }
    } else {
      if (p.data.assigneeScore != null) {
        const snap = normalizeScore(p.data.assigneeScore, String(safeAssigneeId));
        if (snap) {
          state.assigneeScore = { ...(state.assigneeScore || {}), ...snap };
          changed = true;
        }
      }
      if (p.data.creatorScore != null) {
        // 🔑 creatorScore should be attributed to the creator (callerId), not the assignee
        const snap = normalizeScore(p.data.creatorScore, String(callerId || safeAssigneeId));
        if (snap) {
          state.creatorScore = { ...(state.creatorScore || {}), ...snap };
          changed = true;
        }
      }
      if (p.data.status) {
        state.status = p.data.status;
        changed = true;
      }
      if (typeof p.data.hasSavedAssignee === "boolean") {
        (state as any).hasSavedAssignee = p.data.hasSavedAssignee;
        changed = true;
      }
      if (p.data.evidence?.length) {
        state.evidence = addAll(state.evidence, p.data.evidence);
        changed = true;
      }
    }
  }

  if (changed) {
    kpi.userSpecific.deliverables = us.deliverables;
    kpi.markModified("userSpecific.deliverables");
  }

  return { deliverablesUpdated: changed };
}
