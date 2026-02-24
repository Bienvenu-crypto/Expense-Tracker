'use client';

import React, { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import ApiSettingsModal from '@/components/modals/ApiSettingsModal';

const AdvisorView = () => {
    const { expenses, budgets, apiKey, financialGoals, saveFinancialGoals } = useExpenses();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [insights, setInsights] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!financialGoals.trim()) {
            alert("Please enter some financial goals first!");
            return;
        }

        setLoading(true);
        setInsights(null);

        try {
            let result;
            if (apiKey && apiKey.trim().length > 10) {
                console.log("[AI Advisor] Using Gemini API");
                result = await callGeminiAPI(financialGoals, apiKey, expenses, budgets);
            } else {
                console.log("[AI Advisor] Using Heuristic Fallback");
                await new Promise(r => setTimeout(r, 1500));
                result = analyzeFinances(financialGoals, expenses, budgets);
            }
            setInsights(result);
        } catch (error: any) {
            console.error("AI Error:", error);
            alert("Analysis Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="view-advisor">
            <div className="dashboard-header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div className="dashboard-titles">
                    <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>AI Financial Advisor</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Get personalized insights to reach your goals</p>
                </div>
                <button
                    className="btn-secondary"
                    id="openSettingsBtn"
                    onClick={() => setIsSettingsOpen(true)}
                    style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                    API Settings
                </button>
            </div>

            <div className="advisor-layout">
                <div className="advisor-column input-column">
                    <div className="advisor-card">
                        <div className="advisor-header">
                            <span className="advisor-icon-lg"></span>
                            <h3>Your Financial Goals</h3>
                        </div>
                        <p className="advisor-desc">Tell me what you want to achieve (e.g., "Save $500 for a trip", "Stop eating out so much"). I'll analyze your spending and give you a plan.</p>

                        <div className="form-group">
                            <textarea
                                className="advisor-input"
                                placeholder="Type your goals here..."
                                rows={5}
                                value={financialGoals}
                                onChange={(e) => saveFinancialGoals(e.target.value)}
                            />
                        </div>

                        <button className="btn-primary btn-block" onClick={handleAnalyze} disabled={loading} style={{ width: '100%' }}>
                            {loading ? '✨ Analyzing...' : '✨ Generate AI Insights'}
                        </button>
                    </div>
                </div>

                <div className="advisor-column output-column">
                    {loading && (
                        <div className="advisor-loading">
                            <div className="spinner"></div>
                            <p>Analyzing your spending patterns...</p>
                        </div>
                    )}

                    {!loading && insights && (
                        <div className="advisor-results" dangerouslySetInnerHTML={{ __html: insights }} />
                    )}

                    {!loading && !insights && (
                        <div className="advisor-empty" style={{ textAlign: 'center', padding: '40px' }}>
                            <div className="empty-icon" style={{ fontSize: '48px', marginBottom: '16px' }}></div>
                            <h3>Ready to Help</h3>
                            <p>Enter your goals on the left to get started.</p>
                        </div>
                    )}
                </div>
            </div>

            {isSettingsOpen && <ApiSettingsModal onClose={() => setIsSettingsOpen(false)} />}
        </div>
    );
};

// --- GEMINI API INTEGRATION WITH SELF-DIAGNOSIS ---
async function callGeminiAPI(goals: string, apiKey: string, expenses: any[], budgets: Record<string, number>) {
    const cleanApiKey = apiKey.trim();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Group expenses by category for context
    const categorySpending: Record<string, number> = {};
    let totalSpent = 0;
    expenses.forEach(e => {
        const d = new Date(e.date);
        if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
            totalSpent += e.amount;
        }
    });

    const expensesList = expenses.slice(0, 15).map(e => ({
        amount: e.amount,
        category: e.category,
        desc: e.description,
        date: e.date
    }));

    const systemPrompt = `
    You are an expert financial advisor AI for a personal expense tracker app.
    
    Context:
    - Total Spent this month: $${totalSpent.toFixed(2)}
    - Spending by Category: ${JSON.stringify(categorySpending)}
    - Monthly Budgets: ${JSON.stringify(budgets)}
    - Recent Transactions: ${JSON.stringify(expensesList)}
    
    User Goal: "${goals}"
    
    Instructions:
    1. Analyze the user's spending habits relative to their goals.
    2. Provide 3-4 specific, actionable, and encouraging insights.
    3. Be concise. Use HTML formatting (<h2>, <h4>, <p>, <ul>, <li>, <strong>) to structure your response nicely. 
    4. MUST NOT use Markdown code blocks. Return raw HTML suitable for a <div>.
    5. Be intelligent and empathetic. If they are over budget, be helpful, not judgmental.
    `;

    // Discovery: User's key has access to the 2.5 series and latest aliases
    const models = [
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-2.0-flash',
        'gemini-flash-latest',
        'gemini-pro-latest',
        'gemini-1.5-flash'
    ];

    let lastError: any = null;

    for (const model of models) {
        try {
            console.log(`[AI Advisor] Attempting model: ${model}`);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanApiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                const errMsg = data.error?.message || response.statusText;
                console.warn(`[AI Advisor] Model ${model} failed: ${errMsg}`);
                lastError = new Error(errMsg);

                // Stop immediately if it's a fundamental key error
                if (response.status === 400 && errMsg.includes('API key')) throw lastError;
                if (response.status === 401 || response.status === 403) throw lastError;

                continue;
            }

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                console.log(`[AI Advisor] Success with ${model}`);
                // Sanitize output of potential markdown wrappers
                const cleanText = text.replace(/```html/g, '').replace(/```/g, '').trim();
                return `<div class="ai-response">${cleanText}</div>`;
            }
        } catch (error: any) {
            console.error(`[AI Advisor] Error with ${model}:`, error);
            lastError = error;
        }
    }

    // --- ALL MODELS FAILED: TRIGGER SELF-DIAGNOSIS ---
    console.log("[AI Advisor] All models failed. Running diagnosis...");
    try {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${cleanApiKey}`;
        const listResp = await fetch(listUrl);
        const listData = await listResp.json();

        if (listData.models) {
            const modelNames = listData.models.map((m: any) => m.name.replace('models/', '')).join(', ');
            throw new Error(`Your key is valid, but attempted models failed to respond. Available models on your account: ${modelNames}.`);
        } else {
            throw new Error(`The API key provided appears invalid or restricted. (Details: ${JSON.stringify(listData.error || listData)})`);
        }
    } catch (diagnosisError: any) {
        throw new Error(`AI Connection Failed. ${lastError?.message || ""}. Diagnosis: ${diagnosisError.message}`);
    }
}

// --- HEURISTIC OFFLINE ANALYSIS (PORTED FROM STATIC V7) ---
function analyzeFinances(goals: string, expenses: any[], budgets: Record<string, number>) {
    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    const spendingByCategory: Record<string, number> = {};

    expenses.forEach(e => {
        spendingByCategory[e.category] = (spendingByCategory[e.category] || 0) + e.amount;
    });

    const sortedCategories = Object.entries(spendingByCategory).sort((a, b) => b[1] - a[1]);
    const topCategory = sortedCategories.length > 0 ? sortedCategories[0] : null;

    let advice = `<h2>🤖 Financial Analysis (Offline Mode)</h2>`;
    advice += `<p class="analysis-intro">I've analyzed your goal: <em>"${goals}"</em> against your current spending of <strong>$${totalSpent.toFixed(2)}</strong>.</p>`;
    advice += `<p class="analysis-hint" style="color:var(--text-muted); font-size:12px; margin-bottom:16px;">(Tip: Add a Gemini API Key in Settings for smarter, personalized AI insights)</p>`;
    advice += `<div class="insight-list">`;

    if (topCategory) {
        const [name, amount] = topCategory;
        const budget = budgets[name] || 0;
        const percentOfBudget = budget > 0 ? ((amount / budget) * 100).toFixed(0) : null;

        advice += `
            <div class="insight-item" style="margin-bottom: 16px;">
                <h4 style="color: var(--accent-primary);">⚠️ High Spending Alert</h4>
                <p>Your highest spending category is <strong>${name}</strong> ($${amount.toFixed(2)}). ${percentOfBudget ? `You have used ${percentOfBudget}% of your budget for this.` : "Consider setting a budget for this category to track it better."}</p>
            </div>
        `;
    }

    const lowerGoals = goals.toLowerCase();
    if (lowerGoals.match(/(save|vacation|trip|buy|house|car|deposit)/)) {
        advice += `
            <div class="insight-item" style="margin-bottom: 16px;">
                <h4 style="color: var(--accent-primary);">💰 Savings Strategy</h4>
                <p>To reach this goal faster, try the **"Wait 24 Hours Rule"** for any non-essential purchase over $50. This often eliminates impulse spending.</p>
            </div>
        `;
    } else if (lowerGoals.match(/(debt|loan|credit|pay off|owe)/)) {
        advice += `
            <div class="insight-item" style="margin-bottom: 16px;">
                <h4 style="color: var(--accent-primary);">💳 Debt Destruction</h4>
                <p>Consider the **Snowball Method**: pay off your smallest balance first to build momentum, or the **Avalanche Method**: pay the highest interest first to save money long-term.</p>
            </div>
        `;
    } else {
        advice += `
            <div class="insight-item" style="margin-bottom: 16px;">
                <h4 style="color: var(--accent-primary);">🎯 Goal Alignment</h4>
                <p>Start by identifying your "fixed" vs "variable" costs. Reducing variable costs (like dining out) is usually the fastest way to free up cash for new goals.</p>
            </div>
        `;
    }

    advice += `</div>`;
    return `<div class="ai-response">${advice}</div>`;
}

export default AdvisorView;
