import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface MaintenanceRequestFormProps {
    roomNumber: string | null;
    onRequestSubmitted: () => void;
}

const MaintenanceRequestForm: React.FC<MaintenanceRequestFormProps> = ({ roomNumber, onRequestSubmitted }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        issue_type: '',
        description: '',
        priority: 'low'
    });

    const issueTypes = [
        'Plumbing',
        'Electrical',
        'Furniture',
        'Appliance',
        'HVAC',
        'Structural',
        'Cleaning',
        'Other'
    ];

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
            onRequestSubmitted();

        } catch (error) {
            console.error('Error submitting request:', error);
            toast.error('Failed to submit maintenance request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Issue Type *
                </label>
                <select
                    value={formData.issue_type}
                    onChange={(e) => setFormData({ ...formData, issue_type: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                >
                    <option value="">Select issue type</option>
                    {issueTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Priority Level
                </label>
                <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Description *
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Please describe the issue in detail..."
                    required
                />
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading || !roomNumber}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Submitting...' : 'Submit Request'}
                </button>
            </div>
        </form>
    );
};

export default MaintenanceRequestForm; 