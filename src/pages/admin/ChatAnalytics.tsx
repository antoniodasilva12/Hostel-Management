import { useState, useEffect, type FC } from 'react';
import { supabase } from '../../utils/supabaseClient';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { HiDownload } from 'react-icons/hi';

interface AnalyticsData {
    queryTypes: { type: string; count: number }[];
    helpfulnessRate: { status: string; count: number }[];
    popularReactions: { reaction: string; count: number }[];
    activeUsers: number;
    totalSessions: number;
    averageResponseTime: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ChatAnalytics: FC = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            
            // Get date range
            const now = new Date();
            const startDate = new Date();
            switch (timeRange) {
                case 'day':
                    startDate.setDate(now.getDate() - 1);
                    break;
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
            }

            // Fetch query types distribution using count
            const { data: messages } = await supabase
                .from('chat_analytics')
                .select('query_type')
                .gte('created_at', startDate.toISOString());
            
            const queryTypes = messages?.reduce((acc, msg) => {
                const existing = acc.find(item => item.type === msg.query_type);
                if (existing) {
                    existing.count++;
                } else {
                    acc.push({ type: msg.query_type, count: 1 });
                }
                return acc;
            }, [] as { type: string; count: number }[]) || [];

            // Fetch helpfulness data
            const { data: helpfulnessData } = await supabase
                .from('chat_analytics')
                .select('was_helpful')
                .gte('created_at', startDate.toISOString());

            const helpfulness = helpfulnessData?.reduce((acc, item) => {
                const status = item.was_helpful ? 'Helpful' : 'Not Helpful';
                const existing = acc.find(h => h.status === status);
                if (existing) {
                    existing.count++;
                } else {
                    acc.push({ status, count: 1 });
                }
                return acc;
            }, [] as { status: string; count: number }[]) || [];

            // Fetch reaction data
            const { data: reactionsData } = await supabase
                .from('chat_reactions')
                .select('reaction')
                .gte('created_at', startDate.toISOString());

            const reactions = reactionsData?.reduce((acc, item) => {
                const existing = acc.find(r => r.reaction === item.reaction);
                if (existing) {
                    existing.count++;
                } else {
                    acc.push({ reaction: item.reaction, count: 1 });
                }
                return acc;
            }, [] as { reaction: string; count: number }[]) || [];

            // Fetch unique users and sessions
            const { data: sessions } = await supabase
                .from('chat_analytics')
                .select('user_id, session_id')
                .gte('created_at', startDate.toISOString());

            const uniqueUsers = new Set(sessions?.map(s => s.user_id)).size;
            const uniqueSessions = new Set(sessions?.map(s => s.session_id)).size;

            setData({
                queryTypes: queryTypes,
                helpfulnessRate: helpfulness,
                popularReactions: reactions,
                activeUsers: uniqueUsers,
                totalSessions: uniqueSessions,
                averageResponseTime: 1.5 // This would need to be calculated from actual response times
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportAnalytics = async () => {
        try {
            const csvData = [
                ['Category', 'Metric', 'Value', 'Date Range'],
                ['Users', 'Active Users', data?.activeUsers, timeRange],
                ['Users', 'Total Sessions', data?.totalSessions, timeRange],
                ['Performance', 'Average Response Time', data?.averageResponseTime, timeRange],
                ...data?.queryTypes.map(qt => ['Query Types', qt.type, qt.count, timeRange]) || [],
                ...data?.helpfulnessRate.map(hr => ['Helpfulness', hr.status, hr.count, timeRange]) || [],
                ...data?.popularReactions.map(pr => ['Reactions', pr.reaction, pr.count, timeRange]) || []
            ];

            const csvContent = csvData.map(row => row.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting analytics:', error);
        }
    };

    if (loading) {
        return <div>Loading analytics...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Chat Analytics</h1>
                <div className="flex space-x-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as 'day' | 'week' | 'month')}
                        className="px-3 py-2 border rounded-lg"
                    >
                        <option value="day">Last 24 Hours</option>
                        <option value="week">Last 7 Days</option>
                        <option value="month">Last 30 Days</option>
                    </select>
                    <button
                        onClick={exportAnalytics}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <HiDownload className="w-5 h-5 mr-2" />
                        Export Data
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Active Users</h3>
                    <p className="text-3xl">{data?.activeUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Total Sessions</h3>
                    <p className="text-3xl">{data?.totalSessions}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-2">Avg Response Time</h3>
                    <p className="text-3xl">{data?.averageResponseTime}s</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Query Types Chart */}
                <div className="bg-white p-6 rounded-lg shadow col-span-1">
                    <h3 className="text-lg font-semibold mb-4">Query Types Distribution</h3>
                    <BarChart width={300} height={300} data={data?.queryTypes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                </div>

                {/* Helpfulness Rate Chart */}
                <div className="bg-white p-6 rounded-lg shadow col-span-1">
                    <h3 className="text-lg font-semibold mb-4">Response Helpfulness</h3>
                    <PieChart width={300} height={300}>
                        <Pie
                            data={data?.helpfulnessRate}
                            dataKey="count"
                            nameKey="status"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                        >
                            {data?.helpfulnessRate.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </div>

                {/* Reactions Chart */}
                <div className="bg-white p-6 rounded-lg shadow col-span-1">
                    <h3 className="text-lg font-semibold mb-4">Popular Reactions</h3>
                    <div className="space-y-4">
                        {data?.popularReactions.map((reaction, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <span className="text-2xl mr-2">{reaction.reaction}</span>
                                    <span className="text-gray-600">{reaction.count} times</span>
                                </div>
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-600 rounded-full h-2"
                                        style={{
                                            width: `${(reaction.count / Math.max(...data.popularReactions.map(r => r.count))) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Additional Metrics */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Response Time Distribution</h3>
                <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                        <p className="text-gray-600">&lt; 1s</p>
                        <p className="text-2xl font-semibold">45%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600">1-2s</p>
                        <p className="text-2xl font-semibold">35%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600">2-3s</p>
                        <p className="text-2xl font-semibold">15%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-600">&gt; 3s</p>
                        <p className="text-2xl font-semibold">5%</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatAnalytics; 