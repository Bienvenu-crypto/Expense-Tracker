'use client';

import React, { useState } from 'react';
import { useExpenses, CATEGORY_ICONS } from '@/context/ExpenseContext';
import Modal from './Modal';

interface AddExpenseModalProps {
    onClose: () => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ onClose }) => {
    const { categories, budgets, expenses, addExpense } = useExpenses();

    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const [warning, setWarning] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) return;

        const expense = {
            id: Date.now().toString(),
            amount: numAmount,
            category,
            description,
            date,
            timestamp: new Date(date).getTime()
        };

        // Budget check logic
        const catBudget = budgets[category];
        if (catBudget > 0 && !warning) {
            const expenseDate = new Date(date);
            const spent = expenses
                .filter(e => {
                    const d = new Date(e.date);
                    return e.category === category &&
                        d.getMonth() === expenseDate.getMonth() &&
                        d.getFullYear() === expenseDate.getFullYear();
                })
                .reduce((sum, e) => sum + e.amount, 0);

            const newTotal = spent + numAmount;
            if (newTotal >= catBudget * 0.85) {
                setWarning(`Warning: This will put you at ${((newTotal / catBudget) * 100).toFixed(1)}% of your ${category} budget!`);
                return;
            }
        }

        addExpense(expense);
        onClose();
    };

    return (
        <Modal
            title="Add New Expense"
            onClose={onClose}
        >
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Amount ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="form-group">
                    <label>Category</label>
                    <select
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <input
                        type="text"
                        required
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What did you buy?"
                    />
                </div>
                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                {warning && (
                    <div className="warning-message" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--accent-warning)', padding: '12px', borderRadius: '8px', marginBottom: '16px', color: 'var(--accent-warning)' }}>
                        <p>{warning}</p>
                    </div>
                )}

                <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn-primary">
                        {warning ? 'Add Anyway' : 'Add Expense'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddExpenseModal;
