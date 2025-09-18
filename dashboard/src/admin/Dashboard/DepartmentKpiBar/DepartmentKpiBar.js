import React from "react";
import styles from "./DepartmentKpiBar.module.css";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  Cell,
} from "recharts";

const DepartmentKpiBar = ({ data = [] }) => {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Department Completion %</h3>
      <div className={styles.chartBox}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => [`${v}%`, "Completion"]} />
            
            {/* ✅ Fixed Bar colors */}
            <Bar dataKey="completion" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.completion >= 80
                      ? "#16a34a" // green
                      : entry.completion >= 50
                      ? "#facc15" // yellow
                      : "#ef4444" // red
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DepartmentKpiBar;
