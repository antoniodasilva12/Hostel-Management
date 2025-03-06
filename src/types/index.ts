export interface User {
    id: string;
    email: string;
    name: string;
    national_id: string;
    role: 'admin' | 'student';
}

export interface Room {
    id: string;
    room_number: string;
    capacity: number;
    occupied: number;
    block: string;
    status: 'available' | 'full' | 'maintenance';
}

export interface MaintenanceRequest {
    id: string;
    student_id: string;
    room_id: string;
    type: 'Plumbing Issue' | 'Electrical Problem' | 'Furniture Repair' | 
          'Air Conditioning' | 'Heating System' | 'Lock/Key Issue' | 
          'Pest Control' | 'Cleaning Service' | 'Internet/Network Issue' | 'Other';
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    created_at: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface Bill {
    id: string;
    student_id: string;
    amount: number;
    status: 'paid' | 'pending';
    due_date: string;
    description: string;
} 