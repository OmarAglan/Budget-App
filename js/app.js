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
    
    // Check if budget elements exist
    if (!this.budgetInput) console.error('Budget input element not found');
    if (!this.budgetAmount) console.error('Budget amount element not found');
    
    // Balance elements
    this.expenseAmount = document.getElementById('expense-amount');
    this.balance = document.getElementById('balance');
    this.balanceAmount = document.getElementById('balance-amount');
    
    // Expense form elements
    this.expenseFeedback = document.querySelector('.expense-feedback');
    this.expenseForm = document.getElementById('expense-form');
    this.expenseInput = document.getElementById('expense-input');
    this.amountInput = document.getElementById('amount-input');
    this.expenseDate = document.getElementById('expense-date');
    this.expenseList = document.getElementById('expense-list');
    this.expenseCount = document.getElementById('expense-count');
    this.noExpensesMessage = document.getElementById('no-expenses-message');
    this.expenseSearch = document.getElementById('expense-search');
    this.filterCategory = document.getElementById('filter-category');
    this.filterPeriod = document.getElementById('filter-period');
    
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
      if (typeof initializeCharts === 'function') {
        initializeCharts();
        if (typeof initializeBarChart === 'function') {
          initializeBarChart();
        } else {
          console.warn('initializeBarChart function not found');
        }
      } else {
        console.warn('initializeCharts function not found');
      }
    } catch (error) {
      console.error('Error initializing charts:', error);
    }

    // Load data from localStorage
    this.loadFromLocalStorage();
    
    // Set up filter event listeners
    this.setupFilterListeners();
    
    console.log('UI constructor completed');
  }

  // Set up event listeners for filters
  setupFilterListeners() {
    if (this.expenseSearch) {
      this.expenseSearch.addEventListener('input', () => this.filterExpenses());
    }
    
    if (this.filterCategory) {
      this.filterCategory.addEventListener('change', () => this.filterExpenses());
    }
    
    if (this.filterPeriod) {
      this.filterPeriod.addEventListener('change', () => this.filterExpenses());
    }
  }
  
  // Filter expenses based on search and filter values
  filterExpenses() {
    // Get filter values
    const searchTerm = this.expenseSearch ? this.expenseSearch.value.toLowerCase() : '';
    const categoryFilter = this.filterCategory ? this.filterCategory.value : 'all';
    const periodFilter = this.filterPeriod ? this.filterPeriod.value : 'all';
    
    // Filter expenses
    this.filteredList = this.itemList.filter(expense => {
      // Check search term
      const matchesSearch = searchTerm === '' || 
        expense.title.toLowerCase().includes(searchTerm) || 
        expense.category.toLowerCase().includes(searchTerm);
      
      // Check category
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
      
      // Check date period
      let matchesPeriod = true;
      if (periodFilter !== 'all' && expense.date) {
        const expenseDate = new Date(expense.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        
        const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        
        switch(periodFilter) {
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
    
    // Update UI with filtered expenses
    this.updateExpenseList();
  }
  
  // Update the expense list display with filtered expenses
  updateExpenseList() {
    // Clear current expense list (except header)
    const expenseHeader = this.expenseList.querySelector('.expense-list__info');
    this.expenseList.innerHTML = '';
    this.expenseList.appendChild(expenseHeader);
    
    // Add "no expenses" message
    if (this.noExpensesMessage) {
      if (this.filteredList.length === 0) {
        this.noExpensesMessage.classList.remove('d-none');
        this.expenseList.appendChild(this.noExpensesMessage);
      } else {
        this.noExpensesMessage.classList.add('d-none');
      }
    }
    
    // Update expense count
    if (this.expenseCount) {
      this.expenseCount.textContent = this.filteredList.length;
    }
    
    // Add filtered expenses to list
    this.filteredList.forEach(expense => {
      this.addExpenseToDOM(expense);
    });
  }
  
  // Add expense to DOM (separate from addExpense to support filtering)
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
    
    // Format date for display
    const dateObj = new Date(expense.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    const div = document.createElement('div');
    div.classList.add('expense');
    div.innerHTML = `
      <div class="expense-item rounded p-3 mb-3 border-start border-${categoryColors[expense.category]} border-3 bg-white shadow-sm">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center flex-grow-1">
            <div class="me-3">
              <span class="badge bg-${categoryColors[expense.category]} bg-opacity-10 text-${categoryColors[expense.category]} p-2">
                <i class="bi bi-${categoryIcons[expense.category]}"></i>
              </span>
            </div>
            <div>
              <h6 class="expense-title mb-1 text-capitalize fw-semibold">
                ${expense.title}
              </h6>
              <div class="text-muted small">
                <span class="me-2"><i class="bi bi-tag"></i> ${expense.category}</span>
                <span><i class="bi bi-calendar"></i> ${formattedDate}</span>
              </div>
            </div>
          </div>
          <div class="text-end">
            <h6 class="expense-amount mb-1 fw-bold text-danger">$${this.formatNumber(expense.amount)}</h6>
            <div class="expense-icons">
              <button class="btn btn-sm btn-outline-primary edit-icon me-1" data-id="${expense.id}">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger delete-icon" data-id="${expense.id}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Attach event listeners to the buttons
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

  loadFromLocalStorage() {
    const budget = localStorage.getItem('budget');
    const expenses = localStorage.getItem('expenses');
    const itemID = localStorage.getItem('itemID');

    if (budget) {
      this.budgetAmount.textContent = budget;
    }

    if (expenses) {
      this.itemList = JSON.parse(expenses);
      this.filteredList = [...this.itemList]; // Initialize filtered list with all expenses
      this.updateExpenseList(); // Display expenses with new method
    }

    if (itemID) {
      this.itemID = parseInt(itemID);
    }

    this.showBalance();
  }

  saveToLocalStorage() {
    localStorage.setItem('budget', this.budgetAmount.textContent);
    localStorage.setItem('expenses', JSON.stringify(this.itemList));
    localStorage.setItem('itemID', this.itemID.toString());
  }

  submitBudgetForm() {
    console.log('submitBudgetForm method called');
    const value = this.budgetInput.value;
    console.log('Budget input value:', value);
    
    try {
      if (value === '' || parseFloat(value) <= 0) {
        console.log('Invalid budget value');
        this.budgetFeedback.classList.add('showItem');
        this.budgetFeedback.innerHTML = `<p>Value cannot be empty or negative</p>`;
        const self = this;
        setTimeout(function () {
          self.budgetFeedback.classList.remove('showItem');
        }, 3000);
      } else {
        console.log('Setting budget to:', parseFloat(value));
        this.budgetAmount.textContent = this.formatNumber(parseFloat(value));
        this.budgetInput.value = '';
        this.showBalance();
        this.saveToLocalStorage();
        
        // Show success notification
        this.showNotification('Budget set successfully!', 'success');
        console.log('Budget updated successfully');
      }
    } catch (error) {
      console.error('Error setting budget:', error);
      this.budgetFeedback.classList.add('showItem');
      this.budgetFeedback.innerHTML = `<p>Error setting budget: ${error.message}</p>`;
      setTimeout(() => {
        this.budgetFeedback.classList.remove('showItem');
      }, 3000);
    }
  }

  showBalance() {
    console.log('Updating balance display');
    
    // Get budget and expenses from localStorage
    const budget = localStorage.getItem('budget');
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    
    // Calculate total expense
    let totalExpense = 0;
    if (expenses.length > 0) {
      totalExpense = expenses.reduce((acc, curr) => {
        return acc + parseFloat(curr.amount);
      }, 0);
    }
    
    // Format values for display
    const budgetValue = parseFloat(budget) || 0;
    const formattedBudget = budgetValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    const formattedExpense = totalExpense.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    const balance = budgetValue - totalExpense;
    const formattedBalance = balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    // Update DOM elements
    if (this.budgetAmount) {
      this.budgetAmount.textContent = formattedBudget;
    }
    
    if (this.expenseAmount) {
      this.expenseAmount.textContent = formattedExpense;
    }
    
    if (this.balanceAmount) {
      this.balanceAmount.textContent = formattedBalance;
      
      // Add color classes based on balance
      this.balanceAmount.classList.remove('text-success', 'text-danger');
      if (balance > 0) {
        this.balanceAmount.classList.add('text-success');
      } else if (balance < 0) {
        this.balanceAmount.classList.add('text-danger');
      }
    }
    
    console.log(`Balance updated: Budget $${formattedBudget}, Expenses $${formattedExpense}, Balance $${formattedBalance}`);
  }

  submitExpenseForm() {
    const expenseValue = this.expenseInput.value;
    const amountValue = this.amountInput.value;
    const categoryValue = document.getElementById('expense-category').value;
    const dateValue = this.expenseDate.value;

    if (
      expenseValue === '' ||
      amountValue === '' ||
      amountValue <= 0 ||
      categoryValue === '' ||
      dateValue === ''
    ) {
      this.expenseFeedback.classList.add('showItem');
      this.expenseFeedback.innerHTML = `<p>All fields are required and amount cannot be negative</p>`;
      const self = this;
      setTimeout(function () {
        self.expenseFeedback.classList.remove('showItem');
      }, 3000);
    } else {
      let amount = parseFloat(amountValue);
      this.expenseInput.value = '';
      this.amountInput.value = '';
      document.getElementById('expense-category').value = '';
      // Reset date to today
      const today = new Date().toISOString().split('T')[0];
      this.expenseDate.value = today;

      let expense = {
        id: this.itemID,
        title: expenseValue,
        amount: amount,
        category: categoryValue,
        date: dateValue
      };
      this.itemID++;
      
      // Add expense directly to itemList
      this.itemList.push(expense);
      
      // Update UI and filter (but don't add the expense again)
      this.filterExpenses();
      
      // Update the balance and save to localStorage
      this.showBalance();
      this.saveToLocalStorage();
      
      // Update charts with new expense
      updateExpenseChart(this.itemList);
      updateExpenseTrendChart(this.itemList);
    }
  }

  addExpense(expense) {
    // Define category colors and icons for consistent styling
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
    
    // Format date for display
    const dateObj = new Date(expense.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Format amount
    const formattedAmount = expense.amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    // Create the expense element with the new structure that matches our CSS
    const div = document.createElement('div');
    div.className = 'expense-item-container mb-3';
    div.innerHTML = `
      <div class="expense-item rounded p-3 border-start border-${categoryColors[expense.category]} border-3 bg-white shadow-sm">
        <div class="row align-items-center">
          <!-- Title and meta info column - 6 columns -->
          <div class="col-6 col-md-6">
            <div class="d-flex align-items-center">
              <div class="me-3">
                <span class="badge bg-${categoryColors[expense.category]} bg-opacity-10 text-${categoryColors[expense.category]} p-2">
                  <i class="bi bi-${categoryIcons[expense.category]}"></i>
                </span>
              </div>
              <div class="expense-details">
                <h6 class="expense-title mb-1 text-capitalize fw-semibold">
                  ${expense.title}
                </h6>
                <div class="text-muted small">
                  <span class="me-2"><i class="bi bi-tag"></i> ${expense.category}</span>
                  <span><i class="bi bi-calendar"></i> ${formattedDate}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Amount column - 3 columns -->
          <div class="col-3 col-md-3 text-center">
            <h6 class="expense-amount mb-0 fw-bold text-danger">$${formattedAmount}</h6>
          </div>
          
          <!-- Actions column - 3 columns -->
          <div class="col-3 col-md-3 text-end">
            <div class="expense-actions">
              <button class="btn btn-sm btn-outline-primary edit-expense me-1" data-id="${expense.id}">
                <i class="bi bi-pencil-square"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger delete-expense" data-id="${expense.id}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Get the expense list
    const expenseList = document.getElementById('expense-list');
    
    if (expenseList) {
      // Add event listeners to edit and delete buttons
      const editBtn = div.querySelector('.edit-expense');
      const deleteBtn = div.querySelector('.delete-expense');
      
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          this.editExpense(event);
        });
      }
      
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          this.deleteExpense(event);
        });
      }
      
      // Hide any no expenses message
      const noExpensesMessage = document.getElementById('no-expenses-message');
      if (noExpensesMessage) {
        noExpensesMessage.style.display = 'none';
      }
      
      // Add to expense list
      expenseList.appendChild(div);
      
      // Update expense count if element exists
      if (this.expenseCount) {
        const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        this.expenseCount.textContent = expenses.length;
      }
    }
  }

  totalExpense() {
    let total = 0;
    if (this.itemList.length > 0) {
      total = this.itemList.reduce((acc, curr) => {
        acc += curr.amount;
        return acc;
      }, 0);
    }
    this.expenseAmount.textContent = this.formatNumber(total);
    return total;
  }

  formatNumber(number) {
    return number.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  editExpense(element) {
    let id = parseInt(element.dataset.id);
    // Find the expense container (now we need to go up more levels due to new structure)
    let expenseContainer = element.closest('.expense');
    
    if (expenseContainer) {
      this.expenseList.removeChild(expenseContainer);
      
      let expense = this.itemList.filter((item) => item.id === id);
      if (expense.length > 0) {
        this.expenseInput.value = expense[0].title;
        this.amountInput.value = expense[0].amount;
        document.getElementById('expense-category').value = expense[0].category;
        if (expense[0].date) {
          this.expenseDate.value = expense[0].date;
        }
        
        // Show expense form tab if we're in the list tab
        const listTab = document.getElementById('list-tab');
        const formElement = document.getElementById('expense-form').closest('.col-lg-4');
        if (listTab && listTab.classList.contains('active') && window.innerWidth < 992) {
          // Scroll to the form on mobile
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
        
        let tempList = this.itemList.filter((item) => item.id !== id);
        this.itemList = tempList;
        this.showBalance();
        this.saveToLocalStorage();
        updateExpenseChart(this.itemList);
        updateExpenseTrendChart(this.itemList);
        
        // Update filtered list and UI
        this.filterExpenses();
      }
    }
  }

  deleteExpense(element) {
    let id = parseInt(element.dataset.id);
    // Find the expense container
    let expenseContainer = element.closest('.expense');
    
    if (expenseContainer) {
      // Animate the removal
      expenseContainer.style.transition = 'all 0.3s ease';
      expenseContainer.style.opacity = '0';
      expenseContainer.style.transform = 'translateX(20px)';
      
      setTimeout(() => {
        this.expenseList.removeChild(expenseContainer);
        
        let tempList = this.itemList.filter((item) => item.id !== id);
        this.itemList = tempList;
        this.showBalance();
        this.saveToLocalStorage();
        updateExpenseChart(this.itemList);
        
        // Update filtered list and UI
        this.filterExpenses();
        
        // Show notification
        this.showNotification('Expense deleted successfully', 'success');
      }, 300);
    }
  }

  // Export budget data as JSON file
  exportData() {
    const budgetData = {
      budget: this.budgetAmount.textContent,
      expenses: this.itemList,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(budgetData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = 'budget_data_' + new Date().toISOString().split('T')[0] + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    // Show success notification
    this.showNotification('Data exported successfully!', 'success');
  }

  // Import budget data from JSON file
  importData(file) {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        
        if (importedData.budget && importedData.expenses) {
          // Clear current data
          this.itemList = [];
          this.itemID = 0;
          
          // Remove all expense elements (excluding header)
          const expenseHeader = this.expenseList.querySelector('.expense-list__info');
          this.expenseList.innerHTML = '';
          if (expenseHeader) {
            this.expenseList.appendChild(expenseHeader);
          }
          
          // Set budget
          this.budgetAmount.textContent = importedData.budget;
          
          // Import expenses
          if (Array.isArray(importedData.expenses)) {
            this.itemList = importedData.expenses;
            this.itemID = this.itemList.length > 0 
              ? Math.max(...this.itemList.map(expense => expense.id)) + 1 
              : 0;
            
            // Filter expenses to update UI
            this.filteredList = [...this.itemList];
            this.updateExpenseList();
          }
          
          // Update balance and save to localStorage
          this.showBalance();
          this.saveToLocalStorage();
          
          // Update charts
          updateExpenseChart(this.itemList);
          updateExpenseTrendChart(this.itemList);
          
          this.showNotification('Data imported successfully!', 'success');
        } else {
          this.showNotification('Invalid data format!', 'danger');
        }
      } catch (error) {
        console.error('Import error:', error);
        this.showNotification('Error importing data: ' + error.message, 'danger');
      }
    };
    
    reader.onerror = () => {
      this.showNotification('Error reading file!', 'danger');
    };
    
    reader.readAsText(file);
  }

  // Show notification
  showNotification(message, type = 'info') {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notificationDiv.setAttribute('role', 'alert');
    notificationDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    document.body.appendChild(notificationDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      notificationDiv.remove();
    }, 3000);
  }
}

function eventListeners() {
  console.log('Setting up event listeners');
  const BudgetForm = document.getElementById('budget-form');
  const BudgetSubmitBtn = document.getElementById('budget-submit');
  const ExpenseForm = document.getElementById('expense-form');
  const ExportBtn = document.getElementById('export-data');
  const ImportBtn = document.getElementById('import-data');
  const ImportFile = document.getElementById('import-file');
  
  console.log('Budget submit button found:', !!BudgetSubmitBtn);
  
  // Initialize UI
  const ui = new UI();

  // Budget form submission - still keep this for backward compatibility
  if (BudgetForm) {
    BudgetForm.addEventListener('submit', function (event) {
      console.log('Budget form submit event triggered');
      event.preventDefault();
      ui.submitBudgetForm();
    });
  }
  
  // Direct budget button click event
  if (BudgetSubmitBtn) {
    console.log('Adding click event to budget submit button');
    BudgetSubmitBtn.addEventListener('click', function() {
      console.log('Budget submit button clicked from eventListeners');
      ui.submitBudgetForm();
    });
  }

  // Expense form submission
  if (ExpenseForm) {
    ExpenseForm.addEventListener('submit', function (event) {
      console.log('Expense form submit event triggered');
      event.preventDefault();
      ui.submitExpenseForm();
    });
  }
  
  // Export data event
  if (ExportBtn) {
    ExportBtn.addEventListener('click', function() {
      ui.exportData();
    });
  }
  
  // Import data events
  if (ImportBtn && ImportFile) {
    ImportBtn.addEventListener('click', function() {
      ImportFile.click();
    });
    
    ImportFile.addEventListener('change', function(event) {
      if (event.target.files.length > 0) {
        ui.importData(event.target.files[0]);
        // Reset file input
        event.target.value = '';
      }
    });
  }
  
  console.log('Event listeners setup complete');
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM content loaded, initializing application');
  eventListeners();
});

// Filter expenses based on category and period
function filterExpenses() {
  console.log('Filtering expenses');
  
  // Get filter values
  const categoryFilter = document.getElementById('filter-category').value;
  const periodFilter = document.getElementById('filter-period').value;
  const searchQuery = document.getElementById('expense-search').value.toLowerCase();
  
  console.log('Filters:', { category: categoryFilter, period: periodFilter, search: searchQuery });
  
  // Get all expense items
  const expenseItems = document.querySelectorAll('.expense-item-container');
  console.log(`Found ${expenseItems.length} expense items`);
  
  // Track if any items are visible
  let hasVisibleItems = false;
  
  // Get current expenses from localStorage
  let expenses = [];
  if (localStorage.getItem('expenses')) {
    expenses = JSON.parse(localStorage.getItem('expenses'));
  }
  
  // Process each expense item
  expenseItems.forEach(item => {
    const expenseId = item.querySelector('.delete-expense').dataset.id;
    const expense = expenses.find(exp => exp.id.toString() === expenseId);
    
    if (!expense) {
      item.style.display = 'none';
      return;
    }
    
    // Check if expense matches the search query
    const title = expense.title.toLowerCase();
    const category = expense.category.toLowerCase();
    const matchesSearch = searchQuery === '' || 
                          title.includes(searchQuery) || 
                          category.includes(searchQuery);
    
    // Check if expense matches category filter
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    
    // Check if expense matches period filter
    let matchesPeriod = true;
    if (periodFilter !== 'all') {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      
      if (periodFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        matchesPeriod = expenseDate >= today;
      } else if (periodFilter === 'thisWeek') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);
        matchesPeriod = expenseDate >= startOfWeek;
      } else if (periodFilter === 'thisMonth') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        matchesPeriod = expenseDate >= startOfMonth;
      } else if (periodFilter === 'last3Months') {
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        matchesPeriod = expenseDate >= threeMonthsAgo;
      }
    }
    
    // Show or hide the expense item
    if (matchesSearch && matchesCategory && matchesPeriod) {
      item.style.display = 'block';
      hasVisibleItems = true;
    } else {
      item.style.display = 'none';
    }
  });
  
  // Show or hide no expenses message
  const noExpensesMessage = document.getElementById('no-expenses-message');
  const expenseList = document.getElementById('expense-list');
  
  // Remove any existing no results message
  const existingNoResults = document.getElementById('no-results-message');
  if (existingNoResults) {
    existingNoResults.remove();
  }
  
  if (!hasVisibleItems && expenseItems.length > 0) {
    // Create no results message
    const noResultsMsg = document.createElement('div');
    noResultsMsg.id = 'no-results-message';
    noResultsMsg.className = 'text-center py-4';
    noResultsMsg.innerHTML = `
      <div class="py-5">
        <i class="bi bi-search text-muted display-1 mb-3"></i>
        <p class="text-muted mb-0">No expenses match your filters.</p>
        <p class="text-muted">Try adjusting your search criteria.</p>
      </div>
    `;
    expenseList.appendChild(noResultsMsg);
    
    // Hide no expenses message if it exists
    if (noExpensesMessage) {
      noExpensesMessage.style.display = 'none';
    }
  }
  
  // Update charts if function is available
  if (typeof updateExpenseChart === 'function') {
    const filteredExpenses = getFilteredExpenses();
    updateExpenseChart(filteredExpenses);
    
    if (typeof updateExpenseTrendChart === 'function') {
      updateExpenseTrendChart(filteredExpenses);
    }
  }
  
  console.log('Filtering complete, visible items:', hasVisibleItems);
}

// Helper function to get currently filtered expenses
function getFilteredExpenses() {
  const categoryFilter = document.getElementById('filter-category').value;
  const periodFilter = document.getElementById('filter-period').value;
  const searchQuery = document.getElementById('expense-search').value.toLowerCase();
  
  // Get expenses from localStorage
  let expenses = [];
  if (localStorage.getItem('expenses')) {
    expenses = JSON.parse(localStorage.getItem('expenses'));
  }
  
  // Apply filters
  return expenses.filter(expense => {
    // Check search query
    const title = expense.title.toLowerCase();
    const category = expense.category.toLowerCase();
    const matchesSearch = searchQuery === '' || 
                          title.includes(searchQuery) || 
                          category.includes(searchQuery);
    
    // Check category
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    
    // Check period
    let matchesPeriod = true;
    if (periodFilter !== 'all') {
      const expenseDate = new Date(expense.date);
      const now = new Date();
      
      if (periodFilter === 'today') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        matchesPeriod = expenseDate >= today;
      } else if (periodFilter === 'thisWeek') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);
        matchesPeriod = expenseDate >= startOfWeek;
      } else if (periodFilter === 'thisMonth') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        matchesPeriod = expenseDate >= startOfMonth;
      } else if (periodFilter === 'last3Months') {
        const threeMonthsAgo = new Date(now);
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        matchesPeriod = expenseDate >= threeMonthsAgo;
      }
    }
    
    return matchesSearch && matchesCategory && matchesPeriod;
  });
}

// Setup filter listeners
document.addEventListener('DOMContentLoaded', function() {
  // Set up filter listeners
  const categoryFilter = document.getElementById('filter-category');
  const periodFilter = document.getElementById('filter-period');
  const searchInput = document.getElementById('expense-search');
  
  if (categoryFilter) {
    console.log('Adding event listener to category filter');
    categoryFilter.addEventListener('change', filterExpenses);
  }
  
  if (periodFilter) {
    console.log('Adding event listener to period filter');
    periodFilter.addEventListener('change', filterExpenses);
  }
  
  if (searchInput) {
    console.log('Adding event listener to search input');
    searchInput.addEventListener('input', filterExpenses);
  }
});
