import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiHome, HiUser, HiKey, HiClipboardList, HiLightningBolt, HiCash, HiChat, HiBell } from 'react-icons/hi';

const StudentLayout = () => {
    const { signOut } = useAuth();

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-900 text-white flex flex-col">
                <div className="p-4">
                    <h1 className="text-2xl font-bold">Hostel Management</h1>
                </div>
                
                <nav className="flex-1 overflow-y-auto">
                    <NavLink 
                        to="/student" 
                        end
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`
                        }
                    >
                        <HiHome className="w-5 h-5 mr-3" />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink 
                        to="/student/profile"
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`
                        }
                    >
                        <HiUser className="w-5 h-5 mr-3" />
                        <span>My Profile</span>
                    </NavLink>

                    <NavLink 
                        to="/student/room"
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`
                        }
                    >
                        <HiKey className="w-5 h-5 mr-3" />
                        <span>My Room</span>
                    </NavLink>

                    <NavLink 
                        to="/student/book-room"
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`
                        }
                    >
                        <HiKey className="w-5 h-5 mr-3" />
                        <span>Book Room</span>
                    </NavLink>

                    <NavLink 
                        to="/student/maintenance"
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`
                        }
                    >
                        <HiClipboardList className="w-5 h-5 mr-3" />
                        <span>Maintenance Request</span>
                    </NavLink>

                    <NavLink 
                        to="/student/resources"
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`
                        }
                    >
                        <HiLightningBolt className="w-5 h-5 mr-3" />
                        <span>Resource Management</span>
                    </NavLink>

                    <NavLink 
                        to="/student/chat"
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`
                        }
                    >
                        <HiChat className="w-5 h-5 mr-3" />
                        <span>Chat Assistant</span>
                    </NavLink>

                    <NavLink 
                        to="/student/notifications"
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`
                        }
                    >
                        <HiBell className="w-5 h-5 mr-3" />
                        <span>Notifications</span>
                    </NavLink>

                    <NavLink 
                        to="/student/billing"
                        className={({ isActive }) => 
                            `flex items-center px-4 py-2 ${isActive ? 'bg-gray-800' : 'hover:bg-gray-800'}`
                        }
                    >
                        <HiCash className="w-5 h-5 mr-3" />
                        <span>Billing</span>
                    </NavLink>
                </nav>

                <button
                    onClick={() => signOut()}
                    className="p-4 text-gray-400 hover:text-white border-t border-gray-800"
                >
                    Logout
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default StudentLayout;