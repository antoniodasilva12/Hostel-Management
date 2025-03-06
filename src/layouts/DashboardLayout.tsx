import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../context/AuthContext';
import { HiLogout } from 'react-icons/hi';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin' || user?.user_metadata?.role === 'admin';

    const handleSignOut = async () => {
        try {
            await signOut();
            toast.success('Signed out successfully');
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
            toast.error('Failed to sign out');
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar role={isAdmin ? 'admin' : 'student'} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <h1 className="text-xl font-semibold text-gray-900">
                                {isAdmin ? 'Admin Dashboard' : 'Student Dashboard'}
                            </h1>
                            <NotificationBell />
                            <button
                                onClick={handleSignOut}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <HiLogout className="w-5 h-5 mr-2" />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout; 