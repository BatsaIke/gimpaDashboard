import React from "react";
import styles from "./ProfilePage.module.css";

const ListCard = ({ title, emptyMsg, items, wide = false, showTag = true }) => {
  const SectionTag = wide ? "section" : "section";
  const sectionClass = wide ? `${styles.cardWide} ${styles.glass}` : `${styles.card} ${styles.glass}`;

  return (
    <SectionTag className={sectionClass}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {(!items || items.length === 0) ? (
        <div className={styles.empty}>{emptyMsg}</div>
      ) : (
        <ul className={styles.deptList}>
          {items.map((d) => (
            <li key={String(d._id)} className={styles.deptItem}>
              <span className={styles.deptName}>{d.name}</span>
              {showTag && (
                <span className={styles.deptTag}>{d.parent ? "child" : "root"}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionTag>
  );
};

export default ListCard;
