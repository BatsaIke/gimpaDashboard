// src/components/KPIBoard/KPIDetails/deliverableUtils.js
export default function resolveDeliverable(raw) {
  if (!raw) return {};
  if (raw.title) return raw;
  if (raw._doc?.title) return { ...raw._doc, discrepancy: raw.discrepancy || raw._doc.discrepancy };
  if (Array.isArray(raw.__parentArray) && typeof raw.__index === "number") {
    const d = raw.__parentArray[raw.__index];
    if (d?.title) return { ...d, discrepancy: raw.discrepancy || d.discrepancy };
  }
  return raw;
}
