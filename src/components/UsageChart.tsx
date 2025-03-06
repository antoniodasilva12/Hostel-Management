import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

interface UsageChartProps {
    data: {
        month: string;
        water_usage: number;
        electricity_usage: number;
    }[];
}

const UsageChart: React.FC<UsageChartProps> = ({ data }) => {
    // Format data to show last 6 months
    const chartData = data
        .slice(0, 6)
        .map(item => ({
            month: new Date(item.month).toLocaleDateString('default', { month: 'short' }),
            'Water Usage (m³)': Number(item.water_usage.toFixed(1)),
            'Electricity Usage (kWh)': Number(item.electricity_usage.toFixed(1))
        }))
        .reverse();

    return (
        <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#2563eb" />
                <YAxis yAxisId="right" orientation="right" stroke="#eab308" />
                <Tooltip />
                <Legend />
                <Bar 
                    yAxisId="left"
                    dataKey="Water Usage (m³)" 
                    fill="#2563eb" 
                    radius={[4, 4, 0, 0]}
                />
                <Bar 
                    yAxisId="right"
                    dataKey="Electricity Usage (kWh)" 
                    fill="#eab308" 
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default UsageChart; 