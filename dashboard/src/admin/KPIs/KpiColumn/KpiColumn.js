// src/components/KpiColumn/KpiColumn.js
import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import KpiCard from "../KPIBoard/KpiCard/KpiCard";
import styles from "./KpiColumn.module.css";

const KpiColumn = ({
  status,
  kpis,
  onKpiClick,
  onEditKpi,
  onDeleteKpi,
  isUserView = false,
}) => {
  return (
    <div className={styles.column}>
      <h2 className={styles.columnTitle}>{status}</h2>

      <Droppable droppableId={status}>
        {(provided) => (
          <div
            className={styles.kpiList}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {kpis.map((kpi, index) => (
              <Draggable
                key={kpi._id}
                draggableId={kpi._id}
                index={index}
                // If in user view, disable dragging
                isDragDisabled={isUserView}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <KpiCard
                      kpi={kpi}
                      index={index}
                      onKpiClick={onKpiClick}
                      onEditKpi={onEditKpi}
                      onDeleteKpi={onDeleteKpi}
                      isUserView={isUserView}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {/* Required placeholder to reserve space while dragging */}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KpiColumn;
