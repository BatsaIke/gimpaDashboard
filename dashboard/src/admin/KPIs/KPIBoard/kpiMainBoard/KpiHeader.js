// src/components/KPIBoard/KpiBoard/KpiHeader.js
import React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import KpiColumns from "./KpiColumns";
import styles from "./KpiBoard.module.css";
import { useKpiUserRole } from "../../../hooks/useKpiUserRole";

const KpiHeader = ({
  header,
  kpis,
  onCreateKpi,
  onKpiClick,
  onDragEnd,
  onEditHeader,
  onDeleteHeader,
  onEditKpi,
  onDeleteKpi,
  currentUserId,
}) => {
  const { isCreator } = useKpiUserRole(header);

  

  return (
    <div className={styles.headerSection}>
      <div className={styles.headerTitleContainer}>
        <h2 className={styles.headerTitle}>{header.name}</h2>

        <div className={styles.headerActions}>
          {/* Show edit/delete buttons only for creator */}
          {isCreator && (
            <>
              <button
                className={styles.editHeaderButton}
                onClick={() => onEditHeader(header)}
              >
                ✏️ Edit
              </button>
              <button
                className={styles.deleteHeaderButton}
                onClick={() => onDeleteHeader(header._id)}
              >
                🗑️ Delete
              </button>
            </>
          )}
          
          {/* Show create KPI button for everyone */}
          <button
            className={styles.createKpiButton}
            onClick={() => onCreateKpi(header._id)}
          >
            + Create KPI
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <KpiColumns
          header={header}
          kpis={kpis}
          onKpiClick={onKpiClick}
          onEditKpi={onEditKpi}
          onDeleteKpi={onDeleteKpi}
          currentUserId={currentUserId}
        />
      </DragDropContext>
    </div>
  );
};

export default KpiHeader;