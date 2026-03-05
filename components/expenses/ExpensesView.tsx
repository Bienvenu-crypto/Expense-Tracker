'use client';

import React, { useState } from 'react';
import { useExpenses, Expense } from '@/context/ExpenseContext';
import AddExpenseModal from '../modals/AddExpenseModal';

const ExpensesView = () => {
    const { expenses, deleteExpense, setIsAddModalOpen } = useExpenses();
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    const handleEditClick = (expense: Expense) => {
        setEditingExpense(expense);
    };

    const handleDeleteClick = (id: string, description: string) => {
        if (window.confirm(`Are you sure you want to delete "${description}"?`)) {
            deleteExpense(id);
        }
    };

    return (
        <div id="view-expenses">
            <div className="dashboard-header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div className="dashboard-titles">
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Manage Expenses</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>View and manage all your historical transactions</p>
                </div>
                <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>+ Add Expense</button>
            </div>

            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                    No expenses found. Start by adding one!
                                </td>
                            </tr>
                        ) : (
                            expenses.map(expense => (
                                <tr key={expense.id}>
                                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{expense.description}</div>
                                    </td>
                                    <td>
                                        <span className="expense-category-badge" style={{ fontSize: '12px' }}>
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 700 }}>${expense.amount.toFixed(2)}</span>
                                    </td>
                                    <td>
                                        <div className="category-actions" style={{ justifyContent: 'flex-end', display: 'flex', gap: '8px' }}>
                                            <button
                                                className="icon-btn edit"
                                                onClick={() => handleEditClick(expense)}
                                                title="Edit Expense"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="icon-btn delete"
                                                onClick={() => handleDeleteClick(expense.id, expense.description)}
                                                title="Delete Expense"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {editingExpense && (
                <AddExpenseModal
                    onClose={() => setEditingExpense(null)}
                    editExpense={editingExpense}
                />
            )}
        </div>
    );
};

export default ExpensesView;
