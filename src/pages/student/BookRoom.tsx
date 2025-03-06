import React, { useEffect, useState, type FC } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface Room {
    id: string;
    room_number: string;
    floor: string;
    capacity: number;
    type: string;
    status: 'available' | 'occupied' | 'maintenance';
    price: number;
}

const BookRoom: FC = () => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasRoom, setHasRoom] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        checkCurrentRoom();
    }, []);

    const checkCurrentRoom = async () => {
        try {
            setLoading(true);

            // Check if user has a room in their metadata
            if (user?.user_metadata?.room_number) {
                setHasRoom(true);
                setLoading(false);
                return;
            }

            // If no room found, fetch available rooms
            await fetchAvailableRooms();
            setHasRoom(false);

        } catch (error) {
            console.error('Error checking room:', error);
            toast.error('Failed to check room status');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableRooms = async () => {
        try {
            const { data, error } = await supabase
                .from('rooms')
                .select('*')
                .eq('status', 'available')
                .order('room_number');

            if (error) throw error;
            setRooms(data || []);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to fetch available rooms');
        }
    };

    const handleBookRoom = async () => {
        if (!selectedRoom || !user?.user_metadata?.student_id) return;

        try {
            // Update room status to occupied
            const { error: roomError } = await supabase
                .from('rooms')
                .update({ 
                    status: 'occupied',
                    last_updated: new Date().toISOString()
                })
                .eq('id', selectedRoom.id);

            if (roomError) throw roomError;

            // Update user metadata with room number
            const { error: userError } = await supabase.auth.updateUser({
                data: {
                    ...user.user_metadata,
                    room_number: selectedRoom.room_number
                }
            });

            if (userError) throw userError;

            toast.success('Room booked successfully!');
            setIsModalOpen(false);
            setHasRoom(true);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to book room');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (hasRoom) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-lg font-medium text-yellow-800">
                                Room Already Assigned
                            </h3>
                            <div className="mt-2 text-yellow-700">
                                <p>
                                    You already have a room assigned to you. Please check your room details in the "My Room" section.
                                </p>
                                <p className="mt-2">
                                    If you need to change rooms, please contact the hostel administration.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Available Rooms</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-2">Room {room.room_number}</h3>
                            <div className="space-y-2">
                                <p className="text-gray-600">Floor: {room.floor}</p>
                                <p className="text-gray-600">Type: {room.type}</p>
                                <p className="text-gray-600">Capacity: {room.capacity} person(s)</p>
                                <p className="text-gray-600">Price: ${room.price}/month</p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedRoom(room);
                                    setIsModalOpen(true);
                                }}
                                className="mt-4 w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                            >
                                Book Room
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Confirmation Modal */}
            {isModalOpen && selectedRoom && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-semibold mb-4">Confirm Room Booking</h2>
                        <p className="text-gray-600 mb-4">
                            Are you sure you want to book Room {selectedRoom.room_number}?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBookRoom}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookRoom; 