// utils/recurrence.ts
import { addDays, addWeeks, addMonths } from "date-fns";

export function nextOccurrence(label: string, pattern: string) {
  const date = new Date(label);               // label is ISO string for day/week start
  switch (pattern) {
    case "Daily":   return addDays(date, 1);
    case "Weekly":  return addWeeks(date, 1);
    case "Monthly": return addMonths(date, 1);
    default:        return addDays(date, 1);  // fallback
  }
}
