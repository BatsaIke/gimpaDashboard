import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchDepartments,
  fetchMyDepartments,
  createDepartment,
  editDepartment,
  removeDepartment,
} from "../../../actions/departmentsActions";
import { set_Alert } from "../../../actions/alertAction";
import styles from "./DepartmentPage.module.css";

import { createDeptRole } from "../../../actions/departmentRolesActions";
import RolesTab from "../Roles/RolesTab";

// NEW splits
import DepartmentTabsHeader from "./DepartmentTabsHeader";
import DepartmentsPane from "./DepartmentsPane";
import DeptRoleModalPortal from "./DeptRoleModalPortal";

const TOP_ROLES = new Set([
  "Super Admin",
  "Rector",
  "Deputy Rector",
  "Secretary of the Institute",
]);

const DepartmentPage = () => {
  const dispatch = useDispatch();
  const authUser = useSelector((s) => s.auth?.user);
  const isTop = TOP_ROLES.has(authUser?.role);

  const deptState = useSelector((state) => state.departments) || {};
  const items = Array.isArray(deptState.items) ? deptState.items : [];
  const loading = !!deptState.loading;
  const error = deptState.error || null;

  const [isAddOpen, setAddOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Unit");
  const [parentId, setParentId] = useState(null);
  const [editingDept, setEditingDept] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Add Role modal state
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleDeptId, setRoleDeptId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");

  const [activeTab, setActiveTab] = useState("departments"); // 'departments' | 'roles'

  useEffect(() => {
    (async () => {
      if (isTop) await dispatch(fetchDepartments());
      else await dispatch(fetchMyDepartments());
    })();
  }, [dispatch, isTop]);

  const scopedItems = useMemo(() => {
    if (isTop) return items.filter((d) => !d.parent);

    const uid = String(authUser?._id || "");
    const memberIds = Array.isArray(authUser?.department)
      ? authUser.department.map((d) =>
          String(typeof d === "object" ? d._id : d)
        )
      : authUser?.department
      ? [
          String(
            typeof authUser.department === "object"
              ? authUser.department._id
              : authUser.department
          ),
        ]
      : [];

    const supervisedIds = new Set(
      items
        .filter(
          (d) =>
            String(d.head) === uid ||
            (Array.isArray(d.supervisors) &&
              d.supervisors.map(String).includes(uid))
        )
        .map((d) => String(d._id))
    );

    const base = new Set([...memberIds, ...supervisedIds]);

    return items.filter((d) => {
      const idStr = String(d._id);
      if (base.has(idStr)) return true;
      const anc = Array.isArray(d.ancestors) ? d.ancestors.map(String) : [];
      return anc.some((a) => base.has(a));
    });
  }, [items, authUser, isTop]);

  const filteredItems = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return scopedItems.filter((dept) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(q) ||
        (dept.description && dept.description.toLowerCase().includes(q));
      const matchesCategory =
        filterCategory === "All" || dept.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [scopedItems, searchTerm, filterCategory]);

  const categories = useMemo(() => {
    const uniqueCats = [
      ...new Set(scopedItems.map((i) => i.category || "Uncategorized")),
    ];
    return ["All", ...uniqueCats];
  }, [scopedItems]);

  const allowedParents = useMemo(
    () => (isTop ? items : scopedItems),
    [isTop, items, scopedItems]
  );

  const roleDeptOptions = useMemo(
    () => (isTop ? items : scopedItems),
    [isTop, items, scopedItems]
  );

  const canEdit = (dept) =>
    isTop ||
    String(dept.head) === String(authUser?._id) ||
    (Array.isArray(dept.supervisors) &&
      dept.supervisors.map(String).includes(String(authUser?._id)));

  const canDelete = () => authUser?.role === "Super Admin";

  const openAdd = () => {
    setName("");
    setDescription("");
    setCategory("Unit");
    setParentId(isTop ? null : allowedParents[0]?._id || null);
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
    if (!name.trim())
      return dispatch(set_Alert("Name cannot be empty", "error"));
    if (!isTop && !parentId)
      return dispatch(set_Alert("Select a parent department", "error"));

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
    if (!window.confirm("Delete this department?")) return;
    const res = await dispatch(removeDepartment(id));
    if (res?.success) dispatch(set_Alert("Department deleted", "success"));
    else dispatch(set_Alert(res?.message || "Delete failed", "error"));
  };

  const openAddRole = (deptId) => {
    setRoleDeptId(deptId || roleDeptOptions[0]?._id || "");
    setRoleName("");
    setRoleDesc("");
    setRoleModalOpen(true);
  };

  const saveRole = async () => {
    if (!roleDeptId) {
      dispatch(set_Alert("Select a department", "error"));
      return;
    }
    if (!roleName.trim()) {
      dispatch(set_Alert("Enter a role name", "error"));
      return;
    }

    const res = await dispatch(
      createDeptRole(roleDeptId, {
        name: roleName.trim(),
        description: roleDesc?.trim() || undefined,
      })
    );

    if (res?.success) {
      dispatch(set_Alert("Role created", "success"));
      setRoleModalOpen(false);
      setRoleName("");
      setRoleDesc("");
      setRoleDeptId("");
    } else {
      dispatch(set_Alert("Failed to create role", "error"));
    }
  };

  return (
    <div className={styles.container}>
      <DepartmentTabsHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "departments" ? (
        <DepartmentsPane
          isTop={isTop}
          scopedCount={scopedItems.length}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          categories={categories}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          openAdd={openAdd}
          openAddRole={openAddRole}
          loading={loading}
          error={error}
          filteredItems={filteredItems}
          canEdit={canEdit}
          canDelete={canDelete}
          openEdit={openEdit}
          doDelete={doDelete}
          isAddOpen={isAddOpen}
          setAddOpen={setAddOpen}
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          category={category}
          setCategory={setCategory}
          doAdd={doAdd}
          parentId={parentId}
          setParentId={setParentId}
          allowedParents={allowedParents}
          isEditOpen={isEditOpen}
          setEditOpen={setEditOpen}
          doEdit={doEdit}
        />
      ) : (
        <RolesTab
          departments={roleDeptOptions}
          onAddRoleClick={(deptId) => openAddRole(deptId)}
        />
      )}

      <DeptRoleModalPortal
        roleModalOpen={roleModalOpen}
        closeRoleModal={() => setRoleModalOpen(false)}
        roleDeptOptions={roleDeptOptions}
        roleDeptId={roleDeptId}
        setRoleDeptId={setRoleDeptId}
        roleName={roleName}
        setRoleName={setRoleName}
        roleDesc={roleDesc}
        setRoleDesc={setRoleDesc}
        saveRole={saveRole}
      />
    </div>
  );
};

export default DepartmentPage;
