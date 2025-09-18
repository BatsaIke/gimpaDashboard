// utils/buildKpiFormData.js
export default function buildKpiFormData(updates = {}) {
  const fd = new FormData();

  // 1) JSON body the server expects
  //    - deliverables: array of patches (can include occurrenceLabel, scores, status, etc.)
  //    - assigneeId: optional; defaults to caller on server
  if (updates.deliverables) {
    fd.append("deliverables", JSON.stringify(updates.deliverables));
  }
  if (updates.assigneeId) {
    fd.append("assigneeId", updates.assigneeId);
  }

  // 2) Files. Accept either:
  //    - File (deliverableIndex required in wrapper)
  //    - { file, deliverableIndex, periodLabel?: "YYYY-MM-DD" }
  // The filename encodes routing for the backend:
  //    - "<idx>-name.ext"                -> deliverable-level evidence
  //    - "<idx>@YYYY-MM-DD-name.ext"     -> occurrence-level evidence
  const files = Array.isArray(updates.files) ? updates.files : [];

  files.forEach((item, i) => {
    // normalize to object shape
    const file = item?.file instanceof File ? item.file : item;
    const deliverableIndex =
      typeof item?.deliverableIndex === "number"
        ? item.deliverableIndex
        : item?.idx ?? 0;
    const periodLabel = item?.periodLabel; // optional

    // build filename prefix for backend parser
    const prefix = periodLabel
      ? `${deliverableIndex}@${periodLabel}`
      : `${deliverableIndex}`;

    // keep original extension/name for convenience
    const originalName =
      file && typeof file.name === "string" ? file.name : `upload-${i}`;
    const routedName = `${prefix}-${originalName}`;

    // field name can be anything when using multer.any(); use stable key
    fd.append(`file_${i}`, file, routedName);
  });

  return fd;
}
