class UI {
  /**
   * Constructor function for initializing UI elements.
   */
  constructor() {
    this.budgetFeedback = document.querySelector('.budget-feedback');
    this.expenseFeedback = document.querySelector('.expense-feedback');
    this.budgetForm = document.getElementById('budget-form');
    this.budgetInput = document.getElementById('budget-input');
    this.budgetAmount = document.getElementById('budget-amount');
    this.expenseAmount = document.getElementById('expense-amount');
    this.balance = document.getElementById('balance');
    this.balanceAmount = document.getElementById('balance-amount');
    this.expenseForm = document.getElementById('expense-form');
    this.expenseInput = document.getElementById('expense-input');
    this.amountInput = document.getElementById('amount-input');
    this.expenseList = document.getElementById('expense-list');
    this.itemList = [];
    this.itemID = 0;

    // Initialize charts
    initializeCharts();
    initializeBarChart();

    // Load data from localStorage
    this.loadFromLocalStorage();
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
      this.itemList.forEach((expense) => this.addExpense(expense));
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
    const value = this.budgetInput.value;
    if (value === '' || value <= 0) {
      this.budgetFeedback.classList.add('showItem');
      this.budgetFeedback.innerHTML = `<p>Value cannot be empty or negative</p>`;
      const self = this;
      setTimeout(function () {
        self.budgetFeedback.classList.remove('showItem');
      }, 3000);
    } else {
      this.budgetAmount.textContent = this.formatNumber(parseFloat(value));
      this.budgetInput.value = '';
      this.showBalance();
      this.saveToLocalStorage();
    }
  }

  showBalance() {
    const expense = this.totalExpense();
    const total =
      parseFloat(this.budgetAmount.textContent.replace(/,/g, '')) - expense;
    this.balanceAmount.textContent = this.formatNumber(total);
    if (total < 0) {
      this.balance.classList.remove('showGreen', 'showBlack');
      this.balance.classList.add('showRed');
    } else if (total > 0) {
      this.balance.classList.remove('showRed', 'showBlack');
      this.balance.classList.add('showGreen');
    } else {
      this.balance.classList.remove('showRed', 'showGreen');
      this.balance.classList.add('showBlack');
    }
  }

  submitExpenseForm() {
    const expenseValue = this.expenseInput.value;
    const amountValue = this.amountInput.value;
    const categoryValue = document.getElementById('expense-category').value;

    if (
      expenseValue === '' ||
      amountValue === '' ||
      amountValue <= 0 ||
      categoryValue === ''
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

      let expense = {
        id: this.itemID,
        title: expenseValue,
        amount: amount,
        category: categoryValue
      };
      this.itemID++;
      this.itemList.push(expense);
      this.addExpense(expense);
      this.showBalance();
      this.saveToLocalStorage();
    }
  }

  addExpense(expense) {
    const categoryColors = {
      groceries: 'text-success',
      transportation: 'text-info',
      utilities: 'text-warning',
      entertainment: 'text-primary',
      healthcare: 'text-danger',
      shopping: 'text-secondary',
      other: 'text-muted'
    };
    updateExpenseChart(this.itemList);

    const div = document.createElement('div');
    div.classList.add('expense');
    div.innerHTML = `
      <div class="expense-item d-flex justify-content-between align-items-center py-2 mb-2">
        <div class="d-flex align-items-center">
          <h6 class="expense-title mb-0 text-uppercase list-item ${
            categoryColors[expense.category]
          }">
            ${expense.title}
            <small class="text-muted ms-2">(${expense.category})</small>
          </h6>
        </div>
        <h6 class="expense-amount mb-0 list-item text-danger">- ${this.formatNumber(
          expense.amount
        )}</h6>
        <div class="expense-icons list-item text-end">
          <a href="#" class="edit-icon mx-2" data-id="${expense.id}">
            <i class="bi bi-pencil-square"></i>
          </a>
          <a href="#" class="delete-icon" data-id="${expense.id}">
            <i class="bi bi-trash"></i>
          </a>
        </div>
      </div>
    `;
    this.expenseList.appendChild(div);
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
    let parent = element.parentElement.parentElement.parentElement;
    this.expenseList.removeChild(parent);
    let expense = this.itemList.filter((item) => item.id === id);
    this.expenseInput.value = expense[0].title;
    this.amountInput.value = expense[0].amount;
    let tempList = this.itemList.filter((item) => item.id !== id);
    this.itemList = tempList;
    this.showBalance();
    this.saveToLocalStorage();
    updateExpenseTrendChart(this.itemList);
  }

  deleteExpense(element) {
    let id = parseInt(element.dataset.id);
    let parent = element.parentElement.parentElement.parentElement;
    this.expenseList.removeChild(parent);
    let tempList = this.itemList.filter((item) => item.id !== id);
    this.itemList = tempList;
    this.showBalance();
    this.saveToLocalStorage();
    updateExpenseChart(this.itemList);
  }
}

function eventListeners() {
  const BudgetForm = document.getElementById('budget-form');
  const ExpenseForm = document.getElementById('expense-form');
  const ExpenseList = document.getElementById('expense-list');

  const ui = new UI();

  BudgetForm.addEventListener('submit', function (event) {
    event.preventDefault();
    ui.submitBudgetForm();
  });

  ExpenseForm.addEventListener('submit', function (event) {
    event.preventDefault();
    ui.submitExpenseForm();
  });

  ExpenseList.addEventListener('click', function (event) {
    if (event.target.classList.contains('bi-pencil-square')) {
      ui.editExpense(event.target.parentElement);
    } else if (event.target.classList.contains('bi-trash')) {
      ui.deleteExpense(event.target.parentElement);
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  eventListeners();
  initializeCharts();
});
