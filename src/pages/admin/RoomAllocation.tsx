import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { notifyRoomAssignment } from '../../utils/notifications';
import toast from 'react-hot-toast';

interface Room {
    id: string;
    room_number: string;
    block: string;
    capacity: number;
    occupied: number;
    status: 'available' | 'full' | 'maintenance';
}

interface Student {
    id: string;
    name: string;
    email: string;
    room_number: string | null;
}

const RoomAllocation = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [unassignedStudents, setUnassignedStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<string>('');

    useEffect(() => {
        fetchRooms();
        fetchUnassignedStudents();
    }, []);

    const fetchRooms = async () => {
        try {
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .order('room_number');

            if (error) throw error;
            setRooms(data || []);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            toast.error('Failed to fetch rooms');
        }
    };

    const fetchUnassignedStudents = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, email, room_number')
                .eq('role', 'student')
                .is('room_number', null);

            if (error) throw error;
            setUnassignedStudents(data || []);
        } catch (error) {
            console.error('Error fetching unassigned students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRoom || !selectedStudent) return;

        setLoading(true);
        try {
            // Update student's room assignment
            const { error: studentError } = await supabase
                .from('profiles')
                .update({ room_number: selectedRoom.room_number })
                .eq('id', selectedStudent);

            if (studentError) throw studentError;

            // Update room occupancy
            const { error: roomError } = await supabase
                .from('rooms')
                .update({ 
                    occupied: selectedRoom.occupied + 1,
                    status: selectedRoom.occupied + 1 >= selectedRoom.capacity ? 'full' : 'available'
                })
                .eq('id', selectedRoom.id);

            if (roomError) throw roomError;

            // Send notification to student
            await notifyRoomAssignment(selectedStudent, selectedRoom.room_number);

            toast.success('Room assigned successfully');
            setShowAssignModal(false);
            setSelectedRoom(null);
            setSelectedStudent('');
            fetchRooms();
            fetchUnassignedStudents();
        } catch (error) {
            console.error('Error assigning room:', error);
            toast.error('Failed to assign room');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800';
            case 'full':
                return 'bg-red-100 text-red-800';
            case 'maintenance':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Room Allocation</h1>
                <div className="text-sm text-gray-500">
                    Unassigned Students: {unassignedStudents.length}
                </div>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {rooms.map(room => (
                    <div key={room.id} className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-lg font-medium">Room {room.room_number}</h2>
                                <p className="text-sm text-gray-500">Block {room.block}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(room.status)}`}>
                                {room.status}
                            </span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm text-gray-500">
                                Occupancy: {room.occupied}/{room.capacity}
                            </p>
                        </div>
                        {room.status === 'available' && (
                            <button
                                onClick={() => {
                                    setSelectedRoom(room);
                                    setShowAssignModal(true);
                                }}
                                className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Assign Student
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Assignment Modal */}
            {showAssignModal && selectedRoom && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                                Assign Student to Room {selectedRoom.room_number}
                            </h3>
                            <form onSubmit={handleAssignRoom} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Select Student
                                    </label>
                                    <select
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                        className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    >
                                        <option value="">Select a student</option>
                                        {unassignedStudents.map(student => (
                                            <option key={student.id} value={student.id}>
                                                {student.name} ({student.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowAssignModal(false)}
                                        className="px-4 py-2 text-gray-500 hover:text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        {loading ? 'Assigning...' : 'Assign Room'}
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

export default RoomAllocation; 