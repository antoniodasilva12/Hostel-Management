import React from 'react';
import { useNotifications } from '../../context/NotificationContext';

const Notifications = () => {
    const { notifications, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Notifications</h1>
                {notifications.length > 0 && (
                    <button
                        onClick={() => markAllAsRead()}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No notifications</p>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 rounded-lg shadow ${
                                notification.read ? 'bg-white' : 'bg-blue-50'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold">{notification.title}</h3>
                                    <p className="text-gray-600 mt-1">{notification.message}</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        {new Date(notification.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex space-x-2">
                                    {!notification.read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="text-sm text-indigo-600 hover:text-indigo-800"
                                        >
                                            Mark as read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications; 