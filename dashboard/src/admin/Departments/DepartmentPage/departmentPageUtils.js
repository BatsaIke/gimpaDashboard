// src/utils/departmentUtils.js
// Pure helpers for DepartmentPage (JavaScript, named exports)

export const TOP_ROLES = new Set([
  "Super Admin",
  "Rector",
  "Deputy Rector",
  "Secretary of the Institute",
]);

/**
 * Compute scopedItems for current user
 */
export function computeScopedItems(items = [], authUser = {}, isTop = false) {
  if (isTop) return items.filter((d) => !d.parent);

  const uid = String(authUser?._id || "");
  const memberIds = Array.isArray(authUser?.department)
    ? authUser.department.map((d) => String(typeof d === "object" ? d._id : d))
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
}

/**
 * Filter scopedItems by search term + category
 */
export function filterItems(scopedItems = [], searchTerm = "", filterCategory = "All") {
  const q = (searchTerm || "").toLowerCase();
  return scopedItems.filter((dept) => {
    const matchesSearch =
      (dept.name || "").toLowerCase().includes(q) ||
      ((dept.description || "") && dept.description.toLowerCase().includes(q));
    const matchesCategory =
      filterCategory === "All" || dept.category === filterCategory;
    return matchesSearch && matchesCategory;
  });
}

/**
 * Extract unique categories
 */
export function getCategories(scopedItems = []) {
  const uniqueCats = [
    ...new Set(scopedItems.map((i) => i.category || "Uncategorized")),
  ];
  return ["All", ...uniqueCats];
}

export function getAllowedParents(items = [], scopedItems = [], isTop = false) {
  return isTop ? items : scopedItems;
}

export function getRoleDeptOptions(items = [], scopedItems = [], isTop = false) {
  return isTop ? items : scopedItems;
}

export function canEdit(dept = {}, authUser = {}, isTop = false) {
  if (isTop) return true;
  const uid = String(authUser?._id);
  if (String(dept.head) === uid) return true;
  if (Array.isArray(dept.supervisors)) {
    return dept.supervisors.map(String).includes(uid);
  }
  return false;
}

export function canDelete(authUser = {}) {
  return authUser?.role === "Super Admin";
}
