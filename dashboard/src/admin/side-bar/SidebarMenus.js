// src/components/SidebarMenus.js

export const getMenusByRole = (role) => {
    const coreMenus = [
      { name: "Dashboard", icon: "FaHome", path: "/admin/dashboard" },
      { name: "KPI Overview", icon: "FaChartLine", path: "/admin/kpis" },
      { name: "Feedback", icon: "FaCommentAlt", path: "/admin/feedback" },
    ];
  
    const adminMenus = [
      { name: "User Management", icon: "FaUserCog", path: "/admin/users" },
      { name: "Analytics", icon: "FaChartPie", path: "/admin/reports" },
      { name: "Departments", icon: "FaBuilding", path: "/admin/departments" },
    ];
  
    const deanMenus = [
      { name: "Dashboard", icon: "FaHome", path: "/dean/dashboard" },
      { name: "KPIs", icon: "FaTasks", path: "/admin/kpis" },
      { name: "Review", icon: "FaClipboardCheck", path: "/dean/review" },
      { name: "Feedback", icon: "FaCommentAlt", path: "/admin/feedback" },
    ];
  
    const hodMenus = [
      { name: "Department KPIs", icon: "FaClipboardList", path: "/hod/kpis" },
      { name: "Submissions", icon: "FaFileAlt", path: "/hod/submissions" },
      { name: "Feedback", icon: "FaCommentAlt", path: "/hod/feedback" },
    ];
  
    const lecturerMenus = [
      { name: "My KPIs", icon: "FaTasks", path: "/admin/kpis" },
      { name: "Submit Evidence", icon: "FaUpload", path: "/admin/submit" },
      { name: "Feedback", icon: "FaCommentAlt", path: "/admin/feedback" },
    ];
  
    if (role === "Rector" || role === "Deputy Rector"||role === "Super Admin") {
      return [...coreMenus, ...adminMenus];
    }
  
    if (role === "Deans of Schools and Faculty") {
      return deanMenus;
    }
  
    if (role === "Heads of Departments" || role === "HOD") {
      return hodMenus;
    }
  
    if (role.includes("Lecturer") || role.includes("Teaching") || role.includes("Fellow")) {
      return lecturerMenus;
    }
  
    return coreMenus;
  };