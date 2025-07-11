// src/components/KPIBoard/KpiBoard/KpiBoardUtils.js
import { deleteKpi, editKpiDeliverables, } from "../actions/kpiActions";
import { deleteKpiHeader } from "../actions/kpiHeaderActions";
import { canUserMoveKpi } from "./dreagKpiBoard";
import { setMovingKpi, unsetMovingKpi } from "../redux/slices/kpiSlice";

export const handleDragEnd = async (result, headers, dispatch) => {
  const { source, destination, draggableId } = result;

  if (!destination) {
    console.log("Drag cancelled - no destination");
    return;
  }

  console.log("From:", source.droppableId, "To:", destination.droppableId);

  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  ) {
    return;
  }

  // Find the KPI in the headers data
  let kpiToUpdate = null;
  for (const header of headers) {
    if (header.kpis) {
      kpiToUpdate = header.kpis.find((k) => k._id === draggableId);
      if (kpiToUpdate) break;
    }
  }

  if (!kpiToUpdate) {
    console.error("KPI not found for draggableId:", draggableId);
    return;
  }

  if (!canUserMoveKpi(kpiToUpdate, destination.droppableId)) {
    console.warn("Drag operation not permitted for this user");
    return;
  }

  dispatch(setMovingKpi(draggableId));

  try {
    await dispatch(
      editKpiDeliverables(kpiToUpdate._id, {
        status: destination.droppableId,
      })
    );
  } catch (error) {
    console.error("Error updating KPI:", error);
  } finally {
    dispatch(unsetMovingKpi(draggableId));
  }
};

export const onEditHeader = (header, setHeaderBeingEdited, setEditHeaderModalOpen) => {
  if (!header.isCreator) {
    alert("You cannot edit this header (not the creator).");
    return;
  }
  setHeaderBeingEdited(header);
  setEditHeaderModalOpen(true);
};

export const onDeleteHeader = async (headerId, headers, dispatch) => {
  const headerToDelete = headers.find((h) => h._id === headerId);
  if (!headerToDelete) return;

  if (!headerToDelete.isCreator) {
    alert("You cannot delete this header (not the creator).");
    return;
  }

  if (!window.confirm(`Are you sure you want to delete "${headerToDelete.name}"?`)) {
    return;
  }
  dispatch(deleteKpiHeader(headerId));
};

export const onEditKpi = (kpi, setSelectedKpi, setIsDetailOpen) => {
  if (!kpi.isCreator) {
    alert("You cannot edit this KPI (not the creator).");
    return;
  }
  setSelectedKpi(kpi);
  setIsDetailOpen(true);
};

export const onDeleteKpi = (kpiId, headers, dispatch) => {
  let kpiToDelete = null;
  for (const header of headers) {
    if (header.kpis) {
      kpiToDelete = header.kpis.find((k) => k._id === kpiId);
      if (kpiToDelete) break;
    }
  }

  if (!kpiToDelete) return;

  if (!kpiToDelete.isCreator) {
    alert("You cannot delete this KPI (not the creator).");
    return;
  }

  if (!window.confirm(`Are you sure you want to delete "${kpiToDelete.name}"?`)) {
    return;
  }
  dispatch(deleteKpi(kpiId));
};
