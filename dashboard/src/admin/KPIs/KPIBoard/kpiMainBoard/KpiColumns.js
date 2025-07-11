// src/components/KPIBoard/KpiColumns/KpiColumns.js
import React from "react";
import KpiColumn from "../../KpiColumn/KpiColumn";
import styles from "./KpiBoard.module.css";

const KpiColumns = ({
  header,
  kpis,
  currentUserId,
  onKpiClick,
  onEditKpi,
  onDeleteKpi,
  isUserView = false,
}) => {
  const kpiStatuses = ["Pending", "In Progress", "Completed", "Approved"];

  

  // For each kpi, if there's a user-specific status or deliverables, override
  const displayKpis = kpis.map((k) => {
    const userSpecificStatus =
      k.userSpecific?.statuses?.[currentUserId] || k.status;

    const userSpecificDeliverables =
      k.userSpecific?.deliverables?.[currentUserId] || k.deliverables;

    return {
      ...k,
      status: userSpecificStatus,
      deliverables: userSpecificDeliverables,
    };
  });

  return (
    <div className={styles.columns}>
      {kpiStatuses.map((status) => {
        // Filter to just the KPIs matching this user-specific (or fallback) status
        const filteredKpis = displayKpis.filter(
          (kpi) =>
            String(kpi.header?._id || kpi.header) === String(header._id) &&
            kpi.status === status
        );

        return (
          <KpiColumn
            key={status}
            status={status}
            kpis={filteredKpis}
            onKpiClick={onKpiClick}
            onEditKpi={onEditKpi}
            onDeleteKpi={onDeleteKpi}
            isUserView={isUserView}
          />
        );
      })}
    </div>
  );
};

export default KpiColumns;
