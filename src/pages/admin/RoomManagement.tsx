import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import { HiPlus, HiTrash } from 'react-icons/hi';
import AssignRoomModal from '../../components/AssignRoomModal';

interface Room {
    id: string;
    room_number: string;
    floor_number: number;
    capacity: number;
    price: number;
    status: 'available' | 'occupied' | 'maintenance';
}

type RoomStatus = 'available' | 'occupied' | 'maintenance';

const RoomManagement = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        room_number: '',
        floor_number: 1,
        capacity: 1,
        price: 5000,
        status: 'available' as RoomStatus
    });
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState('');

    useEffect(() => {
        fetchRooms();
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
        } finally {
            setLoading(false);
        }
    };

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('rooms')
                .insert([formData]);

            if (error) throw error;

            toast.success('Room added successfully');
            setShowAddModal(false);
            setFormData({
                room_number: '',
                floor_number: 1,
                capacity: 1,
                price: 5000,
                status: 'available'
            });
            fetchRooms();
        } catch (error) {
            console.error('Error adding room:', error);
            toast.error('Failed to add room');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRoom = async (roomId: string) => {
        if (!window.confirm('Are you sure you want to delete this room?')) return;

        try {
            const { error } = await supabase
                .from('rooms')
                .delete()
                .eq('id', roomId);

            if (error) throw error;

            toast.success('Room deleted successfully');
            fetchRooms();
        } catch (error) {
            console.error('Error deleting room:', error);
            toast.error('Failed to delete room');
        }
    };

    const handleAssignClick = (roomNumber: string) => {
        setSelectedRoom(roomNumber);
        setShowAssignModal(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Room Management</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                    <HiPlus className="w-5 h-5 mr-2" />
                    Add Room
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading rooms...</div>
                </div>
            ) : rooms.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                    No rooms found. Add some rooms to get started.
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Room Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Floor
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Capacity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price (KES)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rooms.map((room) => (
                                <tr key={room.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{room.room_number}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{room.floor_number}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{room.capacity}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{room.price.toLocaleString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            room.status === 'available' 
                                                ? 'bg-green-100 text-green-800'
                                                : room.status === 'occupied'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {room.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-3">
                                            {room.status === 'available' && (
                                                <button
                                                    onClick={() => handleAssignClick(room.room_number)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                >
                                                    Assign
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteRoom(room.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <HiTrash className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Room Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Room</h3>
                            <form onSubmit={handleAddRoom} className="mt-4 space-y-4">
                                <input
                                    type="text"
                                    placeholder="Room Number (e.g., A101)"
                                    value={formData.room_number}
                                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Floor Number"
                                    value={formData.floor_number}
                                    onChange={(e) => setFormData({ ...formData, floor_number: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                    min="1"
                                />
                                <input
                                    type="number"
                                    placeholder="Capacity"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                    min="1"
                                />
                                <input
                                    type="number"
                                    placeholder="Price (KES)"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                    min="0"
                                />
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    required
                                >
                                    <option value="available">Available</option>
                                    <option value="occupied">Occupied</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
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
                                        {loading ? 'Adding...' : 'Add Room'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Assign Room Modal */}
            {showAssignModal && (
                <AssignRoomModal
                    roomNumber={selectedRoom}
                    onClose={() => setShowAssignModal(false)}
                    onAssign={fetchRooms}
                />
            )}
        </div>
    );
};

export default RoomManagement; 