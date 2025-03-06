import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';

interface Bill {
    id: string;
    type: 'Room Rent' | 'Utilities' | 'Maintenance' | 'Security Deposit';
    amount: number;
    due_date: string;
    status: 'pending' | 'paid';
    description: string;
}

const StudentBilling = () => {
    const { user } = useAuth();
    const [bills, setBills] = useState<Bill[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

    useEffect(() => {
        fetchBills();
    }, [user]);

    const fetchBills = async () => {
        try {
            const { data, error } = await supabase
                .from('bills')
                .select('*')
                .eq('student_id', user?.id)
                .order('due_date', { ascending: true });

            if (error) throw error;
            setBills(data || []);
        } catch (error) {
            console.error('Error fetching bills:', error);
            toast.error('Failed to load bills');
        }
    };

    const handlePayNow = (bill: Bill) => {
        setSelectedBill(bill);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">My Bills</h1>
                <div className="bg-white p-4 rounded-lg shadow">
                    <p className="text-sm text-gray-500">Total Outstanding</p>
                    <p className="text-2xl font-bold text-red-600">
                        Ksh {bills.reduce((sum, bill) => sum + (bill.status === 'pending' ? bill.amount : 0), 0).toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bills.map((bill) => (
                    <div key={bill.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{bill.type}</h3>
                                    <p className="text-sm text-gray-500">Due: {new Date(bill.due_date).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium
                                    ${bill.status === 'paid' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'}`}>
                                    {bill.status}
                                </span>
                            </div>
                            
                            <div className="mb-4">
                                <p className="text-2xl font-bold text-gray-900">
                                    Ksh {bill.amount.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">{bill.description}</p>
                            </div>

                            {bill.status === 'pending' && (
                                <button
                                    onClick={() => handlePayNow(bill)}
                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 
                                        transition duration-200 flex items-center justify-center"
                                >
                                    <span className="mr-2">Pay Now</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Modal */}
            {isModalOpen && selectedBill && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Payment Details</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600">Amount Due</p>
                                <p className="text-2xl font-bold text-gray-900">Ksh {selectedBill.amount.toLocaleString()}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2">Payment Methods</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="p-4 border rounded-lg text-center hover:border-indigo-500 hover:text-indigo-500">
                                        <span className="block font-semibold">M-Pesa</span>
                                        <span className="text-sm text-gray-500">Pay via M-Pesa</span>
                                    </button>
                                    <button className="p-4 border rounded-lg text-center hover:border-indigo-500 hover:text-indigo-500">
                                        <span className="block font-semibold">Card</span>
                                        <span className="text-sm text-gray-500">Credit/Debit Card</span>
                                    </button>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <button 
                                    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 
                                        transition duration-200"
                                >
                                    Proceed to Payment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentBilling; 