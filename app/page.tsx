'use client';

import React from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import DashboardView from '@/components/dashboard/DashboardView';
import CategoriesView from '@/components/categories/CategoriesView';
import AdvisorView from '@/components/advisor/AdvisorView';
import AddExpenseModal from '@/components/modals/AddExpenseModal';

export default function Home() {
    const { activeView, isAddModalOpen, setIsAddModalOpen } = useExpenses();

    return (
        <>
            <div>
                {activeView === 'dashboard' && <DashboardView />}
                {activeView === 'categories' && <CategoriesView />}
                {activeView === 'advisor' && <AdvisorView />}
            </div>

            {isAddModalOpen && <AddExpenseModal onClose={() => setIsAddModalOpen(false)} />}
        </>
    );
}
