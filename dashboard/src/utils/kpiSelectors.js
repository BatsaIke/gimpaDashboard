// Normalization utility - ensures consistent string comparison
const norm = (v) => (v == null ? "" : String(v));

/**
 * Gets all KPIs for a specific user
 * @param {object} state - Redux state
 * @param {string} userId - User ID to look up
 * @returns {array} Array of KPIs for the user
 */
export const selectUserKpis = (state, userId) => 
  state.kpis.userKpis?.[norm(userId)] || [];

/**
 * Gets a specific KPI by ID, checking both user-specific and global stores
 * @param {object} state - Redux state
 * @param {string} userId - User ID to look up
 * @param {string} kpiId - KPI ID to find
 * @returns {object|null} The KPI object or null if not found
 */
export const selectUserKpiById = (state, userId, kpiId) => {
  // 1. Check user-specific KPIs first (most likely to have deliverable statuses)
  const userKpi = selectUserKpis(state, userId).find(k => norm(k._id) === norm(kpiId));
  
  // 2. If not found in user-specific, check global items
  if (!userKpi) {
    const globalKpi = state.kpis.items.find(k => norm(k._id) === norm(kpiId));
    return globalKpi || null;
  }
  
  return userKpi;
};

/**
 * Gets a deliverable by its index in the KPI's deliverables array
 * @param {object} state - Redux state
 * @param {string} userId - User ID
 * @param {string} kpiId - KPI ID
 * @param {number|string} index - Deliverable index
 * @returns {object|null} The deliverable or null if invalid
 */
export const selectUserDeliverableByIndex = (state, userId, kpiId, index) => {
  const kpi = selectUserKpiById(state, userId, kpiId);
  const idx = Number(index);
  
  if (!kpi || 
      !Array.isArray(kpi.deliverables) || 
      Number.isNaN(idx) || 
      idx < 0 || 
      idx >= kpi.deliverables.length
  ) {
    return null;
  }
  
  return kpi.deliverables[idx] ?? null;
};

/**
 * Gets a deliverable by its ID
 * @param {object} state - Redux state
 * @param {string} userId - User ID
 * @param {string} kpiId - KPI ID
 * @param {string} deliverableId - Deliverable ID
 * @returns {object|null} The deliverable or null if not found
 */
export const selectUserDeliverableById = (state, userId, kpiId, deliverableId) => {
  const kpi = selectUserKpiById(state, userId, kpiId);
  return kpi?.deliverables?.find(d => norm(d._id) === norm(deliverableId)) || null;
};