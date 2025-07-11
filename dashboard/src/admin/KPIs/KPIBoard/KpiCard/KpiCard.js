// src/components/KPIBoard/KpiCard/KpiCard.js
import React, { memo } from "react";
import KpiCardContent from "./KpiCardContent";
import styles from "./KpiCard.module.css";

const KpiCard = memo(
  ({
    kpi,
    index,
    onKpiClick,
    onEditKpi,
    onDeleteKpi,
    isUserView = false,
    disableDrag = false,
  }) => {
    // Permissions from KPI data
    const { isCreator, isAssignedUser } = kpi;
    

    return (
      <div
        className={styles.kpiCardWrapper}
        // Now clickable in user view:
        onClick={() => onKpiClick?.(kpi)}
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          opacity: disableDrag ? 0.8 : 1,
        }}
      >
        <KpiCardContent
          kpi={kpi}
          isCreator={isCreator}
          isAssignedUser={isAssignedUser}
          isUserView={isUserView}
          onEditKpi={onEditKpi}
          onDeleteKpi={onDeleteKpi}
        />
      </div>
    );
  }
);

export default KpiCard;
