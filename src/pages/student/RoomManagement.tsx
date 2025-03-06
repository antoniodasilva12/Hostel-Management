import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

interface RoomAssignment {
    id: string;
    student_id: string;
    student_name: string;
    student_email: string;
    room_number: string;
    floor_number: number;
    assigned_at: string;
}

const RoomManagement = () => {
    const { user } = useAuth();
    const [assignment, setAssignment] = useState<RoomAssignment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchRoomAssignment();
        }
    }, [user]);

    const fetchRoomAssignment = async () => {
        try {
            setLoading(true);
            
            // Fetch the room assignment for the current student
            const { data, error } = await supabase
                .from('room_assignments')
                .select('*')
                .eq('student_id', user?.id)
                .eq('status', 'active')
                .maybeSingle();

            if (error) {
                console.error('Error fetching room assignment:', error);
                throw error;
            }

            setAssignment(data);

        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to fetch room details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Room Details</h1>

            {loading ? (
                <div className="text-center">Loading room details...</div>
            ) : !assignment ? (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                No room has been assigned to you yet. Please contact the administrator.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Room Information</h2>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Room Number</label>
                                    <p className="mt-1 text-lg text-gray-900">{assignment.room_number}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Floor</label>
                                    <p className="mt-1 text-lg text-gray-900">{assignment.floor_number}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Assignment Date</label>
                                    <p className="mt-1 text-lg text-gray-900">
                                        {new Date(assignment.assigned_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Room Rules</h2>
                            <ul className="mt-4 space-y-2 text-sm text-gray-600">
                                <li>• Keep your room clean and tidy</li>
                                <li>• No smoking allowed</li>
                                <li>• Quiet hours: 10 PM - 6 AM</li>
                                <li>• Report any maintenance issues promptly</li>
                                <li>• No unauthorized guests allowed</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomManagement; 