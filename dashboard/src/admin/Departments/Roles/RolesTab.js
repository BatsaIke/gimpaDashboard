import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDeptRoles } from "../../../actions/departmentRolesActions";
import RoleList from "./RoleList";
import styles from "./RolesTab.module.css";

const RolesTab = ({ departments = [], onAddRoleClick, initialDeptId }) => {
  const dispatch = useDispatch();
  
  // Initialize deptId state - only set from initialDeptId if provided and valid
  const [deptId, setDeptId] = useState(() => {
    if (initialDeptId && typeof initialDeptId === 'string' && initialDeptId.trim() !== '') {
      return initialDeptId;
    }
    if (departments?.length && departments[0]?._id) {
      return departments[0]._id;
    }
    return "";
  });

  // Debug logging to see what's happening
  console.log("🔍 RolesTab - departments:", departments);
  console.log("🔍 RolesTab - initialDeptId:", initialDeptId);
  console.log("🔍 RolesTab - current deptId:", deptId);

  // FIX 1: Simplify department ID initialization - remove conflicting useEffects
  useEffect(() => {
    // Only update deptId if we have a valid initialDeptId and current deptId is empty
    if (initialDeptId && !deptId) {
      setDeptId(initialDeptId);
    }
  }, [initialDeptId]); // Only run when initialDeptId changes

  useEffect(() => {
    // Only set from departments if we have no deptId and departments are available
    if (!deptId && departments?.length && departments[0]?._id) {
      setDeptId(departments[0]._id);
    }
  }, [departments]); // Only run when departments change

  const rolesState = useSelector((s) => s.departmentRoles || {});

  // FIX 2: Stable perDept memoization
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

  // FIX 3: Stable fetch function with error handling
  const doFetch = useCallback(async (targetDeptId = deptId) => {
    const idToFetch = targetDeptId || deptId;
    
    if (!idToFetch) {
      console.log("[RolesTab] skip fetch, deptId empty");
      return;
    }

    console.log("[RolesTab] Fetching roles for department:", idToFetch);
    
    try {
      await dispatch(fetchDeptRoles(idToFetch));
    } catch (error) {
      console.error("[RolesTab] Fetch error:", error);
      // Don't let the error propagate to avoid infinite loops
    }
  }, [dispatch, deptId]);

  // FIX 4: Proper useEffect with correct dependencies - fetch only when deptId is valid and stable
  useEffect(() => {
    if (deptId && deptId.trim() !== "") {
      console.log("[RolesTab] useEffect triggered, fetching roles for:", deptId);
      doFetch(deptId);
    }
  }, [deptId, doFetch]); // Only fetch when deptId changes

  // FIX 5: Handle department selection change
  const handleDeptChange = (e) => {
    const newDeptId = e.target.value;
    console.log("[RolesTab] Department changed to:", newDeptId);
    setDeptId(newDeptId);
    // No need to call doFetch here - the useEffect above will handle it
  };

  // FIX 6: Handle manual refresh
  const handleRefresh = () => {
    if (deptId) {
      console.log("[RolesTab] Manual refresh for department:", deptId);
      doFetch(deptId);
    }
  };

  // FIX 7: Handle add role click
  const handleAddRole = () => {
    if (deptId && onAddRoleClick) {
      onAddRoleClick(deptId);
    }
  };

  // Filter and sort departments for the dropdown
  const sortedDepartments = useMemo(() => {
    return departments
      .slice()
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }, [departments]);

  return (
    <div className={styles.rolesTabWrap}>
      <div className={styles.controls}>
        <div className={styles.filterBox}>
          <select
            className={styles.filterSelect}
            value={deptId}
            onChange={handleDeptChange}
            disabled={sortedDepartments.length === 0}
          >
            <option value="">— choose department —</option>
            {sortedDepartments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} {d.category ? `(${d.category})` : ""}
              </option>
            ))}
          </select>
          {sortedDepartments.length === 0 && (
            <div style={{ fontSize: '12px', color: '#ff6b6b', marginTop: '4px' }}>
              No departments available
            </div>
          )}
        </div>

        <div className={styles.buttonRow}>
          <button
            type="button"
            className={styles.addRoleButton}
            onClick={handleAddRole}
            disabled={!deptId || sortedDepartments.length === 0}
            title={!deptId ? "Select a department first" : "Add Role to selected department"}
          >
            Add Role
          </button>
          <button
            type="button"
            className={styles.addButton}
            onClick={handleRefresh}
            disabled={!deptId || loading || sortedDepartments.length === 0}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.errorBox}>
          Error: {String(error)}
          <button 
            onClick={handleRefresh}
            style={{ marginLeft: '10px', padding: '2px 8px' }}
          >
            Retry
          </button>
        </div>
      )}

      <RoleList
        roles={roles}
        loading={loading}
        emptyHint={
          !deptId ? "Pick a department to view roles." :
          loading ? "Loading roles..." :
          "No roles found for this department."
        }
      />
    </div>
  );
};

export default RolesTab;