import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Modal from '../../components/Modal';

interface MaintenanceRequest {
    id: string;
    created_at: string;
    student_id: string;
    student_name: string;
    room_number: string;
    issue_type: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    admin_response?: string;
    resolved_at?: string;
}

const MaintenanceRequest = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roomNumber, setRoomNumber] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        issue_type: '',
        description: '',
        priority: 'low' as const
    });

    useEffect(() => {
        if (user) {
            fetchRoomAndRequests();
        }
    }, [user]);

    const fetchRoomAndRequests = async () => {
        try {
            setLoading(true);

            // First get the user's room number from room_assignments
            const { data: roomData, error: roomError } = await supabase
                .from('room_assignments')
                .select('room_number')
                .eq('student_id', user?.id)
                .eq('status', 'active')
                .single();

            if (roomError && roomError.code !== 'PGRST116') throw roomError;
            setRoomNumber(roomData?.room_number || null);

            // Then fetch maintenance requests
            const { data: requestsData, error: requestsError } = await supabase
                .from('maintenance_requests')
                .select('*')
                .eq('student_id', user?.id)
                .order('created_at', { ascending: false });

            if (requestsError) throw requestsError;
            setRequests(requestsData || []);

        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!roomNumber) {
            toast.error('You must be assigned to a room to submit maintenance requests');
            return;
        }

        if (!formData.issue_type || !formData.description) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase
                .from('maintenance_requests')
                .insert({
                    student_id: user?.id,
                    student_name: user?.name,
                    room_number: roomNumber,
                    issue_type: formData.issue_type,
                    description: formData.description,
                    priority: formData.priority,
                    status: 'pending'
                });

            if (error) throw error;

            toast.success('Maintenance request submitted successfully');
            setFormData({ issue_type: '', description: '', priority: 'low' });
            setIsModalOpen(false);
            fetchRoomAndRequests();

        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeColor = (status: MaintenanceRequest['status']) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            in_progress: 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        return colors[status];
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Maintenance Requests</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!roomNumber}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    New Request
                </button>
            </div>

            {!roomNumber && (
                <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-yellow-700">
                        You must be assigned to a room to submit maintenance requests.
                    </p>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.map((request) => (
                            <tr key={request.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(request.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {request.issue_type}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {request.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                    {request.priority}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(request.status)}`}>
                                        {request.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {request.admin_response || '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Submit Maintenance Request"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Issue Type *</label>
                        <select
                            value={formData.issue_type}
                            onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            required
                        >
                            <option value="">Select issue type</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Furniture">Furniture</option>
                            <option value="HVAC">HVAC</option>
                            <option value="Cleaning">Cleaning</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Priority Level</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as MaintenanceRequest['priority'] })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            placeholder="Please describe the issue in detail..."
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MaintenanceRequest; 