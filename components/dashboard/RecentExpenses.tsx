'use client';

import React, { useState } from 'react';
import { useExpenses, CATEGORY_ICONS } from '@/context/ExpenseContext';

const RecentExpenses = () => {
    const { expenses, categories, deleteExpense } = useExpenses();
    const [filter, setFilter] = useState('all');

    const filteredExpenses = filter === 'all'
        ? expenses
        : expenses.filter(e => e.category === filter);

    if (filteredExpenses.length === 0) {
        return <div className="empty-state"><p>No expenses found</p></div>;
    }

    return (
        <div className="expenses-container">
            <div className="filter-controls" style={{ marginBottom: '16px' }}>
                <select
                    className="filter-select"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>
            <div className="expenses-list">
                {filteredExpenses.slice(0, 10).map(expense => (
                    <div key={expense.id} className="expense-item">
                        <div className="expense-info">
                            <div className="expense-header">
                                <span className="expense-category-badge">
                                    {expense.category}
                                </span>
                                <span className="expense-description">{expense.description}</span>
                            </div>
                            <div className="expense-date">
                                {new Date(expense.date).toLocaleDateString()}
                            </div>
                        </div>
                        <div className="expense-amount">${expense.amount.toFixed(2)}</div>
                        <button
                            className="icon-btn delete"
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
                                    deleteExpense(expense.id);
                                }
                            }}
                            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
                            title="Delete Expense"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentExpenses;
