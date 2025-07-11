import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  editKpiHeader,
  createKpiHeader,
} from "../../../../actions/kpiHeaderActions";
import CreateKpiModal from "../KPImodal/CreateKpiModal";
import KpiDetailModal from "../KPIDetails/KpiDetailModal/KpiDetailModal";
import Modal from "../../../../UI/modal/Modal";
import styles from "./KpiBoard.module.css";

const KpiBoardModals = ({
  isModalOpen,
  setModalOpen,
  selectedHeaderId,
  isDetailOpen,
  setIsDetailOpen,
  selectedKpi,

  // For Create Header
  isCreateHeaderModalOpen,
  setCreateHeaderModalOpen,

  // For Edit Header
  isEditHeaderModalOpen,
  setEditHeaderModalOpen,
  headerBeingEdited,
  setHeaderBeingEdited,

  // Possibly passing isCreator / isAssignedUser as well
  isCreator,
  isAssignedUser,
}) => {
  const dispatch = useDispatch();

  // For "Create Header"
  const [newHeaderName, setNewHeaderName] = useState("");

  // For "Edit Header"
  const [editedHeaderName, setEditedHeaderName] = useState("");

  useEffect(() => {
    if (headerBeingEdited) {
      setEditedHeaderName(headerBeingEdited.name || "");
    }
  }, [headerBeingEdited]);

  const handleCreateHeader = () => {
    if (!newHeaderName.trim()) return;
    dispatch(createKpiHeader({ name: newHeaderName.trim() }));
    setNewHeaderName("");
    setCreateHeaderModalOpen(false);
  };

  const saveHeaderEdit = () => {
    if (!headerBeingEdited) return;
    dispatch(editKpiHeader(headerBeingEdited._id, { name: editedHeaderName }));
    setEditHeaderModalOpen(false);
    setHeaderBeingEdited(null);
  };

  return (
    <>
      {/* 1) CREATE KPI MODAL */}
      <CreateKpiModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        selectedHeaderId={selectedHeaderId}
      />

      {/* 2) KPI DETAIL MODAL */}
      {isDetailOpen && selectedKpi && (
        <KpiDetailModal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          kpi={selectedKpi}
          isCreator={isCreator}
          isAssignedUser={isAssignedUser}
        />
      )}

      {/* 3) CREATE HEADER MODAL */}
      <Modal
        isOpen={isCreateHeaderModalOpen}
        onClose={() => setCreateHeaderModalOpen(false)}
        header="Create KPI Header"
        footer={
          <div className={styles.modalActions}>
            <button onClick={() => setCreateHeaderModalOpen(false)}>
              Cancel
            </button>
            <button onClick={handleCreateHeader}>Create</button>
          </div>
        }
      >
        <input
          type="text"
          value={newHeaderName}
          onChange={(e) => setNewHeaderName(e.target.value)}
          className={styles.modalInput}
          placeholder="Header Name..."
        />
      </Modal>

      {/* 4) EDIT HEADER MODAL */}
      <Modal
        isOpen={isEditHeaderModalOpen}
        onClose={() => {
          setEditHeaderModalOpen(false);
          setHeaderBeingEdited(null);
        }}
        header="Edit KPI Header"
        footer={
          <div className={styles.modalActions}>
            <button
              onClick={() => {
                setEditHeaderModalOpen(false);
                setHeaderBeingEdited(null);
              }}
            >
              Cancel
            </button>
            <button onClick={saveHeaderEdit}>Save</button>
          </div>
        }
      >
        <input
          type="text"
          value={editedHeaderName}
          onChange={(e) => setEditedHeaderName(e.target.value)}
          className={styles.modalInput}
          placeholder="Enter new header name"
        />
      </Modal>
    </>
  );
};

export default KpiBoardModals;
