import React, { useEffect, useState } from 'react';
import { supabase, supabaseAdmin } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import { HiTrash, HiPencil, HiPlus } from 'react-icons/hi';

interface Student {
    id: string;
    name: string;
    email: string;
    national_id: string;
    room_number?: string;
    created_at: string;
    role: 'student';
}

const StudentManagement = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        national_id: '',
        room_number: '',
        role: 'student' as const
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const client = supabaseAdmin || supabase; // Fallback to regular client if admin not available
            const { data, error } = await client
                .from('profiles')
                .select('*')
                .eq('role', 'student');

            if (error) throw error;
            setStudents(data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // First create auth user
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: formData.email,
                password: formData.password,
                email_confirm: true,
                user_metadata: {
                    name: formData.name,
                    national_id: formData.national_id,
                    role: formData.role
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                toast.success('Student added successfully');
                setShowAddModal(false);
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    national_id: '',
                    room_number: '',
                    role: 'student'
                });
                fetchStudents();
            }
        } catch (error) {
            console.error('Error adding student:', error);
            toast.error('Failed to add student');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (!window.confirm('Are you sure you want to delete this student?')) return;

        try {
            // First delete from auth
            const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(studentId);
            if (authError) throw authError;

            // Then delete from profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .delete()
                .eq('id', studentId);

            if (profileError) throw profileError;

            toast.success('Student deleted successfully');
            fetchStudents();
        } catch (error) {
            console.error('Error deleting student:', error);
            toast.error('Failed to delete student');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Student Management</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    <HiPlus className="w-5 h-5 mr-2" />
                    Add Student
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading students...</div>
                </div>
            ) : students.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                    No students found. Add some students to get started.
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    National ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Room
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{student.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{student.national_id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">
                                            {student.room_number || 'Not assigned'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDeleteStudent(student.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <HiTrash className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Student Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Student</h3>
                            <form onSubmit={handleAddStudent} className="mt-4 space-y-4">
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="National ID"
                                    value={formData.national_id}
                                    onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Room Number (Optional)"
                                    value={formData.room_number}
                                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
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
                                        {loading ? 'Adding...' : 'Add Student'}
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

export default StudentManagement; 