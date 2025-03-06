import { supabase } from './supabaseClient';

interface NotificationData {
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success' | 'error';
}

export const createNotification = async (data: NotificationData) => {
    try {
        const { error } = await supabase
            .from('notifications')
            .insert([{
                ...data,
                read: false,
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// Predefined notification creators for common events
export const notifyMaintenanceRequest = async (userId: string, adminIds: string[]) => {
    try {
        const notifications = adminIds.map(adminId => ({
            sender_id: userId,
            recipient_id: adminId,
            title: 'New Maintenance Request',
            message: 'A new maintenance request has been submitted.',
            type: 'maintenance_request',
            read: false
        }));

        const { error } = await supabase
            .from('notifications')
            .insert(notifications);

        if (error) throw error;
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
};

export const notifyMaintenanceUpdate = async (studentId: string, status: string) => {
    await createNotification({
        user_id: studentId,
        title: 'Maintenance Request Update',
        message: `Your maintenance request status has been updated to: ${status}`,
        type: 'info'
    });
};

export const notifyRoomAssignment = async (studentId: string, roomNumber: string) => {
    await createNotification({
        user_id: studentId,
        title: 'Room Assignment',
        message: `You have been assigned to Room ${roomNumber}`,
        type: 'success'
    });
};

export const notifyBillCreated = async (studentId: string, amount: number, dueDate: string) => {
    await createNotification({
        user_id: studentId,
        title: 'New Bill Generated',
        message: `A new bill of $${amount} has been generated. Due date: ${new Date(dueDate).toLocaleDateString()}`,
        type: 'warning'
    });
};

export const notifyPaymentReceived = async (studentId: string, amount: number) => {
    await createNotification({
        user_id: studentId,
        title: 'Payment Received',
        message: `Your payment of $${amount} has been received and processed.`,
        type: 'success'
    });
}; 