import React from 'react';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Welcome, {user?.name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Room Status Card */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Room Status</h2>
                    <p className="text-gray-600">
                        Room Number: {user?.room_number || 'Not Assigned'}
                    </p>
                </div>

                {/* Maintenance Requests Card */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Maintenance Requests</h2>
                    <p className="text-gray-600">No pending requests</p>
                </div>

                {/* Billing Status Card */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Billing Status</h2>
                    <p className="text-gray-600">No pending bills</p>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard; 