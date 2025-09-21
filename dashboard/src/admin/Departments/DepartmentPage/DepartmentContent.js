// src/admin/Departments/DepartmentContent.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import styles from "./DepartmentPage.module.css";

import DepartmentList from "../DepartmentList";
import AddDepartmentModal from "../AddDepartmentModal";
import EditDepartmentModal from "../EditDepartmentModal";
import DepartmentRolesDrawer from "../DepartmentRolesDrawer.js/DepartmentRolesDrawer";
// ✅ FIXED PATH: put the drawer in src/admin/Departments/DepartmentRolesDrawer/DepartmentRolesDrawer.jsx

const DepartmentContent = ({
  loading,
  error,
  filteredItems,
  canEdit,
  canDelete,
  onEdit,
  onDelete,

  // Add modal
  isAddOpen,
  setAddOpen,
  name,
  setName,
  description,
  setDescription,
  category,
  setCategory,
  onAddSave,
  isTop,
  parentId,
  setParentId,
  allowedParents,

  // Edit modal
  isEditOpen,
  setEditOpen,
  onEditSave,
}) => {
  // Roles drawer state
  const [rolesOpen, setRolesOpen] = useState(false);
  const [rolesDept, setRolesDept] = useState(null);
  const openRoles = (dept) => { setRolesDept(dept); setRolesOpen(true); };
  const closeRoles = () => { setRolesDept(null); setRolesOpen(false); };

  const hasItems = Array.isArray(filteredItems) && filteredItems.length > 0;

  return (
    <>
      {loading && (
        <motion.div className={styles.loadingState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className={styles.loadingSpinner} />
          <p>Loading departments...</p>
        </motion.div>
      )}

      {error && (
        <motion.div className={styles.errorState} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          {String(error)}
        </motion.div>
      )}

      {!loading && !error && !hasItems ? (
        <motion.div className={styles.emptyState} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.emptyIllustration}><FontAwesomeIcon icon={faBuilding} /></div>
          <h3>No departments found</h3>
          <p>Try adjusting your search or filter criteria, or use the button above to create your first department.</p>
        </motion.div>
      ) : (
        !loading && !error && (
          <DepartmentList
            departments={filteredItems || []}
            onEdit={onEdit}
            onDelete={onDelete}
            canEdit={canEdit}
            canDelete={canDelete}
            onManageRoles={openRoles}   // ✅ pass Roles handler
          />
        )
      )}

      {/* Add Department */}
      <AddDepartmentModal
        isOpen={isAddOpen}
        onClose={() => setAddOpen(false)}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        category={category}
        setCategory={setCategory}
        onSave={onAddSave}
        isTop={isTop}
        parentId={parentId}
        setParentId={setParentId}
        allowedParents={allowedParents}
      />

      {/* Edit Department */}
      <EditDepartmentModal
        isOpen={isEditOpen}
        onClose={() => setEditOpen(false)}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        category={category}
        setCategory={setCategory}
        onSave={onEditSave}
      />

      {/* Roles Drawer */}
      <DepartmentRolesDrawer
        open={rolesOpen}
        onClose={closeRoles}
        department={rolesDept}
        canManage={rolesDept ? canEdit(rolesDept) : false}
      />
    </>
  );
};

export default DepartmentContent;
