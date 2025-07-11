import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from "./ReportsPage.module.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { fetchReports } from "../../actions/reportActions";
import { CSVLink } from "react-csv";
import Spinner from "../../UI/Spinner"; // Import the Spinner component

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function ReportsPage() {
  const dispatch = useDispatch();
  const { reports, loading } = useSelector((state) => state.reports);
  const [filter, setFilter] = useState("All"); // State to handle dropdown filter

  useEffect(() => {
    // Fetch report data on page load
    dispatch(fetchReports());
  }, [dispatch]);

  // Display spinner during loading
  if (loading) {
    return <Spinner />;
  }

  // Report data
  const totalOrders = reports.totalOrders || 0;
  const totalCustomers = reports.totalCustomers || 0;
  const successfulOrders = reports.successfulOrders || 0;
  const totalSales = reports.totalSales || 0;
  const salesData = reports.salesData || [];

  // Filtered sales data based on dropdown selection
  const filteredSalesData = salesData.filter((item) => {
    if (filter === "All") return true;
    if (filter === "High Sales") return item.sales > 50; // Example condition
    if (filter === "Low Sales") return item.sales <= 50; // Example condition
    return true;
  });

  // Chart data
  const chartData = {
    labels: filteredSalesData.map((item) => item.name),
    datasets: [
      {
        label: "Sales",
        data: filteredSalesData.map((item) => item.sales),
        backgroundColor: "#0dd983",
        borderColor: "#0bb773",
        borderWidth: 1,
      },
    ],
  };

  // CSV Data for Export
  const csvData = [
    ["Product Name", "Sales"],
    ...filteredSalesData.map((item) => [item.name, item.sales]),
  ];

  return (
    <div className={styles.reportsContainer}>
      {/* Header Section */}
      <div className={styles.headerContainer}>
        <h2 className={styles.pageTitle}>Reports</h2>
        <div className={styles.filterExportContainer}>
          {/* Filter Dropdown */}
          <select
            className={styles.filterInput}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="High Sales">High Sales</option>
            <option value="Low Sales">Low Sales</option>
          </select>
          {/* Export Button */}
          <CSVLink data={csvData} filename="reports.csv" className={styles.exportButton}>
            Export to CSV
          </CSVLink>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.iconTextContainer}>
            <i className="fas fa-shopping-cart"></i>
            <span className={styles.statTitle}>Total Orders</span>
          </div>
          <span className={styles.statValue}>{totalOrders}</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconTextContainer}>
            <i className="fas fa-users"></i>
            <span className={styles.statTitle}>Total Customers</span>
          </div>
          <span className={styles.statValue}>{totalCustomers}</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconTextContainer}>
            <i className="fas fa-check-circle"></i>
            <span className={styles.statTitle}>Successful Orders</span>
          </div>
          <span className={styles.statValue}>{successfulOrders}</span>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconTextContainer}>
            <i className="fas fa-dollar-sign"></i>
            <span className={styles.statTitle}>Sales</span>
          </div>
          <span className={styles.statValue}>GHS {totalSales}</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className={styles.chartContainer}>
        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
}

export default ReportsPage;
