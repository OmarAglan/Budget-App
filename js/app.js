class UI {
  /**
   * Constructor function for initializing UI elements.
   */
  constructor() {
    this.budgetFeedback = document.querySelector(".budget-feedback");
    this.expenseFeedback = document.querySelector(".expense-feedback");
    this.budgetForm = document.getElementById("budget-form");
    this.budgetInput = document.getElementById("budget-input");
    this.budgetAmount = document.getElementById("budget-amount");
    this.expenseAmount = document.getElementById("expense-amount");
    this.balance = document.getElementById("balance");
    this.balanceAmount = document.getElementById("balance-amount");
    this.expenseForm = document.getElementById("expense-form");
    this.expenseInput = document.getElementById("expense-input");
    this.amountInput = document.getElementById("amount-input");
    this.expenseList = document.getElementById("expense-list");
    this.itemList = [];
    this.itemID = 0;
  }

  //Submit budget method

  submitBudgetForm() {
    console.log("Hello Es6");
    const value = this.budgetInput.value;

    if (value === '0' || value < 0){
      this.budgetFeedback.classList.add('showItem');
      this.budgetFeedback.innerHTML = `<p>value cannot be empty or negative</p>`;
      const self = this;
      setTimeout(function(){
        self.budgetFeedback.classList.remove('showItem');
      }, 3000)
    }
  }
}
/**
 * A function that sets up event listeners for budget and expense forms and creates a new instance of the UI class.
 *
 */
function eventListeners() {
  const BudgetForm = document.getElementById('budget-form');
  const ExpenseForm = document.getElementById('expense-form');
  const ExpenseList = document.getElementById('expense-list');

  // new instance of UI Class
  const ui = new UI();

  // budget form submit
  BudgetForm.addEventListener('submit', function (event){
    event.preventDefault();

    ui.submitBudgetForm();
    

  })

  // Expense form submit
  ExpenseForm.addEventListener('submit', function (event) {

    event.preventDefault();

  })

  // expense click event
  ExpenseList.addEventListener('click', function () {
  })
}

document.addEventListener('DOMContentLoaded', function() {
  eventListeners();
})
