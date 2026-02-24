'use client';

import React, { useState } from 'react';
import { useExpenses, CATEGORY_ICONS } from '@/context/ExpenseContext';
import CategoryModal from '../modals/CategoryModal';

const CategoriesView = () => {
    const { categories, budgets, deleteCategory } = useExpenses();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editName, setEditName] = useState<string | undefined>(undefined);

    const handleAddClick = () => {
        setEditName(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (name: string) => {
        setEditName(name);
        setIsModalOpen(true);
    };

    return (
        <div id="view-categories">
            <div className="dashboard-header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div className="dashboard-titles">
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Manage Categories</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Customize your expense categories</p>
                </div>
                <button className="btn-primary" onClick={handleAddClick}>New Category</button>
            </div>

            <div className="table-container">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Budget</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(category => (
                            <tr key={category}>
                                <td>
                                    <div className="table-category-cell">
                                        <span style={{ fontWeight: 600 }}>{category}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        padding: '4px 10px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        borderRadius: '6px',
                                        fontSize: '14px'
                                    }}>
                                        ${budgets[category]?.toFixed(0) || '0'}
                                    </span>
                                </td>
                                <td>
                                    <div className="category-actions" style={{ justifyContent: 'flex-end', display: 'flex', gap: '8px' }}>
                                        <button
                                            className="icon-btn edit"
                                            onClick={() => handleEditClick(category)}
                                            title="Edit Category"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="icon-btn delete"
                                            onClick={() => {
                                                if (window.confirm(`Are you sure you want to delete the "${category}" category? This will also affect budgets for this category.`)) {
                                                    deleteCategory(category);
                                                }
                                            }}
                                            title="Delete Category"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && <CategoryModal onClose={() => setIsModalOpen(false)} editName={editName} />}

        </div>
    );
};

export default CategoriesView;
