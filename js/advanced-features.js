// Advanced Budget Tracker Features
// Recurring Expenses, Savings Goals, and Advanced Analytics

class AdvancedBudgetManager {
  constructor() {
    this.recurringExpenses = JSON.parse(localStorage.getItem('recurringExpenses') || '[]');
    this.savingsGoals = JSON.parse(localStorage.getItem('savingsGoals') || '[]');
    this.budgetCategories = JSON.parse(localStorage.getItem('budgetCategories') || '{}');
    this.notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    this.initializeAdvancedFeatures();
  }

  initializeAdvancedFeatures() {
    this.setupRecurringExpenses();
    this.setupSavingsGoals();
    this.setupBudgetCategories();
    this.setupNotifications();
  }

  // Recurring Expenses Management
  setupRecurringExpenses() {
    const today = new Date();
    this.recurringExpenses.forEach(recurring => {
      const lastProcessed = new Date(recurring.lastProcessed || '2000-01-01');
      const daysSinceLastProcessed = Math.floor((today - lastProcessed) / (1000 * 60 * 60 * 24));
      
      if (this.shouldProcessRecurring(recurring, daysSinceLastProcessed)) {
        this.processRecurringExpense(recurring);
      }
    });
  }

  shouldProcessRecurring(recurring, daysSince) {
    switch (recurring.frequency) {
      case 'daily':
        return daysSince >= 1;
      case 'weekly':
        return daysSince >= 7;
      case 'monthly':
        return daysSince >= 30;
      case 'yearly':
        return daysSince >= 365;
      default:
        return false;
    }
  }

  processRecurringExpense(recurring) {
    const expense = {
      id: Date.now(),
      title: `${recurring.title} (Recurring)`,
      amount: recurring.amount,
      category: recurring.category,
      date: new Date().toISOString().split('T')[0],
      isRecurring: true
    };

    // Add to main expense list
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    // Update last processed date
    recurring.lastProcessed = new Date().toISOString();
    localStorage.setItem('recurringExpenses', JSON.stringify(this.recurringExpenses));

    this.showNotification(`Recurring expense added: ${recurring.title}`, 'info');
  }

  addRecurringExpense(title, amount, category, frequency) {
    const recurring = {
      id: Date.now(),
      title,
      amount: parseFloat(amount),
      category,
      frequency,
      createdDate: new Date().toISOString(),
      lastProcessed: new Date().toISOString()
    };

    this.recurringExpenses.push(recurring);
    localStorage.setItem('recurringExpenses', JSON.stringify(this.recurringExpenses));
    this.showNotification('Recurring expense created successfully!', 'success');
  }

  // Savings Goals Management
  setupSavingsGoals() {
    this.updateSavingsGoalsDisplay();
  }

  addSavingsGoal(name, targetAmount, deadline, category = 'general') {
    const goal = {
      id: Date.now(),
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      deadline: deadline,
      category,
      createdDate: new Date().toISOString(),
      isCompleted: false
    };

    this.savingsGoals.push(goal);
    localStorage.setItem('savingsGoals', JSON.stringify(this.savingsGoals));
    this.updateSavingsGoalsDisplay();
    this.showNotification('Savings goal created successfully!', 'success');
  }

  updateSavingsGoalsDisplay() {
    const container = document.getElementById('savings-goals-container');
    if (!container) return;

    if (this.savingsGoals.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-muted">
          <i class="bi bi-piggy-bank display-4 mb-3"></i>
          <p>No savings goals yet</p>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#savingsGoalModal">
            <i class="bi bi-plus-circle me-2"></i>Create Your First Goal
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.savingsGoals.map(goal => {
      const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
      const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      
      return `
        <div class="card border-0 shadow-sm mb-3 hover-lift">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h6 class="fw-bold mb-1">${goal.name}</h6>
                <small class="text-muted">Target: $${this.formatNumber(goal.targetAmount)}</small>
              </div>
              <div class="text-end">
                <div class="fw-bold ${goal.isCompleted ? 'text-success' : 'text-primary'}">
                  $${this.formatNumber(goal.currentAmount)}
                </div>
                <small class="text-muted">${progress.toFixed(1)}%</small>
              </div>
            </div>
            <div class="progress mb-2" style="height: 8px;">
              <div class="progress-bar ${goal.isCompleted ? 'bg-success' : 'bg-primary'}" 
                   style="width: ${progress}%"></div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                <i class="bi bi-calendar me-1"></i>
                ${daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
              </small>
              <div>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="advancedManager.addToGoal(${goal.id})">
                  <i class="bi bi-plus"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="advancedManager.deleteGoal(${goal.id})">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Budget Categories Management
  setupBudgetCategories() {
    const defaultCategories = {
      groceries: 500,
      transportation: 200,
      utilities: 150,
      entertainment: 100,
      healthcare: 100,
      shopping: 150,
      dining: 200,
      other: 100
    };

    if (Object.keys(this.budgetCategories).length === 0) {
      this.budgetCategories = defaultCategories;
      localStorage.setItem('budgetCategories', JSON.stringify(this.budgetCategories));
    }
  }

  setCategoryBudget(category, amount) {
    this.budgetCategories[category] = parseFloat(amount);
    localStorage.setItem('budgetCategories', JSON.stringify(this.budgetCategories));
    this.checkCategoryBudgetAlerts();
  }

  checkCategoryBudgetAlerts() {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const categoryTotals = {};
    monthlyExpenses.forEach(expense => {
      const category = expense.category || 'other';
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(expense.amount);
    });

    Object.entries(this.budgetCategories).forEach(([category, budget]) => {
      const spent = categoryTotals[category] || 0;
      const percentage = (spent / budget) * 100;

      if (percentage >= 90) {
        this.addNotification({
          type: 'warning',
          title: 'Budget Alert',
          message: `You've spent ${percentage.toFixed(1)}% of your ${category} budget this month.`,
          category: 'budget-alert'
        });
      }
    });
  }

  // Notifications System
  setupNotifications() {
    this.displayNotifications();
  }

  addNotification(notification) {
    notification.id = Date.now();
    notification.timestamp = new Date().toISOString();
    notification.isRead = false;
    
    this.notifications.unshift(notification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }
    
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
    this.displayNotifications();
  }

  displayNotifications() {
    const container = document.getElementById('notifications-container');
    if (!container) return;

    const unreadNotifications = this.notifications.filter(n => !n.isRead).slice(0, 5);
    
    if (unreadNotifications.length === 0) {
      container.innerHTML = '<div class="text-muted text-center py-3">No new notifications</div>';
      return;
    }

    container.innerHTML = unreadNotifications.map(notification => `
      <div class="notification-item p-3 border-bottom hover-lift" data-id="${notification.id}">
        <div class="d-flex align-items-start">
          <i class="bi bi-${this.getNotificationIcon(notification.type)} text-${notification.type === 'warning' ? 'warning' : 'primary'} me-3 mt-1"></i>
          <div class="flex-grow-1">
            <div class="fw-semibold">${notification.title}</div>
            <div class="text-muted small">${notification.message}</div>
            <div class="text-muted small mt-1">
              <i class="bi bi-clock me-1"></i>${this.getTimeAgo(new Date(notification.timestamp))}
            </div>
          </div>
          <button class="btn btn-sm btn-outline-secondary" onclick="advancedManager.markAsRead(${notification.id})">
            <i class="bi bi-check"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  getNotificationIcon(type) {
    const icons = {
      'info': 'info-circle',
      'warning': 'exclamation-triangle',
      'success': 'check-circle',
      'danger': 'x-circle'
    };
    return icons[type] || 'info-circle';
  }

  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
      this.displayNotifications();
    }
  }

  // Expense Predictions
  predictNextMonthExpenses() {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);

    const recentExpenses = expenses.filter(expense => 
      new Date(expense.date) >= threeMonthsAgo
    );

    const monthlyAverages = {};
    const months = {};

    recentExpenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const category = expense.category || 'other';

      if (!months[monthKey]) {
        months[monthKey] = {};
      }
      if (!months[monthKey][category]) {
        months[monthKey][category] = 0;
      }
      months[monthKey][category] += parseFloat(expense.amount);
    });

    // Calculate averages
    Object.values(months).forEach(month => {
      Object.entries(month).forEach(([category, amount]) => {
        if (!monthlyAverages[category]) {
          monthlyAverages[category] = [];
        }
        monthlyAverages[category].push(amount);
      });
    });

    const predictions = {};
    Object.entries(monthlyAverages).forEach(([category, amounts]) => {
      const average = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
      predictions[category] = Math.round(average * 100) / 100;
    });

    return predictions;
  }

  // Budget Recommendations
  generateBudgetRecommendations() {
    const predictions = this.predictNextMonthExpenses();
    const totalPredicted = Object.values(predictions).reduce((sum, amount) => sum + amount, 0);
    const currentBudget = parseFloat(localStorage.getItem('budget_raw') || '0');

    const recommendations = [];

    if (totalPredicted > currentBudget * 0.9) {
      recommendations.push({
        type: 'warning',
        title: 'Budget Increase Recommended',
        message: `Based on your spending patterns, consider increasing your budget to $${this.formatNumber(totalPredicted * 1.1)}`
      });
    }

    Object.entries(predictions).forEach(([category, amount]) => {
      const categoryBudget = this.budgetCategories[category] || 0;
      if (amount > categoryBudget * 1.2) {
        recommendations.push({
          type: 'info',
          title: `${category.charAt(0).toUpperCase() + category.slice(1)} Budget Alert`,
          message: `Consider allocating $${this.formatNumber(amount)} for ${category} next month`
        });
      }
    });

    return recommendations;
  }

  // Expense Analysis
  analyzeSpendingPatterns() {
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const analysis = {
      totalTransactions: expenses.length,
      averageTransaction: 0,
      mostExpensiveTransaction: null,
      mostFrequentCategory: null,
      spendingTrend: 'stable',
      monthlyGrowth: 0
    };

    if (expenses.length === 0) return analysis;

    // Calculate averages
    const totalAmount = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    analysis.averageTransaction = totalAmount / expenses.length;

    // Find most expensive transaction
    analysis.mostExpensiveTransaction = expenses.reduce((max, expense) => 
      parseFloat(expense.amount) > parseFloat(max.amount) ? expense : max
    );

    // Find most frequent category
    const categoryCounts = {};
    expenses.forEach(expense => {
      const category = expense.category || 'other';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    analysis.mostFrequentCategory = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

    // Calculate monthly growth
    const now = new Date();
    const currentMonth = expenses.filter(expense => {
      const date = new Date(expense.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });

    const lastMonth = expenses.filter(expense => {
      const date = new Date(expense.date);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
    });

    const currentMonthTotal = currentMonth.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const lastMonthTotal = lastMonth.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

    if (lastMonthTotal > 0) {
      analysis.monthlyGrowth = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
      analysis.spendingTrend = analysis.monthlyGrowth > 10 ? 'increasing' : 
                             analysis.monthlyGrowth < -10 ? 'decreasing' : 'stable';
    }

    return analysis;
  }

  // Financial Health Score Calculation
  calculateFinancialHealthScore() {
    const rawBudget = parseFloat(localStorage.getItem('budget_raw') || '0');
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const totalExpenses = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    let score = 100;
    const factors = [];

    // Budget adherence (40% of score)
    if (rawBudget > 0) {
      const spentPercentage = (totalExpenses / rawBudget) * 100;
      if (spentPercentage <= 50) {
        factors.push({ name: 'Budget Adherence', score: 40, status: 'excellent' });
      } else if (spentPercentage <= 75) {
        factors.push({ name: 'Budget Adherence', score: 30, status: 'good' });
        score -= 10;
      } else if (spentPercentage <= 90) {
        factors.push({ name: 'Budget Adherence', score: 20, status: 'fair' });
        score -= 20;
      } else {
        factors.push({ name: 'Budget Adherence', score: 10, status: 'poor' });
        score -= 30;
      }
    }

    // Expense tracking consistency (30% of score)
    const daysWithExpenses = new Set(expenses.map(expense => expense.date)).size;
    const daysSinceFirstExpense = expenses.length > 0 ? 
      Math.ceil((new Date() - new Date(expenses[0].date)) / (1000 * 60 * 60 * 24)) : 0;
    
    const trackingConsistency = daysSinceFirstExpense > 0 ? (daysWithExpenses / daysSinceFirstExpense) * 100 : 0;
    
    if (trackingConsistency >= 80) {
      factors.push({ name: 'Tracking Consistency', score: 30, status: 'excellent' });
    } else if (trackingConsistency >= 60) {
      factors.push({ name: 'Tracking Consistency', score: 25, status: 'good' });
      score -= 5;
    } else if (trackingConsistency >= 40) {
      factors.push({ name: 'Tracking Consistency', score: 20, status: 'fair' });
      score -= 10;
    } else {
      factors.push({ name: 'Tracking Consistency', score: 15, status: 'poor' });
      score -= 15;
    }

    // Category diversification (20% of score)
    const uniqueCategories = new Set(expenses.map(expense => expense.category)).size;
    if (uniqueCategories >= 5) {
      factors.push({ name: 'Category Diversification', score: 20, status: 'excellent' });
    } else if (uniqueCategories >= 3) {
      factors.push({ name: 'Category Diversification', score: 15, status: 'good' });
      score -= 5;
    } else {
      factors.push({ name: 'Category Diversification', score: 10, status: 'fair' });
      score -= 10;
    }

    // Savings goals progress (10% of score)
    const completedGoals = this.savingsGoals.filter(goal => goal.isCompleted).length;
    if (completedGoals > 0) {
      factors.push({ name: 'Savings Goals', score: 10, status: 'excellent' });
    } else if (this.savingsGoals.length > 0) {
      factors.push({ name: 'Savings Goals', score: 5, status: 'fair' });
      score -= 5;
    } else {
      factors.push({ name: 'Savings Goals', score: 0, status: 'poor' });
      score -= 10;
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      factors,
      recommendations: this.generateBudgetRecommendations()
    };
  }

  // Utility functions
  formatNumber(number) {
    const num = parseFloat(number);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
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
}

// Initialize advanced features
let advancedManager;
document.addEventListener('DOMContentLoaded', () => {
  advancedManager = new AdvancedBudgetManager();
});