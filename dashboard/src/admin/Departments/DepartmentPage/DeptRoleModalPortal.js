import React from "react";
import AddDeptRoleModal from "../Roles/AddDeptRoleModal";

const DeptRoleModalPortal = ({
  roleModalOpen,
  closeRoleModal,
  roleDeptOptions,
  roleDeptId,
  setRoleDeptId,
  roleName,
  setRoleName,
  roleDesc,
  setRoleDesc,
  saveRole,
}) => {
  return (
    <AddDeptRoleModal
      isOpen={roleModalOpen}
      onClose={closeRoleModal}
      departments={roleDeptOptions}
      departmentId={roleDeptId}
      setDepartmentId={setRoleDeptId}
      roleName={roleName}
      setRoleName={setRoleName}
      roleDesc={roleDesc}
      setRoleDesc={setRoleDesc}
      onSave={saveRole}
    />
  );
};

export default DeptRoleModalPortal;
