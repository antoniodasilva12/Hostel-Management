import React, { useState } from 'react';
import { HiX } from 'react-icons/hi';

interface ResourceUsageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (waterUsage: number, electricityUsage: number) => void;
    loading: boolean;
}

const ResourceUsageModal: React.FC<ResourceUsageModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    loading
}) => {
    const [waterUsage, setWaterUsage] = useState('');
    const [electricityUsage, setElectricityUsage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(Number(waterUsage), Number(electricityUsage));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Record Resource Usage</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Water Usage (m³)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={waterUsage}
                            onChange={(e) => setWaterUsage(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            required
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Electricity Usage (kWh)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={electricityUsage}
                            onChange={(e) => setElectricityUsage(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                            required
                            min="0"
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResourceUsageModal; 