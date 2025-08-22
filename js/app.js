// Enhanced security and validation functions
function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';
  let temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
}

function validateNumber(value, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const num = parseFloat(value);
  if (isNaN(num) || num < min || num > max) {
    return { isValid: false, error: `Value must be between ${min} and ${max}` };
  }
  return { isValid: true, value: num };
}

function validateString(str, minLength = 1, maxLength = 100) {
  if (typeof str !== 'string') {
    return { isValid: false, error: 'Value must be a string' };
  }
  const trimmed = str.trim();
  if (trimmed.length < minLength || trimmed.length > maxLength) {
    return { isValid: false, error: `Length must be between ${minLength} and ${maxLength} characters` };
  }
  return { isValid: true, value: trimmed };
}

function validateDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(now.getFullYear() + 1);
  
  if (isNaN(date.getTime()) || date < oneYearAgo || date > oneYearFromNow) {
    return { isValid: false, error: 'Date must be within the last year to one year in the future' };
  }
  return { isValid: true, value: dateStr };
}

// Performance optimization: Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Performance optimization: Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

class UI {
  /**
   * Constructor function for initializing UI elements.
   */
  constructor() {
    console.log('UI constructor called');

    // Budget elements
    this.budgetFeedback = document.querySelector('.budget-feedback');
    this.budgetForm = document.getElementById('budget-form');
    this.budgetInput = document.getElementById('budget-input');
    this.budgetAmount = document.getElementById('budget-amount');
    this.budgetSubmitBtn = document.getElementById('budget-submit');

    // Check if budget elements exist
    if (!this.budgetInput) console.error('Budget input element not found');
    if (!this.budgetAmount) console.error('Budget amount element not found');
    if (!this.budgetSubmitBtn) console.error('Budget submit button not found');

    // Balance elements
    this.expenseAmount = document.getElementById('expense-amount');
    this.balance = document.getElementById('balance');
    this.balanceAmount = document.getElementById('balance-amount');

    // Expense form elements
    this.expenseFeedback = document.querySelector('.expense-feedback');
    this.expenseForm = document.getElementById('expense-form');
    this.expenseInput = document.getElementById('expense-input');
    this.amountInput = document.getElementById('amount-input');
    this.expenseCategory = document.getElementById('expense-category');
    this.expenseDate = document.getElementById('expense-date');
    this.expenseSubmitBtn = document.getElementById('expense-submit');
    this.expenseList = document.getElementById('expense-list');
    this.expenseCount = document.getElementById('expense-count');
    this.noExpensesMessage = document.getElementById('no-expenses-message');
    this.expenseSearch = document.getElementById('expense-search');
    this.filterCategory = document.getElementById('filter-category');
    this.filterPeriod = document.getElementById('filter-period');

    // New enhanced elements
    this.expensePercentage = document.getElementById('expense-percentage');
    this.budgetProgress = document.getElementById('budget-progress');
    this.monthExpenses = document.getElementById('month-expenses');
    this.weekExpenses = document.getElementById('week-expenses');
    this.todayExpenses = document.getElementById('today-expenses');
    this.avgDaily = document.getElementById('avg-daily');
    this.healthScore = document.getElementById('health-score');
    this.healthScoreCircle = document.getElementById('health-score-circle');
    this.budgetAdherence = document.getElementById('budget-adherence');
    this.spendingTrend = document.getElementById('spending-trend');
    this.financialTip = document.getElementById('financial-tip');
    this.recentActivity = document.getElementById('recent-activity');
    this.smartInsights = document.getElementById('smart-insights');
    this.categoryBredownTable = document.getElementById('category-breakdown-table');

    // Quick action buttons
    this.clearDataBtn = document.getElementById('clear-data');
    this.resetFiltersBtn = document.getElementById('reset-filters');
    this.bulkDeleteBtn = document.getElementById('bulk-delete');
    this.monthlyReportBtn = document.getElementById('monthly-report');

    // Budget presets
    this.preset1000 = document.getElementById('preset-1000');
    this.preset2500 = document.getElementById('preset-2500');

    // Quick amount buttons
    this.quickAmountBtns = document.querySelectorAll('.quick-amount');

    // Sorting functionality
    this.currentSort = 'date-desc';
    this.sortButtons = document.querySelectorAll('[data-sort]');

    // Check expense elements
    if (!this.expenseInput) console.error('Expense input element not found');
    if (!this.amountInput) console.error('Amount input element not found');
    if (!this.expenseCategory) console.error('Expense category element not found');
    if (!this.expenseDate) console.error('Expense date element not found');
    if (!this.expenseSubmitBtn) console.error('Expense submit button not found');

    this.itemList = [];
    this.filteredList = [];
    this.itemID = 0;

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    if (this.expenseDate) {
      this.expenseDate.value = today;
    }

    console.log('Trying to initialize charts');
    // Initialize charts - wrap in try/catch to handle potential errors
    try {
      if (typeof initializeExpenseChart === 'function') {
        initializeExpenseChart();
      } else {
        console.warn('initializeExpenseChart function not found');
      }
      if (typeof initializeTrendChart === 'function') {
        initializeTrendChart();
      } else {
        console.warn('initializeTrendChart function not found');
      }
    } catch (error) {
      console.error('Error initializing charts:', error);
    }

    // Load data from localStorage
    this.loadFromLocalStorage();

    console.log('UI constructor completed');
  }

  filterExpenses() {
    console.log('Filtering expenses...');
    // Get filter values
    const searchTerm = this.expenseSearch
      ? this.expenseSearch.value.toLowerCase()
      : '';
    const categoryFilter = this.filterCategory
      ? this.filterCategory.value
      : 'all';
    const periodFilter = this.filterPeriod ? this.filterPeriod.value : 'all';

    // Filter expenses
    this.filteredList = this.itemList.filter((expense) => {
      // Check search term
      const matchesSearch =
        searchTerm === '' ||
        expense.title.toLowerCase().includes(searchTerm) ||
        expense.category.toLowerCase().includes(searchTerm);

      // Check category
      const matchesCategory =
        categoryFilter === 'all' || expense.category === categoryFilter;

      // Check date period
      let matchesPeriod = true;
      if (periodFilter !== 'all' && expense.date) {
        const expenseDate = new Date(expense.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)

        const thisMonthStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          1
        );

        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);

        switch (periodFilter) {
          case 'today':
            matchesPeriod = expenseDate.toDateString() === today.toDateString();
            break;
          case 'thisWeek':
            matchesPeriod = expenseDate >= thisWeekStart;
            break;
          case 'thisMonth':
            matchesPeriod = expenseDate >= thisMonthStart;
            break;
          case 'last3Months':
            matchesPeriod = expenseDate >= threeMonthsAgo;
            break;
        }
      }

      return matchesSearch && matchesCategory && matchesPeriod;
    });

    console.log(`Filtered list count: ${this.filteredList.length}`);
    // Update UI with filtered expenses
    this.updateExpenseList();

    // Update charts with filtered data
    if (typeof updateExpenseChart === 'function') {
        updateExpenseChart(this.filteredList);
        if (typeof updateExpenseTrendChart === 'function') {
            updateExpenseTrendChart(this.filteredList);
        }
    }
  }

  updateExpenseList() {
    // Clear current expense list (except header)
    const expenseHeader = this.expenseList.querySelector('.expense-list__info');
    this.expenseList.innerHTML = '';
    if (expenseHeader) {
        this.expenseList.appendChild(expenseHeader);
    }

    // Remove any existing no results message before checking lengths
    const existingNoResults = document.getElementById('no-results-message');
    if (existingNoResults) {
        existingNoResults.remove();
    }

    // Handle "no expenses at all" vs "no expenses match filter"
    if (this.itemList.length === 0 && this.noExpensesMessage) {
        // Show the initial "No expenses found" message if the main list is empty
        this.noExpensesMessage.classList.remove('d-none');
        this.expenseList.appendChild(this.noExpensesMessage);
    } else if (this.filteredList.length === 0) {
        // Show the "No expenses match your filters" message
        if (this.noExpensesMessage) this.noExpensesMessage.classList.add('d-none');

        const noResultsMsg = document.createElement('div');
        noResultsMsg.id = 'no-results-message';
        noResultsMsg.className = 'text-center py-4';
        noResultsMsg.innerHTML = `
          <div class="py-5">
            <i class="bi bi-search text-muted display-1 mb-3"></i>
            <p class="text-muted mb-0">${sanitizeHTML("No expenses match your filters.")}</p>
            <p class="text-muted">${sanitizeHTML("Try adjusting your search criteria.")}</p>
          </div>
        `;
        this.expenseList.appendChild(noResultsMsg);

    } else {
        // Hide the initial "No expenses found" message if there are filtered results
        if (this.noExpensesMessage) this.noExpensesMessage.classList.add('d-none');
        // Add filtered expenses to list
        this.filteredList.forEach((expense) => {
          this.addExpenseToDOM(expense);
        });
    }

    // Update expense count based on filtered list
    if (this.expenseCount) {
      this.expenseCount.textContent = this.filteredList.length;
    }
  }

  loadFromLocalStorage() {
    console.log('Loading data from localStorage');
    const budget = localStorage.getItem('budget');
    const expenses = localStorage.getItem('expenses');
    const itemID = localStorage.getItem('itemID');

    if (budget) {
      console.log(`Loaded budget: ${budget}`);
    } else {
      console.log('No budget found in localStorage');
    }

    if (expenses) {
      try {
          this.itemList = JSON.parse(expenses);
          this.filteredList = [...this.itemList];
          console.log(`Loaded ${this.itemList.length} expenses`);
      } catch (e) {
          console.error("Error parsing expenses from localStorage:", e);
          this.itemList = [];
          this.filteredList = [];
          localStorage.removeItem('expenses');
      }
    } else {
        console.log('No expenses found in localStorage');
        this.itemList = [];
        this.filteredList = [];
    }

    if (itemID) {
        try {
            this.itemID = parseInt(itemID);
            console.log(`Loaded itemID: ${this.itemID}`);
        } catch (e) {
            console.error("Error parsing itemID from localStorage:", e);
            this.itemID = this.itemList.length > 0 ? Math.max(...this.itemList.map(item => item.id)) + 1 : 0;
            localStorage.setItem('itemID', this.itemID.toString());
        }
    } else {
        this.itemID = this.itemList.length > 0 ? Math.max(...this.itemList.map(item => item.id)) + 1 : 0;
        console.log(`Calculated initial itemID: ${this.itemID}`);
    }

    this.showBalance();
    this.updateExpenseList();
    this.updateCharts();
  }

  saveToLocalStorage() {
    console.log('Saving data to localStorage');
    const budgetValue = parseFloat(localStorage.getItem('budget_raw') || '0');
    localStorage.setItem('budget_raw', budgetValue.toString());
    localStorage.setItem('expenses', JSON.stringify(this.itemList));
    localStorage.setItem('itemID', this.itemID.toString());
  }

  submitBudgetForm() {
    console.log('submitBudgetForm method called');
    const value = this.budgetInput.value;
    console.log('Budget input value:', value);

    try {
      // Enhanced validation
      const budgetValidation = validateNumber(value, 1, 1000000);
      
      if (!budgetValidation.isValid) {
        console.log('Invalid budget value');
        this.showBudgetValidationError(budgetValidation.error);
        return;
      }

      const budgetValue = budgetValidation.value;
      console.log('Setting budget to:', budgetValue);
      
      localStorage.setItem('budget_raw', budgetValue.toString());
      this.budgetInput.value = '';
      this.showBalance();
      this.saveToLocalStorage();
      this.showNotification('Budget set successfully!', 'success');
      console.log('Budget updated successfully');
      
    } catch (error) {
      console.error('Error setting budget:', error);
      this.showBudgetValidationError('Unexpected error: ' + error.message);
    }
  }

  showBudgetValidationError(message) {
    if (this.budgetFeedback) {
      this.budgetFeedback.classList.add('showItem');
      this.budgetFeedback.innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>${sanitizeHTML(message)}</div>`;
      setTimeout(() => {
        this.budgetFeedback.classList.remove('showItem');
      }, 4000);
    }
  }

  showBalance() {
    console.log('Updating balance display');
    const rawBudget = parseFloat(localStorage.getItem('budget_raw') || '0');
    const totalExpense = this.itemList.reduce((acc, curr) => {
        return acc + (parseFloat(curr.amount) || 0);
    }, 0);
    const balance = rawBudget - totalExpense;

    if (this.budgetAmount) {
        this.budgetAmount.textContent = '$' + this.formatNumber(rawBudget);
    }

    if (this.expenseAmount) {
        this.expenseAmount.textContent = '$' + this.formatNumber(totalExpense);
    }

    if (this.balanceAmount) {
        this.balanceAmount.textContent = '$' + this.formatNumber(balance);
        this.balanceAmount.classList.remove('text-success', 'text-danger', 'text-muted', 'stat-positive', 'stat-negative');
        if (balance > 0) {
            this.balanceAmount.classList.add('text-success', 'stat-positive');
        } else if (balance < 0) {
            this.balanceAmount.classList.add('text-danger', 'stat-negative');
        } else {
            this.balanceAmount.classList.add('text-muted');
        }
    }

    // Update percentage and progress bar
    if (this.expensePercentage && rawBudget > 0) {
        const percentage = Math.round((totalExpense / rawBudget) * 100);
        this.expensePercentage.innerHTML = `<i class="bi bi-percent me-1"></i>${percentage}% of budget`;
    }

    if (this.budgetProgress && rawBudget > 0) {
        const progressPercentage = Math.min((totalExpense / rawBudget) * 100, 100);
        this.budgetProgress.style.width = `${progressPercentage}%`;
        
        // Change color based on percentage
        this.budgetProgress.classList.remove('bg-success', 'bg-warning', 'bg-danger');
        if (progressPercentage <= 60) {
            this.budgetProgress.classList.add('bg-success');
        } else if (progressPercentage <= 85) {
            this.budgetProgress.classList.add('bg-warning');
        } else {
            this.budgetProgress.classList.add('bg-danger');
        }
    }

    // Update period-based statistics
    this.updatePeriodStats();
    this.updateFinancialHealth();
    this.updateSmartInsights();
    this.updateRecentActivity();
    this.updateCategoryBreakdown();

    console.log(
      `Balance updated: Budget $${this.formatNumber(rawBudget)}, Expenses $${this.formatNumber(totalExpense)}, Balance $${this.formatNumber(balance)}`
    );
  }

  updatePeriodStats() {
    const now = new Date();
    
    // Calculate different time periods
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate expenses for each period
    const todayExpenses = this.itemList
        .filter(expense => new Date(expense.date) >= today)
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        
    const weekExpenses = this.itemList
        .filter(expense => new Date(expense.date) >= weekStart)
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        
    const monthExpenses = this.itemList
        .filter(expense => new Date(expense.date) >= monthStart)
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    // Calculate average daily spending (last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const last30DaysExpenses = this.itemList
        .filter(expense => new Date(expense.date) >= thirtyDaysAgo)
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const avgDaily = last30DaysExpenses / 30;

    // Update UI elements
    if (this.todayExpenses) {
        this.todayExpenses.textContent = '$' + this.formatNumber(todayExpenses);
    }
    if (this.weekExpenses) {
        this.weekExpenses.textContent = '$' + this.formatNumber(weekExpenses);
    }
    if (this.monthExpenses) {
        this.monthExpenses.textContent = '$' + this.formatNumber(monthExpenses);
    }
    if (this.avgDaily) {
        this.avgDaily.textContent = '$' + this.formatNumber(avgDaily);
    }
  }

  updateFinancialHealth() {
    const rawBudget = parseFloat(localStorage.getItem('budget_raw') || '0');
    const totalExpense = this.itemList.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    
    let score = 85; // Base score
    let adherence = 'Excellent';
    let trend = 'Stable';
    
    if (rawBudget > 0) {
        const spentPercentage = (totalExpense / rawBudget) * 100;
        
        if (spentPercentage <= 50) {
            score = 95;
            adherence = 'Excellent';
        } else if (spentPercentage <= 75) {
            score = 80;
            adherence = 'Good';
        } else if (spentPercentage <= 90) {
            score = 65;
            adherence = 'Fair';
        } else if (spentPercentage <= 100) {
            score = 45;
            adherence = 'Poor';
        } else {
            score = 25;
            adherence = 'Critical';
        }
    }

    // Update health score display
    if (this.healthScore) {
        this.healthScore.textContent = score;
    }
    
    if (this.healthScoreCircle) {
        const circumference = 2 * Math.PI * 52;
        const offset = circumference - (score / 100) * circumference;
        this.healthScoreCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        this.healthScoreCircle.style.strokeDashoffset = offset;
        
        // Change color based on score
        if (score >= 80) {
            this.healthScoreCircle.setAttribute('stroke', '#10b981');
        } else if (score >= 60) {
            this.healthScoreCircle.setAttribute('stroke', '#f59e0b');
        } else {
            this.healthScoreCircle.setAttribute('stroke', '#ef4444');
        }
    }
    
    if (this.budgetAdherence) {
        this.budgetAdherence.textContent = adherence;
        this.budgetAdherence.className = score >= 80 ? 'text-success' : score >= 60 ? 'text-warning' : 'text-danger';
    }
    
    if (this.spendingTrend) {
        this.spendingTrend.textContent = trend;
    }
  }

  updateSmartInsights() {
    if (!this.smartInsights) return;
    
    const rawBudget = parseFloat(localStorage.getItem('budget_raw') || '0');
    const totalExpense = this.itemList.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
    const insights = [];

    // Generate insights based on spending patterns
    if (rawBudget > 0 && totalExpense > 0) {
        const spentPercentage = (totalExpense / rawBudget) * 100;
        
        if (spentPercentage > 90) {
            insights.push({
                type: 'warning',
                icon: 'exclamation-triangle',
                title: 'Budget Alert',
                message: 'You\'ve spent over 90% of your budget. Consider reducing expenses.'
            });
        } else if (spentPercentage < 30) {
            insights.push({
                type: 'success',
                icon: 'check-circle',
                title: 'Great Job!',
                message: 'You\'re well within your budget. Consider increasing your savings.'
            });
        }

        // Category-based insights
        const categoryTotals = this.getCategoryTotals();
        const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
        
        if (topCategory && topCategory[1] > totalExpense * 0.4) {
            insights.push({
                type: 'info',
                icon: 'info-circle',
                title: 'Spending Pattern',
                message: `${topCategory[0]} accounts for ${Math.round((topCategory[1] / totalExpense) * 100)}% of your expenses.`
            });
        }
    }

    // Default insight if no specific insights
    if (insights.length === 0) {
        insights.push({
            type: 'info',
            icon: 'lightbulb',
            title: 'Keep Going!',
            message: 'Track more expenses to get personalized insights and recommendations.'
        });
    }

    // Render insights
    this.smartInsights.innerHTML = insights.map(insight => `
        <div class="insight-item mb-3 p-3 bg-light rounded">
            <div class="d-flex align-items-start">
                <i class="bi bi-${insight.icon} text-${insight.type === 'warning' ? 'warning' : insight.type === 'success' ? 'success' : 'primary'} me-2 mt-1"></i>
                <div>
                    <div class="fw-semibold">${insight.title}</div>
                    <div class="text-muted small">${insight.message}</div>
                </div>
            </div>
        </div>
    `).join('');
  }

  updateRecentActivity() {
    if (!this.recentActivity) return;
    
    const recentExpenses = [...this.itemList]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    if (recentExpenses.length === 0) {
        this.recentActivity.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="bi bi-clock display-4 mb-3"></i>
                <p>No recent activity</p>
            </div>
        `;
        return;
    }

    this.recentActivity.innerHTML = recentExpenses.map(expense => {
        const date = new Date(expense.date);
        const timeAgo = this.getTimeAgo(date);
        
        return `
            <div class="d-flex align-items-center mb-3 p-2 rounded hover-lift">
                <div class="category-badge bg-primary bg-opacity-10 text-primary me-3">
                    <i class="bi bi-${this.getCategoryIcon(expense.category)}"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="fw-semibold">${sanitizeHTML(expense.title)}</div>
                    <div class="text-muted small">${timeAgo}</div>
                </div>
                <div class="text-end">
                    <div class="fw-bold text-danger">$${this.formatNumber(expense.amount)}</div>
                </div>
            </div>
        `;
    }).join('');
  }

  updateCategoryBreakdown() {
    if (!this.categoryBredownTable) return;
    
    const categoryTotals = this.getCategoryTotals();
    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    if (totalExpenses === 0) {
        this.categoryBredownTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-table display-4 mb-3 d-block"></i>
                    No data available
                </td>
            </tr>
        `;
        return;
    }

    const categoryStats = Object.entries(categoryTotals).map(([category, amount]) => {
        const transactions = this.itemList.filter(expense => expense.category === category);
        const avgPerTransaction = amount / transactions.length;
        const percentage = (amount / totalExpenses) * 100;
        
        return {
            category,
            amount,
            percentage,
            transactions: transactions.length,
            avgPerTransaction
        };
    }).sort((a, b) => b.amount - a.amount);

    this.categoryBredownTable.innerHTML = categoryStats.map(stat => `
        <tr>
            <td>
                <div class="d-flex align-items-center">
                    <i class="bi bi-${this.getCategoryIcon(stat.category)} me-2 text-primary"></i>
                    <span class="text-capitalize">${stat.category}</span>
                </div>
            </td>
            <td class="fw-bold">$${this.formatNumber(stat.amount)}</td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="progress me-2" style="width: 60px; height: 8px;">
                        <div class="progress-bar bg-primary" style="width: ${stat.percentage}%"></div>
                    </div>
                    <span>${stat.percentage.toFixed(1)}%</span>
                </div>
            </td>
            <td>${stat.transactions}</td>
            <td>$${this.formatNumber(stat.avgPerTransaction)}</td>
        </tr>
    `).join('');
  }

  getCategoryTotals() {
    const categoryTotals = {};
    this.itemList.forEach(expense => {
        const category = expense.category || 'other';
        categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });
    return categoryTotals;
  }

  getCategoryIcon(category) {
    const icons = {
        groceries: 'cart',
        transportation: 'car-front',
        utilities: 'lightning',
        entertainment: 'film',
        healthcare: 'heart-pulse',
        shopping: 'bag',
        dining: 'cup-hot',
        education: 'book',
        travel: 'airplane',
        fitness: 'heart',
        other: 'three-dots'
    };
    return icons[category] || 'three-dots';
  }

  getTimeAgo(date) {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
  }

  submitExpenseForm() {
    console.log('submitExpenseForm called');
    const expenseValue = this.expenseInput.value.trim();
    const amountValue = this.amountInput.value;
    const categoryValue = this.expenseCategory.value;
    const dateValue = this.expenseDate.value;

    // Enhanced validation
    const titleValidation = validateString(expenseValue, 1, 100);
    const amountValidation = validateNumber(amountValue, 0.01, 999999.99);
    const dateValidation = validateDate(dateValue);
    
    const validCategories = ['groceries', 'transportation', 'utilities', 'entertainment', 'healthcare', 'shopping', 'dining', 'education', 'travel', 'fitness', 'other'];
    
    if (!titleValidation.isValid) {
        this.showValidationError('Expense title: ' + titleValidation.error);
        return;
    }
    
    if (!amountValidation.isValid) {
        this.showValidationError('Amount: ' + amountValidation.error);
        return;
    }
    
    if (!validCategories.includes(categoryValue)) {
        this.showValidationError('Please select a valid category.');
        return;
    }
    
    if (!dateValidation.isValid) {
        this.showValidationError('Date: ' + dateValidation.error);
        return;
    }

    // All validations passed
    console.log('Valid expense data, adding expense');
    
    // Clear form
    this.expenseInput.value = '';
    this.amountInput.value = '';
    this.expenseCategory.value = '';
    const today = new Date().toISOString().split('T')[0];
    this.expenseDate.value = today;

    // Create expense object with validated data
    let expense = {
      id: this.itemID,
      title: titleValidation.value,
      amount: amountValidation.value,
      category: categoryValue,
      date: dateValidation.value,
      timestamp: new Date().toISOString()
    };
    this.itemID++;

    this.itemList.push(expense);
    console.log(`Expense added: ${JSON.stringify(expense)}, New item count: ${this.itemList.length}`);

    this.filterExpenses();
    this.showBalance();
    this.saveToLocalStorage();
    this.updateCharts();

    this.showNotification('Expense added successfully!', 'success');
  }

  showValidationError(message) {
    if (this.expenseFeedback) {
      this.expenseFeedback.classList.add('showItem');
      this.expenseFeedback.innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>${sanitizeHTML(message)}</div>`;
      setTimeout(() => {
        this.expenseFeedback.classList.remove('showItem');
      }, 4000);
    }
  }

  addExpenseToDOM(expense) {
    const categoryColors = {
      groceries: 'success',
      transportation: 'info',
      utilities: 'warning',
      entertainment: 'primary',
      healthcare: 'danger',
      shopping: 'secondary',
      other: 'dark'
    };

    const categoryIcons = {
      groceries: 'cart',
      transportation: 'car-front',
      utilities: 'lightning',
      entertainment: 'film',
      healthcare: 'heart-pulse',
      shopping: 'bag',
      other: 'three-dots'
    };

    const dateObj = new Date(expense.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const formattedAmount = expense.amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    const div = document.createElement('div');
    div.classList.add('expense');
    div.innerHTML = `
      <div class="expense-item rounded p-3 mb-3 border-start border-${
        categoryColors[expense.category]
      } border-3 bg-white shadow-sm">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center flex-grow-1">
            <div class="me-3">
              <span class="badge bg-${
                categoryColors[expense.category]
              } bg-opacity-10 text-${categoryColors[expense.category]} p-2">
                <i class="bi bi-${categoryIcons[expense.category]}"></i>
              </span>
            </div>
            <div>
              <h6 class="expense-title mb-1 text-capitalize fw-semibold">
                ${sanitizeHTML(expense.title)}
              </h6>
              <div class="text-muted small">
                <span class="me-2"><i class="bi bi-tag"></i> ${sanitizeHTML(
                  expense.category
                )}</span>
                <span><i class="bi bi-calendar"></i> ${formattedDate}</span>
              </div>
            </div>
          </div>
          <div class="text-end">
            <h6 class="expense-amount mb-1 fw-bold text-danger">$${formattedAmount}</h6>
            <div class="expense-icons">
              <button class="btn btn-sm btn-outline-primary edit-icon me-1" data-id="${
                expense.id
              }">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger delete-icon" data-id="${
                expense.id
              }">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const editBtn = div.querySelector('.edit-icon');
    const deleteBtn = div.querySelector('.delete-icon');

    editBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.editExpense(editBtn);
    });

    deleteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.deleteExpense(deleteBtn);
    });

    this.expenseList.appendChild(div);
  }

  formatNumber(number) {
    const num = parseFloat(number);
    if (isNaN(num)) {
        return (0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
    }
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  editExpense(element) {
    console.log('editExpense called');
    let id;
    if (element.tagName === 'I') {
        id = parseInt(element.parentElement.dataset.id);
    } else {
        id = parseInt(element.dataset.id);
    }
    console.log(`Editing expense with ID: ${id}`);

    let expenseContainer = element.closest('.expense');
    if (!expenseContainer) {
        console.error("Could not find expense container for edit.");
        return;
    }

    let expense = this.itemList.find((item) => item.id === id);

    if (expense) {
      this.expenseInput.value = expense.title;
      this.amountInput.value = expense.amount;
      this.expenseCategory.value = expense.category;
      if (expense.date) {
        this.expenseDate.value = expense.date;
      }

      this.itemList = this.itemList.filter((item) => item.id !== id);
      console.log(`Removed expense ${id} for editing. Item count: ${this.itemList.length}`);

      this.filterExpenses();

      this.showBalance();
      this.updateCharts();
      this.saveToLocalStorage();

      if (this.expenseForm) {
          this.expenseForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
          this.expenseInput.focus();
      }
    } else {
        console.error(`Expense with ID ${id} not found in itemList.`);
    }
  }

  deleteExpense(element) {
    console.log('deleteExpense called');
    let id;
    if (element.tagName === 'I') {
        id = parseInt(element.parentElement.dataset.id);
    } else {
        id = parseInt(element.dataset.id);
    }
    console.log(`Deleting expense with ID: ${id}`);

    const originalLength = this.itemList.length;
    this.itemList = this.itemList.filter((item) => item.id !== id);

    if (this.itemList.length < originalLength) {
        console.log(`Removed expense ${id}. New item count: ${this.itemList.length}`);
        this.showBalance();
        this.saveToLocalStorage();
        this.updateCharts();

        if (expenseContainer) {
            expenseContainer.style.transition = 'all 0.3s ease';
            expenseContainer.style.opacity = '0';
            expenseContainer.style.transform = 'translateX(20px)';

            setTimeout(() => {
                this.filterExpenses();
                this.showNotification('Expense deleted successfully', 'success');
            }, 300);
        } else {
            this.filterExpenses();
            this.showNotification('Expense deleted successfully', 'success');
        }
    } else {
        console.error(`Expense with ID ${id} not found for deletion.`);
    }
  }

  exportData() {
    console.log('Exporting data');
    const rawBudget = localStorage.getItem('budget_raw') || '0';
    const budgetData = {
      budget_raw: rawBudget,
      expenses: this.itemList,
      itemID: this.itemID.toString(),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(budgetData, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileName =
      'budget_data_' + new Date().toISOString().split('T')[0] + '.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();

    this.showNotification('Data exported successfully!', 'success');
  }

  importData(file) {
    console.log('Importing data from file:', file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        console.log('Parsed imported data:', importedData);

        if (importedData.budget_raw && importedData.expenses && importedData.itemID) {
          const rawBudget = parseFloat(importedData.budget_raw);
          if (!isNaN(rawBudget)) {
              localStorage.setItem('budget_raw', rawBudget.toString());
              console.log(`Imported raw budget: ${rawBudget}`);
          } else {
              console.warn('Imported budget_raw is not a valid number. Skipping budget update.');
          }

          if (Array.isArray(importedData.expenses)) {
            this.itemList = importedData.expenses;
            console.log(`Imported ${this.itemList.length} expenses.`);
          } else {
              console.warn('Imported expenses data is not an array. Skipping expense import.');
              this.itemList = [];
          }

          const importedItemID = parseInt(importedData.itemID);
           if (!isNaN(importedItemID)) {
               this.itemID = importedItemID;
               console.log(`Imported itemID: ${this.itemID}`);
           } else {
               console.warn('Imported itemID is not a valid number. Recalculating.');
               this.itemID = this.itemList.length > 0 ? Math.max(...this.itemList.map((expense) => expense.id || 0)) + 1 : 0;
           }

          if(this.expenseSearch) this.expenseSearch.value = '';
          if(this.filterCategory) this.filterCategory.value = 'all';
          if(this.filterPeriod) this.filterPeriod.value = 'all';

          this.showBalance();
          this.saveToLocalStorage();
          this.filterExpenses();
          this.updateCharts();

          this.showNotification('Data imported successfully!', 'success');
          console.log('Data import completed successfully.');

        } else {
          console.error('Invalid data format in imported file.', importedData);
          this.showNotification('Invalid data format! Required fields: budget_raw, expenses, itemID.', 'danger');
        }
      } catch (error) {
        console.error('Import error:', error);
        this.showNotification(
          'Error importing data: ' + error.message,
          'danger'
        );
      }
    };

    reader.onerror = () => {
      this.showNotification('Error reading file!', 'danger');
    };

    reader.readAsText(file);
  }

  updateCharts() {
      console.log('Updating charts...');
      if (typeof updateExpenseChart === 'function') {
          updateExpenseChart(this.itemList);
      }
      if (typeof updateExpenseTrendChart === 'function') {
          updateExpenseTrendChart(this.itemList);
      }
  }

  showNotification(message, type = 'info') {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notificationDiv.setAttribute('role', 'alert');
    notificationDiv.style.zIndex = '9999';
    notificationDiv.innerHTML = `
      <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(notificationDiv);

    setTimeout(() => {
      notificationDiv.remove();
    }, 4000);
  }

  sortExpenses(sortType) {
    this.currentSort = sortType;
    
    switch (sortType) {
        case 'date-desc':
            this.filteredList.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-asc':
            this.filteredList.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'amount-desc':
            this.filteredList.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
            break;
        case 'amount-asc':
            this.filteredList.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
            break;
        case 'category':
            this.filteredList.sort((a, b) => a.category.localeCompare(b.category));
            break;
    }
    
    this.updateExpenseList();
    this.showNotification(`Sorted by ${sortType.replace('-', ' ')}`, 'info');
  }

  clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        localStorage.clear();
        this.itemList = [];
        this.filteredList = [];
        this.itemID = 0;
        
        // Reset all form inputs
        if (this.budgetInput) this.budgetInput.value = '';
        if (this.expenseInput) this.expenseInput.value = '';
        if (this.amountInput) this.amountInput.value = '';
        if (this.expenseCategory) this.expenseCategory.value = '';
        
        // Reset filters
        if (this.expenseSearch) this.expenseSearch.value = '';
        if (this.filterCategory) this.filterCategory.value = 'all';
        if (this.filterPeriod) this.filterPeriod.value = 'all';
        
        this.showBalance();
        this.updateExpenseList();
        this.updateCharts();
        
        this.showNotification('All data cleared successfully', 'success');
    }
  }

  resetFilters() {
    if (this.expenseSearch) this.expenseSearch.value = '';
    if (this.filterCategory) this.filterCategory.value = 'all';
    if (this.filterPeriod) this.filterPeriod.value = 'all';
    
    this.filterExpenses();
    this.showNotification('Filters reset', 'info');
  }

  setBudgetPreset(amount) {
    if (this.budgetInput) {
        this.budgetInput.value = amount;
        this.budgetInput.focus();
    }
  }

  setQuickAmount(amount) {
    if (this.amountInput) {
        this.amountInput.value = amount;
        this.amountInput.focus();
    }
  }

  generateMonthlyReport() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthExpenses = this.itemList.filter(expense => new Date(expense.date) >= monthStart);
    
    const reportData = {
        month: now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        totalExpenses: monthExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0),
        transactionCount: monthExpenses.length,
        categories: this.getCategoryTotals(),
        budget: parseFloat(localStorage.getItem('budget_raw') || '0'),
        generatedDate: new Date().toISOString()
    };

    const reportContent = `
# Monthly Budget Report - ${reportData.month}

## Summary
- **Total Budget**: $${this.formatNumber(reportData.budget)}
- **Total Expenses**: $${this.formatNumber(reportData.totalExpenses)}
- **Remaining Balance**: $${this.formatNumber(reportData.budget - reportData.totalExpenses)}
- **Number of Transactions**: ${reportData.transactionCount}

## Category Breakdown
${Object.entries(reportData.categories).map(([category, amount]) => 
    `- **${category.charAt(0).toUpperCase() + category.slice(1)}**: $${this.formatNumber(amount)}`
).join('\n')}

## Recent Transactions
${monthExpenses.slice(0, 10).map(expense => 
    `- ${expense.date}: ${expense.title} - $${this.formatNumber(expense.amount)} (${expense.category})`
).join('\n')}

---
Generated on ${new Date().toLocaleDateString()} by Budget Tracker
    `;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget-report-${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}.md`;
    link.click();
    URL.revokeObjectURL(url);

    this.showNotification('Monthly report generated successfully!', 'success');
  }
}

function eventListeners() {
  console.log('Setting up event listeners');
  const ExportBtn = document.getElementById('export-data');
  const ImportBtn = document.getElementById('import-data');
  const ImportFile = document.getElementById('import-file');

  const ui = new UI();

  if (ui.budgetSubmitBtn) {
    console.log('Adding click listener to budget submit button');
    ui.budgetSubmitBtn.addEventListener('click', function (event) {
      event.preventDefault();
      console.log('Budget submit button clicked');
      ui.submitBudgetForm();
    });
  } else {
      console.error("Budget submit button not found in eventListeners setup.");
  }

  if (ui.expenseSubmitBtn) {
      console.log('Adding click listener to expense submit button');
      ui.expenseSubmitBtn.addEventListener('click', function (event) {
          event.preventDefault();
          console.log('Expense submit button clicked');
          ui.submitExpenseForm();
      });
  } else {
      console.error("Expense submit button not found in eventListeners setup.");
  }

  if (ui.expenseForm) {
      ui.expenseForm.addEventListener('submit', function(event) {
          event.preventDefault();
          console.log('Expense form submitted (Enter pressed?), calling submitExpenseForm via button logic.');
          ui.submitExpenseForm();
      });
  }

  if (ui.expenseList) {
      ui.expenseList.addEventListener('click', function (event) {
          const element = event.target;
          if (element.closest('.edit-icon')) {
              event.preventDefault();
              console.log('Edit icon clicked');
              ui.editExpense(element.closest('.edit-icon'));
          }
          else if (element.closest('.delete-icon')) {
              event.preventDefault();
              console.log('Delete icon clicked');
              ui.deleteExpense(element.closest('.delete-icon'));
          }
      });
  }

  if (ui.expenseSearch) {
    console.log('Adding input listener to expense search');
    ui.expenseSearch.addEventListener('input', debounce(() => ui.filterExpenses(), 300));
  }
  if (ui.filterCategory) {
    console.log('Adding change listener to filter category');
    ui.filterCategory.addEventListener('change', () => ui.filterExpenses());
  }
  if (ui.filterPeriod) {
    console.log('Adding change listener to filter period');
    ui.filterPeriod.addEventListener('change', () => ui.filterExpenses());
  }

  if (ExportBtn) {
    ExportBtn.addEventListener('click', function () {
      console.log('Export button clicked');
      ui.exportData();
    });
  }

  if (ImportBtn && ImportFile) {
    ImportBtn.addEventListener('click', function () {
      console.log('Import button clicked, triggering file input');
      ImportFile.click();
    });

    ImportFile.addEventListener('change', function (event) {
      if (event.target.files.length > 0) {
        console.log('File selected for import:', event.target.files[0].name);
        ui.importData(event.target.files[0]);
        event.target.value = '';
      }
    });
  }

  // Enhanced functionality event listeners
  if (ui.clearDataBtn) {
    ui.clearDataBtn.addEventListener('click', () => ui.clearAllData());
  }

  if (ui.resetFiltersBtn) {
    ui.resetFiltersBtn.addEventListener('click', () => ui.resetFilters());
  }

  if (ui.monthlyReportBtn) {
    ui.monthlyReportBtn.addEventListener('click', () => ui.generateMonthlyReport());
  }

  // Budget preset buttons
  if (ui.preset1000) {
    ui.preset1000.addEventListener('click', () => ui.setBudgetPreset(1000));
  }
  if (ui.preset2500) {
    ui.preset2500.addEventListener('click', () => ui.setBudgetPreset(2500));
  }

  // Quick amount buttons
  ui.quickAmountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = btn.dataset.amount;
      ui.setQuickAmount(amount);
    });
  });

  // Sort functionality
  ui.sortButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sortType = btn.dataset.sort;
      ui.sortExpenses(sortType);
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + E to focus on expense input
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
      e.preventDefault();
      if (ui.expenseInput) {
        ui.expenseInput.focus();
      }
    }
    
    // Ctrl/Cmd + B to focus on budget input
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      if (ui.budgetInput) {
        ui.budgetInput.focus();
      }
    }
    
    // Escape to clear current form
    if (e.key === 'Escape') {
      if (document.activeElement === ui.expenseInput) {
        ui.expenseInput.value = '';
        ui.amountInput.value = '';
        ui.expenseCategory.value = '';
      } else if (document.activeElement === ui.budgetInput) {
        ui.budgetInput.value = '';
      }
    }
  });

  // Auto-save functionality
  let autoSaveTimeout;
  function scheduleAutoSave() {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
      ui.saveToLocalStorage();
    }, 1000);
  }

  // Form input auto-save
  [ui.budgetInput, ui.expenseInput, ui.amountInput].forEach(input => {
    if (input) {
      input.addEventListener('input', scheduleAutoSave);
    }
  });

  console.log('Enhanced event listeners setup complete');
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM content loaded, initializing application');
  eventListeners();
});
