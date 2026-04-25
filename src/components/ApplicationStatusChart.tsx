// src/components/ApplicationStatusChart.tsx

import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Update the interface to match the data structure being passed from the parent
interface ApplicationStatusChartProps {
    data: {
        status: string;
        count: number;
    }[];
}

const ApplicationStatusChart: React.FC<ApplicationStatusChartProps> = ({ data }) => {
    // We can now use the 'data' prop directly instead of processing applications
    const labels = data.map(item => item.status);
    const counts = data.map(item => item.count);
    
    // Define your colors to map to the labels
    const backgroundColors = [
        'rgba(75, 192, 192, 0.6)', 
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 99, 132, 0.6)',
    ];

    const borderColors = [
        'rgba(75, 192, 192, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 99, 132, 1)',
    ];

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: '# of Applications',
                data: counts,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    font: {
                        size: 14,
                        family: "'Inter', sans-serif",
                    },
                },
            },
            tooltip: {
                bodyFont: {
                    family: "'Inter', sans-serif",
                },
            },
        },
    };

    return (
        <div className="w-full h-80 flex items-center justify-center">
            <Pie data={chartData} options={options} />
        </div>
    );
};

export default ApplicationStatusChart;