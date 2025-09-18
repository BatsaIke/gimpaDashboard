import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { DragDropContext } from "react-beautiful-dnd";
import { motion, AnimatePresence } from "framer-motion";
import {
  fetchUserKpis,
  updateKpiStatusOnly,
} from "../../../../actions/kpiActions";
import KpiBoardHeader from "../kpiMainBoard/KpiBoardHeader";
import KpiDetailModal from "../KPIDetails/KpiDetailModal/KpiDetailModal";
import styles from "./UserKpiBoard.module.css";
import { fetchKpiHeaders } from "../../../../actions/kpiHeaderActions";

const UserKpiBoard = () => {
  const dispatch = useDispatch();
  const { userId, username } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedKpi, setSelectedKpi] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { userKpis = {}, loading: kpisLoading } = useSelector(
    (state) => state.kpis
  );
  const { items: headers = [], loading: headersLoading } = useSelector(
    (state) => state.kpiHeaders
  );
  const kpis = userKpis[userId] || [];

  useEffect(() => {
    const handleSidebarToggle = (event) => {
      setIsSidebarCollapsed(event.detail.isCollapsed);
    };
    window.addEventListener("sidebarToggle", handleSidebarToggle);
    return () => window.removeEventListener("sidebarToggle", handleSidebarToggle);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          dispatch(fetchUserKpis(userId)),
          dispatch(fetchKpiHeaders(userId)),
        ]);
      } catch (err) {
        setError("Failed to load user KPIs.");
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchData();
  }, [dispatch, userId]);

  const handleDragEnd = async (result) => {
    const dest = result?.destination;
    if (!dest) return;

    const newStatus = dest.droppableId;
    const kpiToUpdate = kpis.find((k) => k._id === result.draggableId);
    if (!kpiToUpdate) return;

    try {
      await dispatch(
        updateKpiStatusOnly(kpiToUpdate._id, {
          status: newStatus,
          assigneeId: userId,        // scope to the viewed user
          promoteGlobally: false,    // do NOT overwrite global on user boards
        })
      );
      dispatch(fetchUserKpis(userId));
    } catch (e) {
      // handled by action
    }
  };

  const handleKpiClick = (kpi) => {
    setSelectedKpi(kpi);
    setIsDetailOpen(true);
  };

  if (loading)
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );

  return (
    <motion.div
      className={styles.kpiBoard}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        marginLeft: isSidebarCollapsed ? "70px" : "200px",
        width: isSidebarCollapsed ? "calc(100vw - 70px)" : "calc(100vw - 200px)",
      }}
    >
      <div className={styles.header}>
        <motion.h1
          className={styles.title}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Viewing KPIs for{" "}
          <span className={styles.usernameHighlight}>{username}</span>
        </motion.h1>
      </div>

      {error ? (
        <motion.div
          className={styles.errorContainer}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {error}
        </motion.div>
      ) : !userId || kpis.length === 0 ? (
        <motion.div className={styles.emptyState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className={styles.emptyIllustration} />
          <h3>No KPIs found</h3>
          <p>This user doesn't have any KPIs assigned yet</p>
        </motion.div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <KpiBoardHeader
            headers={headers}
            kpis={kpis}
            currentUserId={userId}
            headersLoading={headersLoading}
            kpisLoading={kpisLoading}
            isUserView={true}
            onKpiClick={handleKpiClick}
          />
        </DragDropContext>
      )}

      <AnimatePresence>
        {isDetailOpen && selectedKpi && (
          <KpiDetailModal
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            kpi={selectedKpi}
            isUserView={true}
            isCreator={false}
            isAssignedUser={true}
            viewedUserId={userId}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserKpiBoard;
