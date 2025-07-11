import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ allowedRoles = [] }) => {
    const { user, token } = useSelector((state) => state.auth);

    const isAuthenticated = !!token;
    const isAuthorized = allowedRoles.length === 0 || (user && allowedRoles.includes(user.data.role));

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!isAuthorized) {
        return <Navigate to="/" />;
    }

    return <Outlet />;
};

export default PrivateRoute;
