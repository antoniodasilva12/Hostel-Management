import type { FC } from 'react';
import { useState, useRef } from 'react';
import { HiBell } from 'react-icons/hi';
import { useNotifications } from '../context/NotificationContext';
import { useOnClickOutside } from '../hooks/useOnClickOutside';

interface NotificationBellProps {
    className?: string;
}

const NotificationBell: FC<NotificationBellProps> = ({ className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

    useOnClickOutside(dropdownRef, () => setIsOpen(false));

    const handleNotificationClick = async (id: string) => {
        await markAsRead(id);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-800';
            case 'error':
                return 'bg-red-100 text-red-800';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    const toggleNotifications = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleNotifications}
                className={`relative p-2 rounded-full hover:bg-gray-100 focus:outline-none ${className}`}
            >
                <HiBell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="text-xs text-indigo-600 hover:text-indigo-800"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No notifications
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 ${!notification.read ? 'bg-gray-50' : ''}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {notification.title}
                                                </p>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {notification.message}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {formatDate(notification.created_at)}
                                                </p>
                                            </div>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                                                {notification.type}
                                            </span>
                                        </div>
                                        <div className="mt-2 flex justify-end space-x-2">
                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleNotificationClick(notification.id)}
                                                    className="text-xs text-indigo-600 hover:text-indigo-800"
                                                >
                                                    Mark as read
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="text-xs text-red-600 hover:text-red-800"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell; 