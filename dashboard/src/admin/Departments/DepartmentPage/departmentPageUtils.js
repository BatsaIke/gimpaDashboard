// src/admin/Departments/departmentPageUtils.js

const TOP_ROLES = new Set([
  "Super Admin",
  "Rector",
  "Deputy Rector",
  "Secretary of the Institute",
]);

/**
 * Checks if a user has permission to edit a department.
 * @param {object} dept - The department object.
 * @param {object} authUser - The authenticated user object.
 * @returns {boolean}
 */
export const canEdit = (dept, authUser) => {
  const isTop = TOP_ROLES.has(authUser?.role);
  return isTop || String(dept.head) === String(authUser?._id) || (Array.isArray(dept.supervisors) && dept.supervisors.map(String).includes(String(authUser?._id)));
};

/**
 * Checks if a user has permission to delete departments.
 * @param {object} authUser - The authenticated user object.
 * @returns {boolean}
 */
export const canDelete = (authUser) => authUser?.role === "Super Admin";

/**
 * Filters departments based on the user's scope and permissions.
 * @param {Array} items - All departments.
 * @param {object} authUser - The authenticated user object.
 * @returns {Array} - The departments visible to the user.
 */
export const getScopedItems = (items, authUser) => {
  const isTop = TOP_ROLES.has(authUser?.role);
  if (isTop) return items.filter((d) => !d.parent);
  
  const uid = String(authUser?._id || "");
  const memberIds = Array.isArray(authUser?.department) ? authUser.department.map((d) => String(typeof d === "object" ? d._id : d)) : authUser?.department ? [String(typeof authUser.department === "object" ? authUser.department._id : authUser.department)] : [];
  const supervisedIds = new Set(items.filter((d) => String(d.head) === uid || (Array.isArray(d.supervisors) && d.supervisors.map(String).includes(uid))).map((d) => String(d._id)));
  const base = new Set([...memberIds, ...supervisedIds]);

  return items.filter((d) => {
    const idStr = String(d._id);
    if (base.has(idStr)) return true;
    const anc = Array.isArray(d.ancestors) ? d.ancestors.map(String) : [];
    return anc.some((a) => base.has(a));
  });
};

/**
 * Filters departments by search term and category.
 * @param {Array} scopedItems - The user's visible departments.
 * @param {string} searchTerm - The search query.
 * @param {string} filterCategory - The selected category.
 * @returns {Array}
 */
export const getFilteredItems = (scopedItems, searchTerm, filterCategory) => {
  const q = searchTerm.toLowerCase();
  return scopedItems.filter((dept) => {
    const matchesSearch = dept.name.toLowerCase().includes(q) || (dept.description && dept.description.toLowerCase().includes(q));
    const matchesCategory = filterCategory === "All" || dept.category === filterCategory;
    return matchesSearch && matchesCategory;
  });
};

/**
 * Filters roles by search term.
 * @param {Array} allRoles - All department roles.
 * @param {string} searchTerm - The search query.
 * @returns {Array}
 */
export const getFilteredRoles = (allRoles, searchTerm) => {
  if (searchTerm === "") return allRoles;
  const q = searchTerm.toLowerCase();
  return allRoles.filter(role => {
    const deptName = role.department?.name || "";
    return role.name.toLowerCase().includes(q) ||
      (role.description && role.description.toLowerCase().includes(q)) ||
      deptName.toLowerCase().includes(q);
  });
};

/**
 * Extracts unique department categories for the filter dropdown.
 * @param {Array} scopedItems - The user's visible departments.
 * @returns {Array}
 */
export const getCategories = (scopedItems) => {
  const uniqueCats = [...new Set(scopedItems.map((i) => i.category || "Uncategorized"))];
  return ["All", ...uniqueCats];
};

/**
 * Determines which departments can be selected as a parent.
 * @param {Array} items - All departments.
 * @param {Array} scopedItems - The user's visible departments.
 * @param {object} authUser - The authenticated user object.
 * @returns {Array}
 */
export const getAllowedParents = (items, scopedItems, authUser) => {
  const isTop = TOP_ROLES.has(authUser?.role);
  return isTop ? items : scopedItems;
};