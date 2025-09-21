import React from "react";
import { motion } from "framer-motion";
import styles from "./RolesList.module.css";

const RoleList = ({ roles = [], loading = false, emptyHint = "No roles." }) => {
  if (!loading && roles.length === 0) {
    return <div className={styles.empty}>{emptyHint}</div>;
  }

  const items = loading ? Array.from({ length: 4 }).map((_, i) => ({ _id: `s-${i}`, name: "…" })) : roles;

  return (
    <div className={styles.grid}>
      {items.map((role) => {
        const uname = role?.name || "Role";
        const initial = String(uname).charAt(0).toUpperCase();

        return (
          <motion.div
            key={role._id}
            className={styles.card}
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.avatar}>{initial}</div>
              <div className={styles.titleContainer}>
                <h3 title={uname}>{uname}</h3>
                <span className={styles.roleBadge}>
                  {role?.reportsTo?.name ? `Reports: ${role.reportsTo.name}` : "—"}
                </span>
              </div>
            </div>

            {role?.description && (
              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <span className={styles.preview} title={role.description}>
                    {role.description}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default RoleList;
