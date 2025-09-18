// src/components/KPIBoard/KpiBoard/KpiBoard.js
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext } from "react-beautiful-dnd";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus } from "react-icons/fi";

import KpiBoardHeader from "./KpiBoardHeader";
import KpiBoardModals from "./KpiBoardModals";
import KpiSearchBar from "../KpiSearchBar/KpiSearchBar";          // 🆕
import EmptyKpiState from "../KpiCard/EmptyKpiState";

import styles from "./KpiBoard.module.css";

import { fetchKpiHeaders } from "../../../../actions/kpiHeaderActions";
import {
  handleDragEnd,
  onEditHeader,
  onDeleteHeader,
  onEditKpi,
  onDeleteKpi,
} from "../../../../utils/KpiBoardUtils";

const KpiBoard = () => {
  const dispatch = useDispatch();

  /* ─────────────── Redux state ─────────────── */
  const { items: headers = [], loading: headersLoading } = useSelector(
    (state) => state.kpiHeaders
  );
  const currentUserId = useSelector((state) => state.auth.user?._id);

  /* ─────────────── Academic year (unchanged) ─────────────── */
  const firstKpiWithYear = headers
    .flatMap((h) => h.kpis || [])
    .find((k) => k.academicYear);
  const academicYear = firstKpiWithYear?.academicYear || "N/A";

  /* ─────────────── Local UI state ─────────────── */
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedHeaderId, setSelectedHeaderId] = useState(null);
  const [selectedKpi, setSelectedKpi] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateHeaderModalOpen, setCreateHeaderModalOpen] = useState(false);
  const [isEditHeaderModalOpen, setEditHeaderModalOpen] = useState(false);
  const [headerBeingEdited, setHeaderBeingEdited] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  /* ─────────────── Search ─────────────── */
  const [searchTerm, setSearchTerm] = useState("");
  const searchLower = searchTerm.trim().toLowerCase();

  /** Filter headers & KPIs client-side */
  const filteredHeaders = useMemo(() => {
    if (!searchLower) return headers;

    return headers
      .map((h) => {
        const headerMatch = h.name.toLowerCase().includes(searchLower);
        if (headerMatch) return h; // keep full header

        // otherwise filter its KPIs
        const filteredKpis = (h.kpis || []).filter((k) =>
          k.name?.toLowerCase().includes(searchLower)
        );
        return { ...h, kpis: filteredKpis };
      })
      .filter((h) => (h.kpis || []).length); // drop empty
  }, [headers, searchLower]);

  /* ─────────────── Effects ─────────────── */
  useEffect(() => {
    dispatch(fetchKpiHeaders());

    const handleSidebarToggle = (e) => setIsSidebarCollapsed(e.detail.isCollapsed);
    window.addEventListener("sidebarToggle", handleSidebarToggle);
    return () => window.removeEventListener("sidebarToggle", handleSidebarToggle);
  }, [dispatch]);

  /* ─────────────── Handlers ─────────────── */
  const handleKpiClick = (kpi) => {
    setSelectedKpi({ ...kpi, isCreator: kpi.isCreator, isAssignedUser: kpi.isAssignedUser });
    setIsDetailOpen(true);
  };

  /* ─────────────── Render ─────────────── */
  return (
    <motion.div
      className={`${styles.kpiBoard} ${isSidebarCollapsed ? styles.sidebarCollapsed : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Board header */}
      <motion.div className={`${styles.header} ${styles.headerGrid}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className={styles.title}>KPI Management Board</h1>
  <h1 className={styles.academicYear}>Academic Year: {academicYear}</h1>
  <KpiSearchBar value={searchTerm} onChange={setSearchTerm} />

        <motion.button
          className={styles.createButton}
          onClick={() => setCreateHeaderModalOpen(true)}
          whileHover={{ scale: 1.05, boxShadow: "0 4px 12px rgba(44, 168, 92, 0.3)" }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus size={18} />
          <span>Create KPI Header</span>
        </motion.button>
      </motion.div>

      {/* Main content */}
      {headersLoading ? (
        <motion.div className={styles.loadingState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className={styles.spinner} />
          <p>Loading KPI data...</p>
        </motion.div>
      ) : headers.length === 0 ? (
        <EmptyKpiState onCreateClick={() => setCreateHeaderModalOpen(true)} />
      ) : (
        <DragDropContext
          onDragEnd={(result) => handleDragEnd(result, headers, dispatch, currentUserId)}
        >
          <KpiBoardHeader
            headers={filteredHeaders}          /* 🆕 display filtered */
            currentUserId={currentUserId}
            setSelectedHeaderId={setSelectedHeaderId}
            setModalOpen={setModalOpen}
            setSelectedKpi={setSelectedKpi}
            setIsDetailOpen={setIsDetailOpen}
            headersLoading={headersLoading}
            onEditHeader={(header) =>
              onEditHeader(header, setHeaderBeingEdited, setEditHeaderModalOpen)
            }
            onDeleteHeader={(headerId) => onDeleteHeader(headerId, headers, dispatch)}
            onEditKpi={(kpi) => onEditKpi(kpi, setSelectedKpi, setIsDetailOpen)}
            onDeleteKpi={(kpiId) => onDeleteKpi(kpiId, headers, dispatch)}
            onKpiClick={handleKpiClick}
            isSidebarCollapsed={isSidebarCollapsed}
          />
        </DragDropContext>
      )}

      {/* Modals */}
      <AnimatePresence>
        <KpiBoardModals
          isModalOpen={isModalOpen}
          setModalOpen={setModalOpen}
          selectedHeaderId={selectedHeaderId}
          isDetailOpen={isDetailOpen}
          setIsDetailOpen={setIsDetailOpen}
          selectedKpi={selectedKpi}
          isCreateHeaderModalOpen={isCreateHeaderModalOpen}
          setCreateHeaderModalOpen={setCreateHeaderModalOpen}
          isEditHeaderModalOpen={isEditHeaderModalOpen}
          setEditHeaderModalOpen={setEditHeaderModalOpen}
          headerBeingEdited={headerBeingEdited}
          setHeaderBeingEdited={setHeaderBeingEdited}
          isCreator={selectedKpi?.isCreator}
          isAssignedUser={selectedKpi?.isAssignedUser}
        />
      </AnimatePresence>
    </motion.div>
  );
};

export default KpiBoard;
