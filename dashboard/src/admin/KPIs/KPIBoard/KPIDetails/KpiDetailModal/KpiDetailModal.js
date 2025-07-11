import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateKpiStatusOnly, editKpiDeliverables } from "../../../../../actions/kpiActions";
import { fetchMyProfile as getUserDetails } from "../../../../../actions/authAction";
import {
  fetchDiscrepancies,
  bookMeeting,
} from "../../../../../actions/discrepancyActions";
import Spinner from "../../../../../UI/Spinner";
import { KpiDetailContent } from "./KpiDetailContent";
import { KpiMeetingModal } from "./KpiMeetingModal";

const ALL_STATUSES = ["Pending", "In Progress", "Completed", "Approved"];

const KpiDetailModal = ({ isOpen, onClose, kpi, isUserView }) => {
  const dispatch = useDispatch();
  const discrepancies = useSelector((s) => s.discrepancies.list);

  const [localKpi, setLocalKpi] = useState(null);
  const [origDels, setOrigDels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [meeting, setMeeting] = useState({
    open: false,
    idx: null,
    flagId: null,
  });

  const { isCreator, isAssignedUser } = kpi || {};

  const freshKpi = useSelector((state) =>
    state.kpiHeaders.items
      .flatMap((h) => h.kpis || [])
      .find((kp) => kp._id === kpi?._id)
  );

  useEffect(() => {
    if (freshKpi && freshKpi._id === localKpi?._id) {
      setLocalKpi({
        ...freshKpi,
        deliverables: freshKpi.deliverables.map((d) => ({ ...d })),
      });
    }
  }, [freshKpi, localKpi?._id]);

  useEffect(() => {
    if (!isOpen || !kpi) return;
    setLoading(true);
    setLocalKpi({
      ...kpi,
      deliverables: kpi.deliverables.map((d) => ({ ...d })),
    });
    setOrigDels(kpi.deliverables.map((d) => ({ ...d })));

    dispatch(getUserDetails()).finally(() => setLoading(false));
    dispatch(fetchDiscrepancies(kpi._id));
  }, [isOpen, kpi, dispatch]);

  if (!isOpen || loading || !localKpi) {
    return <Spinner fullPage />;
  }

  // KPI handlers
  const handleKpiStatusChange = (status) => {
    setLocalKpi((prev) => {
      const next = { ...prev, status };
      dispatch(updateKpiStatusOnly(prev._id, {
        status,
        promoteGlobally: isCreator,
      }));
      return next;
    });
  };

  const handleDeliverableStatusChange = (idx, status) => {
    setLocalKpi((prev) => {
      const nextArr = [...prev.deliverables];
      nextArr[idx] = { ...nextArr[idx], status };
dispatch(editKpiDeliverables(prev._id, {
  deliverables: nextArr,
  assigneeId: isCreator && isUserView ? localKpi.assignedUsers?.[0] : undefined
}));
      return { ...prev, deliverables: nextArr };
    });
  };

  const handleAttachChange = (idx, field, val) => {
    setLocalKpi((prev) => {
      const nextArr = [...prev.deliverables];
      nextArr[idx] = { ...nextArr[idx], [field]: val };
      return { ...prev, deliverables: nextArr };
    });
  };

  const handleScoreChange = (idx, score, role) => {
    setLocalKpi((prev) => {
      const nextArr = [...prev.deliverables];
      const key = role === "assignee" ? "assigneeScore" : "creatorScore";
      nextArr[idx] = { ...nextArr[idx], [key]: { value: score } };
      return { ...prev, deliverables: nextArr };
    });
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const patched = localKpi.deliverables.map((d) => ({
        ...d,
        hasSavedAssignee:
          isAssignedUser &&
          d.assigneeScore?.value !== undefined &&
          d.notes?.trim(),
        hasSavedCreator:
          isCreator &&
          d.creatorScore?.value !== undefined &&
          d.creatorNotes?.trim(),
      }));
     await dispatch(
  editKpiDeliverables(localKpi._id, {
    status: localKpi.status,
    deliverables: patched,
    assigneeId: isCreator && isUserView ? localKpi.assignedUsers?.[0] : undefined
  })
);
      onClose();
    } catch (err) {
      console.error("Failed to save KPI:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
    if (isUserView) window.location.reload();
  };

  const handleOpenMeeting = (idx) => {
    const f = discrepancies.find(
      (flag) =>
        String(flag.kpiId?._id ?? flag.kpiId) === String(localKpi._id) &&
        flag.delIndex === idx
    );
    if (!f) {
      console.error("No discrepancy found", {
        kpiId: localKpi._id,
        delIndex: idx,
        discrepancies,
      });
      return;
    }
    console.log("Discrepancy found, opening modal:", f);
    setMeeting({ open: true, idx, flagId: f.id });
  };

  const handleSubmitMeeting = async (flagId, data) => {
    const success = await dispatch(bookMeeting(flagId, data));
    if (success) setMeeting({ open: false, idx: null, flagId: null });
  };

  const currentDeliverable =
    meeting.idx != null ? localKpi.deliverables[meeting.idx] : null;
  const deliverableTitle = currentDeliverable?.title || "";

  const discrepancy =
    meeting.idx != null
      ? discrepancies.find(
          (f) =>
            String(f.kpiId) === String(localKpi._id) &&
            String(f.delIndex) === String(meeting.idx)
        )
      : null;

  return (
    <>
      <KpiDetailContent
        isOpen={isOpen}
        onClose={onClose}
        localKpi={localKpi}
        origDels={origDels}
        ALL_STATUSES={ALL_STATUSES}
        isCreator={isCreator}
        isAssignedUser={isAssignedUser}
        isUserView={isUserView}
        handleKpiStatusChange={handleKpiStatusChange}
        handleDeliverableStatusChange={handleDeliverableStatusChange}
        handleAttachChange={handleAttachChange}
        handleScoreChange={handleScoreChange}
        handleSave={handleSave}
        handleCancel={handleCancel}
        onBookMeeting={handleOpenMeeting}
        saving={saving}
      />

      <KpiMeetingModal
        open={meeting.open}
        onClose={() => setMeeting({ open: false, idx: null, flagId: null })}
        discrepancy={discrepancy}
        onSubmit={(data) => handleSubmitMeeting(meeting.flagId, data)}
      />
    </>
  );
};

export default KpiDetailModal;