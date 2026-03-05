'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export const STORAGE_KEYS = {
    EXPENSES: 'expenses',
    BUDGETS: 'budgets',
    GOALS: 'financial_goals',
    API_KEY: 'gemini_api_key',
    CATEGORIES: 'categories',
};

export const DEFAULT_CATEGORIES = ['Food', 'Entertainment', 'Transport', 'Shopping', 'Bills', 'Health', 'Other'];

export const CATEGORY_ICONS: Record<string, string> = {
    'Food': '🍔',
    'Entertainment': '🎮',
    'Transport': '🚗',
    'Shopping': '🛍️',
    'Bills': '💡',
    'Health': '⚕️',
    'Other': '📦'
};

export interface Expense {
    id: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    timestamp: number;
}



interface ExpenseContextType {
    expenses: Expense[];
    budgets: Record<string, number>;
    categories: string[];
    apiKey: string;
    financialGoals: string;
    activeView: 'dashboard' | 'categories' | 'advisor' | 'expenses';
    isAddModalOpen: boolean;
    setActiveView: (view: 'dashboard' | 'categories' | 'advisor' | 'expenses') => void;
    setIsAddModalOpen: (open: boolean) => void;
    addExpense: (expense: Expense) => void;
    updateExpense: (id: string, updatedExpense: Partial<Expense>) => void;
    deleteExpense: (id: string) => void;
    updateBudgets: (newBudgets: Record<string, number>) => void;
    saveApiKey: (key: string) => void;
    saveFinancialGoals: (goals: string) => void;
    addCategory: (name: string) => void;
    deleteCategory: (name: string) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [budgets, setBudgets] = useState<Record<string, number>>({});
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
    const [apiKey, setApiKey] = useState('');
    const [financialGoals, setFinancialGoals] = useState('');
    const [activeView, setActiveView] = useState<'dashboard' | 'categories' | 'advisor' | 'expenses'>('dashboard');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        const loadInitialData = async () => {
            // Priority 1: Fetch from database if user is logged in
            if (session?.user) {
                try {
                    const res = await fetch('/api/user-data');
                    if (res.ok) {
                        const data = await res.json();
                        setExpenses(data.expenses);
                        setBudgets(data.budgets);
                        setCategories(data.categories.length > 0 ? data.categories : DEFAULT_CATEGORIES);
                        setApiKey(data.apiKey);
                        setFinancialGoals(data.financialGoal);
                        return; // Successfully loaded from DB, skip localStorage
                    }
                } catch (error) {
                    console.error("Failed to load from database:", error);
                }
            }

            // Fallback: Load data from localStorage
            const storedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
            const storedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
            const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
            const storedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
            const storedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);

            if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
            if (storedBudgets) {
                setBudgets(JSON.parse(storedBudgets));
            } else {
                const defaults: Record<string, number> = {};
                DEFAULT_CATEGORIES.forEach(cat => defaults[cat] = 0);
                setBudgets(defaults);
            }
            if (storedCategories) setCategories(JSON.parse(storedCategories));
            if (storedApiKey) setApiKey(storedApiKey);
            if (storedGoals) setFinancialGoals(storedGoals);
        };

        loadInitialData();
    }, [session]);

    const addExpense = async (expense: Expense) => {
        const newExpenses = [expense, ...expenses];
        setExpenses(newExpenses);
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(newExpenses));

        if (session) {
            await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense),
            });
        }
    };

    const updateExpense = async (id: string, updatedExpense: Partial<Expense>) => {
        const newExpenses = expenses.map(e => e.id === id ? { ...e, ...updatedExpense } : e);
        setExpenses(newExpenses);
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(newExpenses));

        if (session) {
            await fetch('/api/expenses', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...updatedExpense }),
            });
        }
    };

    const deleteExpense = async (id: string) => {
        const newExpenses = expenses.filter(e => e.id !== id);
        setExpenses(newExpenses);
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(newExpenses));

        if (session) {
            await fetch('/api/expenses', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
        }
    };

    const updateBudgets = async (newBudgets: Record<string, number>) => {
        setBudgets(newBudgets);
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(newBudgets));

        if (session) {
            await fetch('/api/budgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ budgets: newBudgets }),
            });
        }
    };

    const saveApiKey = (key: string) => {
        setApiKey(key);
        localStorage.setItem(STORAGE_KEYS.API_KEY, key);
        // Add DB sync for API key if needed
    };

    const saveFinancialGoals = (goals: string) => {
        setFinancialGoals(goals);
        localStorage.setItem(STORAGE_KEYS.GOALS, goals);
        // Add DB sync for goals if needed
    };

    const addCategory = async (name: string) => {
        if (!categories.includes(name)) {
            const newCategories = [...categories, name];
            setCategories(newCategories);
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories));
            const newBudgets = { ...budgets, [name]: 0 };
            setBudgets(newBudgets);
            localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(newBudgets));

            if (session) {
                await fetch('/api/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name }),
                });
            }
        }
    };

    const deleteCategory = async (name: string) => {
        const newCategories = categories.filter(c => c !== name);
        setCategories(newCategories);
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories));

        if (session) {
            await fetch('/api/categories', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
        }
    };

    return (
        <ExpenseContext.Provider value={{
            expenses,
            budgets,
            categories,
            apiKey,
            financialGoals,
            activeView,
            isAddModalOpen,
            setActiveView,
            setIsAddModalOpen,
            addExpense,
            updateExpense,
            deleteExpense,
            updateBudgets,
            saveApiKey,
            saveFinancialGoals,
            addCategory,
            deleteCategory,
        }}>

            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpenses = () => {
    const context = useContext(ExpenseContext);
    if (!context) throw new Error('useExpenses must be used within an ExpenseProvider');
    return context;
};
