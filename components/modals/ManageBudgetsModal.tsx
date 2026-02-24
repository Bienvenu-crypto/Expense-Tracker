'use client';

import React, { useState } from 'react';
import { useExpenses, CATEGORY_ICONS } from '@/context/ExpenseContext';
import Modal from './Modal';

interface ManageBudgetsModalProps {
    onClose: () => void;
}

const ManageBudgetsModal: React.FC<ManageBudgetsModalProps> = ({ onClose }) => {
    const { budgets, categories, updateBudgets } = useExpenses();
    const [tempBudgets, setTempBudgets] = useState({ ...budgets });

    const handleSave = () => {
        updateBudgets(tempBudgets);
        onClose();
    };

    return (
        <Modal title="Manage Category Budgets" onClose={onClose}>
            <div className="budget-form">
                {categories.map(category => (
                    <div key={category} className="budget-form-item">
                        <label>{category}</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={tempBudgets[category] || 0}
                            onChange={(e) => setTempBudgets({ ...tempBudgets, [category]: parseFloat(e.target.value) || 0 })}
                        />
                    </div>
                ))}
            </div>
            <div className="modal-actions">
                <button className="btn-primary" onClick={handleSave}>Save Budgets</button>
            </div>
        </Modal>
    );
};

export default ManageBudgetsModal;
