'use client';

import React, { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import SummaryCard from './SummaryCard';
import BudgetOverview from './BudgetOverview';
import RecentExpenses from './RecentExpenses';
import Charts from './Charts';
import ManageBudgetsModal from '../modals/ManageBudgetsModal';

const DashboardView = () => {
    const { expenses, budgets } = useExpenses();
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    // Calculate totals
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const currentSpent = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b, 0);
    const remaining = totalBudget - currentSpent;

    // --- LIFETIME SAVINGS CALCULATION (Vault) ---
    const calculateLifetimeSavings = () => {
        if (expenses.length === 0) return 0;

        // Find the earliest month we have data for
        const oldestExpense = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
        const startDate = new Date(oldestExpense.date);
        startDate.setDate(1); // Start at the beginning of that month

        let totalVault = 0;
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Iterate through every month from start until LAST month
        let iterDate = new Date(startDate);
        while (iterDate < currentMonthStart) {
            const m = iterDate.getMonth();
            const y = iterDate.getFullYear();

            const monthExpenses = expenses.filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === m && d.getFullYear() === y;
            });

            const monthSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
            const monthSaved = totalBudget - monthSpent;

            // Only add if they actually saved money
            if (monthSaved > 0) {
                totalVault += monthSaved;
            }

            // Move to next month
            iterDate.setMonth(iterDate.getMonth() + 1);
        }
        return totalVault;
    };

    const lifetimeSavings = calculateLifetimeSavings();

    return (
        <div id="view-dashboard">
            <div className="summary-grid">
                <SummaryCard
                    title="Total Spent"
                    value={`$${currentSpent.toFixed(2)}`}
                    subtitle="This Month"
                />
                <SummaryCard
                    title="Total Budget"
                    value={`$${totalBudget.toFixed(2)}`}
                    subtitle="Monthly Limit"
                />
                <SummaryCard
                    title="Remaining"
                    value={`$${remaining.toFixed(2)}`}
                    subtitle="Available to Spend"
                    color={remaining < 0 ? 'var(--accent-danger)' : remaining < totalBudget * 0.2 ? 'var(--accent-warning)' : 'var(--accent-success)'}
                />
                <SummaryCard
                    title="Lifetime Savings"
                    value={`$${lifetimeSavings.toFixed(2)}`}
                    subtitle="Unspent from Past Months"
                    color="var(--accent-success)"
                />
            </div>

            <Charts />

            <div className="budget-section">
                <div className="section-header">
                    <h2>Budget Overview</h2>
                    <button className="btn-secondary" onClick={() => setIsManageModalOpen(true)}>Manage Budgets</button>
                </div>
                <BudgetOverview />
            </div>

            <div className="expenses-section">
                <div className="section-header">
                    <h2>Recent Expenses</h2>
                </div>
                <RecentExpenses />
            </div>

            {isManageModalOpen && <ManageBudgetsModal onClose={() => setIsManageModalOpen(false)} />}
        </div>
    );
};

export default DashboardView;
