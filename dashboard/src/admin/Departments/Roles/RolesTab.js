import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDeptRoles } from "../../../actions/departmentRolesActions";
import RoleList from "./RoleList";
import styles from "./RolesTab.module.css";

const RolesTab = ({ departments = [], onAddRoleClick, initialDeptId }) => {
  const dispatch = useDispatch();
  const [deptId, setDeptId] = useState(initialDeptId || departments[0]?._id || "");

  useEffect(() => {
    if (initialDeptId && initialDeptId !== deptId) {
      setDeptId(initialDeptId);
    }
  }, [initialDeptId, deptId]);

  useEffect(() => {
    if (!deptId && departments?.length && departments[0]?._id) {
      setDeptId(departments[0]._id);
    }
  }, [departments, deptId]);

  const rolesState = useSelector((s) => s.departmentRoles || {});

  // FIX 1: Wrap 'perDept' in useMemo to stabilize its reference
  const perDept = useMemo(() =>
    rolesState?.rolesByDept?.[deptId] || {},
    [rolesState?.rolesByDept, deptId]
  );

  const loading = !!(perDept.loading || rolesState.loading);
  const error = perDept.error || rolesState.error || null;

  const roles = useMemo(() => {
    if (Array.isArray(perDept.items)) return perDept.items;
    return [];
  }, [perDept]);

  const doFetch = useCallback(async () => {
    if (!deptId) {
      console.log("[RolesTab] skip fetch, deptId empty");
      return;
    }
    // FIX 2: Removed the unused 'res' variable
    await dispatch(fetchDeptRoles(deptId));
  }, [dispatch, deptId]);

  useEffect(() => {
    doFetch();
  }, [doFetch]);

  return (
    <div className={styles.rolesTabWrap}>
      <div className={styles.controls}>
        <div className={styles.filterBox}>
          <select
            className={styles.filterSelect}
            value={deptId}
            onChange={(e) => setDeptId(e.target.value)}
          >
            <option value="">— choose department —</option>
            {departments
              .slice()
              .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")))
              .map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} {d.category ? `(${d.category})` : ""}
                </option>
              ))}
          </select>
        </div>

        <div className={styles.buttonRow}>
          <button
            type="button"
            className={styles.addRoleButton}
            onClick={() => deptId && onAddRoleClick?.(deptId)}
            disabled={!deptId}
            title={!deptId ? "Select a department first" : "Add Role to selected department"}
          >
            Add Role
          </button>
          <button
            type="button"
            className={styles.addButton}
            onClick={doFetch}
            disabled={!deptId || loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && <div className={styles.errorBox}>{String(error)}</div>}

      <RoleList
        roles={roles}
        loading={loading}
        emptyHint={deptId ? "No roles yet." : "Pick a department to view roles."}
      />
    </div>
  );
};

export default RolesTab;