import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    HiHome,
    HiUsers,
    HiOfficeBuilding,
    HiCurrencyDollar,
    HiClipboardList,
    HiCog,
    HiChat,
    HiDocumentReport,
    HiKey,
    HiChartBar,
    HiCash,
    HiSupport,
    HiTemplate
} from 'react-icons/hi';

const AdminLayout = () => {
    const location = useLocation();
    const { signOut } = useAuth();

    const navigation = [
        // Dashboard Section
        { name: 'Dashboard', href: '/admin/dashboard', icon: HiHome },
        
        // Student Management
        { name: 'Student Management', href: '/admin/students', icon: HiUsers },
        
        // Room Management Section
        { name: 'Room Management', href: '/admin/rooms', icon: HiOfficeBuilding },
        { name: 'Room Assignment', href: '/admin/room-assignment', icon: HiKey },
        { name: 'Room Allocation', href: '/admin/room-allocation', icon: HiTemplate },
        
        // Maintenance Section
        { name: 'Maintenance Requests', href: '/admin/maintenance', icon: HiClipboardList },
        
        // Billing Section
        { name: 'Billing Overview', href: '/admin/billing', icon: HiCurrencyDollar },
        { name: 'Billing Management', href: '/admin/billing-management', icon: HiCash },
        
        // Reports Section
        { name: 'Reports', href: '/admin/reports', icon: HiDocumentReport },
        { name: 'Chat Analytics', href: '/admin/chat-analytics', icon: HiChartBar },
        
        // Settings & Support
        { name: 'Settings', href: '/admin/settings', icon: HiCog },
        { name: 'Chat Assistant', href: '/admin/chat', icon: HiChat },
        { name: 'Support', href: '/admin/support', icon: HiSupport }
    ];

    // Group navigation items by section
    const sections = [
        {
            title: 'Main',
            items: navigation.slice(0, 2)
        },
        {
            title: 'Room Management',
            items: navigation.slice(2, 5)
        },
        {
            title: 'Operations',
            items: navigation.slice(5, 6)
        },
        {
            title: 'Billing',
            items: navigation.slice(6, 8)
        },
        {
            title: 'Analytics',
            items: navigation.slice(8, 10)
        },
        {
            title: 'System',
            items: navigation.slice(10)
        }
    ];

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar with fixed header and footer */}
            <div className="w-64 bg-gray-900 flex flex-col h-screen">
                {/* Fixed Header */}
                <div className="flex-shrink-0 p-4 border-b border-gray-800">
                    <h1 className="text-2xl font-bold text-white">Hostel Management</h1>
                </div>
                
                {/* Scrollable Navigation */}
                <nav className="flex-1 overflow-y-auto py-4">
                    {sections.map((section) => (
                        <div key={section.title} className="px-3 py-2">
                            <h2 className="mb-2 px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                {section.title}
                            </h2>
                            <div className="space-y-1">
                                {section.items.map((item) => (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-150 ${
                                            isActive(item.href)
                                                ? 'bg-gray-800 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        }`}
                                    >
                                        <item.icon className="h-5 w-5 mr-3" />
                                        <span>{item.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Fixed Footer with Logout */}
                <div className="flex-shrink-0 p-4 border-t border-gray-800">
                    <button
                        onClick={signOut}
                        className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
                    >
                        <span className="mr-3">⬅️</span>
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm">
                    <div className="flex justify-between items-center px-6 py-4">
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <div className="flex items-center">
                            <span className="mr-4 text-gray-600">Admin</span>
                            <button
                                onClick={signOut}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout; 