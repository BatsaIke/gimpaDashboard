import "./App.css";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Alert from "./UI/alert/Alert";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from "react";
import SignupPage from "./pages/signup/SignupPage";
import AdminLayout from "./admin/AdminLayout";
import PrivateRoute from "./components/PrivateRoute";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ReportsPage from "./admin/reports/ReportsPage";
import Header from "./components/header/Header";
import DepartmentPage from "./admin/Departments/DepartmentPage/DepartmentPage";
import EmployeesPage from "./admin/Employees/EmployeesPage/EmployeesPage";
import LoginPage from "./pages/Empleyee/EmployeeLogin/LoginPage";
import ChangePasswordPage from "./pages/Empleyee/EmplyeeChangePass/ChangePasswordPage";
import AdminLoginPage from "./pages/Login/Loginpage";
import KpiBoard from "./admin/KPIs/KPIBoard/kpiMainBoard/KpiBoard";
import { setAuthToken, setRefreshToken } from "./utils/setAuthToken";
import {
  setToken,
  setRefreshToken as setReduxRefreshToken,
} from "./redux/slices/authSlice";
import UserKpiBoard from "./admin/KPIs/KPIBoard/UserKpiBoard/UserKpiBoard";
import { fetchMyProfile, logout } from "./actions/authAction";
import DiscrepanciesPage from "./admin/Descrepancy/DiscrepanciesPage";
import NetworkModal from "./UI/modal/NetworkModal";
import ContactPage from "./pages/Contact/Contactpage";
import NotFound from "./components/notFound/NotFound";
import InstructionsPage from "./pages/Instructions/InstructionsPage";
import Dashboard from "./admin/Dashboard/Dashboard";
import ProfilePage from "./pages/Profile/ProfilePage";

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    // Create an async function inside the effect
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedRefreshToken = localStorage.getItem("refreshToken");

      if (storedToken && storedRefreshToken) {
        // Dispatch synchronous actions first
        dispatch(setToken(storedToken));
        dispatch(setReduxRefreshToken(storedRefreshToken));
        setAuthToken(storedToken);
        setRefreshToken(storedRefreshToken);

        try {
          // Dispatch the async action separately
          await dispatch(fetchMyProfile());
        } catch (error) {
          console.error("Authentication failed:", error);
          dispatch(logout());
        }
      }
    };

    // Call the async function
    initializeAuth();
  }, [dispatch]);

  const isAuthPage = [
    "/login",
    "/signup",
    "/admin/login",
    "/change-password",
  ].includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Header />}
      <Alert />
      {/* <NetworkModal />  */}
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/kpis" />} />

          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/contact" element={<ContactPage />} />
                    <Route path="/instructions" element={<InstructionsPage />} />

          <Route path="/signup" element={<SignupPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
<Route path="/admin/*" element={<AdminLayout />}>
  <Route element={<PrivateRoute />}>
    {/* Default redirect: /admin → /admin/dashboard */}
    <Route index element={<Navigate to="dashboard" replace />} />

    <Route path="dashboard" element={<Dashboard />} />
    <Route path="departments" element={<DepartmentPage />} />
    <Route path="users" element={<EmployeesPage />} />
    <Route path="kpis" element={<KpiBoard />} />
    <Route path="feedback" element={<DiscrepanciesPage />} />
    <Route
      path="user-kpis/:userId/:username"
      element={<UserKpiBoard />}
    />
    <Route path="report" element={<ReportsPage />} />
        <Route path="profile" element={<ProfilePage />} />

  </Route>
</Route>


          {/* 404 Route - Catch all unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default App;