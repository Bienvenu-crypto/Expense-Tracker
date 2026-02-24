'use client';

import React from 'react';
import { useExpenses } from '@/context/ExpenseContext';

const BudgetOverview = () => {
    const { expenses, budgets, categories } = useExpenses();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const getSpentByCategory = (category: string) => {
        return currentExpenses
            .filter(e => e.category === category)
            .reduce((sum, e) => sum + e.amount, 0);
    };

    const activeBudgets = categories.filter(cat => budgets[cat] > 0);

    if (activeBudgets.length === 0) {
        return <div className="empty-state"><h3>No Budgets Set</h3></div>;
    }

    return (
        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table className="custom-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Spent</th>
                        <th>Budget</th>
                        <th style={{ width: '30%' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {activeBudgets.map(category => {
                        const budget = budgets[category];
                        const spent = getSpentByCategory(category);
                        const percentage = (spent / budget) * 100;

                        let progressClass = 'progress-safe';
                        if (percentage >= 100) progressClass = 'progress-danger';
                        else if (percentage >= 85) progressClass = 'progress-warning';

                        return (
                            <tr key={category}>
                                <td>
                                    <span style={{ fontWeight: 600 }}>{category}</span>
                                </td>
                                <td>${spent.toFixed(0)}</td>
                                <td>${budget.toFixed(0)}</td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <div className="progress-bar" style={{ marginBottom: 0 }}>
                                            <div
                                                className={`progress-fill ${progressClass}`}
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            ></div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                                            <span>{percentage.toFixed(0)}% used</span>
                                            <span>${(budget - spent).toFixed(0)} left</span>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default BudgetOverview;
