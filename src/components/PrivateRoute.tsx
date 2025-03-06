import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
    children: React.ReactNode;
    role: 'student' | 'admin';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || !user.role) {
        console.log('No user or role found, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.role !== role) {
        console.log(`Access denied. Required: ${role}, Current: ${user.role}`);
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student'} replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute; 