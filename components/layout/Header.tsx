'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useExpenses } from '@/context/ExpenseContext';

const Header = () => {
    const pathname = usePathname();
    const { data: session } = useSession();
    const {
        activeView, setActiveView,
        setIsAddModalOpen,
        expenses, budgets, categories,
    } = useExpenses();
    const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
    const notificationRef = React.useRef<HTMLDivElement>(null);

    const isAuthPage = pathname === '/login' || pathname === '/register';
    const shouldHide = isAuthPage || !session;

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // All hooks have been called above — now safe to return null conditionally
    if (shouldHide) return null;

    // Notification Logic: Check if any budget is exceeded
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const overBudgetCategories = categories.map(cat => {
        const budget = budgets[cat] || 0;
        const spent = expenses
            .filter(e => {
                const d = new Date(e.date);
                return e.category === cat && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + e.amount, 0);

        return { name: cat, spent, budget, isOver: budget > 0 && spent > budget };
    }).filter(c => c.isOver);

    const overBudgetCount = overBudgetCategories.length;

    return (
        <header className="header">
            <div className="container">
                <h1 className="logo">Expense Tracker</h1>
                <div className="header-controls">
                    <button
                        className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setActiveView('dashboard')}
                    >
                        Dashboard
                    </button>
                    <button
                        className={`nav-btn ${activeView === 'categories' ? 'active' : ''}`}
                        onClick={() => setActiveView('categories')}
                    >
                        Categories
                    </button>
                    <button
                        className={`nav-btn ${activeView === 'advisor' ? 'active' : ''}`}
                        onClick={() => setActiveView('advisor')}
                    >
                        AI Advisor
                    </button>

                    {/* Notification Bell */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', margin: '0 4px' }} ref={notificationRef}>
                        <button
                            className="nav-btn"
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                            style={{
                                width: '40px', height: '40px', borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '0',
                            }}
                            title="Notifications"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                        </button>
                        {overBudgetCount > 0 && (
                            <span style={{
                                position: 'absolute', top: '-2px', right: '-2px',
                                background: '#f43f5e', color: 'white', borderRadius: '50%',
                                minWidth: '20px', height: '20px', fontSize: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: '700', border: '3px solid #0a0e27',
                                pointerEvents: 'none', padding: '0 4px', zIndex: 1
                            }}>
                                {overBudgetCount}
                            </span>
                        )}

                        {isNotificationOpen && (
                            <div style={{
                                position: 'absolute', top: '50px', right: '0', width: '300px',
                                background: 'var(--bg-modal)', backdropFilter: 'blur(40px)',
                                border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)',
                                boxShadow: 'var(--shadow-lg)', padding: '16px', zIndex: 1000,
                                animation: 'modalSlideIn 0.2s ease'
                            }}>
                                <h3 style={{ fontSize: '16px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                                    Notifications
                                </h3>
                                {overBudgetCount === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px 0' }}>
                                        No new notifications
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {overBudgetCategories.map(cat => (
                                            <div key={cat.name} style={{ background: 'rgba(239,68,68,0.1)', padding: '10px', borderRadius: '8px', borderLeft: '4px solid #f43f5e' }}>
                                                <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>Budget Exceeded!</div>
                                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                                    <strong>{cat.name}</strong>: Spent ${cat.spent.toFixed(2)} of ${cat.budget.toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        className={`nav-btn ${activeView === 'expenses' ? 'active' : ''}`}
                        onClick={() => setActiveView('expenses')}
                    >
                        Expenses
                    </button>

                    {/* User Profile / Logout */}
                    {session && (
                        <>
                            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 8px' }}></div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="user-name-hover" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', color: '#10b981', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                                    </svg>
                                    {session.user?.name || session.user?.email}
                                </span>
                                <button
                                    onClick={() => signOut()}
                                    className="nav-btn sign-out-btn"
                                    style={{ padding: '6px 14px', fontSize: '14px', backgroundColor: '#10b981', color: 'white' }}
                                >
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
