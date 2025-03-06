import type { FC } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatBotProvider } from './context/ChatBotContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

// Admin imports
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import RoomAssignment from './pages/admin/RoomAssignment';
import RoomAllocation from './pages/admin/RoomAllocation';
import RoomManagement from './pages/admin/RoomManagement';
import MaintenanceRequests from './pages/admin/MaintenanceRequests';
import AdminBilling from './pages/admin/AdminBilling';
import BillingManagement from './pages/admin/BillingManagement';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import ChatAnalytics from './pages/admin/ChatAnalytics';
import AdminChat from './pages/admin/AdminChat';

// Student imports
import StudentLayout from './layouts/StudentLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentHome from './pages/student/StudentHome';
import StudentProfile from './pages/student/StudentProfile';
import StudentRoomManagement from './pages/student/RoomManagement';
import StudentMaintenanceRequests from './pages/student/StudentMaintenanceRequests';
import StudentBilling from './pages/student/StudentBilling';
import ResourceManagement from './pages/student/ResourceManagement';
import MaintenanceRequest from './pages/student/MaintenanceRequest';
import Billing from './pages/student/Billing';
import Notifications from './pages/student/Notifications';
import BookRoom from './pages/student/BookRoom';
import ChatBot from './pages/student/ChatBot';

import PrivateRoute from './components/PrivateRoute';
import { Toaster } from 'react-hot-toast';

const AppRoutes: FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Admin routes */}
            <Route 
                path="/admin" 
                element={
                    <PrivateRoute role="admin">
                        <AdminLayout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="students" element={<StudentManagement />} />
                <Route path="room-assignment" element={<RoomAssignment />} />
                <Route path="room-allocation" element={<RoomAllocation />} />
                <Route path="rooms" element={<RoomManagement />} />
                <Route path="maintenance" element={<MaintenanceRequests />} />
                <Route path="billing" element={<AdminBilling />} />
                <Route path="billing-management" element={<BillingManagement />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="chat-analytics" element={<ChatAnalytics />} />
                <Route path="chat" element={<AdminChat />} />
            </Route>

            {/* Student routes */}
            <Route
                path="/student/*"
                element={
                    <PrivateRoute role="student">
                        <StudentLayout />
                    </PrivateRoute>
                }
            >
                <Route index element={<StudentDashboard />} />
                <Route path="home" element={<StudentHome />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="room" element={<StudentRoomManagement />} />
                <Route path="maintenance" element={<StudentMaintenanceRequests />} />
                <Route path="maintenance-request" element={<MaintenanceRequest />} />
                <Route path="billing" element={<StudentBilling />} />
                <Route path="billing-details" element={<Billing />} />
                <Route path="resources" element={<ResourceManagement />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
                <Route path="book-room" element={<BookRoom />} />
                <Route path="chat" element={<ChatBot />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

const App: FC = () => {
    return (
        <Router>
            <AuthProvider>
                <NotificationProvider>
                    <ChatBotProvider>
                        <Toaster position="top-right" />
                        <AppRoutes />
                    </ChatBotProvider>
                </NotificationProvider>
            </AuthProvider>
        </Router>
    );
};

export default App; 