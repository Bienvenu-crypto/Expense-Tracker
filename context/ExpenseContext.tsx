'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export const STORAGE_KEYS = {
    EXPENSES: 'expenses',
    BUDGETS: 'budgets',
    GOALS: 'financial_goals',
    API_KEY: 'gemini_api_key',
    CATEGORIES: 'categories'
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
    activeView: 'dashboard' | 'categories' | 'advisor';
    isAddModalOpen: boolean;
    setActiveView: (view: 'dashboard' | 'categories' | 'advisor') => void;
    setIsAddModalOpen: (open: boolean) => void;
    addExpense: (expense: Expense) => void;
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
    const [activeView, setActiveView] = useState<'dashboard' | 'categories' | 'advisor'>('dashboard');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        // Load data from localStorage
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
    }, []);

    const addExpense = (expense: Expense) => {
        const newExpenses = [expense, ...expenses];
        setExpenses(newExpenses);
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(newExpenses));
    };

    const deleteExpense = (id: string) => {
        const newExpenses = expenses.filter(e => e.id !== id);
        setExpenses(newExpenses);
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(newExpenses));
    };

    const updateBudgets = (newBudgets: Record<string, number>) => {
        setBudgets(newBudgets);
        localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(newBudgets));
    };

    const saveApiKey = (key: string) => {
        setApiKey(key);
        localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    };

    const saveFinancialGoals = (goals: string) => {
        setFinancialGoals(goals);
        localStorage.setItem(STORAGE_KEYS.GOALS, goals);
    };

    const addCategory = (name: string) => {
        if (!categories.includes(name)) {
            const newCategories = [...categories, name];
            setCategories(newCategories);
            localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories));

            // Add budget for new category
            const newBudgets = { ...budgets, [name]: 0 };
            setBudgets(newBudgets);
            localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(newBudgets));
        }
    };

    const deleteCategory = (name: string) => {
        const newCategories = categories.filter(c => c !== name);
        setCategories(newCategories);
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(newCategories));
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
            deleteExpense,
            updateBudgets,
            saveApiKey,
            saveFinancialGoals,
            addCategory,
            deleteCategory
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
