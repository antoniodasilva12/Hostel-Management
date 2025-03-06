import type { FC } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminHome: FC = () => {
    const { user } = useAuth();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Welcome, Admin {user?.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Quick Stats</h2>
                    {/* Add admin dashboard stats */}
                </div>
            </div>
        </div>
    );
};

export default AdminHome; 