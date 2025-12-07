/**
 * Budget Tracker - Core Application Logic
 * Refactored for Modularity, Security, and Performance
 * @author Omar Aglan
 */

// ==========================================
// 1. INFRASTRUCTURE LAYER (Storage & Utils)
// ==========================================

class StorageService {
  static get(key, defaultValue) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key}:`, error);
      return defaultValue;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
      alert('Storage full! Please export or clear data.');
    }
  }

  static clear() {
    localStorage.clear();
  }
}

const Utils = {
  formatCurrency: (num) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(num);
  },

  sanitize: (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};

// ==========================================
// 2. DOMAIN LAYER (Business Logic)
// ==========================================

class BudgetManager {
  constructor() {
    this.budget = parseFloat(StorageService.get('budget_raw', 0));
    this.expenses = StorageService.get('expenses', []);
  }

  setBudget(amount) {
    if (amount < 0) throw new Error('Budget cannot be negative');
    this.budget = parseFloat(amount);
    StorageService.set('budget_raw', this.budget);
  }

  addExpense(title, amount, category, date) {
    if (amount <= 0) throw new Error('Amount must be greater than zero');
    if (!title.trim()) throw new Error('Title is required');

    const expense = {
      id: Utils.generateId(),
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date: date || new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };

    this.expenses.push(expense);
    this.saveExpenses();
    return expense;
  }

  deleteExpense(id) {
    this.expenses = this.expenses.filter(item => item.id !== id);
    this.saveExpenses();
  }

  editExpense(id, newData) {
    const index = this.expenses.findIndex(item => item.id === id);
    if (index !== -1) {
      this.expenses[index] = { ...this.expenses[index], ...newData };
      this.saveExpenses();
    }
  }

  saveExpenses() {
    StorageService.set('expenses', this.expenses);
  }

  getStats() {
    const totalExpenses = this.expenses.reduce((sum, item) => sum + item.amount, 0);
    return {
      budget: this.budget,
      totalExpenses,
      balance: this.budget - totalExpenses,
      percentage: this.budget > 0 ? (totalExpenses / this.budget) * 100 : 0
    };
  }

  filterExpenses(filters = {}) {
    return this.expenses.filter(item => {
      // Filter by Search Text
      if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase())) return false;

      // Filter by Category
      if (filters.category && filters.category !== 'all' && item.category !== filters.category) return false;

      // Filter by Time Period
      if (filters.period && filters.period !== 'all') {
        const itemDate = new Date(item.date);
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        if (filters.period === 'today') {
          return itemDate.toDateString() === new Date().toDateString();
        }
        if (filters.period === 'thisWeek') {
          return itemDate >= startOfWeek;
        }
        if (filters.period === 'thisMonth') {
          return itemDate >= startOfMonth;
        }
      }
      return true;
    }).sort((a, b) => {
      // Sort Logic
      if (filters.sort === 'amount-desc') return b.amount - a.amount;
      if (filters.sort === 'amount-asc') return a.amount - b.amount;
      if (filters.sort === 'date-asc') return new Date(a.date) - new Date(b.date);
      // Default: date-desc
      return new Date(b.date) - new Date(a.date);
    });
  }
}

// ==========================================
// 3. PRESENTATION LAYER (UI Interaction)
// ==========================================

class UIManager {
  constructor() {
    this.manager = new BudgetManager();
    this.filters = { search: '', category: 'all', period: 'all', sort: 'date-desc' };

    this.cacheDOM();
    this.bindEvents();
    this.render();
  }

  cacheDOM() {
    // KPI Elements
    this.budgetEl = document.getElementById('budget-amount');
    this.expenseEl = document.getElementById('expense-amount');
    this.balanceEl = document.getElementById('balance-amount');
    this.percentageEl = document.getElementById('expense-percentage');
    this.progressBar = document.getElementById('budget-progress');

    // Forms
    this.budgetForm = document.getElementById('budget-form');
    this.budgetInput = document.getElementById('budget-input');
    this.expenseForm = document.getElementById('expense-form');
    this.expenseList = document.getElementById('expense-list');

    // Filters
    this.searchInput = document.getElementById('expense-search');
    this.categoryFilter = document.getElementById('filter-category');
    this.periodFilter = document.getElementById('filter-period');

    // Feedback
    this.budgetFeedback = document.querySelector('.budget-feedback');
    this.expenseFeedback = document.querySelector('.expense-feedback');
  }

  bindEvents() {
    // Budget Form
    this.budgetForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSetBudget();
    });

    // Expense Form
    this.expenseForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddExpense();
    });

    // Filters
    this.searchInput?.addEventListener('input', (e) => {
      this.filters.search = e.target.value;
      this.renderExpenses();
    });

    this.categoryFilter?.addEventListener('change', (e) => {
      this.filters.category = e.target.value;
      this.renderExpenses();
    });

    this.periodFilter?.addEventListener('change', (e) => {
      this.filters.period = e.target.value;
      this.renderExpenses();
    });

    // Event Delegation for List Actions (Delete/Edit)
    this.expenseList?.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      const id = target.dataset.id;
      if (target.classList.contains('delete-icon')) {
        this.handleDelete(id);
      }
      // Add Edit logic here if needed
    });

    // Sort Dropdown
    document.querySelectorAll('[data-sort]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.filters.sort = e.target.dataset.sort;
        this.renderExpenses();
      });
    });

    // Presets & Quick Amounts
    document.getElementById('preset-1000')?.addEventListener('click', () => this.budgetInput.value = 1000);
    document.getElementById('preset-2500')?.addEventListener('click', () => this.budgetInput.value = 2500);

    document.querySelectorAll('.quick-amount').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('amount-input').value = btn.dataset.amount;
      });
    });

    // Data Management
    document.getElementById('clear-data')?.addEventListener('click', () => {
      if (confirm('Delete all data?')) {
        StorageService.clear();
        location.reload();
      }
    });
  }

  // --- Handlers ---

  handleSetBudget() {
    try {
      const amount = this.budgetInput.value;
      this.manager.setBudget(amount);
      this.budgetInput.value = '';
      this.render();
      this.showNotification('Budget updated successfully!', 'success');
    } catch (err) {
      this.showFeedback(this.budgetFeedback, err.message, 'danger');
    }
  }

  handleAddExpense() {
    try {
      const title = document.getElementById('expense-input').value;
      const category = document.getElementById('expense-category').value;
      const amount = document.getElementById('amount-input').value;
      const date = document.getElementById('expense-date').value;

      this.manager.addExpense(title, amount, category, date);

      // Reset Form
      this.expenseForm.reset();
      document.getElementById('expense-date').value = new Date().toISOString().split('T')[0];

      this.render();
      this.showNotification('Expense added!', 'success');
    } catch (err) {
      this.showFeedback(this.expenseFeedback, err.message, 'danger');
    }
  }

  handleDelete(id) {
    if (confirm('Delete this transaction?')) {
      this.manager.deleteExpense(id);
      this.render();
      this.showNotification('Transaction removed.', 'info');
    }
  }

  // --- Rendering ---

  render() {
    this.renderStats();
    this.renderExpenses();
    this.updateCharts();
  }

  renderStats() {
    const stats = this.manager.getStats();

    if (this.budgetEl) this.budgetEl.textContent = Utils.formatCurrency(stats.budget);
    if (this.expenseEl) this.expenseEl.textContent = Utils.formatCurrency(stats.totalExpenses);
    if (this.balanceEl) {
      this.balanceEl.textContent = Utils.formatCurrency(stats.balance);
      this.balanceEl.className = `stat-number mb-2 ${stats.balance >= 0 ? 'text-success' : 'text-danger'}`;
    }

    if (this.percentageEl) {
      this.percentageEl.textContent = `${stats.percentage.toFixed(1)}% Used`;
    }

    if (this.progressBar) {
      const width = Math.min(stats.percentage, 100);
      this.progressBar.style.width = `${width}%`;
      this.progressBar.className = `progress-bar ${width > 90 ? 'bg-danger' : width > 75 ? 'bg-warning' : 'bg-success'}`;
    }
  }

  renderExpenses() {
    if (!this.expenseList) return;

    const filtered = this.manager.filterExpenses(this.filters);

    if (filtered.length === 0) {
      this.expenseList.innerHTML = `
        <div class="text-center py-5 text-muted">
          <i class="bi bi-receipt display-4 mb-3 d-block"></i>
          <p>No transactions found.</p>
        </div>`;
      return;
    }

    this.expenseList.innerHTML = filtered.map(item => `
      <div class="expense-item d-flex justify-content-between align-items-center mb-2 p-3 bg-white border rounded shadow-sm">
        <div class="d-flex align-items-center gap-3">
          <div class="category-badge text-capitalize bg-light border">
            ${this.getCategoryIcon(item.category)}
          </div>
          <div>
            <h6 class="mb-0 fw-bold text-dark">${Utils.sanitize(item.title)}</h6>
            <small class="text-muted">
              ${new Date(item.date).toLocaleDateString()} • <span class="text-capitalize">${item.category}</span>
            </small>
          </div>
        </div>
        <div class="text-end">
          <div class="fw-bold text-danger mb-1">-${Utils.formatCurrency(item.amount)}</div>
          <button class="btn btn-sm btn-link text-danger p-0 text-decoration-none delete-icon" data-id="${item.id}">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  getCategoryIcon(category) {
    const icons = {
      groceries: '🛒', transportation: '🚗', utilities: '⚡', entertainment: '🎬',
      dining: '🍽️', shopping: '🛍️', healthcare: '🏥', education: '📚',
      travel: '✈️', fitness: '💪', other: '📦'
    };
    return icons[category] || '💰';
  }

  updateCharts() {
    // Check if global chart functions exist (from js/charts.js)
    if (typeof updateExpenseChart === 'function') {
      updateExpenseChart(this.manager.expenses);
    }
    if (typeof updateExpenseTrendChart === 'function') {
      updateExpenseTrendChart(this.manager.expenses);
    }
  }

  showFeedback(element, message, type) {
    if (!element) return;
    element.innerHTML = `<div class="alert alert-${type} mt-2 py-2">${message}</div>`;
    setTimeout(() => element.innerHTML = '', 3000);
  }

  showNotification(message, type) {
    const div = document.createElement('div');
    div.className = `alert alert-${type} position-fixed top-0 end-0 m-3 shadow-lg`;
    div.style.zIndex = '1050';
    div.innerHTML = `<i class="bi bi-info-circle me-2"></i> ${message}`;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }
}

// ==========================================
// 4. INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize App
  window.app = new UIManager();

  // Set default date
  const dateInput = document.getElementById('expense-date');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }
});