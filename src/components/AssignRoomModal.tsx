import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import toast from 'react-hot-toast';

interface Student {
    id: string;
    name: string;
    email: string;
    room_number: string | null;
}

interface Props {
    roomNumber: string;
    onClose: () => void;
    onAssign: () => void;
}

const AssignRoomModal = ({ roomNumber, onClose, onAssign }: Props) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState('');

    useEffect(() => {
        fetchUnassignedStudents();
    }, []);

    const fetchUnassignedStudents = async () => {
        try {
            console.log('Fetching unassigned students...');
            const { data, error } = await supabase
                .from('profiles')
                .select('*')  // Changed to select all fields for debugging
                .eq('role', 'student');
                // Temporarily removed the room_number filter for testing
                // .is('room_number', null);

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            console.log('Fetched students:', data);
            setStudents(data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to fetch students');
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedStudent) {
            toast.error('Please select a student');
            return;
        }

        try {
            setLoading(true);
            // Update student's room_number in profiles
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ room_number: roomNumber })
                .eq('id', selectedStudent);

            if (updateError) throw updateError;

            // Update room status to occupied
            const { error: roomError } = await supabase
                .from('rooms')
                .update({ status: 'occupied' })
                .eq('room_number', roomNumber);

            if (roomError) throw roomError;

            toast.success('Student assigned to room successfully');
            onAssign();
            onClose();
        } catch (error) {
            console.error('Error assigning room:', error);
            toast.error('Failed to assign room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Assign Student to Room {roomNumber}
                    </h3>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Select Student
                        </label>
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            disabled={loading}
                        >
                            <option value="">
                                {loading 
                                    ? 'Loading students...' 
                                    : students.length === 0 
                                        ? 'No unassigned students available' 
                                        : 'Select a student'
                                }
                            </option>
                            {!loading && students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.name} ({student.email})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-5 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAssign}
                            disabled={loading || !selectedStudent}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Assigning...' : 'Assign Room'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignRoomModal; 