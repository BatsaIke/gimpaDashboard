import React from "react";
import styles from "./KpiStatusPie.module.css";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#2CA85C", "#FF9800", "#607D8B", "#002F5F"]; // Completed, In Progress, Approved, Pending

const KpiStatusPie = ({ data = [] }) => {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Status Breakdown</h3>
      <div className={styles.chartBox}>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={24} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default KpiStatusPie;
