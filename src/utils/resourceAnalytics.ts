interface AnalysisResult {
    recommendations: string[];
    status: 'normal' | 'high' | 'critical';
    efficiency_score: number;
}

interface UsageThresholds {
    water: {
        normal: number;
        high: number;
        critical: number;
    };
    electricity: {
        normal: number;
        high: number;
        critical: number;
    };
}

const USAGE_THRESHOLDS: UsageThresholds = {
    water: {
        normal: 5, // m³ per month
        high: 7,   // m³ per month
        critical: 10 // m³ per month
    },
    electricity: {
        normal: 300, // kWh per month
        high: 400,   // kWh per month
        critical: 500 // kWh per month
    }
};

export const analyzeResourceUsage = async (
    waterUsage: number,
    electricityUsage: number,
    history: any[]
): Promise<AnalysisResult> => {
    const recommendations: string[] = [];
    let status = 'normal';

    // Water usage analysis
    if (waterUsage > USAGE_THRESHOLDS.water.critical) {
        status = 'critical';
        recommendations.push(
            "URGENT: Your water usage is critically high. Immediate action required:",
            "• Check for water leaks in pipes and fixtures",
            "• Install water-saving devices in showers and taps",
            "• Consider shorter shower times"
        );
    } else if (waterUsage > USAGE_THRESHOLDS.water.high) {
        status = 'high';
        recommendations.push(
            "Your water consumption is above recommended levels:",
            "• Monitor tap usage and fix any drips",
            "• Use washing machines only with full loads",
            "• Consider collecting rainwater for plants"
        );
    }

    // Electricity usage analysis
    if (electricityUsage > USAGE_THRESHOLDS.electricity.critical) {
        status = 'critical';
        recommendations.push(
            "URGENT: Your electricity usage is critically high:",
            "• Check for appliances running unnecessarily",
            "• Switch to energy-efficient LED bulbs",
            "• Minimize use of high-power devices"
        );
    } else if (electricityUsage > USAGE_THRESHOLDS.electricity.high) {
        status = status === 'normal' ? 'high' : status;
        recommendations.push(
            "Your electricity consumption is above average:",
            "• Use natural light when possible",
            "• Unplug devices when not in use",
            "• Consider using a power strip to reduce standby power"
        );
    }

    // Historical trend analysis
    if (history.length > 0) {
        const lastMonth = history[0];
        const waterIncrease = ((waterUsage - lastMonth.water_usage) / lastMonth.water_usage) * 100;
        const electricityIncrease = ((electricityUsage - lastMonth.electricity_usage) / lastMonth.electricity_usage) * 100;

        if (waterIncrease > 20) {
            recommendations.push(
                `Water usage increased by ${waterIncrease.toFixed(1)}% from last month. Consider reviewing your usage patterns.`
            );
        }

        if (electricityIncrease > 20) {
            recommendations.push(
                `Electricity usage increased by ${electricityIncrease.toFixed(1)}% from last month. Consider energy-saving measures.`
            );
        }
    }

    // Seasonal recommendations
    const currentMonth = new Date().getMonth();
    if (currentMonth >= 5 && currentMonth <= 8) { // Summer
        recommendations.push(
            "Summer energy-saving tips:",
            "• Use fans instead of AC when possible",
            "• Close curtains during peak heat hours",
            "• Use cold water for laundry when possible"
        );
    } else if (currentMonth >= 11 || currentMonth <= 2) { // Winter
        recommendations.push(
            "Winter energy-saving tips:",
            "• Use natural sunlight for heating",
            "• Seal windows and doors to prevent heat loss",
            "• Use warm clothing instead of increasing heating"
        );
    }

    return {
        recommendations,
        status,
        efficiency_score: calculateEfficiencyScore(waterUsage, electricityUsage, status)
    };
};

const calculateEfficiencyScore = (water: number, electricity: number, status: string): number => {
    const waterScore = Math.max(0, 100 - (water / USAGE_THRESHOLDS.water.normal) * 50);
    const electricityScore = Math.max(0, 100 - (electricity / USAGE_THRESHOLDS.electricity.normal) * 50);
    
    const baseScore = (waterScore + electricityScore) / 2;
    
    // Apply penalties based on status
    const statusMultiplier = {
        normal: 1,
        high: 0.8,
        critical: 0.6
    }[status] || 1;

    return Math.round(baseScore * statusMultiplier);
}; 