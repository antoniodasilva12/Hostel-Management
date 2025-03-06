import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { notifyBillCreated } from '../../utils/notifications';
import toast from 'react-hot-toast';

interface Bill {
    id: string;
    student_id: string;
    amount: number;
    due_date: string;
    status: 'paid' | 'pending';
    description: string;
    created_at: string;
    payment_date?: string;
    profiles: {
        name: string;
        email: string;
        room_number: string;
    };
}

const BillingManagement = () => {
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
    const [formData, setFormData] = useState({
        student_id: '',
        amount: '',
        description: '',
        due_date: '',
    });

    useEffect(() => {
        fetchBills();
        fetchStudents();
    }, []);

    const fetchBills = async () => {
        try {
            const { data, error } = await supabase
                .from('bills')
                .select(`
                    *,
                    profiles:student_id (
                        name,
                        email,
                        room_number
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBills(data || []);
        } catch (error) {
            console.error('Error fetching bills:', error);
            toast.error('Failed to fetch bills');
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name')
                .eq('role', 'student');

            if (error) throw error;
            setStudents(data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const handleAddBill = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('bills')
                .insert([
                    {
                        student_id: formData.student_id,
                        amount: parseFloat(formData.amount),
                        description: formData.description,
                        due_date: formData.due_date,
                        status: 'pending'
                    }
                ]);

            if (error) throw error;

            await notifyBillCreated(
                formData.student_id,
                parseFloat(formData.amount),
                formData.due_date
            );

            toast.success('Bill created successfully');
            setShowAddModal(false);
            setFormData({
                student_id: '',
                amount: '',
                description: '',
                due_date: '',
            });
            fetchBills();
        } catch (error) {
            console.error('Error creating bill:', error);
            toast.error('Failed to create bill');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'paid' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Billing Management</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                    Create New Bill
                </button>
            </div>

            {/* Bills List */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Room
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Due Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bills.map((bill) => (
                            <tr key={bill.id}>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {bill.profiles.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {bill.profiles.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {bill.profiles.room_number}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">
                                        {bill.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        ${bill.amount.toFixed(2)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {new Date(bill.due_date).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                                        {bill.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Bill Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Create New Bill</h3>
                            <form onSubmit={handleAddBill} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Student</label>
                                    <select
                                        value={formData.student_id}
                                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Select a student</option>
                                        {students.map(student => (
                                            <option key={student.id} value={student.id}>
                                                {student.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-4 py-2 text-gray-500 hover:text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        {loading ? 'Creating...' : 'Create Bill'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingManagement; 