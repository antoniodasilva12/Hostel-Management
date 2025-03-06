import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { FC } from 'react';

const AuthRedirect: FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const role = user.user_metadata?.role || user.role || 'student';
    return <Navigate to={`/${role}`} replace />;
};

export default AuthRedirect; 