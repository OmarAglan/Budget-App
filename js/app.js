function sanitizeHTML(str) {
  let temp = document.createElement('div');
  temp.textContent = str;
  return temp.innerHTML;
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
    const budgetValue = parseFloat(value);
    console.log('Budget input value:', value);

    try {
      if (value === '' || isNaN(budgetValue) || budgetValue < 0) {
        console.log('Invalid budget value');
        this.budgetFeedback.classList.add('showItem');
        this.budgetFeedback.innerHTML = `<p>${sanitizeHTML("Value cannot be empty or negative.")}</p>`;
        setTimeout(() => {
          this.budgetFeedback.classList.remove('showItem');
        }, 3000);
      } else {
        console.log('Setting budget to:', budgetValue);
        localStorage.setItem('budget_raw', budgetValue.toString());
        this.budgetInput.value = '';
        this.showBalance();
        this.saveToLocalStorage();
        this.showNotification('Budget set successfully!', 'success');
        console.log('Budget updated successfully');
      }
    } catch (error) {
      console.error('Error setting budget:', error);
      this.budgetFeedback.classList.add('showItem');
      this.budgetFeedback.innerHTML = `<p>${sanitizeHTML("Error setting budget: " + error.message)}</p>`;
      setTimeout(() => {
        this.budgetFeedback.classList.remove('showItem');
      }, 3000);
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
        this.budgetAmount.textContent = this.formatNumber(rawBudget);
    }

    if (this.expenseAmount) {
        this.expenseAmount.textContent = this.formatNumber(totalExpense);
    }

    if (this.balanceAmount) {
        this.balanceAmount.textContent = this.formatNumber(balance);
        this.balanceAmount.classList.remove('text-success', 'text-danger', 'text-muted');
        if (balance > 0) {
            this.balanceAmount.classList.add('text-success');
        } else if (balance < 0) {
            this.balanceAmount.classList.add('text-danger');
        } else {
            this.balanceAmount.classList.add('text-muted');
        }
    }

    console.log(
      `Balance updated: Budget $${this.formatNumber(rawBudget)}, Expenses $${this.formatNumber(totalExpense)}, Balance $${this.formatNumber(balance)}`
    );
  }

  submitExpenseForm() {
    console.log('submitExpenseForm called');
    const expenseValue = this.expenseInput.value.trim();
    const amountValue = this.amountInput.value;
    const categoryValue = this.expenseCategory.value;
    const dateValue = this.expenseDate.value;
    const amount = parseFloat(amountValue);

    if (
      expenseValue === '' ||
      amountValue === '' ||
      isNaN(amount) ||
      amount <= 0 ||
      categoryValue === '' ||
      dateValue === ''
    ) {
        console.log('Invalid expense data');
        this.expenseFeedback.classList.add('showItem');
        this.expenseFeedback.innerHTML = `<p>${sanitizeHTML("All fields are required. Amount must be positive.")}</p>`;
        setTimeout(() => {
            this.expenseFeedback.classList.remove('showItem');
        }, 3000);
    } else {
      console.log('Valid expense data, adding expense');
      this.expenseInput.value = '';
      this.amountInput.value = '';
      this.expenseCategory.value = '';
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

      this.itemList.push(expense);
      console.log(`Expense added: ${JSON.stringify(expense)}, New item count: ${this.itemList.length}`);

      this.filterExpenses();

      this.showBalance();
      this.saveToLocalStorage();

      this.updateCharts();

      this.showNotification('Expense added successfully!', 'success');
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
    notificationDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(notificationDiv);

    setTimeout(() => {
      notificationDiv.remove();
    }, 3000);
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
    ui.expenseSearch.addEventListener('input', () => ui.filterExpenses());
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

  console.log('Event listeners setup complete');
}

document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM content loaded, initializing application');
  eventListeners();
});
