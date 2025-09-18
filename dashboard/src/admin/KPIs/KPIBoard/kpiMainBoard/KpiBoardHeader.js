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
  onKpiClick,
  handleDragEnd,
  onEditHeader,
  onDeleteHeader,
  onEditKpi,
  onDeleteKpi,
  isUserView,
}) => {
  const { isCreator } = useKpiUserRole(header);

  const handleKpiClick = (kpi) => {
    onKpiClick?.(kpi);
  };

  return (
    <motion.section
      className={styles.headerSection}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {!isUserView && (
        <div className={styles.headerTop}>
          <h2 className={styles.headerTitle}>{header.name}</h2>

          <div className={styles.headerActions}>
            {isCreator && (
              <>
                <motion.button
                  className={`${styles.actionButton} ${styles.edit}`}
                  onClick={() => onEditHeader(header)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiEdit2 size={18} />
                  <span>Edit</span>
                </motion.button>

                <motion.button
                  className={`${styles.actionButton} ${styles.delete}`}
                  onClick={() => onDeleteHeader(header._id)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiTrash2 size={18} />
                  <span>Delete</span>
                </motion.button>
              </>
            )}

            <motion.button
              className={`${styles.actionButton} ${styles.create}`}
              onClick={() => {
                setSelectedHeaderId(header._id);
                setModalOpen(true);
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiPlus size={18} />
              <span>Create KPI</span>
            </motion.button>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <KpiColumns
          header={header}
          kpis={header.kpis || []}
          currentUserId={currentUserId}
          onKpiClick={handleKpiClick}
          onEditKpi={onEditKpi}
          onDeleteKpi={onDeleteKpi}
          isUserView={isUserView}
        />
      </DragDropContext>
    </motion.section>
  );
};

const KpiBoardHeader = ({ headers, headersLoading, ...props }) => {
  if (headersLoading) {
    return <p className={styles.loadingText}>Loading KPIs…</p>;
  }

  if (!headers || headers.length === 0) {
    return <p className={styles.emptyText}>No KPI headers yet.</p>;
  }

  return (
    <>
      {headers.map((header) => (
        <HeaderSection key={header._id} header={header} {...props} />
      ))}
    </>
  );
};

export default KpiBoardHeader;
