'use client';

import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useExpenses } from '@/context/ExpenseContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const Charts = () => {
    const { expenses, categories, budgets } = useExpenses();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b, 0);

    const currentExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // --- 1. Spending by Category (Current Month) ---
    const categoryDataMap: Record<string, number> = {};
    categories.forEach(cat => categoryDataMap[cat] = 0);
    currentExpenses.forEach(e => {
        categoryDataMap[e.category] = (categoryDataMap[e.category] || 0) + e.amount;
    });

    const pieData = {
        labels: Object.keys(categoryDataMap),
        datasets: [
            {
                data: Object.values(categoryDataMap),
                backgroundColor: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#64748b'],
                borderWidth: 0,
            },
        ],
    };

    // --- 2. Historical Data Calculation (Months & Years) ---
    const getHistoricalData = () => {
        const history: Record<string, { spent: number; saved: number }> = {};

        // Sort all expenses by date
        const sortedExpenses = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (sortedExpenses.length === 0) return { labels: [], spent: [], saved: [] };

        const start = new Date(sortedExpenses[0].date);
        start.setDate(1);
        const end = new Date(now.getFullYear(), now.getMonth(), 1);

        let iter = new Date(start);
        while (iter <= end) {
            const label = iter.toLocaleDateString('default', { month: 'short', year: '2-digit' });
            const m = iter.getMonth();
            const y = iter.getFullYear();

            const mExpenses = expenses.filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === m && d.getFullYear() === y;
            });

            const spent = mExpenses.reduce((sum, e) => sum + e.amount, 0);
            const saved = Math.max(0, totalBudget - spent);

            history[label] = { spent, saved };
            iter.setMonth(iter.getMonth() + 1);
        }

        return {
            labels: Object.keys(history),
            spent: Object.values(history).map(h => h.spent),
            saved: Object.values(history).map(h => h.saved)
        };
    };

    const historyData = getHistoricalData();

    const spendingTrendData = {
        labels: historyData.labels,
        datasets: [{
            label: 'Monthly Spending',
            data: historyData.spent,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            fill: true,
            tension: 0.4
        }]
    };

    const savingsTrendData = {
        labels: historyData.labels,
        datasets: [{
            label: 'Monthly Savings',
            data: historyData.saved,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            fill: true,
            tension: 0.4
        }]
    };

    // --- 3. Current Month Daily Trend ---
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const dailySpending: number[] = new Array(daysInMonth).fill(0);
    currentExpenses.forEach(e => {
        const day = new Date(e.date).getDate();
        if (day <= daysInMonth) dailySpending[day - 1] += e.amount;
    });

    const barData = {
        labels: Array.from({ length: daysInMonth }, (_, i) => i + 1),
        datasets: [{
            label: 'Daily Spending',
            data: dailySpending,
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderRadius: 4,
        }],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#ffffff' } },
            x: { grid: { display: false }, ticks: { color: '#ffffff' } },
        },
    };

    return (
        <div className="charts-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
            {/* Row 1 */}
            <div className="chart-card">
                <h2>Spending by Category (MTD)</h2>
                <div className="chart-container" style={{ height: '300px', position: 'relative' }}>
                    <Pie data={pieData} options={{ ...options, plugins: { legend: { display: true, position: 'right' as const, labels: { color: '#f8fafc' } } } }} />
                </div>
            </div>

            <div className="chart-card">
                <h2>Current Month Trend</h2>
                <div className="chart-container" style={{ height: '300px', position: 'relative' }}>
                    <Bar data={barData} options={options} />
                </div>
            </div>

            {/* Row 2: Historical */}
            <div className="chart-card">
                <h2>Spending History (Years)</h2>
                <div className="chart-container" style={{ height: '300px', position: 'relative' }}>
                    <Line data={spendingTrendData} options={{ ...options, plugins: { legend: { display: true, labels: { color: '#f8fafc' } } } }} />
                </div>
            </div>

            <div className="chart-card">
                <h2>Savings History (Years)</h2>
                <div className="chart-container" style={{ height: '300px', position: 'relative' }}>
                    <Line data={savingsTrendData} options={{ ...options, plugins: { legend: { display: true, labels: { color: '#f8fafc' } } } }} />
                </div>
            </div>
        </div>
    );
};

export default Charts;
