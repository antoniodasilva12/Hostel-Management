export interface StudentProfile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    phone_number?: string;
    emergency_contact?: string;
    address?: string;
    role: 'student' | 'admin';
    room_number?: string;
    national_id: string;
    created_at?: string;
    updated_at?: string;
} 