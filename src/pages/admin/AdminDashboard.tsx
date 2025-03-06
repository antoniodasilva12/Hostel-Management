import React from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Welcome, Admin {user?.name}</h1>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Total Students</h3>
                    <p className="text-3xl font-bold text-blue-600">150</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Available Rooms</h3>
                    <p className="text-3xl font-bold text-green-600">25</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Pending Requests</h3>
                    <p className="text-3xl font-bold text-yellow-600">8</p>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    {/* Add your recent activity items here */}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 