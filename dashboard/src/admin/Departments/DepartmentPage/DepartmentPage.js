import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDepartments, fetchMyDepartments, createDepartment, editDepartment, removeDepartment } from "../../../actions/departmentsActions";
import { fetchAllRoles, createDeptRole } from "../../../actions/departmentRolesActions";
import { set_Alert } from "../../../actions/alertAction";
import styles from "./DepartmentPage.module.css";

import DepartmentToolbar from "./DepartmentToolbar";
import DepartmentContent from "./DepartmentContent";
import AddDeptRoleModal from "../Roles/AddDeptRoleModal";
import * as Utils from './departmentPageUtils';

const DepartmentPage = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s.auth?.user);

  const deptState = useSelector((state) => state.departments) || {};
  const loading = !!deptState.loading;
  const error = deptState.error || null;
  const items = useMemo(() => Array.isArray(deptState.items) ? deptState.items : [], [deptState.items]);

  const rolesState = useSelector((state) => state.departmentRoles) || {};
  const allRoles = Array.isArray(rolesState.allRoles) ? rolesState.allRoles : [];
  const rolesLoading = !!rolesState.allRolesLoading;

  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Unit");
  const [parentId, setParentId] = useState(null);
  const [editingDept, setEditingDept] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleDeptId, setRoleDeptId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");

  const isTopUser = useMemo(() => Utils.getScopedItems(items, authUser).length > 0 && authUser?.role?.includes("Admin"), [items, authUser]);

  useEffect(() => {
    const fetchData = async () => {
      if (isTopUser) {
        await dispatch(fetchDepartments());
      } else {
        await dispatch(fetchMyDepartments());
      }
      await dispatch(fetchAllRoles());
    };
    fetchData();
  }, [dispatch, isTopUser]);
  
  const scopedItems = useMemo(() => Utils.getScopedItems(items, authUser), [items, authUser]);
  const filteredItems = useMemo(() => Utils.getFilteredItems(scopedItems, searchTerm, filterCategory), [scopedItems, searchTerm, filterCategory]);
  const filteredRoles = useMemo(() => Utils.getFilteredRoles(allRoles, searchTerm), [allRoles, searchTerm]);
  const categories = useMemo(() => Utils.getCategories(scopedItems), [scopedItems]);
  const allowedParents = useMemo(() => Utils.getAllowedParents(items, scopedItems, authUser), [items, scopedItems, authUser]);
  const roleDeptOptions = allowedParents;

  const openAdd = () => {
    setName("");
    setDescription("");
    setCategory("Unit");
    setParentId(isTopUser ? null : allowedParents[0]?._id || null);
    setAddOpen(true);
  };

  const openEdit = (dept) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description || "");
    setCategory(dept.category || "Unit");
    setEditOpen(true);
  };

  const doAdd = async () => {
    if (!name.trim()) {
      return dispatch(set_Alert("Name cannot be empty", "error"));
    }
    if (!isTopUser && !parentId) {
      return dispatch(set_Alert("Select a parent department", "error"));
    }
    const payload = {
      name,
      description,
      category,
      parent: parentId || null,
      makeCreatorHead: false,
    };
    const res = await dispatch(createDepartment(payload));
    if (res?.success) {
      dispatch(set_Alert("Department added", "success"));
      setAddOpen(false);
    } else {
      dispatch(set_Alert(res?.message || "Add failed", "error"));
    }
  };

  const doEdit = async () => {
    if (!editingDept) return;
    const res = await dispatch(
      editDepartment({ id: editingDept._id, name, description, category })
    );
    if (res?.success) {
      dispatch(set_Alert("Department updated", "success"));
      setEditOpen(false);
    } else {
      dispatch(set_Alert(res?.message || "Update failed", "error"));
    }
  };

  const doDelete = async (id) => {
    if (!window.confirm("Delete this department? This action cannot be undone.")) return;
    const res = await dispatch(removeDepartment(id));
    if (res?.success) {
      dispatch(set_Alert("Department deleted", "success"));
    } else {
      dispatch(set_Alert(res?.message || "Delete failed", "error"));
    }
  };

  const openAddRole = () => {
    setRoleDeptId(roleDeptOptions[0]?._id || "");
    setRoleName("");
    setRoleDesc("");
    setRoleModalOpen(true);
  };

  const saveRole = async () => {
    if (!roleDeptId) return dispatch(set_Alert("You must select a department", "error"));
    if (!roleName.trim()) return dispatch(set_Alert("Role name cannot be empty", "error"));

    const res = await dispatch(createDeptRole(roleDeptId, { name: roleName, description: roleDesc }));
    if (res?.success) {
      dispatch(set_Alert("Role created successfully", "success"));
      setRoleModalOpen(false);
    } else {
      dispatch(set_Alert(res?.message || "Failed to create role", "error"));
    }
  };
  
  const handleCanEdit = (dept) => Utils.canEdit(dept, authUser);
  const handleCanDelete = () => Utils.canDelete(authUser);

  return (
    <div className={styles.container}>
      <DepartmentToolbar
        count={scopedItems.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categories={categories}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        onAddClick={openAdd}
        onAddRoleClick={openAddRole}
      />
      <DepartmentContent
        loading={loading || rolesLoading}
        error={error}
        filteredItems={filteredItems}
        filteredRoles={filteredRoles}
        canEdit={handleCanEdit}
        canDelete={handleCanDelete}
        onEdit={(d) => (handleCanEdit(d) ? openEdit(d) : null)}
        onDelete={(id) => (handleCanDelete() ? doDelete(id) : null)}
        isTop={isTopUser}
        {...{ isAddOpen, setAddOpen, name, setName, description, setDescription, category, setCategory, onAddSave: doAdd, parentId, setParentId, allowedParents, isEditOpen, setEditOpen, onEditSave: doEdit }}
      />
      <AddDeptRoleModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        departments={roleDeptOptions}
        departmentId={roleDeptId}
        setDepartmentId={setRoleDeptId}
        roleName={roleName}
        setRoleName={setRoleName}
        roleDesc={roleDesc}
        setRoleDesc={setRoleDesc}
        onSave={saveRole}
      />
    </div>
  );
};

export default DepartmentPage;