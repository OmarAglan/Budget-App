// Global chart instances
let expenseChart = null;
let trendChart = null;

// Initialize charts on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log('Charts.js loaded');
  
  // Initialize expense chart (pie chart)
  initializeExpenseChart();
  
  // Initialize trend chart (bar chart)
  initializeTrendChart();
  
  // Load expenses from localStorage and update charts
  try {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    updateExpenseChart(expenses);
    updateExpenseTrendChart(expenses);
  } catch (error) {
    console.error('Error loading expenses for charts:', error);
  }
});

// Initialize the expense distribution pie chart
function initializeExpenseChart() {
  try {
    const ctx = document.getElementById('expense-chart');
    if (!ctx) {
      console.warn('Expense chart canvas element not found');
      return;
    }
    
    // Check if Chart object is available
    if (typeof Chart === 'undefined') {
      console.error('Chart.js library not loaded');
      return;
    }
    
    // Destroy previous chart instance if it exists
    if (expenseChart) {
      expenseChart.destroy();
    }
    
    expenseChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              font: {
                family: 'Inter, sans-serif'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.formattedValue;
                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((context.raw / total) * 100);
                return `${label}: $${value} (${percentage}%)`;
              }
            }
          },
          doughnutLabel: {
            labels: [
              {
                text: 'Total',
                font: {
                  size: 20,
                  weight: 'bold'
                }
              }
            ]
          }
        }
      }
    });
    
    console.log('Expense chart initialized');
  } catch (error) {
    console.error('Error initializing expense chart:', error);
  }
}

// Initialize the expense trend bar chart
function initializeTrendChart() {
  try {
    const ctx = document.getElementById('expense-trend-chart');
    if (!ctx) {
      console.warn('Expense trend chart canvas element not found');
      return;
    }
    
    // Check if Chart object is available
    if (typeof Chart === 'undefined') {
      console.error('Chart.js library not loaded');
      return;
    }
    
    // Destroy previous chart instance if it exists
    if (trendChart) {
      trendChart.destroy();
    }
    
    trendChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Daily Expenses',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value;
              }
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                family: 'Inter, sans-serif'
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.formattedValue;
                return `${label}: $${value}`;
              }
            }
          }
        }
      }
    });
    
    console.log('Expense trend chart initialized');
  } catch (error) {
    console.error('Error initializing expense trend chart:', error);
  }
}

// Update the expense distribution chart with current expense data
function updateExpenseChart(expenses) {
  try {
    if (!expenseChart) {
      console.warn('Expense chart not initialized');
      initializeExpenseChart();
    }
    
    if (!expenseChart) {
      console.error('Failed to initialize expense chart');
      return;
    }
    
    if (!Array.isArray(expenses)) {
      console.error('Invalid expenses data format');
      return;
    }
    
    // Group expenses by category
    const categorySums = {};
    expenses.forEach(expense => {
      const category = expense.category || 'other';
      if (!categorySums[category]) {
        categorySums[category] = 0;
      }
      categorySums[category] += parseFloat(expense.amount) || 0;
    });
    
    // Sort categories by amount (largest first)
    const sortedCategories = Object.entries(categorySums)
      .sort((a, b) => b[1] - a[1])
      .map(([category, _]) => {
        // Capitalize first letter
        return category.charAt(0).toUpperCase() + category.slice(1);
      });
    
    const amounts = Object.entries(categorySums)
      .sort((a, b) => b[1] - a[1])
      .map(([_, amount]) => amount);
    
    // Update chart data
    expenseChart.data.labels = sortedCategories;
    expenseChart.data.datasets[0].data = amounts;
    
    // Handle empty state
    if (sortedCategories.length === 0) {
      expenseChart.data.labels = ['No Expenses'];
      expenseChart.data.datasets[0].data = [1];
      expenseChart.data.datasets[0].backgroundColor = ['rgba(200, 200, 200, 0.7)'];
      expenseChart.data.datasets[0].borderColor = ['rgba(200, 200, 200, 1)'];
    }
    
    // Update chart
    expenseChart.update();
    
    console.log('Expense chart updated with', sortedCategories.length, 'categories');
  } catch (error) {
    console.error('Error updating expense chart:', error);
  }
}

// Update the expense trend chart with daily expenses
function updateExpenseTrendChart(expenses) {
  try {
    if (!trendChart) {
      console.warn('Trend chart not initialized');
      initializeTrendChart();
    }
    
    if (!trendChart) {
      console.error('Failed to initialize trend chart');
      return;
    }
    
    if (!Array.isArray(expenses)) {
      console.error('Invalid expenses data format');
      return;
    }
    
    // Get expenses from the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    // Create an array of the last 30 days
    const last30Days = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);
      last30Days.unshift(date);
    }
    
    // Group expenses by date
    const dailyExpenses = {};
    
    // Initialize all dates with zero
    last30Days.forEach(date => {
      const dateString = date.toISOString().split('T')[0];
      dailyExpenses[dateString] = 0;
    });
    
    // Sum expenses by date
    expenses.forEach(expense => {
      const date = expense.date;
      if (!date) return;
      
      const expenseDate = new Date(date);
      expenseDate.setHours(0, 0, 0, 0);
      
      // Skip expenses older than 30 days
      if (expenseDate < thirtyDaysAgo) return;
      
      const dateString = expense.date;
      if (dailyExpenses.hasOwnProperty(dateString)) {
        dailyExpenses[dateString] += parseFloat(expense.amount) || 0;
      }
    });
    
    // Extract dates and amounts for chart
    const labels = Object.keys(dailyExpenses).sort();
    const data = labels.map(date => dailyExpenses[date]);
    
    // Format dates for display
    const formattedLabels = labels.map(date => {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    // Update chart data
    trendChart.data.labels = formattedLabels;
    trendChart.data.datasets[0].data = data;
    
    // Update chart
    trendChart.update();
    
    console.log('Trend chart updated with', formattedLabels.length, 'days');
  } catch (error) {
    console.error('Error updating trend chart:', error);
  }
}

// Function to get chart data for a specific period
function getExpenseDataForPeriod(expenses, period = 'all') {
  try {
    if (!Array.isArray(expenses)) {
      return [];
    }
    
    const now = new Date();
    let startDate = new Date(0); // Unix epoch start
    
    // Set start date based on period
    switch (period) {
      case 'today':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        break;
      
      case 'thisWeek':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        startDate.setHours(0, 0, 0, 0);
        break;
      
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      
      case 'last3Months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      
      default:
        // 'all' - no filtering needed
        break;
    }
    
    // Filter expenses by date
    return expenses.filter(expense => {
      if (!expense.date) return false;
      
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate;
    });
  } catch (error) {
    console.error('Error filtering expenses by period:', error);
    return [];
  }
}
