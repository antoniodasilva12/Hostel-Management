import { useEffect, useState, type FC } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';

interface Room {
    room_number: string;
    block: string;
    capacity: number;
    occupied: number;
}

interface Bill {
    amount: number;
    due_date: string;
    status: 'paid' | 'pending';
}

const StudentHome: FC = () => {
    const { user } = useAuth();
    const [room, setRoom] = useState<Room | null>(null);
    const [pendingBill, setPendingBill] = useState<Bill | null>(null);
    const [maintenanceCount, setMaintenanceCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchStudentData();
        }
    }, [user]);

    const fetchStudentData = async () => {
        try {
            // Fetch room details
            const { data: roomData } = await supabase
                .from('rooms')
                .select('*')
                .eq('room_number', user?.room_number)
                .single();

            if (roomData) setRoom(roomData);

            // Fetch latest pending bill
            const { data: billData } = await supabase
                .from('bills')
                .select('*')
                .eq('student_id', user?.id)
                .eq('status', 'pending')
                .order('due_date', { ascending: true })
                .limit(1)
                .single();

            if (billData) setPendingBill(billData);

            // Fetch maintenance requests count
            const { count } = await supabase
                .from('maintenance_requests')
                .select('*', { count: 'exact' })
                .eq('student_id', user?.id)
                .eq('status', 'pending');

            setMaintenanceCount(count || 0);
        } catch (error) {
            console.error('Error fetching student data:', error);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Welcome, {user?.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-2">Room Details</h2>
                    {room ? (
                        <div className="space-y-2">
                            <p className="text-gray-600">Room Number: {room.room_number}</p>
                            <p className="text-gray-600">Block: {room.block}</p>
                            <p className="text-gray-600">Occupancy: {room.occupied}/{room.capacity}</p>
                        </div>
                    ) : (
                        <p className="text-gray-600">No room assigned</p>
                    )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-gray-500 text-sm font-medium">Pending Bill</h2>
                    {pendingBill ? (
                        <div className="mt-2">
                            <p className="text-2xl font-bold text-gray-900">
                                ${pendingBill.amount}
                            </p>
                            <p className="text-sm text-red-500">
                                Due by {new Date(pendingBill.due_date).toLocaleDateString()}
                            </p>
                        </div>
                    ) : (
                        <p className="mt-2 text-sm text-gray-500">No pending bills</p>
                    )}
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-gray-500 text-sm font-medium">Maintenance Requests</h2>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                        {maintenanceCount}
                    </p>
                    <p className="text-sm text-gray-500">Pending requests</p>
                </div>
            </div>
        </div>
    );
};

export default StudentHome; 