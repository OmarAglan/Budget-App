// Global chart instances
let expenseChart = null;
let trendChart = null;
let comparisonChart = null;

// Enhanced color schemes
const modernColors = {
  primary: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
  gradients: [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
  ],
  rgba: [
    'rgba(102, 126, 234, 0.8)',
    'rgba(118, 75, 162, 0.8)',
    'rgba(240, 147, 251, 0.8)',
    'rgba(245, 87, 108, 0.8)',
    'rgba(79, 172, 254, 0.8)',
    'rgba(0, 242, 254, 0.8)',
    'rgba(67, 233, 123, 0.8)'
  ]
};

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
          backgroundColor: modernColors.rgba,
          borderColor: modernColors.primary,
          borderWidth: 3,
          hoverBorderWidth: 5,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          easing: 'easeInOutQuart'
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                family: 'Inter, sans-serif',
                size: 12,
                weight: '500'
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: 'white',
            bodyColor: 'white',
            cornerRadius: 8,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = parseFloat(context.raw).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                });
                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((context.raw / total) * 100);
                return `${label}: $${value} (${percentage}%)`;
              }
            }
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
          backgroundColor: function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;
            if (!chartArea) return 'rgba(102, 126, 234, 0.8)';
            
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
            gradient.addColorStop(1, 'rgba(102, 126, 234, 0.8)');
            return gradient;
          },
          borderColor: '#667eea',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: 'rgba(102, 126, 234, 0.9)',
          hoverBorderColor: '#5a67d8',
          hoverBorderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: 'Inter, sans-serif',
                size: 11
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
              lineWidth: 1
            },
            ticks: {
              font: {
                family: 'Inter, sans-serif',
                size: 11
              },
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: 'white',
            bodyColor: 'white',
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              title: function(context) {
                return context[0].label;
              },
              label: function(context) {
                const value = parseFloat(context.raw).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                });
                return `Expenses: $${value}`;
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
