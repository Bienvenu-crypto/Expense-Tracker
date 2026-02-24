// Data Store
const STORAGE_KEYS = {
    EXPENSES: 'expenses',
    BUDGETS: 'budgets',
    GOALS: 'financial_goals',
    API_KEY: 'gemini_api_key',
    CATEGORIES: 'categories'
};

const DEFAULT_CATEGORIES = [
    { name: 'Food' },
    { name: 'Entertainment' },
    { name: 'Transport' },
    { name: 'Shopping' },
    { name: 'Bills' },
    { name: 'Health' },
    { name: 'Other' }
];

const WARNING_THRESHOLD = 0.85;

// State
let expenses = [];
let budgets = {};
let categories = [];
let pendingExpense = null;

// Global Error Handler for Debugging (Alerts on error)
window.onerror = function (msg, url, line, col, error) {
    if (msg.includes('ResizeObserver')) return false;
    console.error("Global Error:", msg, url, line, col, error);
    return false;
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    console.log("App Initialized - Version 7 (Categories)");

    loadData();
    initializeEventListeners();
    initializeCategoryFilter();
    initializeAdvisor();
    setTodayDate();
    updateCategorySelects();

    // Default View
    switchView('dashboard');
    navigateFromHash(); // Check if URL has #categories

    render();
});

// Load data from localStorage
function loadData() {
    const storedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    const storedBudgets = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);

    expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
    categories = storedCategories ? JSON.parse(storedCategories) : DEFAULT_CATEGORIES;
    budgets = storedBudgets ? JSON.parse(storedBudgets) : getDefaultBudgets();

    if (!storedBudgets) {
        saveBudgets();
    }
    if (!storedCategories) {
        saveCategories();
    }
}

function getDefaultBudgets() {
    const defaultBudgets = {};
    categories.forEach(cat => {
        defaultBudgets[cat.name] = 0;
    });
    return defaultBudgets;
}

function saveExpenses() {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
}

function saveBudgets() {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
}

function saveCategories() {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    updateCategorySelects();
    initializeCategoryFilter();
    renderBudgetForm(); // Update budget form if open
}

// Helper to get Icon (Disabled)
function getCategoryIcon(name) {
    return '';
}

// Initialize Event Listeners
function initializeEventListeners() {
    console.log("Initializing Event Listeners...");

    // Navigation Listeners
    const navs = ['Dashboard', 'Categories', 'Advisor'];
    navs.forEach(view => {
        const btn = document.getElementById(`nav${view}`);
        if (btn) btn.addEventListener('click', () => switchView(view.toLowerCase()));
    });

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
    document.body.addEventListener('click', function (e) {
        const settingsBtn = e.target.closest('#openSettingsBtn');
        if (settingsBtn) {
            console.log("Delegated Click: Settings Button detected");
            e.preventDefault();
            e.stopPropagation();
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

    // Category Management Listeners
    const addCatBtn = document.getElementById('addCategoryBtn');
    if (addCatBtn) addCatBtn.addEventListener('click', promptAddCategory);

    const closeCatModal = document.getElementById('closeCategoryModal');
    if (closeCatModal) closeCatModal.addEventListener('click', closeCategoryModal);

    const cancelCatBtn = document.getElementById('cancelCategoryBtn');
    if (cancelCatBtn) cancelCatBtn.addEventListener('click', closeCategoryModal);

    const catForm = document.getElementById('categoryForm');
    if (catForm) catForm.addEventListener('submit', handleCategorySubmit);
}

// Category Logic
function updateCategorySelects() {
    const selects = ['expenseCategory', 'categoryFilter'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;

        const currentVal = select.value;
        // Keep "All Categories" for filter
        if (id === 'categoryFilter') {
            select.innerHTML = '<option value="all">All Categories</option>';
        } else {
            select.innerHTML = '<option value="">Select a category</option>';
        }

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name;
            option.innerHTML = `${cat.icon} ${cat.name}`;
            select.appendChild(option);
        });

        // Restore value if possible
        if (currentVal && categories.some(c => c.name === currentVal)) {
            select.value = currentVal;
        }
    });
}

// Category Management with Modal
// Category Management with Modal
let editingCategoryIndex = null;

function renderCategories() {
    const list = document.getElementById('categoriesList');
    if (!list) return;

    list.innerHTML = categories.map((cat, index) => `
        <div class="category-card">
            <div class="category-info">
                <h3>${cat.name}</h3>
                <p>${expenses.filter(e => e.category === cat.name).length} transactions</p>
            </div>
            <div class="category-actions">
                <button class="icon-btn edit" onclick="editCategory(${index})" title="Edit Category">✏️</button>
                <button class="icon-btn delete" onclick="deleteCategory(${index})" title="Delete Category">🗑️</button>
            </div>
        </div>
    `).join('');
}

function openCategoryModal(editIndex = null) {
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');
    const nameInput = document.getElementById('categoryName');

    editingCategoryIndex = editIndex;

    // Set title
    title.textContent = editIndex !== null ? 'Edit Category' : 'Add Category';

    // Populate fields if editing
    if (editIndex !== null) {
        const cat = categories[editIndex];
        nameInput.value = cat.name;
    } else {
        nameInput.value = '';
    }

    modal.classList.add('active');
    nameInput.focus();
}

// selectIcon removed

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.remove('active');
    editingCategoryIndex = null;
}

function handleCategorySubmit(e) {
    e.preventDefault();
    const name = document.getElementById('categoryName').value.trim();

    if (!name) {
        alert('Please enter a name!');
        return;
    }

    const isDuplicate = categories.some((cat, index) =>
        cat.name.toLowerCase() === name.toLowerCase() && index !== editingCategoryIndex
    );

    if (isDuplicate) {
        alert('A category with this name already exists!');
        return;
    }

    if (editingCategoryIndex !== null) {
        const oldName = categories[editingCategoryIndex].name;
        categories[editingCategoryIndex] = { name };

        if (oldName !== name && budgets[oldName] !== undefined) {
            budgets[name] = budgets[oldName];
            delete budgets[oldName];
            saveBudgets();
        }

        expenses.forEach(e => {
            if (e.category === oldName) e.category = name;
        });
        saveExpenses();
    } else {
        categories.push({ name });
    }

    saveCategories();
    renderCategories();
    closeCategoryModal();
}

function editCategory(index) {
    openCategoryModal(index);
}

function promptAddCategory() {
    openCategoryModal();
}

function deleteCategory(index) {
    const cat = categories[index];
    const expenseCount = expenses.filter(e => e.category === cat.name).length;

    const confirmMsg = expenseCount > 0
        ? `Delete category '${cat.name}'? ${expenseCount} existing expenses will keep this category name.`
        : `Delete category '${cat.name}'?`;

    if (confirm(confirmMsg)) {
        categories.splice(index, 1);
        saveCategories();
        renderCategories();
    }
}

// Navigation Logic
function switchView(viewName) {
    console.log("Switching View to:", viewName);
    const views = ['dashboard', 'categories', 'advisor'];

    views.forEach(v => {
        const el = document.getElementById(`view-${v}`);
        const btn = document.getElementById(`nav${v.charAt(0).toUpperCase() + v.slice(1)}`);

        if (v === viewName) {
            if (el) el.style.display = 'block';
            if (btn) btn.classList.add('active');
            if (v === 'categories') renderCategories(); // Refresh list when entering
        } else {
            if (el) el.style.display = 'none';
            if (btn) btn.classList.remove('active');
        }
    });
}

function navigateFromHash() {
    const hash = window.location.hash.replace('#', '');
    if (['dashboard', 'categories', 'advisor'].includes(hash)) {
        switchView(hash);
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
        modal.style.display = 'flex';

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
        modal.style.display = '';
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
            console.log("Using Gemini API");
            insights = await callGeminiAPI(goals, apiKey);
        } else {
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

// Gemini API Integration with SELF-DIAGNOSIS
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

    // List of models to try
    const models = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-flash-latest',
        'gemini-pro-latest'
    ];

    let lastError = null;

    for (const model of models) {
        try {
            console.log(`Attempting to use Gemini model: ${model}`);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt }] }] })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.error?.message || response.statusText;
                console.warn(`Model ${model} failed: ${errMsg}`);
                lastError = new Error(`Model ${model}: ${errMsg}`);

                // If invalid key, stop immediately
                if (response.status === 400 && errMsg.includes('API key')) throw lastError;

                continue;
            }

            const data = await response.json();
            if (!data.candidates || data.candidates.length === 0) throw new Error("No candidates returned");

            const text = data.candidates[0].content.parts[0].text;
            console.log(`Success with model: ${model}`);
            const cleanText = text.replace(/```html/g, '').replace(/```/g, '');
            return `<div class="ai-response">${cleanText}</div>`;

        } catch (error) {
            console.error(`Error with ${model}:`, error);
            lastError = error;
        }
    }

    // ALL MODELS FAILED - DIAGNOSE
    console.log("All models failed. checking available models...");
    try {
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listResp = await fetch(listUrl);
        const listData = await listResp.json();

        if (listData.models) {
            const modelNames = listData.models.map(m => m.name.replace('models/', '')).join(', ');
            throw new Error(`Your key is valid, but tried models failed. Available models are: ${modelNames}. Please check quotas.`);
        } else {
            throw new Error(`Key might be invalid. ListModels returned: ${JSON.stringify(listData)}`);
        }
    } catch (listErr) {
        throw new Error(`Failed to find ANY working model. ${lastError.message}. (Also failed to list models: ${listErr.message})`);
    }
}

// Fallback Heuristic Analysis
function analyzeFinances(goals) {
    const spending = getSpendingByCategory();
    const totalSpent = Object.values(spending).reduce((a, b) => a + b, 0);
    return `<h2>Offline Analysis</h2><p>You spent $${totalSpent.toFixed(2)}. (Add API Key for more)</p>`;
}

// ... rest of helpers
function initializeCategoryFilter() {
    const filter = document.getElementById('categoryFilter');
    if (!filter) return;
    filter.innerHTML = '<option value="all">All Categories</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = `${cat.icon} ${cat.name}`;
        filter.appendChild(option);
    });
}

function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    const el = document.getElementById('expenseDate');
    if (el) el.value = today;
}

function openAddExpenseModal() {
    document.getElementById('addExpenseModal').classList.add('active');
    document.getElementById('expenseAmount').focus();
}

function closeAddExpenseModal() {
    document.getElementById('addExpenseModal').classList.remove('active');
    document.getElementById('expenseForm').reset();
    setTodayDate();
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
        <p><strong>Category:</strong> ${getCategoryIcon(expense.category)} ${expense.category}</p>
        <p><strong>New Total:</strong> $${(spent + expense.amount).toFixed(2)} (${percentage.toFixed(1)}%)</p>
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
    const budget = budgets[expense.category];
    if (budget > 0) {
        const currentParams = getCurrentMonthExpenses().filter(ex => ex.category === expense.category);
        const spent = currentParams.reduce((sum, ex) => sum + ex.amount, 0);
        const percentage = ((spent + expense.amount) / budget) * 100;
        if (percentage >= WARNING_THRESHOLD * 100) {
            pendingExpense = expense;
            openWarningModal(expense, spent, budget, percentage);
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
    if (confirm('Delete expense?')) {
        expenses = expenses.filter(e => e.id !== id);
        saveExpenses();
        render();
    }
}

function renderBudgetForm() {
    const form = document.getElementById('budgetForm');
    form.innerHTML = '';
    categories.forEach(cat => {
        const item = document.createElement('div');
        item.className = 'budget-form-item';
        item.innerHTML = `
            <label>${cat.icon} ${cat.name}</label>
            <input type="number" step="0.01" min="0" value="${budgets[cat.name] || 0}" data-category="${cat.name}">
        `;
        form.appendChild(item);
    });
}

function handleSaveBudgets() {
    document.querySelectorAll('#budgetForm input').forEach(input => {
        budgets[input.dataset.category] = parseFloat(input.value) || 0;
    });
    saveBudgets();
    closeManageBudgetsModal();
    render();
}

function handleFilterChange() {
    renderExpenses();
}

function getCurrentMonthExpenses() {
    const now = new Date();
    return expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
}

function getSpendingByCategory() {
    const current = getCurrentMonthExpenses();
    const sp = {};
    categories.forEach(c => {
        sp[c.name] = current.filter(e => e.category === c.name).reduce((s, e) => s + e.amount, 0);
    });
    return sp;
}

function renderSummary() {
    if (!document.getElementById('totalSpent')) return;
    const current = getCurrentMonthExpenses();
    const total = current.reduce((s, e) => s + e.amount, 0);
    const budgetTotal = Object.values(budgets).reduce((a, b) => a + b, 0);
    document.getElementById('totalSpent').textContent = `$${total.toFixed(2)}`;
    document.getElementById('totalBudget').textContent = `$${budgetTotal.toFixed(2)}`;
    document.getElementById('remaining').textContent = `$${(budgetTotal - total).toFixed(2)}`;
}

function renderBudgets() {
    const list = document.getElementById('budgetList');
    if (!list) return;
    list.innerHTML = '';
    categories.forEach(c => {
        if (!budgets[c.name]) return;
        const s = getSpendingByCategory()[c.name];
        const p = (s / budgets[c.name]) * 100;
        const cl = p >= 100 ? 'progress-danger' : (p > 85 ? 'progress-warning' : 'progress-safe');
        list.innerHTML += `<div class="budget-item">${c.icon} ${c.name} ($${s.toFixed(0)}/$${budgets[c.name].toFixed(0)}) <div class="progress-bar"><div class="progress-fill ${cl}" style="width:${Math.min(p, 100)}%"></div></div></div>`;
    });
}

function renderExpenses() {
    const list = document.getElementById('expensesList');
    if (!list) return;
    const filter = document.getElementById('categoryFilter').value;
    const shown = filter === 'all' ? expenses : expenses.filter(e => e.category === filter);
    list.innerHTML = shown.slice(0, 10).map(e => `
        <div class="expense-item">
            <span>${getCategoryIcon(e.category)} ${e.description}</span>
            <span>$${e.amount.toFixed(2)} <button onclick="deleteExpense('${e.id}')">🗑️</button></span>
        </div>
    `).join('');
}

function render() {
    renderSummary();
    renderBudgets();
    renderExpenses();
    if (typeof renderCharts === 'function') renderCharts();
}
