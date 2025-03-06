import React, { useEffect, useState, type FC } from 'react';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';

// Add this interface for maintenance types
const MAINTENANCE_TYPES = [
    'Plumbing Issue',
    'Electrical Problem',
    'Furniture Repair',
    'Air Conditioning',
    'Heating System',
    'Lock/Key Issue',
    'Pest Control',
    'Cleaning Service',
    'Internet/Network Issue',
    'Other'
] as const;

type MaintenanceType = typeof MAINTENANCE_TYPES[number];

// Define user metadata type
interface UserMetadata {
    role: 'student' | 'admin';
    student_id: string;
    room_number: string;
    name: string;
}

// Update MaintenanceRequest interface
interface MaintenanceRequest {
    id?: string;
    type: MaintenanceType;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed';
    student_name: string;
    student_id: string;
    room_number: string;
    created_at?: string;
    updated_at?: string;
}

const StudentMaintenanceRequests: FC = () => {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<MaintenanceRequest>>({
        type: 'Plumbing Issue' as const,
        description: '',
        priority: 'low',
        status: 'pending',
        student_name: '',
        student_id: '',
        room_number: ''
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('maintenance_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                if (error.code === '42501') {
                    toast.error('Permission denied. Please check your access rights.');
                } else {
                    toast.error('Failed to fetch requests');
                }
                return;
            }

            setRequests(data || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('An unexpected error occurred while fetching requests');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Validate required fields
            if (!formData.student_name || !formData.student_id || !formData.room_number || !formData.type || !formData.description) {
                toast.error('Please fill in all required fields');
                return;
            }

            const newRequest = {
                type: formData.type,
                description: formData.description,
                priority: formData.priority || 'low',
                status: 'pending',
                student_name: formData.student_name,
                student_id: formData.student_id,
                room_number: formData.room_number,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('maintenance_requests')
                .insert([newRequest])
                .select()
                .single();

            if (error) {
                console.error('Supabase error:', error);
                if (error.code === '42501') {
                    toast.error('Permission denied. Please check your access rights.');
                } else if (error.code === '23505') {
                    toast.error('A request with this information already exists.');
                } else {
                    toast.error('Failed to submit request. Please try again.');
                }
                return;
            }

            toast.success('Request submitted successfully!');
            setIsModalOpen(false);
            fetchRequests();
            
            // Reset form
            setFormData({
                type: 'Plumbing Issue' as const,
                description: '',
                priority: 'low',
                status: 'pending',
                student_name: '',
                student_id: '',
                room_number: ''
            });

        } catch (error) {
            console.error('Error:', error);
            toast.error('An unexpected error occurred. Please try again.');
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-green-100 text-green-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Maintenance Requests</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center"
                >
                    <span className="mr-2">+</span> New Request
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg w-full max-w-4xl">
                        <div className="border-b border-gray-200">
                            <div className="px-6 py-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">New Maintenance Request</h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">×</button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="px-6 py-4">
                            <table className="min-w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Number</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={formData.student_name}
                                                onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                                placeholder="Enter student name"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={formData.student_id}
                                                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                                placeholder="Enter student ID"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                value={formData.room_number}
                                                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                                placeholder="Enter room number"
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <table className="min-w-full mt-4">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-6 py-4">
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value as MaintenanceType })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                            >
                                                <option value="">Select Issue Type</option>
                                                {MAINTENANCE_TYPES.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={3}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                                placeholder="Describe the issue"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={formData.priority}
                                                onChange={(e) => setFormData({ ...formData, priority: e.target.value as MaintenanceRequest['priority'] })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                required
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="urgent">Urgent</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500">Pending</div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Requests Table */}
            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.map((request) => (
                                <tr key={request.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{request.type}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{request.description}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                                            {request.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(request.created_at || '').toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StudentMaintenanceRequests; 