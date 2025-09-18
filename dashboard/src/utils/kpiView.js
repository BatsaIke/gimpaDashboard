export function selectDeliverablesForViewer(kpi, {
  authUserId,
  viewedUserId,
  isCreatorView
}) {
  const map = kpi?.userSpecific?.deliverables;

  const getFromMap = (m, key) => {
    if (!m || !key) return null;
    if (typeof m.get === 'function') return m.get(key) || null; // Map from server
    return m?.[key] || null; // plain object (serialized)
  };

  // If creator is viewing an assignee’s board, use that assignee’s copy
  const targetId = isCreatorView && viewedUserId ? viewedUserId : authUserId;

  const userScoped = getFromMap(map, targetId);
  return Array.isArray(userScoped) && userScoped.length ? userScoped : (kpi.deliverables || []);
}
