import React, { useEffect, useMemo, useState } from "react";
import styles from "./EmployeeFormFields.module.css";
import { fetchDepartmentsForCreateUser } from "../../../actions/departmentsActions";

// helper: accept ObjectId, string, or populated doc { _id }


const DepartmentsSelector = ({
  formData,
  onChange,
  loading,
  editMode,
  parentDepartmentId,
  sortedDepartments,
  isChildInScope,
  dispatch,
}) => {
  // Create mode: load levelRows (roots OR parent + descendants)
  const [levelRows, setLevelRows] = useState([]); // [{ _id, name, parent, selectable }]
  const [loadingLevel, setLoadingLevel] = useState(false);
  const [levelErr, setLevelErr] = useState(null);

  // quick filter
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (editMode) return; // only for create mode
    let alive = true;
    (async () => {
      setLoadingLevel(true);
      setLevelErr(null);
      const res = await dispatch(
        fetchDepartmentsForCreateUser({ parent: parentDepartmentId ?? null })
      );
      if (!alive) return;
      if (res?.success) {
        setLevelRows(Array.isArray(res.data) ? res.data : []);
      } else {
        setLevelErr(res?.error || "Failed to load departments");
        setLevelRows([]);
      }
      setLoadingLevel(false);
    })();
    return () => {
      alive = false;
    };
  }, [dispatch, editMode, parentDepartmentId]);

  const listToRender = editMode ? sortedDepartments : levelRows;

  // filter by query (case-insensitive)
  const filtered = useMemo(() => {
    if (!query.trim()) return listToRender;
    const q = query.trim().toLowerCase();
    return listToRender.filter((d) => d.name?.toLowerCase().includes(q));
  }, [listToRender, query]);

  const depIds = formData.departmentIds || [];
  const isChecked = (id) => depIds.includes(String(id));

  const toggleDept = (id) => {
    const idStr = String(id);
    const next = new Set(depIds.map(String));
    next.has(idStr) ? next.delete(idStr) : next.add(idStr);
    onChange("departmentIds", Array.from(next));
  };

  const selectAll = () =>
    onChange("departmentIds", filtered.map((d) => String(d._id)));
  const clearAll = () => onChange("departmentIds", []);

  const tagFor = (node) => {
    if (editMode) return isChildInScope(node) ? "child" : "root";
    if (!parentDepartmentId) return "root"; // top-level create
    return String(node._id) === String(parentDepartmentId) ? "department" : "child";
  };

  const listState = (() => {
    if (editMode) {
      if (listToRender.length === 0)
        return <div className={styles.emptyHint}>No departments available</div>;
    } else {
      if (loadingLevel) return <div className={styles.emptyHint}>Loading departments…</div>;
      if (levelErr) return <div className={styles.error}>{levelErr}</div>;
      if (listToRender.length === 0)
        return <div className={styles.emptyHint}>No departments at this level</div>;
    }

    if (filtered.length === 0)
      return <div className={styles.emptyHint}>No matches for “{query}”</div>;

    return filtered.map((node) => (
      <label key={node._id} className={styles.checkboxItem}>
        <input
          type="checkbox"
          checked={isChecked(node._id)}
          onChange={() => toggleDept(node._id)}
          disabled={loading || node.selectable === false}
        />
        <span className={styles.checkboxText}>
          {node.name}
          <span className={styles.deptTag}>{tagFor(node)}</span>
          {node.selectable === false && (
            <em className={styles.dim}>&nbsp;• no permission</em>
          )}
        </span>
      </label>
    ));
  })();

  const total = listToRender.length;
  const shown = filtered.length;
  const selectedCount = depIds.length;

  return (
    <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
      <label className={styles.label}>Department(s)</label>

      {/* Sticky toolbar */}
      <div className={`${styles.checkboxToolbar} ${styles.toolbarSticky}`}>
        <div className={styles.toolbarLeft}>
          <button
            type="button"
            className={styles.smallBtn}
            onClick={selectAll}
            disabled={
              loading ||
              shown === 0 ||
              (!editMode && loadingLevel)
            }
          >
            Select All ({shown})
          </button>
          <button
            type="button"
            className={styles.smallBtnSecondary}
            onClick={clearAll}
            disabled={loading || selectedCount === 0}
          >
            Clear {selectedCount ? `(${selectedCount})` : ""}
          </button>
        </div>

        <div className={styles.toolbarRight}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter ${total || ""} departments…`}
            className={styles.searchInput}
            aria-label="Filter departments"
          />
        </div>
      </div>

      <div className={`${styles.checkboxList} ${styles.checkboxListGrid}`}>
        {listState}
      </div>

      <small className={styles.hint}>
        Top level shows only main departments. Opening from a department shows that
        department and <b>all its descendants</b> (children & grandchildren).
      </small>
    </div>
  );
};

export default DepartmentsSelector;
