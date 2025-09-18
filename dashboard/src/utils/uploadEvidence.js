// src/utils/uploadEvidence.js
import { uploadKpiEvidence } from "../actions/kpiActions";

export const handleAttachChange =
  (dispatch, kpiId) =>
  async (deliverableId, occurrenceLabel, file) => {
    const result = await dispatch(
      uploadKpiEvidence(kpiId, { file, deliverableId, occurrenceLabel })
    );
    if (!result.success) throw new Error(result.error || "Failed to upload evidence.");
    return result.filePath || null;
  };
