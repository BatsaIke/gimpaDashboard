// src/hooks/deliverables/useSelectedOccurrence.js
import { useMemo, useState, useEffect } from "react";

export default function useSelectedOccurrence(deliverable) {
  // Memoize occurrences so its reference is stable between renders
  const occurrences = useMemo(() => {
    return Array.isArray(deliverable?.occurrences) ? deliverable.occurrences : [];
  }, [deliverable?.occurrences]);

  const nextDue = useMemo(() => {
    if (!deliverable?.isRecurring || !occurrences.length) return null;
    const parse = (x) => {
      const dt = new Date(x);
      return isNaN(dt.getTime()) ? null : dt;
    };
    return (
      occurrences
        .map((o) => ({ o, dt: parse(o.dueDate || o.periodLabel) }))
        .filter((x) => x.dt)
        .sort((a, b) => a.dt - b.dt)
        .find((x) => x.o.status !== "Completed")?.o || null
    );
  }, [deliverable?.isRecurring, occurrences]);

  // Initialize selectedLabel once; then keep it in sync when inputs change
  const [selectedLabel, setSelectedLabel] = useState("");

  useEffect(() => {
    if (!deliverable?.isRecurring) {
      setSelectedLabel("");
      return;
    }
    const initial =
      nextDue?.periodLabel || occurrences[0]?.periodLabel || "";
    setSelectedLabel((prev) => (prev ? prev : initial));
  }, [deliverable?.isRecurring, nextDue, occurrences]);

  const selectedOccurrence = useMemo(() => {
    if (!deliverable?.isRecurring || !selectedLabel) return undefined;
    return occurrences.find((o) => o.periodLabel === selectedLabel);
  }, [deliverable?.isRecurring, occurrences, selectedLabel]);

  return { occurrences, selectedLabel, setSelectedLabel, selectedOccurrence, nextDue };
}
