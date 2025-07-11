// src/components/KPIBoard/KpiBoard/KpiBoardHeader.js
import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { motion } from "framer-motion";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import KpiColumns from "./KpiColumns";
import styles from "./KpiBoardHeader.module.css";
import { useKpiUserRole } from "../../../hooks/useKpiUserRole";

const HeaderSection = ({
  header,
  currentUserId,
  setSelectedHeaderId,
  setModalOpen,
  onKpiClick, // ✅ pass down this callback
  setIsDetailOpen,
  handleDragEnd,
  onEditHeader,
  onDeleteHeader,
  onEditKpi,
  onDeleteKpi,
  isUserView,
}) => {
  const { isCreator } = useKpiUserRole(header);

  const handleKpiClick = (kpi) => {
    if (onKpiClick) {
      onKpiClick(kpi);
    }
  };

  return (
    <motion.div
      className={styles.headerSection}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {!isUserView && (
        <div className={styles.headerTitleContainer}>
          <h2 className={styles.headerTitle}>{header.name}</h2>
          <div className={styles.headerActions}>
            {isCreator && (
              <>
                <motion.button
                  className={styles.editHeaderButton}
                  onClick={() => onEditHeader(header)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiEdit2 size={16} />
                  Edit
                </motion.button>
                <motion.button
                  className={styles.deleteHeaderButton}
                  onClick={() => onDeleteHeader(header._id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiTrash2 size={16} />
                  Delete
                </motion.button>
              </>
            )}
            <motion.button
              className={styles.createKpiButton}
              onClick={() => {
                setSelectedHeaderId(header._id);
                setModalOpen(true);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus size={16} />
              Create KPI
            </motion.button>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <KpiColumns
          header={header}
          kpis={header.kpis || []}
          currentUserId={currentUserId}
          onKpiClick={handleKpiClick} // ✅ use this new handler
          onEditKpi={onEditKpi}
          onDeleteKpi={onDeleteKpi}
          isUserView={isUserView}
        />
      </DragDropContext>
    </motion.div>
  );
};

const KpiBoardHeader = ({ headers, headersLoading, ...props }) => {
  if (headersLoading) {
    return <p className={styles.loadingText}>Loading...</p>;
  }

  return (
    <>
      {headers.map((header) => (
        <HeaderSection
          key={header._id}
          header={header}
          {...props}
        />
      ))}
    </>
  );
};

export default KpiBoardHeader;
