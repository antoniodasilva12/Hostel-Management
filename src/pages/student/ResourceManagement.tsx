import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import { HiLightningBolt, HiOutlineChartBar, HiBeaker } from 'react-icons/hi';
import ResourceUsageModal from '../../components/ResourceUsageModal';
import UsageChart from '../../components/UsageChart';
import { analyzeResourceUsage } from '../../utils/resourceAnalytics';

interface ResourceUsage {
    id: string;
    student_id: string;
    water_usage: number;
    electricity_usage: number;
    month: string;
    created_at: string;
    recommendations?: string[];
    status: 'normal' | 'high' | 'critical';
    efficiency_score?: number;
}

const ResourceManagement = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [usageHistory, setUsageHistory] = useState<ResourceUsage[]>([]);
    const [loading, setLoading] = useState(true);
    const [recommendations, setRecommendations] = useState<string[]>([]);

    useEffect(() => {
        fetchUsageHistory();
    }, [user]);

    const fetchUsageHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('resource_management')
                .select('*')
                .eq('student_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsageHistory(data || []);
            
            if (data && data.length > 0) {
                setRecommendations(data[0].recommendations || []);
            }
        } catch (error) {
            console.error('Error fetching usage history:', error);
            toast.error('Failed to fetch usage history');
        } finally {
            setLoading(false);
        }
    };

    const handleUsageSubmit = async (waterUsage: number, electricityUsage: number) => {
        try {
            setLoading(true);
            const month = new Date().toISOString().slice(0, 7); // YYYY-MM format

            // Analyze usage and get recommendations
            const analysis = await analyzeResourceUsage(waterUsage, electricityUsage, usageHistory);

            const { error } = await supabase
                .from('resource_management')
                .insert({
                    student_id: user?.id,
                    water_usage: waterUsage,
                    electricity_usage: electricityUsage,
                    month: new Date().toISOString(),
                    recommendations: analysis.recommendations,
                    status: analysis.status,
                    efficiency_score: analysis.efficiency_score
                });

            if (error) throw error;

            // Show appropriate notifications based on status
            if (analysis.status === 'critical') {
                toast.error('Critical: Your resource usage is extremely high! Check recommendations.');
            } else if (analysis.status === 'high') {
                toast.warning('Warning: Your resource usage is above average. Consider recommendations.');
            } else {
                toast.success('Usage recorded successfully!');
            }

            setRecommendations(analysis.recommendations);
            fetchUsageHistory();
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error submitting usage:', error);
            toast.error('Failed to submit usage data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Resource Management</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    Record New Usage
                </button>
            </div>

            {/* Usage Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Water Usage Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center mb-4">
                        <HiBeaker className="w-8 h-8 text-blue-500 mr-3" />
                        <h2 className="text-lg font-semibold">Water Usage</h2>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-blue-600">
                            {usageHistory[0]?.water_usage || 0} m³
                        </p>
                        <p className="text-sm text-gray-500">
                            Current Month Usage
                        </p>
                        {usageHistory.length > 1 && (
                            <div className="mt-2 text-sm">
                                <p className={`${
                                    usageHistory[0]?.water_usage > usageHistory[1]?.water_usage 
                                    ? 'text-red-500' 
                                    : 'text-green-500'
                                }`}>
                                    {usageHistory[0]?.water_usage > usageHistory[1]?.water_usage ? '↑' : '↓'} 
                                    {Math.abs(
                                        ((usageHistory[0]?.water_usage - usageHistory[1]?.water_usage) / 
                                        usageHistory[1]?.water_usage) * 100
                                    ).toFixed(1)}% from last month
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Electricity Usage Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center mb-4">
                        <HiLightningBolt className="w-8 h-8 text-yellow-500 mr-3" />
                        <h2 className="text-lg font-semibold">Electricity Usage</h2>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-yellow-600">
                            {usageHistory[0]?.electricity_usage || 0} kWh
                        </p>
                        <p className="text-sm text-gray-500">
                            Current Month Usage
                        </p>
                        {usageHistory.length > 1 && (
                            <div className="mt-2 text-sm">
                                <p className={`${
                                    usageHistory[0]?.electricity_usage > usageHistory[1]?.electricity_usage 
                                    ? 'text-red-500' 
                                    : 'text-green-500'
                                }`}>
                                    {usageHistory[0]?.electricity_usage > usageHistory[1]?.electricity_usage ? '↑' : '↓'} 
                                    {Math.abs(
                                        ((usageHistory[0]?.electricity_usage - usageHistory[1]?.electricity_usage) / 
                                        usageHistory[1]?.electricity_usage) * 100
                                    ).toFixed(1)}% from last month
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Efficiency Score Card */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center mb-4">
                        <HiOutlineChartBar className="w-8 h-8 text-green-500 mr-3" />
                        <h2 className="text-lg font-semibold">Efficiency Score</h2>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-green-600">
                            {usageHistory[0]?.efficiency_score || 0}%
                        </p>
                        <p className="text-sm text-gray-500">Based on AI analysis</p>
                        <p className="mt-2 text-sm text-gray-600">
                            {getEfficiencyMessage(usageHistory[0]?.efficiency_score || 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Usage Charts */}
            {usageHistory.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <h2 className="text-lg font-semibold mb-4">Usage Trends</h2>
                    <UsageChart data={usageHistory} />
                </div>
            )}

            {/* AI Recommendations */}
            {recommendations.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">AI Recommendations</h2>
                    <div className="space-y-3">
                        {recommendations.map((recommendation, index) => (
                            <div key={index} className="flex items-start">
                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 text-green-800 rounded-full mr-3">
                                    {index + 1}
                                </span>
                                <p className="text-gray-700">{recommendation}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <ResourceUsageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleUsageSubmit}
                loading={loading}
            />
        </div>
    );
};

// Helper function to get efficiency message
const getEfficiencyMessage = (score: number): string => {
    if (score >= 90) return "Excellent! Keep up the great work!";
    if (score >= 70) return "Good efficiency. Room for improvement.";
    if (score >= 50) return "Average efficiency. Consider our recommendations.";
    return "Needs improvement. Check recommendations below.";
};

export default ResourceManagement; 