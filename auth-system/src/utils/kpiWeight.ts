import Kpi from "../models/Kpi";
import mongoose from "mongoose";

export function academicYearKey(date = new Date()) {
  const y = date.getUTCFullYear() + (date.getUTCMonth() >= 8 ? 1 : 0);
  return `${y - 1}-${y}`;
}

/**
 * Recomputes KPI.weight so the sum per academic year = 100,
 * and splits each KPI’s weight equally across its deliverables.
 */
export async function recomputeWeights(
  yearKey: string,
  session: mongoose.ClientSession | null = null
) {
  const kpis = await Kpi.find({ academicYear: yearKey }).session(session);

  const kpiWeight = kpis.length > 0 ? 100 / kpis.length : 0;

  for (const k of kpis) {
    k.weight = kpiWeight;

    const delWeight = k.deliverables.length
      ? kpiWeight / k.deliverables.length
      : 0;

    k.deliverables.forEach((d) => (d.weight = delWeight));
    await k.save({ session, validateModifiedOnly: true });
  }
}
