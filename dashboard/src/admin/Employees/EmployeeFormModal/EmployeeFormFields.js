import React, { useMemo } from "react";
import { useDispatch } from "react-redux";
import styles from "./EmployeeFormFields.module.css";
import BasicInfoFields from "./BasicInfoFields";
import DepartmentsSelector from "./DepartmentsSelector";
import GovernanceToggle from "./GovernanceToggle";


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

  // handlers shared by children
  const set = (name) => (e) => onChange(name, e.target.value);
  const onToggle = (name) => (e) => onChange(name, e.target.checked);

  // keep the “roots first, then children” sort for edit mode
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

  return (
    <div className={styles.formGrid}>
      <BasicInfoFields
        formData={formData}
        loading={loading}
        roles={roles}
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
