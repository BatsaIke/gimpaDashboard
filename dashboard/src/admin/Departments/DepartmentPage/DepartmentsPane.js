import React from "react";
import DepartmentToolbar from "./DepartmentToolbar";
import DepartmentContent from "./DepartmentContent";

const DepartmentsPane = ({
  isTop,
  scopedCount,
  searchTerm,
  setSearchTerm,
  categories,
  filterCategory,
  setFilterCategory,
  openAdd,
  openAddRole,
  loading,
  error,
  filteredItems,
  canEdit,
  canDelete,
  openEdit,
  doDelete,
  isAddOpen,
  setAddOpen,
  name,
  setName,
  description,
  setDescription,
  category,
  setCategory,
  doAdd,
  parentId,
  setParentId,
  allowedParents,
  isEditOpen,
  setEditOpen,
  doEdit,
}) => {
  return (
    <>
      <DepartmentToolbar
        isTop={isTop}
        count={scopedCount}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        categories={categories}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        onAddClick={openAdd}
        onAddRoleClick={() => openAddRole()}
      />

      <DepartmentContent
        loading={loading}
        error={error}
        filteredItems={filteredItems}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={(d) => (canEdit(d) ? openEdit(d) : null)}
        onDelete={(id) => (canDelete() ? doDelete(id) : null)}
        isAddOpen={isAddOpen}
        setAddOpen={setAddOpen}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        category={category}
        setCategory={setCategory}
        onAddSave={doAdd}
        isTop={isTop}
        parentId={parentId}
        setParentId={setParentId}
        allowedParents={allowedParents}
        isEditOpen={isEditOpen}
        setEditOpen={setEditOpen}
        onEditSave={doEdit}
      />
    </>
  );
};

export default DepartmentsPane;
