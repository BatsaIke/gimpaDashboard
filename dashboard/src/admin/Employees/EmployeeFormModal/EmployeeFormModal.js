import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import EmployeeFormActions from "./EmployeeFormActions";
import EmployeeFormFields from "./EmployeeFormFields";
import Modal from "../../../UI/modal/Modal";
import { set_Alert } from "../../../actions/alertAction";
import { createUser, fetchRoles, updateUser } from "../../../actions/authAction";

const LEADER_ROLES = new Set([
  "Heads of Departments",
  "Heads of Units / Senior Assistant Registrars",
  "Directors",
  "Campus Managers",
  "Heads of Centers",
]);

const EmployeeFormModal = ({
  show,
  onClose,
  editMode,
  employee,
  refreshEmployees,
  departments = [],
  me = null,
  /** 👇 NEW: pass the parent department id when opening from a department card */
parentDepartmentId = null,}) => {
  const dispatch = useDispatch();

  const meRole = useSelector((s) => s.auth?.user?.role);
  const isTop = useMemo(
    () =>
      ["Super Admin", "Rector", "Deputy Rector", "Secretary of the Institute"].includes(
        meRole
      ),
    [meRole]
  );

  useEffect(() => {
    if (show) dispatch(fetchRoles());
  }, [show, dispatch]);

  const roles = useSelector((state) => state.roles.roles?.data ?? []);

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "Lecturer",
    rank: "",
    departmentIds: [],
    makeSupervisor: false,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode && employee) {
      const dept = employee.department;
      const deptIds = Array.isArray(dept)
        ? dept.map((d) => (typeof d === "object" ? d._id : d))
        : dept
        ? [typeof dept === "object" ? dept._id : dept]
        : [];

      setFormData({
        username: employee.username || "",
        fullName: employee.fullName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        password: "",
        role: employee.role || "Lecturer",
        rank: employee.rank || "",
        departmentIds: deptIds,
        makeSupervisor: false,
      });
    } else {
      setFormData({
        username: "",
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "Lecturer",
        rank: "",
        departmentIds: [],
        makeSupervisor: false,
      });
    }
  }, [editMode, employee]);

  useEffect(() => {
    if (!isTop) {
      setFormData((f) => ({
        ...f,
        makeSupervisor: LEADER_ROLES.has(f.role),
      }));
    }
  }, [formData.role, isTop]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFieldChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      dispatch(set_Alert("Username is required", "error"));
      return;
    }

    setLoading(true);
    try {
      const depIds = (formData.departmentIds || []).map(String);
      const base = {
        username: formData.username?.trim(),
        fullName: formData.fullName?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        role: formData.role,
        rank: formData.rank || undefined,
        makeSupervisor: !!formData.makeSupervisor,
      };

      let payload;

      if (!editMode) {
        payload = {
          ...base,
          department:
            depIds.length === 0 ? undefined : depIds.length === 1 ? depIds[0] : depIds,
          password: formData.password?.trim() || undefined,
        };
        if (!payload.department) delete payload.department;
        if (!payload.password) delete payload.password;
      } else {
        payload = {
          ...base,
          department: depIds.length ? depIds[0] : undefined,
        };
        if (!payload.department) delete payload.department;

        if (isTop) {
          if (formData.makeSupervisor && depIds.length) {
            payload.supervisorDepartmentIds = depIds;
          } else if (!formData.makeSupervisor && depIds.length) {
            payload.setAsHead = true;
            payload.headDepartmentIds = depIds;
          }
        } else {
          if (formData.makeSupervisor && depIds.length) {
            payload.supervisorDepartmentIds = depIds;
          }
        }
      }

      const res = await dispatch(
        editMode && employee?._id
          ? updateUser(employee._id, payload)
          : createUser(payload)
      );

      if (res.success) {
        dispatch(set_Alert(`Employee ${editMode ? "updated" : "created"} successfully`, "success"));
        onClose();
        refreshEmployees();
      }
    } catch (err) {
      dispatch(set_Alert(err?.response?.data?.message || "Operation failed", "error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={show}
      onClose={onClose}
      header={editMode ? "Edit Employee" : "Add Employee"}
      footer={
        <EmployeeFormActions
          onClose={onClose}
          handleSubmit={handleSubmit}
          loading={loading}
        />
      }
    >
      <form onSubmit={handleSubmit}>
        <EmployeeFormFields
          formData={formData}
          onChange={handleFieldChange}
          loading={loading}
          roles={roles}
          departments={departments}
          isTop={isTop}
          editMode={editMode}
          /** 👇 forward context so create-mode knows which level to show */
         parentDepartmentId={parentDepartmentId}
        />
      </form>
    </Modal>
  );
};

export default EmployeeFormModal;
