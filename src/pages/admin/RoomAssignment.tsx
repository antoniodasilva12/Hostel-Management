import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface Student {
    id: string;
    name: string;
    email: string;
}

interface Room {
    id: string;
    room_number: string;
    floor_number: number;
    capacity: number;
    status: 'available' | 'occupied' | 'maintenance';
}

const RoomAssignment = () => {
    const { user } = useAuth();
    const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');

    useEffect(() => {
        if (user?.role !== 'admin') {
            toast.error('Only administrators can access this page');
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Get all students from profiles
            const { data: studentsData, error: studentsError } = await supabase
                .from('profiles')
                .select('id, name, email')
                .eq('role', 'student');

            if (studentsError) throw studentsError;

            // Get students who already have room assignments
            const { data: assignedStudents, error: assignmentsError } = await supabase
                .from('room_assignments')
                .select('student_id')
                .eq('status', 'active');

            if (assignmentsError) throw assignmentsError;

            // Filter out already assigned students
            const assignedIds = assignedStudents?.map(a => a.student_id) || [];
            const unassignedStudentsData = studentsData?.filter(s => !assignedIds.includes(s.id)) || [];

            // Get available rooms
            const { data: roomsData, error: roomsError } = await supabase
                .from('rooms')
                .select('*')
                .eq('status', 'available');

            if (roomsError) throw roomsError;

            setUnassignedStudents(unassignedStudentsData);
            setAvailableRooms(roomsData || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleAssignment = async () => {
        if (!selectedStudent || !selectedRoom) {
            toast.error('Please select both a student and a room');
            return;
        }

        if (user?.role !== 'admin') {
            toast.error('Only administrators can assign rooms');
            return;
        }

        try {
            setLoading(true);

            // Log the current user and their role
            console.log('Current user:', {
                id: user?.id,
                role: user?.role,
                email: user?.email
            });

            // Get student details
            const student = unassignedStudents.find(s => s.id === selectedStudent);
            const room = availableRooms.find(r => r.room_number === selectedRoom);

            if (!student || !room) {
                throw new Error('Invalid student or room selection');
            }

            console.log('Attempting to insert:', {
                student_id: student.id,
                student_name: student.name,
                student_email: student.email,
                room_number: room.room_number,
                floor_number: room.floor_number,
                status: 'active'
            });

            // Create room assignment
            const { data: assignmentData, error: assignmentError } = await supabase
                .from('room_assignments')
                .insert({
                    student_id: student.id,
                    student_name: student.name,
                    student_email: student.email,
                    room_number: room.room_number,
                    floor_number: room.floor_number,
                    status: 'active'
                })
                .select()
                .single();

            if (assignmentError) {
                console.error('Assignment error:', {
                    message: assignmentError.message,
                    details: assignmentError.details,
                    code: assignmentError.code,
                    hint: assignmentError.hint
                });
                throw assignmentError;
            }

            console.log('Assignment created:', assignmentData); // Debug log

            // Update room status
            const { error: roomError } = await supabase
                .from('rooms')
                .update({ status: 'occupied' })
                .eq('room_number', selectedRoom);

            if (roomError) {
                console.error('Room update error:', roomError);
                throw roomError;
            }

            toast.success(`Room ${selectedRoom} assigned to ${student.name}`);
            
            // Reset and refresh
            setSelectedStudent('');
            setSelectedRoom('');
            fetchData();

        } catch (error: any) {
            console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                user: user  // Log user info in error
            });
            toast.error(error.message || 'Failed to assign room');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Room Assignment</h1>
            
            <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unassigned Students Section */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Unassigned Students</h2>
                        <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            disabled={loading}
                        >
                            <option value="">Select a student</option>
                            {unassignedStudents.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {student.name} ({student.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Available Rooms Section */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Available Rooms</h2>
                        <select
                            value={selectedRoom}
                            onChange={(e) => setSelectedRoom(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            disabled={loading}
                        >
                            <option value="">Select a room</option>
                            {availableRooms.map((room) => (
                                <option key={room.id} value={room.room_number}>
                                    Room {room.room_number} (Floor {room.floor_number}, Capacity: {room.capacity})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleAssignment}
                        disabled={loading || !selectedStudent || !selectedRoom}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Assigning...' : 'Assign Room'}
                    </button>
                </div>

                {/* Statistics */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500">Unassigned Students</h3>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{unassignedStudents.length}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-500">Available Rooms</h3>
                        <p className="mt-2 text-3xl font-semibold text-gray-900">{availableRooms.length}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoomAssignment; 