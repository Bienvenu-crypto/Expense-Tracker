// Chart.js Configuration
let categoryChart = null;
let trendChart = null;

// Render all charts (Called from app.js render())
function renderCharts() {
    renderCategoryChart();
    renderTrendChart();
}

// Render Category Spending Chart (Doughnut)
function renderCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    // Use globally available function from app.js
    let spending = {};
    if (typeof getSpendingByCategory === 'function') {
        spending = getSpendingByCategory();
    }

    const labels = [];
    const data = [];
    const colors = [
        'rgba(139, 92, 246, 0.8)',   // Purple
        'rgba(99, 102, 241, 0.8)',   // Indigo
        'rgba(16, 185, 129, 0.8)',   // Green
        'rgba(245, 158, 11, 0.8)',   // Orange
        'rgba(239, 68, 68, 0.8)',    // Red
        'rgba(59, 130, 246, 0.8)',   // Blue
        'rgba(236, 72, 153, 0.8)'    // Pink
    ];

    Object.entries(spending).forEach(([category, amount]) => {
        if (amount > 0) {
            labels.push(category);
            data.push(amount);
        }
    });

    if (categoryChart) {
        categoryChart.destroy();
    }

    // Empty state check handled by Chart.js (shows empty if no data) or wrapper in app

    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, data.length),
                borderColor: 'rgba(24, 27, 33, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#9ca3af', usePointStyle: true }
                }
            }
        }
    });
}

// Render Trend Chart (Bar - Last 6 Months)
function renderTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    // Check if expenses available
    if (typeof expenses === 'undefined') return;

    // Calculate last 6 months data
    const monthsLabels = [];
    const dataPoints = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = d.toLocaleDateString('en-US', { month: 'short' });
        monthsLabels.push(monthName);

        // Filter expenses
        const monthlyTotal = expenses
            .filter(e => {
                const eDate = new Date(e.date);
                return eDate.getMonth() === d.getMonth() && eDate.getFullYear() === d.getFullYear();
            })
            .reduce((sum, e) => sum + e.amount, 0);

        dataPoints.push(monthlyTotal);
    }

    if (trendChart) {
        trendChart.destroy();
    }

    trendChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthsLabels,
            datasets: [{
                label: 'Spending',
                data: dataPoints,
                backgroundColor: 'rgba(139, 92, 246, 0.5)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { color: '#9ca3af' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#9ca3af' }
                }
            }
        }
    });
}
