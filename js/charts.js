// Chart initialization and update functions
function initializeCharts() {
  // Initialize doughnut chart
  const doughnutCtx = document.getElementById('expense-chart').getContext('2d');
  window.expenseChart = new Chart(doughnutCtx, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [
            '#198754', // success (groceries)
            '#0dcaf0', // info (transportation)
            '#ffc107', // warning (utilities)
            '#0d6efd', // primary (entertainment)
            '#dc3545', // danger (healthcare)
            '#6c757d', // secondary (shopping)
            '#6c757d' // muted (other)
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 4,
          hoverBorderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12,
              family: "'Inter', sans-serif"
            }
          }
        },
        title: {
          display: true,
          text: 'Expense Distribution by Category',
          font: {
            size: 16,
            weight: 'bold',
            family: "'Inter', sans-serif"
          },
          padding: {
            top: 10,
            bottom: 30
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.formattedValue;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.raw / total) * 100).toFixed(1);
              return `${label}: $${value} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '60%',
      radius: '90%'
    }
  });
}

function updateExpenseChart(itemList) {
  if (!window.expenseChart) return;

  const categoryTotals = {};
  const categories = [
    'groceries',
    'transportation',
    'utilities',
    'entertainment',
    'healthcare',
    'shopping',
    'other'
  ];

  // Initialize categories with 0
  categories.forEach((category) => {
    categoryTotals[category] = 0;
  });

  // Calculate totals for each category
  itemList.forEach((item) => {
    categoryTotals[item.category] += item.amount;
  });

  // Update chart data
  window.expenseChart.data.labels = categories.map(
    (category) => category.charAt(0).toUpperCase() + category.slice(1)
  );
  window.expenseChart.data.datasets[0].data = categories.map(
    (category) => categoryTotals[category]
  );

  window.expenseChart.update();
}

// Initialize bar chart for expense trends
function initializeBarChart() {
  const barCtx = document
    .getElementById('expense-trend-chart')
    .getContext('2d');
  window.expenseTrendChart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Daily Expenses',
          data: [],
          backgroundColor: '#0d6efd',
          borderColor: '#0d6efd',
          borderWidth: 1,
          borderRadius: 6,
          hoverBackgroundColor: '#0b5ed7'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Amount ($)',
            font: {
              size: 12,
              weight: 'bold',
              family: "'Inter', sans-serif"
            }
          },
          ticks: {
            callback: function (value) {
              return '$' + value.toLocaleString();
            },
            font: {
              family: "'Inter', sans-serif"
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date',
            font: {
              size: 12,
              weight: 'bold',
              family: "'Inter', sans-serif"
            }
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Daily Expense Trends',
          font: {
            size: 16,
            weight: 'bold',
            family: "'Inter', sans-serif"
          },
          padding: {
            top: 10,
            bottom: 30
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return 'Expenses: $' + context.formattedValue;
            }
          }
        },
        legend: {
          labels: {
            font: {
              family: "'Inter', sans-serif"
            }
          }
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

function updateExpenseTrendChart(itemList) {
  if (!window.expenseTrendChart) return;

  // Group expenses by date
  const expensesByDate = {};
  itemList.forEach((item) => {
    const date = new Date().toLocaleDateString(); // In a real app, you'd use item's date
    expensesByDate[date] = (expensesByDate[date] || 0) + item.amount;
  });

  // Sort dates and prepare data for chart
  const sortedDates = Object.keys(expensesByDate).sort();
  const amounts = sortedDates.map((date) => expensesByDate[date]);

  // Update chart data
  window.expenseTrendChart.data.labels = sortedDates;
  window.expenseTrendChart.data.datasets[0].data = amounts;
  window.expenseTrendChart.update();
}

// Export functions
window.initializeCharts = initializeCharts;
window.updateExpenseChart = updateExpenseChart;
window.initializeBarChart = initializeBarChart;
window.updateExpenseTrendChart = updateExpenseTrendChart;
