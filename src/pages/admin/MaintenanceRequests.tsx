import React, { useEffect, useState, type FC } from 'react';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';

interface MaintenanceRequest {
    id: string;
    type: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed';
    student_name: string;
    student_id: string;
    room_number: string;
    created_at: string;
    updated_at: string;
}

const MaintenanceRequests: FC = () => {
    const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('maintenance_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    const updateRequestStatus = async (id: string, newStatus: MaintenanceRequest['status']) => {
        try {
            const { error } = await supabase
                .from('maintenance_requests')
                .update({ 
                    status: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            // Update local state
            setRequests(prev => 
                prev.map(request => 
                    request.id === id 
                        ? { ...request, status: newStatus, updated_at: new Date().toISOString() }
                        : request
                )
            );

            // Send notification to student
            await supabase.from('notifications').insert([{
                user_id: selectedRequest?.student_id,
                title: 'Maintenance Request Update',
                message: `Your maintenance request for ${selectedRequest?.type} has been updated to ${newStatus}`,
                type: 'info',
                read: false,
                created_at: new Date().toISOString()
            }]);

            toast.success('Status updated successfully');
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to update status');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            default: return 'bg-yellow-100 text-yellow-800';
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

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Maintenance Requests</h1>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {requests.map((request) => (
                                <tr key={request.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {request.type}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {request.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {request.student_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {request.room_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                                            {request.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(request.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => {
                                                setSelectedRequest(request);
                                                setIsModalOpen(true);
                                            }}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            Update Status
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Status Update Modal */}
            {isModalOpen && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Update Request Status</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Current Status</p>
                                <p className="mt-1">{selectedRequest.status}</p>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <button
                                    onClick={() => updateRequestStatus(selectedRequest.id, 'pending')}
                                    className={`px-4 py-2 rounded-md ${
                                        selectedRequest.status === 'pending' 
                                            ? 'bg-yellow-100 text-yellow-800' 
                                            : 'bg-gray-100 hover:bg-yellow-50 text-gray-800'
                                    }`}
                                >
                                    Mark as Pending
                                </button>
                                <button
                                    onClick={() => updateRequestStatus(selectedRequest.id, 'in_progress')}
                                    className={`px-4 py-2 rounded-md ${
                                        selectedRequest.status === 'in_progress' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-gray-100 hover:bg-blue-50 text-gray-800'
                                    }`}
                                >
                                    Mark as In Progress
                                </button>
                                <button
                                    onClick={() => updateRequestStatus(selectedRequest.id, 'completed')}
                                    className={`px-4 py-2 rounded-md ${
                                        selectedRequest.status === 'completed' 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-gray-100 hover:bg-green-50 text-gray-800'
                                    }`}
                                >
                                    Mark as Completed
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MaintenanceRequests; 