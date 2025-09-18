export function stripDynamicFromGlobal(kpi: any): boolean {
  let mutated = false;
  for (const d of kpi.deliverables || []) {
    if ('assigneeScore' in d) { delete (d as any).assigneeScore; mutated = true; }
    if ('creatorScore' in d) { delete (d as any).creatorScore; mutated = true; }
    if ('hasSavedAssignee' in d) { delete (d as any).hasSavedAssignee; mutated = true; }
    if ('hasSavedCreator' in d) { delete (d as any).hasSavedCreator; mutated = true; }
    if ('evidence' in d) { delete (d as any).evidence; mutated = true; }
    if ('occurrences' in d) { delete (d as any).occurrences; mutated = true; }
  }
  return mutated;
}
