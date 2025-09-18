
// src/components/SidebarMenus.js

const TOP_ROLES = new Set([
  "Super Admin",
  "Rector",
  "Deputy Rector",
  "Secretary of the Institute",
]);

const LEADER_ROLES = new Set([
  "Heads of Departments",
  "Heads of Units / Senior Assistant Registrars",
  "Directors",
  "Campus Managers",
  "Heads of Centers",
]);

// helpers
const isTop = (role) => !!role && TOP_ROLES.has(role);

// a user is supervisor/head if:
// 1) any department.head === user._id OR user._id ∈ department.supervisors
// (departments from GET /departments return ObjectIds; compare as strings)
const isSupervisorOrHead = (user, departments = []) => {
  if (!user?._id) return false;
  const uid = String(user._id);
  return departments.some((d) => {
    const head = d.head ? String(d.head) : null;
    const supervisors = Array.isArray(d.supervisors)
      ? d.supervisors.map(String)
      : [];
    return head === uid || supervisors.includes(uid);
  });
};

export const getMenusForUser = (user, departments = []) => {
  const role = user?.role || "";

  const coreMenus = [
    { name: "Dashboard", icon: "FaHome", path: "/admin/dashboard" },
    { name: "KPI Overview", icon: "FaChartLine", path: "/admin/kpis" },
    { name: "Discrepancy", icon: "FaCommentAlt", path: "/admin/feedback" },
  ];

  const adminMenus = [
    { name: "User Management", icon: "FaUserCog", path: "/admin/users" },
    { name: "Analytics", icon: "FaChartPie", path: "/admin/reports" },
    { name: "Departments", icon: "FaBuilding", path: "/admin/departments" },
  ];

  // Menus suitable for supervisors/heads (scoped by backend)
  const supervisorMenus = [
    { name: "User Management", icon: "FaUserCog", path: "/admin/users" },
    { name: "Departments", icon: "FaBuilding", path: "/admin/departments" },
    { name: "Department KPIs", icon: "FaClipboardList", path: "/hod/kpis" },
    { name: "Submissions", icon: "FaFileAlt", path: "/hod/submissions" },
  ];

  const deanMenus = [
    { name: "Dashboard", icon: "FaHome", path: "/dean/dashboard" },
    { name: "KPIs", icon: "FaTasks", path: "/admin/kpis" },
    { name: "Review", icon: "FaClipboardCheck", path: "/dean/review" },
    { name: "Discrepancy", icon: "FaCommentAlt", path: "/admin/feedback" },
  ];

  const lecturerMenus = [
    { name: "My KPIs", icon: "FaTasks", path: "/admin/kpis" },
    { name: "Submit Evidence", icon: "FaUpload", path: "/admin/submit" },
    { name: "Discrepancy", icon: "FaCommentAlt", path: "/admin/feedback" },
  ];

  // Capability checks
  const top = isTop(role);
  const supervisor = isSupervisorOrHead(user, departments) || LEADER_ROLES.has(role);

  if (top) {
    // Top-4 get admin + core
    return [...coreMenus, ...adminMenus];
  }

  if (supervisor) {
    // Non-top supervisors/heads get scoped admin-ish menus
    return [...coreMenus, ...supervisorMenus];
  }

  if (role === "Deans of Schools and Faculty") {
    return deanMenus;
  }

  if (
    role.includes("Lecturer") ||
    role.includes("Teaching") ||
    role.includes("Fellow")
  ) {
    return lecturerMenus;
  }

  // default safe set
  return coreMenus;
};
