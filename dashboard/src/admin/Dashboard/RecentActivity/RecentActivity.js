import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./RecentActivity.module.css";

const RecentActivity = ({ activities }) => {
  return (
    <div className={styles.recentActivity}>
      <h3 className={styles.title}>Recent Activity</h3>

      <div className={styles.activityList}>
        {activities.map((activity, index) => (
          <div key={index} className={styles.activityItem}>
            <div className={styles.activityIcon}>
              <FontAwesomeIcon icon={activity.icon} />
            </div>

            <div className={styles.activityContent}>
              <p className={styles.activityText}>{activity.description}</p>
              <span className={styles.activityTime}>{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
