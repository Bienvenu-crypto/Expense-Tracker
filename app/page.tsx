'use client';

import { useExpenses } from '@/context/ExpenseContext';
import DashboardView from '@/components/dashboard/DashboardView';
import CategoriesView from '@/components/categories/CategoriesView';
import AdvisorView from '@/components/advisor/AdvisorView';
import ExpensesView from '@/components/expenses/ExpensesView';
import AddExpenseModal from '@/components/modals/AddExpenseModal';
import LandingPage from '@/components/layout/LandingPage';
import { useSession } from 'next-auth/react';

export default function Home() {
    const { activeView, isAddModalOpen, setIsAddModalOpen } = useExpenses();
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!session) {
        return <LandingPage />;
    }

    return (
        <div className="w-full">
            {activeView === 'dashboard' && <DashboardView />}
            {activeView === 'categories' && <CategoriesView />}
            {activeView === 'advisor' && <AdvisorView />}
            {activeView === 'expenses' && <ExpensesView />}

            {isAddModalOpen && (
                <AddExpenseModal onClose={() => setIsAddModalOpen(false)} />
            )}
        </div>
    );
}
