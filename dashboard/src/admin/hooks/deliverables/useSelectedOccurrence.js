// src/hooks/deliverables/useSelectedOccurrence.js
import { useMemo, useState } from "react";

export default function useSelectedOccurrence(deliverable) {
  const occurrences = Array.isArray(deliverable?.occurrences) ? deliverable.occurrences : [];

  const nextDue = useMemo(() => {
    if (!deliverable?.isRecurring || !occurrences.length) return null;
    const parse = (x) => {
      const dt = new Date(x);
      return isNaN(dt.getTime()) ? null : dt;
    };
    return occurrences
      .map((o) => ({ o, dt: parse(o.dueDate || o.periodLabel) }))
      .filter((x) => x.dt)
      .sort((a, b) => a.dt - b.dt)
      .find((x) => x.o.status !== "Completed")?.o || null;
  }, [deliverable?.isRecurring, occurrences]);

  const [selectedLabel, setSelectedLabel] = useState(
    deliverable?.isRecurring ? (nextDue?.periodLabel || occurrences[0]?.periodLabel || "") : ""
  );

  const selectedOccurrence = useMemo(() => {
    if (!deliverable?.isRecurring || !selectedLabel) return undefined;
    return occurrences.find((o) => o.periodLabel === selectedLabel);
  }, [deliverable?.isRecurring, occurrences, selectedLabel]);

  return { occurrences, selectedLabel, setSelectedLabel, selectedOccurrence, nextDue };
}
