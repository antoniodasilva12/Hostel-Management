import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';

interface SettingsForm {
    email: string;
    name: string;
    student_id: string;
    room_number: string | null;
    notifications_enabled: boolean;
    theme: string;
    language: string;
    password: string;
    new_password: string;
    confirm_password: string;
}

const Settings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<SettingsForm>({
        email: user?.email || '',
        name: user?.user_metadata?.name || '',
        student_id: user?.user_metadata?.student_id || '',
        room_number: user?.user_metadata?.room_number || null,
        notifications_enabled: true,
        theme: 'light',
        language: 'en',
        password: '',
        new_password: '',
        confirm_password: ''
    });

    useEffect(() => {
        fetchUserSettings();
    }, [user]);

    const fetchUserSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('student_settings')
                .select('*')
                .eq('user_id', user?.id)
                .single();

            if (error) throw error;

            if (data) {
                setSettings(prev => ({
                    ...prev,
                    ...data,
                    password: '',
                    new_password: '',
                    confirm_password: ''
                }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Update password if provided
            if (settings.new_password) {
                if (settings.new_password !== settings.confirm_password) {
                    throw new Error('New passwords do not match');
                }

                const { error: passwordError } = await supabase.auth.updateUser({
                    password: settings.new_password
                });

                if (passwordError) throw passwordError;
            }

            // Update other settings
            const { error: settingsError } = await supabase
                .from('student_settings')
                .upsert({
                    user_id: user?.id,
                    notifications_enabled: settings.notifications_enabled,
                    theme: settings.theme,
                    language: settings.language
                });

            if (settingsError) throw settingsError;

            toast.success('Settings updated successfully');
        } catch (error: any) {
            console.error('Error updating settings:', error);
            toast.error(error.message || 'Failed to update settings');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Information */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={settings.email}
                                disabled
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={settings.name}
                                disabled
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Student ID</label>
                            <input
                                type="text"
                                name="student_id"
                                value={settings.student_id}
                                disabled
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Room Number</label>
                            <input
                                type="text"
                                name="room_number"
                                value={settings.room_number || 'Not Assigned'}
                                disabled
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                            />
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Preferences</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Theme</label>
                            <select
                                name="theme"
                                value={settings.theme}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Language</label>
                            <select
                                name="language"
                                value={settings.language}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="en">English</option>
                                <option value="sw">Swahili</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="notifications_enabled"
                                checked={settings.notifications_enabled}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-700">
                                Enable Notifications
                            </label>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Current Password</label>
                            <input
                                type="password"
                                name="password"
                                value={settings.password}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Password</label>
                            <input
                                type="password"
                                name="new_password"
                                value={settings.new_password}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirm_password"
                                value={settings.confirm_password}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Settings; 