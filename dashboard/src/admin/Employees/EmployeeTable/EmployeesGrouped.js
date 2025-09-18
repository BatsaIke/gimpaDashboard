// src/components/EmployeeTable/EmployeesGrouped.jsx
import React, { useMemo, useState, useId } from "react";
import styles from "./EmployeesGrouped.module.css";
import EmployeeCard from "./EmployeeCard";

const Section = ({ title, count, children, defaultOpen = false, depth = 0 }) => {
  const [open, setOpen] = useState(defaultOpen);
  const uid = useId();
  const contentId = `sec-${uid}`;
  const headerId = `${contentId}-header`;

  return (
    <section
      className={styles.section}
      style={{ "--depth": depth }}
      aria-labelledby={headerId}
    >
      <button
        id={headerId}
        type="button"
        className={styles.sectionHeader}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={contentId}
      >
        <div className={styles.headerLeft}>
          <span className={`${styles.chev} ${open ? styles.chevOpen : ""}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <h3 className={styles.title}>{title}</h3>
        </div>
        <span className={styles.countBadge}>{count}</span>
      </button>

      <div
        id={contentId}
        className={`${styles.sectionBody} ${open ? styles.open : ""}`}
        hidden={!open}
        role="region"
        aria-labelledby={headerId}
      >
        <div className={styles.sectionBodyInner}>{children}</div>
      </div>
    </section>
  );
};

export default function EmployeesGrouped({
  employees = [],
  departments = [],
  onEdit,
  onDelete,
  onResetPassword,
  onView,
}) {
  // Map of deptId -> dept
  const deptById = useMemo(() => {
    const m = new Map();
    for (const d of departments) m.set(String(d._id), { ...d, parent: d.parent || null });
    return m;
  }, [departments]);

  // Normalize employee._dep using departments map (string id or populated object)
  const norm = useMemo(() => {
    return employees.map((e) => {
      const d = e?.department;
      if (!d) return { ...e, _dep: null };
      if (typeof d === "object" && d._id) {
        const full =
          deptById.get(String(d._id)) ||
          { _id: String(d._id), name: d.name || String(d._id), parent: d.parent || null };
        return { ...e, _dep: full };
      }
      const id = String(d);
      const full = deptById.get(id) || { _id: id, name: id, parent: null };
      return { ...e, _dep: full };
    });
  }, [employees, deptById]);

  // Build tree: parentId -> children[]
  const childrenOf = useMemo(() => {
    const map = new Map(); // id -> child array
    for (const d of departments) map.set(String(d._id), []);
    for (const d of departments) {
      const pid = d.parent ? String(d.parent) : null;
      if (pid && map.has(pid)) map.get(pid).push(d);
    }
    for (const arr of map.values()) arr.sort((a, b) => a.name.localeCompare(b.name));
    return map;
  }, [departments]);

  // Roots = depts whose parent is not present in the scoped list
  const presentIds = useMemo(() => new Set(departments.map((d) => String(d._id))), [departments]);
  const roots = useMemo(() => {
    return departments
      .filter((d) => !(d.parent && presentIds.has(String(d.parent))))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [departments, presentIds]);

  // Index employees by exact department id (null for top level)
  const empsByDept = useMemo(() => {
    const map = new Map(); // key: id or 'null'
    const push = (key, e) => {
      const k = key ?? "null";
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(e);
    };
    for (const e of norm) {
      if (e._dep && e._dep._id) push(String(e._dep._id), e);
      else push(null, e);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => (a.username || "").localeCompare(b.username || ""));
    }
    return map;
  }, [norm]);

  const renderCards = (list = []) =>
    list.length === 0 ? (
      <div className={styles.emptySmall}>No employees in this department</div>
    ) : (
      <div className={styles.cardGrid}>
        {list.map((employee) => (
          <EmployeeCard
            key={employee._id}
            employee={employee}
            onEdit={onEdit}
            onDelete={onDelete}
            onResetPassword={onResetPassword}
            onView={onView}
          />
        ))}
      </div>
    );

  // Recursive renderer for a department node
  const DepartmentNode = ({ dept, depth = 0 }) => {
    const id = String(dept._id);
    const myEmployees = empsByDept.get(id) || [];
    const kids = childrenOf.get(id) || [];

    return (
      <Section title={dept.name} count={myEmployees.length} defaultOpen={false} depth={depth}>
        {renderCards(myEmployees)}
        <div className={styles.childrenWrap}>
          {kids.map((child) => (
            <DepartmentNode key={String(child._id)} dept={child} depth={depth + 1} />
          ))}
        </div>
      </Section>
    );
  };

  const topLevelEmps = empsByDept.get("null") || [];

  return (
    <div className={styles.container}>
      <Section
        title="Top level (no department)"
        count={topLevelEmps.length}
        defaultOpen={false}
        depth={0}
      >
        {renderCards(topLevelEmps)}
      </Section>

      {roots.map((root) => (
        <DepartmentNode key={String(root._id)} dept={root} depth={0} />
      ))}
    </div>
  );
}
