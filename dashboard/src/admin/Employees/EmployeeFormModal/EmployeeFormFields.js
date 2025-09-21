import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./EmployeeFormFields.module.css";
import BasicInfoFields from "./BasicInfoFields";
import DepartmentsSelector from "./DepartmentsSelector";
import GovernanceToggle from "./GovernanceToggle";

import { fetchDeptRoles } from "../../../actions/departmentRolesActions";
import {
  selectDeptRoles,
  selectDeptRolesLoading,
} from "../../../redux/slices/departmentRolesSlice";

const idOf = (x) => {
  if (!x) return "";
  if (typeof x === "object" && x._id) return String(x._id);
  return String(x);
};

const EmployeeFormFields = ({
  formData,
  onChange, // (name, value) => void
  loading,
  roles,
  departments,
  isTop,
  editMode,
  parentDepartmentId = null,
}) => {
  const dispatch = useDispatch();

  // Department context (create under a specific department or chosen in-form)
  const effectiveDeptId = idOf(parentDepartmentId) || idOf(formData?.department);

  // Dept-scoped roles from redux
  const deptRoles = useSelector((s) =>
    effectiveDeptId ? selectDeptRoles(s, effectiveDeptId) : []
  );
  const deptRolesLoading = useSelector((s) =>
    effectiveDeptId ? selectDeptRolesLoading(s, effectiveDeptId) : false
  );

  useEffect(() => {
    if (!effectiveDeptId) return;
    dispatch(fetchDeptRoles(effectiveDeptId));
  }, [dispatch, effectiveDeptId]);

  // If role is accidentally an ObjectId (24-hex) but dept roles are loaded, normalize to NAME
  useEffect(() => {
    if (!effectiveDeptId) return;
    const isHex24 = (s) => typeof s === "string" && /^[a-fA-F0-9]{24}$/.test(s);
    const current = String(formData?.role || "");
    if (!isHex24(current)) return;
    const list = Array.isArray(deptRoles) ? deptRoles : [];
    const found = list.find((r) => String(r?._id) === current);
    if (found?.name) {
      onChange("role", found.name);
      onChange("deptRoleId", String(found._id));
      onChange("deptRoleName", found.name);
    }
  }, [effectiveDeptId, deptRoles, formData?.role, onChange]);

  // ---- handlers shared by children ----
  // When role changes in dept context: keep role as NAME (string),
  // also set deptRoleId (_id) and deptRoleName (text) for follow-up assignment.
  const set = (name) => (e) => {
    const val = e?.target?.value ?? e;

    if (name === "role" && effectiveDeptId) {
      const pickedName = String(val || "");
      const match = (Array.isArray(deptRoles) ? deptRoles : []).find(
        (r) => String(r?.name || "").toLowerCase() === pickedName.toLowerCase()
      );
      onChange("deptRoleId", match?._id ? String(match._id) : "");
      onChange("deptRoleName", pickedName);
      onChange(name, pickedName); // keep TEXT for /employees
      return;
    }

    onChange(name, val);
  };

  const onToggle = (name) => (e) => onChange(name, e.target.checked);

  // ---- departments sorting (unchanged) ----
  const presentIds = useMemo(
    () => new Set((departments || []).map((d) => String(d._id))),
    [departments]
  );
  const isChildInScope = (d) => !!idOf(d.parent) && presentIds.has(idOf(d.parent));

  const sortedDepartments = useMemo(() => {
    const list = departments || [];
    const roots = list
      .filter((d) => !idOf(d.parent))
      .sort((a, b) => a.name.localeCompare(b.name));
    const children = list
      .filter((d) => idOf(d.parent))
      .sort((a, b) => a.name.localeCompare(b.name));
    return [...roots, ...children];
  }, [departments]);

  // ---- roles normalization ----
  // If in a department: options use NAME for both label and value (so role = name).
  // Else (top/global): keep names; if {_id,name} is provided, still use name as value.
  const rolesToUse = useMemo(() => {
    if (effectiveDeptId) {
      const raw = Array.isArray(deptRoles) ? deptRoles : [];
      return raw.map((r) => ({
        label: r?.name || "",
        value: r?.name || "", // value is NAME (not id)
      }));
    }

    const arr = Array.isArray(roles) ? roles : [];
    return arr
      .map((r) => {
        if (typeof r === "string") return { label: r, value: r };
        if (r && typeof r === "object") {
          if ("label" in r && "value" in r) {
            return { label: r.label, value: String(r.value) }; // assume value is a name string
          }
          if ("_id" in r && "name" in r) {
            return { label: r.name, value: r.name }; // prefer name as value
          }
        }
        const s = String(r ?? "");
        return { label: s, value: s };
      })
      .filter(Boolean);
  }, [effectiveDeptId, deptRoles, roles]);

  return (
    <div className={styles.formGrid}>
      <BasicInfoFields
        formData={formData}
        loading={loading || (!!effectiveDeptId && deptRolesLoading)}
        roles={rolesToUse}
        editMode={editMode}
        set={set}
      />

      <DepartmentsSelector
        formData={formData}
        onChange={onChange}
        loading={loading}
        editMode={editMode}
        parentDepartmentId={parentDepartmentId}
        sortedDepartments={sortedDepartments}
        isChildInScope={isChildInScope}
        dispatch={dispatch}
      />

      <GovernanceToggle
        formData={formData}
        onToggle={onToggle}
        loading={loading}
        isTop={isTop}
        editMode={editMode}
      />
    </div>
  );
};

export default EmployeeFormFields;
