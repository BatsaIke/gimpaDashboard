// src/components/KPIBoard/KPIDetails/KpiDetailModal/KpiDetailModal.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateKpiStatusOnly, editKpiDeliverables } from "../../../../../actions/kpiActions";
import { fetchMyProfile as getUserDetails } from "../../../../../actions/authAction";
import { fetchDiscrepancies } from "../../../../../actions/discrepancyActions";
import Spinner from "../../../../../UI/Spinner";
import { KpiDetailContent } from "./KpiDetailContent";

const ALL_STATUSES = ["Pending", "In Progress", "Completed", "Approved"];

const KpiDetailModal = ({
  isOpen,
  onClose,
  kpi,
  isUserView = false,
  viewedUserId,         // required when isUserView=true
  // Optional: you may pass these, but we also read them from kpi for safety
  isCreator: isCreatorProp,
  isAssignedUser: isAssignedUserProp,
}) => {
  const dispatch = useDispatch();

  const [localKpi, setLocalKpi] = useState(null);
  const [origDels, setOrigDels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // prefer explicit props; fallback to kpi flags if present
  const isCreator = typeof isCreatorProp === "boolean" ? isCreatorProp : !!kpi?.isCreator;
  const isAssignedUser = typeof isAssignedUserProp === "boolean" ? isAssignedUserProp : !!kpi?.isAssignedUser;

  const freshKpi = useSelector((state) =>
    state.kpiHeaders.items
      .flatMap((h) => h.kpis || [])
      .find((kp) => kp._id === kpi?._id)
  );

  const getScoped = (objOrMap, key) => {
    if (!objOrMap || !key) return null;
    if (typeof objOrMap.get === "function") return objOrMap.get(key) || null;
    return objOrMap?.[key] || null;
  };

  // Refresh-local when headers bring a newer KPI
  useEffect(() => {
    if (freshKpi && freshKpi._id === localKpi?._id) {
      const scoped =
        (isUserView && viewedUserId
          ? getScoped(freshKpi?.userSpecific?.deliverables, viewedUserId)
          : null) || freshKpi.deliverables;

      const safeDels = Array.isArray(scoped) ? scoped : (freshKpi.deliverables || []);
      setLocalKpi({ ...freshKpi, deliverables: safeDels.map((d) => ({ ...d })) });
    }
  }, [freshKpi, localKpi?._id, isUserView, viewedUserId]);

  // On open, seed local state with viewer-scoped deliverables
  useEffect(() => {
    if (!isOpen || !kpi) return;
    setLoading(true);

    const scoped =
      (isUserView && viewedUserId
        ? getScoped(kpi?.userSpecific?.deliverables, viewedUserId)
        : null) || kpi.deliverables;

    const safeDels = Array.isArray(scoped) ? scoped : (kpi.deliverables || []);
    setLocalKpi({ ...kpi, deliverables: safeDels.map((d) => ({ ...d })) });
    setOrigDels(safeDels.map((d) => ({ ...d })));

    Promise.all([
      dispatch(getUserDetails()),
      dispatch(fetchDiscrepancies(kpi._id)),
    ]).finally(() => setLoading(false));
  }, [isOpen, kpi, dispatch, isUserView, viewedUserId]);

  if (!isOpen || loading || !localKpi) return <Spinner fullPage />;

  /* ---------------- KPI handlers ---------------- */

  // 🔧 FIX: scope status change based on where we are
  const handleKpiStatusChange = async (status) => {
    setLocalKpi((prev) => ({ ...prev, status }));
    try {
      if (isUserView && viewedUserId) {
        // creator (or someone) changing status on a user's board → scoped
        await dispatch(
          updateKpiStatusOnly(localKpi._id, {
            status,
            assigneeId: viewedUserId,
            promoteGlobally: false,         // 👈 key change
          })
        );
      } else {
        // creator on their own/global board → global
        await dispatch(
          updateKpiStatusOnly(localKpi._id, {
            status,
            promoteGlobally: true,
          })
        );
      }
      // refresh the correct list
      if (isUserView && viewedUserId) {
        // your UserKpiBoard already refreshes after DnD;
        // if you want modal to also refresh that list, dispatch here
        // e.g., dispatch(fetchUserKpis(viewedUserId));
      } else {
        // refresh headers for global board
        // e.g., dispatch(fetchKpiHeaders());
      }
    } catch (err) {
      // optionally revert local state on error
      console.error("Failed to update KPI status:", err);
    }
  };

  const handleDeliverableStatusChange = (idx, status) => {
    setLocalKpi((prev) => {
      const nextArr = [...prev.deliverables];
      nextArr[idx] = { ...nextArr[idx], status };

      dispatch(
        editKpiDeliverables(prev._id, {
          deliverables: nextArr,
          // when creator is viewing a user board, patch the *user-specific* copy
          assigneeId: isCreator && isUserView ? viewedUserId : undefined,
        })
      );

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
          isAssignedUser && d.assigneeScore?.value !== undefined && d.notes?.trim(),
        hasSavedCreator:
          isCreator && d.creatorScore?.value !== undefined && d.creatorNotes?.trim(),
      }));

      await dispatch(
        editKpiDeliverables(localKpi._id, {
          status: localKpi.status,
          deliverables: patched,
          // IMPORTANT: route to viewer's userSpecific when creator is on user view
          assigneeId: isCreator && isUserView ? viewedUserId : undefined,
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
    // optional hard refresh only for user view:
    if (isUserView) window.location.reload();
  };

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
        handleScoreChange={handleScoreChange}
        handleSave={handleSave}
        handleCancel={handleCancel}
        saving={saving}
        viewedUserId={viewedUserId}
      />
    </>
  );
};

export default KpiDetailModal;
