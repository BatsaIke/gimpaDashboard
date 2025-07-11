// src/components/EmployeeFormModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import EmployeeFormActions from "./EmployeeFormActions";
import EmployeeFormFields from "./EmployeeFormFields";
import Modal from "../../../UI/modal/Modal";
import { set_Alert } from "../../../actions/alertAction";
import { createUser, fetchRoles, updateUser } from "../../../actions/authAction";

const EmployeeFormModal = ({
  show,
  onClose,
  editMode,
  employee,
  refreshEmployees,
  departments = [],
}) => {
  const dispatch = useDispatch();
  

  // 1) Kick off fetch as soon as modal opens
  useEffect(() => {
    if (show) dispatch(fetchRoles());
  }, [show, dispatch]);

  // 2) Grab exactly the array you logged: state.roles.roles.data
  const roles = useSelector(
    (state) => state.roles.roles?.data ?? []
  );

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    role: "Lecturer",
    rank: "",
    department: "",
  });
  const [loading, setLoading] = useState(false);

  const rankOptions = [
    "Professor",
    "Senior Lecturer",
    "Assistant Lecturer",
    "Tutor",
    "Adjunct",
    "Other",
  ];

  // Preload form when editing
  useEffect(() => {
    if (editMode && employee) {
      setFormData({
        username: employee.username || "",
        email: employee.email || "",
        phone: employee.phone || "",
        role: employee.role || "Lecturer",
        rank: employee.rank || "",
        department: employee.department?._id || "",
      });
    } else {
      setFormData({
        username: "",
        email: "",
        phone: "",
        role: "Lecturer",
        rank: "",
        department: "",
      });
    }
  }, [editMode, employee]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      dispatch(set_Alert("Username is required", "error"));
      return;
    }
    setLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.department) delete payload.department;
      const res = await dispatch(
        editMode && employee?._id
          ? updateUser(employee._id, payload)
          : createUser(payload)
      );
      if (res.success) {
        dispatch(
          set_Alert(
            `Employee ${editMode ? "updated" : "created"} successfully`,
            "success"
          )
        );
        onClose();
        refreshEmployees();
      }
    } catch (err) {
      dispatch(
        set_Alert(err.response?.data?.message || "Operation failed", "error")
      );
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
          handleChange={handleChange}
          loading={loading}
          roles={roles}            
          rankOptions={rankOptions}
          departments={departments}
        />
      </form>
    </Modal>
  );
};

export default EmployeeFormModal;
