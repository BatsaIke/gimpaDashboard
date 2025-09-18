// controllers/kpiController/updateKpi/parsePatches.ts
import type { Express } from "express";
import { AuthRequest } from "../../../types/types";

export type PatchDeliverable = {
  deliverableId: string;
  scope: "deliverable";
  data: {
    status?: "Pending" | "In Progress" | "Completed" | "Approved";
    assigneeScore?: any;
    creatorScore?: any;
    evidence?: string[];
    hasSavedAssignee?: boolean;
  };
};

export type PatchOccurrence = {
  deliverableId: string;
  scope: "occurrence";
  occurrenceLabel: string;
  data: {
    status?: "Pending" | "In Progress" | "Completed" | "Approved";
    assigneeScore?: any;
    creatorScore?: any;
    evidence?: string[];
    hasSavedAssignee?: boolean;
  };
};

export type Patch = PatchDeliverable | PatchOccurrence;

// filename styles:
// 1) <deliverableId>[@|_YYYY-MM-DD]-...
const FILE_WITH_ID_RE = /^([a-fA-F0-9]{24})(?:[@_](\d{4}-\d{2}-\d{2}))?-/;
// 2) <idx>[@|_YYYY-MM-DD]-... (legacy)
const FILE_WITH_INDEX_RE = /^(\d+)(?:[@_](\d{4}-\d{2}-\d{2}))?-/;

function asArray<T = any>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function uniqMerge(a?: string[], b?: string[]) {
  return Array.from(new Set([...(a || []), ...(b || [])]));
}

function parseMaybeJSON<T = any>(v: any, fallback: T): T {
  if (typeof v === "string") {
    try { return JSON.parse(v); } catch { return fallback; }
  }
  return (v ?? fallback) as T;
}

type BodyDeliverable = {
  deliverableId?: string;
  scope?: "deliverable" | "occurrence";
  occurrenceLabel?: string;
  status?: string;
  assigneeScore?: any;
  creatorScore?: any;
  evidence?: string[];
  occurrences?: Array<{
    periodLabel?: string;
    status?: string;
    assigneeScore?: any;
    creatorScore?: any;
    evidence?: string[];
    hasSavedAssignee?: boolean;
  }>;
  hasSavedAssignee?: boolean;
};

export function parsePatchesAndFiles(
  req: AuthRequest,
  callerId: string
): { patches: Patch[]; safeAssigneeId: string } {
  const body = (req.body ?? {}) as Record<string, any>;
  
  // Modified logic for safeAssigneeId - prioritize evaluatedUserId if present
  const safeAssigneeId = body.evaluatedUserId 
    ? String(body.evaluatedUserId)
    : (body.assigneeId && typeof body.assigneeId === "object"
      ? String(body.assigneeId._id)
      : String(body.assigneeId || callerId));

  const declaredScoreType: "creatorScore" | "assigneeScore" | undefined =
    body.scoreType === "creatorScore" || body.scoreType === "assigneeScore"
      ? body.scoreType
      : undefined;

  const patchMap = new Map<string, Patch>();
  const keyFor = (p: Patch) =>
    `${p.deliverableId}::${p.scope}${p.scope === "occurrence" ? `::${p.occurrenceLabel}` : ""}`;

  const putPatch = (p: Patch) => {
    const k = keyFor(p);
    const existing = patchMap.get(k);
    if (!existing) return void patchMap.set(k, p);

    // merge
    if (p.scope === "deliverable" && existing.scope === "deliverable") {
      existing.data.status = p.data.status ?? existing.data.status;
      existing.data.assigneeScore = p.data.assigneeScore ?? existing.data.assigneeScore;
      existing.data.creatorScore = p.data.creatorScore ?? existing.data.creatorScore;
      existing.data.evidence = uniqMerge(existing.data.evidence, p.data.evidence);
      existing.data.hasSavedAssignee =
        p.data.hasSavedAssignee ?? existing.data.hasSavedAssignee;
    } else if (p.scope === "occurrence" && existing.scope === "occurrence") {
      existing.data.status = p.data.status ?? existing.data.status;
      existing.data.assigneeScore = p.data.assigneeScore ?? existing.data.assigneeScore;
      existing.data.creatorScore = p.data.creatorScore ?? existing.data.creatorScore;
      existing.data.evidence = uniqMerge(existing.data.evidence, p.data.evidence);
      existing.data.hasSavedAssignee =
        p.data.hasSavedAssignee ?? existing.data.hasSavedAssignee;
    }
  };

  const ensurePatch = (
    deliverableId: string,
    scope: "deliverable" | "occurrence",
    occurrenceLabel?: string
  ): Patch => {
    const key =
      scope === "deliverable"
        ? `${deliverableId}::deliverable`
        : `${deliverableId}::occurrence::${occurrenceLabel}`;
    let existing = patchMap.get(key);
    if (existing) return existing;

    existing =
      scope === "deliverable"
        ? { deliverableId, scope: "deliverable", data: {} }
        : { deliverableId, scope: "occurrence", occurrenceLabel: occurrenceLabel!, data: {} };
    patchMap.set(key, existing);
    return existing;
  };

  const attachDocsToScore = (
    data: PatchDeliverable["data"] | PatchOccurrence["data"],
    score: "creatorScore" | "assigneeScore",
    docs: string[]
  ) => {
    if (!docs?.length) return;
    const target = (data as any)[score] || {};
    target.supportingDocuments = uniqMerge(target.supportingDocuments, docs);
    (data as any)[score] = target;
  };

  // --- 1) Targeted payload support -----------------------------------------
  if (body.deliverableId && body.updates) {
    const deliverableId = String(body.deliverableId);
    const updates = parseMaybeJSON<any>(body.updates, {});
    const nested = (Array.isArray(updates.occurrences) && updates.occurrences[0]) || {};
    const occLabel = String(body.occurrenceLabel || nested.periodLabel || "");

    const explicitCreatorDocs = asArray<string>(updates?.creatorScore?.supportingDocuments);
    const explicitAssigneeDocs = asArray<string>(updates?.assigneeScore?.supportingDocuments);

    const looseEvidenceTop = asArray<string>(updates.evidence || updates.supportingDocuments);
    const looseEvidenceNested = asArray<string>(
      (nested as any).evidence || (nested as any).supportingDocuments
    );
    const looseEvidence = uniqMerge(looseEvidenceTop, looseEvidenceNested);

    const hasCreator = !!updates.creatorScore || !!nested.creatorScore;
    const hasAssignee = !!updates.assigneeScore || !!nested.assigneeScore;

    const scope: "deliverable" | "occurrence" = occLabel ? "occurrence" : "deliverable";
    const patch = ensurePatch(deliverableId, scope, occLabel);

    patch.data.status = (updates.status ?? nested.status) || patch.data.status;
    
    // Handle scores based on declared scoreType
    if (declaredScoreType === "assigneeScore" || (!declaredScoreType && hasAssignee)) {
      patch.data.assigneeScore = updates.assigneeScore ?? nested.assigneeScore;
      attachDocsToScore(patch.data, "assigneeScore", explicitAssigneeDocs);
    }
    
    if (declaredScoreType === "creatorScore" || (!declaredScoreType && hasCreator)) {
      patch.data.creatorScore = updates.creatorScore ?? nested.creatorScore;
      attachDocsToScore(patch.data, "creatorScore", explicitCreatorDocs);
    }

    if (!hasCreator && !hasAssignee && looseEvidence.length) {
      patch.data.evidence = uniqMerge(patch.data.evidence, looseEvidence);
    }

    putPatch(patch);
  }

  // --- 2) Legacy array-of-deliverables support ------------------------------
  const bodyDeliverables = asArray<BodyDeliverable>(body.deliverables);
  const deliverableIds = asArray<string>(body.deliverableIds);

  for (const b of bodyDeliverables) {
    const deliverableId = b?.deliverableId && String(b.deliverableId);
    if (!deliverableId) continue;

    const hasCreator = !!b.creatorScore;
    const hasAssignee = !!b.assigneeScore;

    if (b.scope === "occurrence" || b.occurrenceLabel || (b.occurrences && b.occurrences[0])) {
      const nested = (b.occurrences && b.occurrences[0]) || {};
      const occLabel = String(b.occurrenceLabel || nested.periodLabel || "");
      if (!occLabel) continue;

      const p = ensurePatch(deliverableId, "occurrence", occLabel);
      p.data.status = (nested.status || b.status) as any ?? p.data.status;

      if (declaredScoreType === "assigneeScore" || (!declaredScoreType && (hasAssignee || nested.assigneeScore))) {
        p.data.assigneeScore = b.assigneeScore ?? nested.assigneeScore;
      }
      if (declaredScoreType === "creatorScore" || (!declaredScoreType && (hasCreator || nested.creatorScore))) {
        p.data.creatorScore = b.creatorScore ?? nested.creatorScore;
      }

      if (!p.data.assigneeScore && !p.data.creatorScore) {
        p.data.evidence = uniqMerge(p.data.evidence, uniqMerge(b.evidence, nested.evidence));
      }

      putPatch(p);
    } else {
      const p = ensurePatch(deliverableId, "deliverable");
      p.data.status = (b.status as any) ?? p.data.status;

      if (declaredScoreType === "assigneeScore" || (!declaredScoreType && hasAssignee)) {
        p.data.assigneeScore = b.assigneeScore;
      }
      if (declaredScoreType === "creatorScore" || (!declaredScoreType && hasCreator)) {
        p.data.creatorScore = b.creatorScore;
      }

      if (!hasAssignee && !hasCreator) {
        p.data.evidence = uniqMerge(p.data.evidence, b.evidence);
      }

      putPatch(p);
    }
  }

  // --- 3) Files --------------------------------------------------------------
  const files: Express.Multer.File[] = Array.isArray(req.files)
    ? (req.files as Express.Multer.File[])
    : ((Object.values((req.files as Record<string, Express.Multer.File[]>) || {})) as Express.Multer.File[][]).flat();

  for (const file of files) {
    const name = file.originalname || "";
    const idMatch = name.match(FILE_WITH_ID_RE);
    const idxMatch = !idMatch ? name.match(FILE_WITH_INDEX_RE) : null;

    let deliverableId: string | null = null;
    let periodLabel: string | undefined;

    if (idMatch) {
      deliverableId = idMatch[1];
      periodLabel = idMatch[2];
    } else if (idxMatch) {
      const idx = parseInt(idxMatch[1], 10);
      periodLabel = idxMatch[2];
      if (!Number.isNaN(idx) && deliverableIds[idx]) {
        deliverableId = String(deliverableIds[idx]);
      }
    }
    if (!deliverableId) continue;

    const scope: "deliverable" | "occurrence" = periodLabel ? "occurrence" : "deliverable";
    const patch = ensurePatch(deliverableId, scope, periodLabel);
    const filePath = `/uploads/evidence/${file.filename}`;

    const chosenScore: "creatorScore" | "assigneeScore" | undefined =
      declaredScoreType
        || (patch.data.creatorScore ? "creatorScore" : undefined)
        || (patch.data.assigneeScore ? "assigneeScore" : undefined);

    if (chosenScore) {
      attachDocsToScore(patch.data, chosenScore, [filePath]);
    } else {
      patch.data.evidence = uniqMerge(patch.data.evidence, [filePath]);
    }

    putPatch(patch);
  }

  return { patches: Array.from(patchMap.values()), safeAssigneeId };
}