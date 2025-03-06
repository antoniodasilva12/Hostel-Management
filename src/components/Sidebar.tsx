import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    HiHome, 
    HiUserGroup, 
    HiClipboardList, 
    HiCog,
    HiLogout,
    HiCurrencyDollar,
    HiChartBar,
    HiOfficeBuilding,
    HiChat
} from 'react-icons/hi';

interface SidebarProps {
    role: 'admin' | 'student';
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
    const location = useLocation();
    const { signOut } = useAuth();

    const isActive = (path: string) => location.pathname === path;

    const linkClass = (path: string) => `
        flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors
        ${isActive(path) ? 'bg-gray-700 text-white' : ''}
    `;

    return (
        <div className="bg-gray-800 w-64 flex flex-col h-screen">
            {/* Logo/Header section - fixed at top */}
            <div className="flex items-center h-16 px-4 bg-gray-900">
                <h1 className="text-xl font-bold text-white">
                    Hostel Management
                </h1>
            </div>

            {/* Scrollable navigation section */}
            <div className="flex-1 overflow-y-auto">
                <nav className="mt-4 space-y-1">
                    <Link to="/dashboard" className={linkClass('/dashboard')}>
                        <HiHome className="w-5 h-5 mr-3" />
                        Dashboard
                    </Link>

                    {role === 'admin' ? (
                        <>
                            <Link to="/admin/students" className={linkClass('/admin/students')}>
                                <HiUserGroup className="w-5 h-5 mr-3" />
                                Student Management
                            </Link>

                            <Link to="/admin/rooms" className={linkClass('/admin/rooms')}>
                                <HiOfficeBuilding className="w-5 h-5 mr-3" />
                                Room Management
                            </Link>

                            <Link to="/admin/maintenance" className={linkClass('/admin/maintenance')}>
                                <HiClipboardList className="w-5 h-5 mr-3" />
                                Maintenance Requests
                            </Link>

                            <Link to="/admin/billing" className={linkClass('/admin/billing')}>
                                <HiCurrencyDollar className="w-5 h-5 mr-3" />
                                Billing
                            </Link>

                            <Link to="/admin/reports" className={linkClass('/admin/reports')}>
                                <HiChartBar className="w-5 h-5 mr-3" />
                                Reports
                            </Link>

                            <Link to="/admin/settings" className={linkClass('/admin/settings')}>
                                <HiCog className="w-5 h-5 mr-3" />
                                Settings
                            </Link>

                            <Link to="/admin/chat-analytics" className={linkClass('/admin/chat-analytics')}>
                                <HiChat className="w-5 h-5 mr-3" />
                                Chat Analytics
                            </Link>

                            <Link to="/admin/room-assignment" className={linkClass('/admin/room-assignment')}>
                                <HiOfficeBuilding className="w-5 h-5 mr-3" />
                                Room Assignment
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/student/profile" className={linkClass('/student/profile')}>
                                <HiUserGroup className="w-5 h-5 mr-3" />
                                My Profile
                            </Link>

                            <Link to="/student/room" className={linkClass('/student/room')}>
                                <HiOfficeBuilding className="w-5 h-5 mr-3" />
                                My Room
                            </Link>

                            <Link to="/student/maintenance" className={linkClass('/student/maintenance')}>
                                <HiClipboardList className="w-5 h-5 mr-3" />
                                Maintenance Request
                            </Link>

                            <Link to="/student/billing" className={linkClass('/student/billing')}>
                                <HiCurrencyDollar className="w-5 h-5 mr-3" />
                                Billing
                            </Link>
                        </>
                    )}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={() => signOut()}
                    className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <HiLogout className="w-6 h-6" />
                    <span className="ml-3">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar; 