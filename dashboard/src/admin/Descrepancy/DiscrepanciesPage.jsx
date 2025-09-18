import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./DiscrepanciesPage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faFlag } from "@fortawesome/free-solid-svg-icons";

import {
  fetchDiscrepancies,
  bookMeeting,
  resolveDiscrepancy
} from "../../actions/discrepancyActions";

import DiscrepancyTable from "./DiscrepancyTable/DiscrepancyTable";
import DiscrepancyDetailModal from "./DiscrepancyDetailModal/DiscrepancyDetailModal";
import MeetingBookingModal from "./DiscrepancyDetailModal/MeetingBookingModal";
import ResolutionNotesModal from "./DiscrepancyDetailModal/ResolutionNotesModal";

const DiscrepanciesPage = () => {
  const dispatch = useDispatch();
  const { list: discrepancies, loading } = useSelector((state) => state.discrepancies);

  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [kpiFilter, setKpiFilter] = useState("");

  useEffect(() => {
    dispatch(fetchDiscrepancies(kpiFilter));
  }, [dispatch, kpiFilter]);

  const handleViewDetail = (discrepancy) => {
    setSelectedDiscrepancy(discrepancy);
    setIsDetailOpen(true);
  };

  const handleBookMeeting = (discrepancy) => {
    setSelectedDiscrepancy(discrepancy);
    setIsBookingOpen(true);
  };

  const handleResolve = (discrepancy) => {
    if (!discrepancy?.id) return;
    setSelectedDiscrepancy(discrepancy);
    setIsResolutionOpen(true);
  };

  const handleMeetingBooked = async (data) => {
    if (!selectedDiscrepancy?.id) return;
    const success = await dispatch(bookMeeting(selectedDiscrepancy.id, data));
    if (success) {
      setIsBookingOpen(false);
      dispatch(fetchDiscrepancies(kpiFilter));
    }
  };

  const handleResolutionConfirm = async ({ notes, newScore, file }) => {
    if (!selectedDiscrepancy?.id) return;

    try {
      const success = await dispatch(
        resolveDiscrepancy(selectedDiscrepancy.id, {
          resolutionNotes: notes,
          newScore,
          file
        })
      );

      if (success) {
        setIsResolutionOpen(false);
        dispatch(fetchDiscrepancies(kpiFilter));
      }
    } catch (error) {
      console.error("Resolution failed:", error);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        <header className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Discrepancy Management</h1>
            <div className={styles.filterControls}>
              <select
                value={kpiFilter}
                onChange={(e) => setKpiFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">All KPIs</option>
                <option value="kpi1">KPI 1</option>
                <option value="kpi2">KPI 2</option>
              </select>
            </div>
          </div>
        </header>

        <main className={styles.mainContent}>
          {loading ? (
            <div className={styles.loadingState}>
              <FontAwesomeIcon icon={faSpinner} spin />
              <span>Loading discrepancies...</span>
            </div>
          ) : discrepancies.length === 0 ? (
            <div className={styles.emptyState}>
              <FontAwesomeIcon icon={faFlag} className={styles.emptyIcon} />
              <h3>No Discrepancies Found</h3>
              <p>All scores are in agreement</p>
            </div>
          ) : (
            <DiscrepancyTable
              discrepancies={discrepancies}
              onView={handleViewDetail}
              onBookMeeting={handleBookMeeting}
              onResolve={handleResolve}
            />
          )}
        </main>
      </div>

      <DiscrepancyDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        discrepancy={selectedDiscrepancy}
        onBookMeeting={handleBookMeeting}
        onResolve={handleResolve}
      />

      <MeetingBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onConfirm={handleMeetingBooked}
        discrepancy={selectedDiscrepancy}
      />

      <ResolutionNotesModal
        isOpen={isResolutionOpen}
        onClose={() => setIsResolutionOpen(false)}
        onConfirm={handleResolutionConfirm}
        discrepancy={selectedDiscrepancy}
      />
    </div>
  );
};

export default DiscrepanciesPage;
