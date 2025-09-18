import React, { useMemo } from "react";
import styles from "./ProfilePage.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSitemap } from "@fortawesome/free-solid-svg-icons";

const DepartmentsCard = ({ title, departments, allDepartments }) => {
  const presentIds = useMemo(
    () => new Set(allDepartments.map((d) => String(d._id))),
    [allDepartments]
  );
  const isChildInScope = (dep) =>
    dep?.parent && presentIds.has(String(dep.parent));

  return (
    <section className={`${styles.card} ${styles.glass}`}>
      <h2 className={styles.cardTitle}>
        <FontAwesomeIcon icon={faSitemap} /> {title}
      </h2>
      {(!departments || departments.length === 0) ? (
        <div className={styles.empty}>No departments found in your scope.</div>
      ) : (
        <ul className={styles.deptList}>
          {departments.map((d) => (
            <li
              key={String(d?._id || d?.id || d?.name)}
              className={styles.deptItem}
            >
              <span className={styles.deptName}>
                {d?.name || "Unnamed Department"}
              </span>
              <span className={styles.deptTag}>
                {isChildInScope(d) ? "child" : "root"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default DepartmentsCard;
