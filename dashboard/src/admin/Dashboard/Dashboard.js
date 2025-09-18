import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays as faCalendarAlt,
  faTasks, faCheckCircle, faClock,
  faTriangleExclamation as faExclamationTriangle, faUsers,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./Dashboard.module.css";
import StatCard from "./StatCard/StatCard";
import KpiProgress from "./KpiProgress/KpiProgress";
import RecentActivity from "./RecentActivity/RecentActivity";
import DepartmentStatus from "./DepartmentStatus/DepartmentStatus";

// NEW charts
import KpiStatusPie from "./KpiStatusPie/KpiStatusPie";
import DepartmentKpiBar from "./DepartmentKpiBar/DepartmentKpiBar";
import WeeklyProgressLine from "./WeeklyProgressLine/WeeklyProgressLine";

// match your global Sidebar.module.css widths
const SIDEBAR_W = 200;
const SIDEBAR_W_COLLAPSED = 70;

const Dashboard = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const onToggle = (e) => setIsSidebarCollapsed(Boolean(e.detail?.isCollapsed));
    window.addEventListener("sidebarToggle", onToggle);
    return () => window.removeEventListener("sidebarToggle", onToggle);
  }, []);

  const leftSpace = isSidebarCollapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  // ----- Demo / placeholder data (replace with API aggregates later) -----
  const totalKpis = 42;
  const completed = 28;
  const inProgress = 9;
  const approved = 3;
  const pending = Math.max(0, totalKpis - (completed + inProgress + approved));

  const stats = useMemo(() => [
    { title: "Total KPIs", value: String(totalKpis), change: 12, icon: faTasks, color: "#002F5F" },
    { title: "Completed", value: String(completed), change: 8, icon: faCheckCircle, color: "#2CA85C" },
    { title: "In Progress", value: String(inProgress), change: -3, icon: faClock, color: "#FF9800" },
    { title: "Discrepancies", value: "5", change: 2, icon: faExclamationTriangle, color: "#F44336" },
  ], [totalKpis, completed, inProgress]); // Dependencies added in case these values change

  const kpis = useMemo(() => [
    { title: "Student Enrollment", progress: 75, target: 80, status: "warning" },
    { title: "Faculty Development", progress: 90, target: 85, status: "completed" },
    { title: "Research Publications", progress: 60, target: 75, status: "warning" },
    { title: "Community Outreach", progress: 45, target: 70, status: "pending" },
  ], []);

  const activities = useMemo(() => [
    { icon: faCheckCircle, description: 'KPI "Faculty Training" marked as completed', time: "2 hours ago" },
    { icon: faExclamationTriangle, description: "Discrepancy reported in Research Metrics", time: "5 hours ago" },
    { icon: faUsers, description: "New staff member added to Science Department", time: "1 day ago" },
    { icon: faTasks, description: "Quarterly review meeting scheduled", time: "2 days ago" },
  ], []);

  // FIX: Wrapped the 'departments' array in useMemo to prevent it from being
  // recreated on every render, which stabilizes its reference for other hooks.
  const departments = useMemo(() => [
    { name: "Science", completed: 12, total: 15, performance: 80 },
    { name: "Arts", completed: 8, total: 12, performance: 67 },
    { name: "Engineering", completed: 10, total: 14, performance: 71 },
    { name: "Business", completed: 14, total: 16, performance: 88 },
  ], []);

  // ----- Chart transforms -----
  const statusPieData = useMemo(
    () => [
      { name: "Completed", value: completed },
      { name: "In Progress", value: inProgress },
      { name: "Approved", value: approved },
      { name: "Pending", value: pending },
    ],
    [completed, inProgress, approved, pending]
  );

  const deptBarData = useMemo(
    () =>
      departments.map((d) => ({
        name: d.name,
        completion: Math.round((d.completed / d.total) * 100),
      })),
    [departments] // Now this dependency is stable
  );

  const weeklyTrend = useMemo(
    () => [
      { day: "Mon", completed: 2 },
      { day: "Tue", completed: 3 },
      { day: "Wed", completed: 1 },
      { day: "Thu", completed: 4 },
      { day: "Fri", completed: 5 },
      { day: "Sat", completed: 2 },
      { day: "Sun", completed: 0 },
    ],
    []
  );

  return (
    <div
      className={styles.dashboard}
      style={{ marginLeft: leftSpace, width: `calc(100vw - ${leftSpace}px)` }}
    >
      <div className={styles.mainContent}>
        <div className={styles.contentArea}>
          <div className={styles.pageHeader}>
            <h1>Dashboard Overview</h1>
            <div className={styles.dateFilter}>
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>Last 7 days</span>
            </div>
          </div>

          {/* KPI cards */}
          <div className={styles.statsGrid}>
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </div>

          {/* Fancy charts row */}
          <div className={styles.chartsGrid}>
            <div className={styles.card}>
              <KpiStatusPie data={statusPieData} />
            </div>
            <div className={styles.card}>
              <DepartmentKpiBar data={deptBarData} />
            </div>
            <div className={styles.card}>
              <WeeklyProgressLine data={weeklyTrend} />
            </div>
          </div>

          {/* Existing blocks */}
          <div className={styles.dashboardGrid}>
            <div className={styles.gridColumn}>
              <div className={styles.card}>
                <h3>KPI Progress</h3>
                <div className={styles.kpiList}>
                  {kpis.map((kpi, i) => (
                    <KpiProgress key={i} {...kpi} />
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.gridColumn}>
              <div className={styles.card}>
                <RecentActivity activities={activities} />
              </div>

              <div className={styles.card}>
                <DepartmentStatus departments={departments} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;