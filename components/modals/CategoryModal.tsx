'use client';

import React, { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import Modal from './Modal';

interface CategoryModalProps {
    onClose: () => void;
    editName?: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ onClose, editName }) => {
    const { addCategory, categories, deleteCategory } = useExpenses();
    const [name, setName] = useState(editName || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) return;

        addCategory(trimmedName);
        onClose();
    };

    return (
        <Modal title={editName ? "Edit Category" : "Add Category"} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Category Name</label>
                    <input
                        type="text"
                        placeholder="e.g., Subscriptions, Gym, Pet Care"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="modal-actions">
                    <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button type="submit" className="btn-primary">Save Category</button>
                </div>
            </form>
        </Modal>
    );
};

export default CategoryModal;
