// Data Store
const STORAGE_KEYS = {
    EXPENSES: 'expenses',
    BUDGETS: 'budgets',
    GOALS: 'financial_goals',
    API_KEY: 'gemini_api_key'
};

const CATEGORIES = ['Food', 'Entertainment', 'Transport', 'Shopping', 'Bills', 'Health', 'Other'];

const CATEGORY_ICONS = {
    'Food': '🍔',
    'Entertainment': '🎮',
    'Transport': '🚗',
    'Shopping': '🛍️',
    'Bills': '💡',
    'Health': '⚕️',
    'Other': '📦'
};

const WARNING_THRESHOLD = 0.85;

// State
let expenses = [];
let budgets = {};
let pendingExpense = null;

// Global Error Handler for Debugging (Alerts on error)
window.onerror = function (msg, url, line, col, error) {
    // Ignore benign errors if any
    if (msg.includes('ResizeObserver')) return false;

    console.error("Global Error:", msg, url, line, col, error);
    // Only alert if it's likely a script logic error preventing execution
    // alert("Script Error: " + msg); 
    return false;
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log("App Initialized");
    loadData();
    initializeEventListeners();
    initializeCategoryFilter();
    initializeAdvisor();
    setTodayDate();

    // Default View
    switchView('dashboard');

    render();
});

// Load data from localStorage
function loadData() {
    const storedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    const storedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);

    expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
    budgets = storedBudgets ? JSON.parse(storedBudgets) : getDefaultBudgets();

    if (!storedBudgets) {
        saveBudgets();
    }
}

function getDefaultBudgets() {
    const defaultBudgets = {};
    CATEGORIES.forEach(category => {
        defaultBudgets[category] = 0;
    });
    return defaultBudgets;
}

function saveExpenses() {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
}

function saveBudgets() {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
}

// Initialize Event Listeners
function initializeEventListeners() {
    console.log("Initializing Event Listeners...");

    // Navigation Listeners
    const btnDash = document.getElementById('navDashboard');
    const btnAdv = document.getElementById('navAdvisor');

    if (btnDash) {
        btnDash.addEventListener('click', () => switchView('dashboard'));
        console.log("Attached Dashboard Listener");
    }
    if (btnAdv) {
        btnAdv.addEventListener('click', () => switchView('advisor'));
        console.log("Attached Advisor Listener");
    }

    // Modal & Action Listeners
    const addBtn = document.getElementById('addExpenseBtn');
    if (addBtn) addBtn.addEventListener('click', openAddExpenseModal);

    const closeExp = document.getElementById('closeExpenseModal');
    if (closeExp) closeExp.addEventListener('click', closeAddExpenseModal);

    const cancelExp = document.getElementById('cancelExpenseBtn');
    if (cancelExp) cancelExp.addEventListener('click', closeAddExpenseModal);

    const expForm = document.getElementById('expenseForm');
    if (expForm) expForm.addEventListener('submit', handleExpenseSubmit);

    const manageBtn = document.getElementById('manageBudgetsBtn');
    if (manageBtn) manageBtn.addEventListener('click', openManageBudgetsModal);

    const closeBudgets = document.getElementById('closeBudgetsModal');
    if (closeBudgets) closeBudgets.addEventListener('click', closeManageBudgetsModal);

    const saveBudgets = document.getElementById('saveBudgetsBtn');
    if (saveBudgets) saveBudgets.addEventListener('click', handleSaveBudgets);

    const closeWarn = document.getElementById('closeWarningModal');
    if (closeWarn) closeWarn.addEventListener('click', closeWarningModal);

    const cancelWarn = document.getElementById('cancelWarningBtn');
    if (cancelWarn) cancelWarn.addEventListener('click', closeWarningModal);

    const proceedWarn = document.getElementById('proceedWarningBtn');
    if (proceedWarn) proceedWarn.addEventListener('click', proceedWithExpense);

    const catFilter = document.getElementById('categoryFilter');
    if (catFilter) catFilter.addEventListener('change', handleFilterChange);

    // AI Settings Listeners - EVENT DELEGATION
    // This catches clicks anywhere on the body and checks if they originated from openSettingsBtn
    document.body.addEventListener('click', function (e) {
        // Check if clicked element is the button or inside it
        const settingsBtn = e.target.closest('#openSettingsBtn');
        if (settingsBtn) {
            console.log("Delegated Click: Settings Button detected");
            e.preventDefault(); // Stop any default behavior
            e.stopPropagation(); // Stop bubbling
            openSettingsModal();
        }
    });

    const closeSettings = document.getElementById('closeSettingsModal');
    if (closeSettings) closeSettings.addEventListener('click', closeSettingsModal);

    const cancelSettings = document.getElementById('cancelSettingsBtn');
    if (cancelSettings) cancelSettings.addEventListener('click', closeSettingsModal);

    // Save API Key
    const saveKeyBtn = document.querySelector('#apiSettingsForm button[type="submit"]');
    if (saveKeyBtn) saveKeyBtn.addEventListener('click', handleSaveApiKey);


    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
}

// Navigation Logic
function switchView(viewName) {
    console.log("Switching View to:", viewName);
    const dashboard = document.getElementById('view-dashboard');
    const advisor = document.getElementById('view-advisor');

    const btnDash = document.getElementById('navDashboard');
    const btnAdv = document.getElementById('navAdvisor');

    if (viewName === 'dashboard') {
        if (dashboard) dashboard.style.display = 'block';
        if (advisor) advisor.style.display = 'none';

        if (btnDash) btnDash.classList.add('active');
        if (btnAdv) btnAdv.classList.remove('active');
    } else if (viewName === 'advisor') {
        if (dashboard) dashboard.style.display = 'none';
        if (advisor) advisor.style.display = 'block';

        if (btnDash) btnDash.classList.remove('active');
        if (btnAdv) btnAdv.classList.add('active');
    }
}

// AI Advisor Logic
function initializeAdvisor() {
    const btn = document.getElementById('analyzeBtn');
    if (btn) btn.addEventListener('click', generateAIInsights);

    const savedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (savedGoals) {
        const input = document.getElementById('financialGoals');
        if (input) input.value = savedGoals;
    }
}

function openSettingsModal() {
    console.log("Opening Settings Modal...");
    const modal = document.getElementById('apiSettingsModal');
    const input = document.getElementById('geminiApiKey');
    if (modal) {
        console.log("Modal found, adding active class");
        modal.classList.add('active');
        // Check if style display is interfering
        modal.style.display = 'flex'; // Force flex display ensures it overrides any other styles

        const key = localStorage.getItem(STORAGE_KEYS.API_KEY);
        if (key && input) input.value = key;
    } else {
        console.error("API Settings Modal NOT found in DOM");
        alert("Error: Settings Modal not found!");
    }
}

function closeSettingsModal() {
    const modal = document.getElementById('apiSettingsModal');
    if (modal) {
        modal.classList.remove('active');
        modal.style.display = ''; // Reset inline style to revert to CSS class control
    }
}

function handleSaveApiKey(e) {
    e.preventDefault();
    const input = document.getElementById('geminiApiKey');
    if (input && input.value.trim()) {
        localStorage.setItem(STORAGE_KEYS.API_KEY, input.value.trim());
        alert("API Key Saved Successfully!");
        closeSettingsModal();
    } else {
        alert("Please enter a valid API Key.");
    }
}

async function generateAIInsights() {
    const goalsInput = document.getElementById('financialGoals');
    const goals = goalsInput.value;

    if (!goals.trim()) {
        alert("Please enter some financial goals first!");
        return;
    }

    localStorage.setItem(STORAGE_KEYS.GOALS, goals);

    const outputDiv = document.getElementById('aiOutput');
    const emptyDiv = document.getElementById('aiEmpty');
    const loadingDiv = document.getElementById('aiLoading');

    if (outputDiv) outputDiv.style.display = 'none';
    if (emptyDiv) emptyDiv.style.display = 'none';
    if (loadingDiv) loadingDiv.style.display = 'block';

    const apiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);

    try {
        let insights;
        if (apiKey) {
            // Real AI
            console.log("Using Gemini API");
            insights = await callGeminiAPI(goals, apiKey);
        } else {
            // Heuristic Fallback
            console.log("Using Heuristic Fallback");
            await new Promise(r => setTimeout(r, 1500));
            insights = analyzeFinances(goals);
        }

        if (loadingDiv) loadingDiv.style.display = 'none';
        if (outputDiv) {
            outputDiv.innerHTML = insights;
            outputDiv.style.display = 'block';
        }
    } catch (error) {
        console.error("AI Error:", error);
        if (loadingDiv) loadingDiv.style.display = 'none';
        alert("Failed to generate insights: " + error.message);
    }
}

// Gemini API Integration
async function callGeminiAPI(goals, apiKey) {
    const spending = getSpendingByCategory();
    const totalSpent = Object.values(spending).reduce((a, b) => a + b, 0);
    const spendingContext = JSON.stringify(spending);
    const budgetsContext = JSON.stringify(budgets);
    const expensesList = JSON.stringify(expenses.slice(0, 15).map(e => ({
        amount: e.amount,
        category: e.category,
        desc: e.description,
        date: e.date
    })));

    const systemPrompt = `
    You are an expert financial advisor AI for a personal expense tracker app.
    
    Context:
    - Total Spent this month: $${totalSpent.toFixed(2)}
    - Spending by Category: ${spendingContext}
    - Monthly Budgets: ${budgetsContext}
    - Recent Expenses: ${expensesList}
    
    User Goal: "${goals}"
    
    Instructions:
    1. Analyze the user's spending habits relative to their goals.
    2. Provide 3-4 specific, actionable, and encouraging insights.
    3. Be concise. Use HTML formatting (<h2>, <h4>, <p>, <ul>, <li>, <strong>) to structure your response nicely. 
    4. Do not use Markdown code blocks. Return raw HTML suitable for a <div>.
    5. Be intelligent and empathetic. If they are over budget, be helpful, not judgmental.
    `;

    // List of models to try in order of preference
    const models = [
        'gemini-1.5-flash',
        'gemini-pro',
        'gemini-1.0-pro-latest',
        'gemini-1.0-pro'
    ];

    let lastError = null;

    for (const model of models) {
        try {
            console.log(`Attempting to use Gemini model: ${model}`);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: systemPrompt }]
                    }]
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.error?.message || response.statusText;
                console.warn(`Model ${model} failed: ${errMsg}`);
                lastError = new Error(`Model ${model}: ${errMsg}`);

                // If it's a key error (400/403), don't try other models, just fail
                if (response.status === 400 && errMsg.includes('API key')) {
                    throw lastError;
                }

                continue; // Try next model
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("No candidates returned");
            }

            const text = data.candidates[0].content.parts[0].text;

            // Success!
            console.log(`Success with model: ${model}`);

            // Clean up markdown code blocks if any
            const cleanText = text.replace(/```html/g, '').replace(/```/g, '');
            return `<div class="ai-response">${cleanText}</div>`;

        } catch (error) {
            console.error(`Error with ${model}:`, error);
            lastError = error;
            // Continue to next model unless it was a break condition
        }
    }

    // If we get here, all models failed
    throw lastError || new Error("Failed to connect to any Gemini model. Please checks your API Key.");
}

// Fallback Heuristic Analysis
function analyzeFinances(goals) {
    const spending = getSpendingByCategory();
    const categories = Object.entries(spending).sort((a, b) => b[1] - a[1]);
    const topCategory = categories.length > 0 ? categories[0] : null;
    const totalSpent = Object.values(spending).reduce((a, b) => a + b, 0);

    const intros = [
        `I've analyzed your goal: <em>"${goals}"</em> against your spending patterns.`,
        `Analyzing your finances... I see you've spent <strong>$${totalSpent.toFixed(2)}</strong> this month.`,
        `Let's look at how your goal: <em>"${goals}"</em> fits with your current budget.`
    ];
    const randomIntro = intros[Math.floor(Math.random() * intros.length)];

    let advice = `<h2>🤖 Financial Analysis (Offline Mode)</h2>`;
    advice += `<p class="analysis-intro">${randomIntro}</p>`;
    advice += `<p class="analysis-hint" style="color:var(--text-muted); font-size:12px; margin-bottom:16px;">(Tip: Add an API Key in Settings for smarter AI)</p>`;
    advice += `<div class="insight-list">`;

    if (topCategory && topCategory[1] > 0) {
        const amount = topCategory[1];
        const percent = totalSpent > 0 ? ((amount / totalSpent) * 100).toFixed(1) : 0;

        advice += `
            <div class="insight-item">
                <h4>⚠️ Top Spending Alert</h4>
                <p>Your highest spending category is <strong>${topCategory[0]}</strong> ($${amount.toFixed(2)}). This accounts for ${percent}% of your total spending. Reducing this by just 10% would save you $${(amount * 0.1).toFixed(2)}.</p>
            </div>
        `;
    }

    const lowerGoals = goals.toLowerCase();
    let specificAdviceFound = false;

    if (lowerGoals.match(/(save|vacation|trip|buy|house|car|deposit|future)/)) {
        advice += `
            <div class="insight-item">
                <h4>💰 Savings Strategy</h4>
                <p>To reach this savings goal, consider the <strong>50/30/20 rule</strong>. Try setting up an automatic transfer of 20% of your income into a separate account immediately on payday.</p>
            </div>
        `;
        specificAdviceFound = true;
    }

    if (lowerGoals.match(/(debt|loan|credit|pay off|owe)/)) {
        advice += `
            <div class="insight-item">
                <h4>💳 Debt Destruction</h4>
                <p>Consider the <strong>Avalanche Method</strong> (pay highest interest first) or <strong>Snowball Method</strong> (pay smallest balance first). Reducing discretionary spend can accelerate this.</p>
            </div>
        `;
        specificAdviceFound = true;
    }

    if (!specificAdviceFound) {
        advice += `
            <div class="insight-item">
                <h4>🎯 Goal Alignment</h4>
                <p>To achieve "${goals}", start by tracking every penny for 7 days. Awareness is the first step.</p>
            </div>
        `;
    }

    const tips = [
        "Buying generic brands instead of name brands can save you up to 30% on groceries.",
        "Wait 24 hours before making any non-essential purchase over $50.",
        "Review your bank statements for 'zombie subscriptions' you forgot about.",
        "Using cash for daily spending acts as a physical limit on your budget."
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    advice += `
        <div class="insight-item">
            <h4>💡 Pro Tip</h4>
            <p>${randomTip}</p>
        </div>
    `;

    advice += `</div>`;

    return advice;
}

// ... (Rest of helper functions remain unchanged)

// Helper Functions (re-included for completeness if overwriting file)
function initializeCategoryFilter() {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;

    // Clear existing to avoid duplicates if re-run
    filter.innerHTML = '<option value="all">All Categories</option>';

    CATEGORIES.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = `${CATEGORY_ICONS[category]} ${category}`;
        filter.appendChild(option);
    });
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    const el = document.getElementById('expenseDate');
    if (el) el.value = today;
}

// Modal Functions
function openAddExpenseModal() {
    document.getElementById('addExpenseModal').classList.add('active');
    document.getElementById('expenseAmount').focus();
}

function closeAddExpenseModal() {
    document.getElementById('addExpenseModal').classList.remove('active');
    document.getElementById('expenseForm').reset();
    setTodayDate();
    pendingExpense = null;
}

function openManageBudgetsModal() {
    renderBudgetForm();
    document.getElementById('manageBudgetsModal').classList.add('active');
}

function closeManageBudgetsModal() {
    document.getElementById('manageBudgetsModal').classList.remove('active');
}

function openWarningModal(expense, spent, budget, percentage) {
    const message = document.getElementById('warningMessage');
    const over100 = percentage > 100;
    const warningLevel = over100 ? 'OVER BUDGET' : 'WARNING';

    message.innerHTML = `
        <h3 style="color: var(--accent-danger); margin-bottom: 16px;">⚠️ ${warningLevel}</h3>
        <p><strong>Category:</strong> ${CATEGORY_ICONS[expense.category]} ${expense.category}</p>
        <p><strong>Current Spending:</strong> $${spent.toFixed(2)}</p>
        <p><strong>Monthly Budget:</strong> $${budget.toFixed(2)}</p>
        <p><strong>This Expense:</strong> $${expense.amount.toFixed(2)}</p>
        <p><strong>New Total:</strong> $${(spent + expense.amount).toFixed(2)} 
           (${percentage.toFixed(1)}% of budget)</p>
        ${over100 ?
            `<p style="color: var(--accent-danger); font-weight: 600; margin-top: 12px;">
                You will be <strong>$${((spent + expense.amount) - budget).toFixed(2)}</strong> over budget!
            </p>` :
            `<p style="color: var(--accent-warning); font-weight: 600; margin-top: 12px;">
                You are approaching your budget limit!
            </p>`
        }
    `;

    document.getElementById('warningModal').classList.add('active');
}

function closeWarningModal() {
    document.getElementById('warningModal').classList.remove('active');
    pendingExpense = null;
}

function handleExpenseSubmit(e) {
    e.preventDefault();

    const expense = {
        id: Date.now().toString(),
        amount: parseFloat(document.getElementById('expenseAmount').value),
        category: document.getElementById('expenseCategory').value,
        description: document.getElementById('expenseDescription').value,
        date: document.getElementById('expenseDate').value,
        timestamp: new Date(document.getElementById('expenseDate').value).getTime()
    };

    const categoryBudget = budgets[expense.category];
    if (categoryBudget > 0) {
        const expenseDate = new Date(expense.date);
        const expenseMonth = expenseDate.getMonth();
        const expenseYear = expenseDate.getFullYear();

        const categoryExpenses = expenses.filter(e => {
            const eDate = new Date(e.date);
            return e.category === expense.category &&
                eDate.getMonth() === expenseMonth &&
                eDate.getFullYear() === expenseYear;
        });

        const spent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
        const newTotal = spent + expense.amount;
        const percentage = (newTotal / categoryBudget) * 100;

        if (percentage >= (WARNING_THRESHOLD * 100)) {
            pendingExpense = expense;
            openWarningModal(expense, spent, categoryBudget, percentage);
            return;
        }
    }

    addExpense(expense);
}

function addExpense(expense) {
    expenses.unshift(expense);
    saveExpenses();
    closeAddExpenseModal();
    closeWarningModal();
    render();
}

function proceedWithExpense() {
    if (pendingExpense) addExpense(pendingExpense);
}

function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        expenses = expenses.filter(e => e.id !== id);
        saveExpenses();
        render();
    }
}

function renderBudgetForm() {
    const form = document.getElementById('budgetForm');
    form.innerHTML = '';
    CATEGORIES.forEach(category => {
        const item = document.createElement('div');
        item.className = 'budget-form-item';
        item.innerHTML = `
            <label>${CATEGORY_ICONS[category]} ${category}</label>
            <input type="number" step="0.01" min="0" value="${budgets[category] || 0}" data-category="${category}" placeholder="Enter monthly budget">
        `;
        form.appendChild(item);
    });
}

function handleSaveBudgets() {
    const inputs = document.querySelectorAll('#budgetForm input');
    inputs.forEach(input => {
        const category = input.dataset.category;
        const value = parseFloat(input.value) || 0;
        budgets[category] = value;
    });
    saveBudgets();
    closeManageBudgetsModal();
    render();
}

function handleFilterChange() {
    renderExpenses();
}

// Data Helpers
function getCurrentMonthExpenses() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth &&
            expenseDate.getFullYear() === currentYear;
    });
}

function getSpendingByCategory() {
    const currentExpenses = getCurrentMonthExpenses();
    const spending = {};
    CATEGORIES.forEach(category => {
        spending[category] = currentExpenses
            .filter(e => e.category === category)
            .reduce((sum, e) => sum + e.amount, 0);
    });
    return spending;
}

// Render Functions
function renderSummary() {
    const currentExpenses = getCurrentMonthExpenses();
    const totalSpent = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBudget = Object.values(budgets).reduce((sum, b) => sum + b, 0);
    const remaining = totalBudget - totalSpent;

    const now = new Date();
    const currentDay = now.getDate();
    const avgDaily = currentDay > 0 ? totalSpent / currentDay : 0;

    if (document.getElementById('totalSpent')) document.getElementById('totalSpent').textContent = `$${totalSpent.toFixed(2)}`;
    if (document.getElementById('totalBudget')) document.getElementById('totalBudget').textContent = `$${totalBudget.toFixed(2)}`;
    if (document.getElementById('remaining')) document.getElementById('remaining').textContent = `$${remaining.toFixed(2)}`;
    if (document.getElementById('avgDaily')) document.getElementById('avgDaily').textContent = `$${avgDaily.toFixed(2)}`;

    const remainingEl = document.getElementById('remaining');
    if (remainingEl) {
        if (remaining < 0) remainingEl.style.color = 'var(--accent-danger)';
        else if (remaining < totalBudget * 0.2) remainingEl.style.color = 'var(--accent-warning)';
        else remainingEl.style.color = 'var(--accent-success)';
    }
}

function renderBudgets() {
    const list = document.getElementById('budgetList');
    if (!list) return;
    const spending = getSpendingByCategory();

    if (Object.values(budgets).every(b => b === 0)) {
        list.innerHTML = `<div class="empty-state"><h3>No Budgets Set</h3></div>`;
        return;
    }

    list.innerHTML = '';
    CATEGORIES.forEach(category => {
        const budget = budgets[category];
        if (budget === 0) return;

        const spent = spending[category];
        const percentage = (spent / budget) * 100;
        let progressClass = 'progress-safe';
        if (percentage >= 100) progressClass = 'progress-danger';
        else if (percentage >= WARNING_THRESHOLD * 100) progressClass = 'progress-warning';

        const item = document.createElement('div');
        item.className = 'budget-item';
        item.innerHTML = `
            <div class="budget-header">
                <span class="budget-category">${CATEGORY_ICONS[category]} ${category}</span>
                <span style="font-size: 13px; color: #9ca3af;">$${spent.toFixed(0)} / $${budget.toFixed(0)}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
            </div>
        `;
        list.appendChild(item);
    });
}

function renderExpenses() {
    const list = document.getElementById('expensesList');
    if (!list) return;
    const filter = document.getElementById('categoryFilter').value;

    let filteredExpenses = expenses;

    if (filter !== 'all') {
        filteredExpenses = expenses.filter(e => e.category === filter);
    }

    if (filteredExpenses.length === 0) {
        list.innerHTML = `<div class="empty-state"><p>No expenses found</p></div>`;
        return;
    }

    list.innerHTML = '';
    filteredExpenses.slice(0, 10).forEach(expense => {
        const item = document.createElement('div');
        item.className = 'expense-item';
        const date = new Date(expense.date).toLocaleDateString();
        item.innerHTML = `
             <div class="expense-info">
                 <div class="expense-header">
                     <span class="expense-category-badge">${CATEGORY_ICONS[expense.category]} ${expense.category}</span>
                     <span class="expense-description">${expense.description}</span>
                 </div>
                 <div class="expense-date">${date}</div>
             </div>
             <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
             <button class="icon-btn delete" onclick="deleteExpense('${expense.id}')" style="margin-left:auto;background:none;border:none;">🗑️</button>
        `;
        list.appendChild(item);
    });
}

function render() {
    renderSummary();
    renderBudgets();
    renderExpenses();
    if (typeof renderCharts === 'function') renderCharts();
}
