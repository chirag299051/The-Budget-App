let budgetController = (function() {

    let Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    let Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    let calculateTotal = function(type) {
        let sum = data.allItems[type].reduce((sum, x) => sum + x.value, 0);
        data.totals[type] = sum;
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val) {
            let newItem, ID;
            
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            }
            else {
                ID = 0;
            }

            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function(type, id) {
            let ids, index;

            ids = data.allItems[type].map(x => x.id);

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;

            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(x => x.calcPercentage(data.totals.inc))
        },

        getPercentages: function() {
            return data.allItems.exp.map(x => x.getPercentage())
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                totalPercentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }
    }
        


})();

let UIController = (function() {

    let DOMStrings = {
        type: '.add__type',
        description: '.add__description',
        value: '.add__value',
        addBtn: '.add__btn',
        expensesContainer: '.expenses__list',
        incomeContainer: '.income__list',
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    }

    let formatNumbers = function(num, type) {
        num = num.toLocaleString(
            "en-IN", 
            { 
                style: "decimal", 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        return (type === 'exp' ? '-' : '+') + ' ' + num;
    }

    return {

        getInput: function() {
            return {
                type: document.querySelector(DOMStrings.type).value,
                description: document.querySelector(DOMStrings.description).value,
                value: parseFloat(document.querySelector(DOMStrings.value).value),
            }
        },

        addListItem: function(obj, type) {
            let html, element;

            if(type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = `<div class="item clearfix" id="exp-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">${formatNumbers(obj.value, type)}</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`
            }
            else if(type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = `<div class="item clearfix" id="inc-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix"><div class="item__value">${formatNumbers(obj.value, type)}</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`
            }

            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },

        deleteListItem: function(selectorId) {
            let el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            let fields = document.querySelectorAll(DOMStrings.description + ', ' + DOMStrings.value);
            let fieldsArr = Array.from(fields);

            fieldsArr.forEach(x => x.value = '');
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumbers(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumbers(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumbers(obj.totalExp, 'exp');
            if(obj.totalPercentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.totalPercentage + '%';
            }
            else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
            
        },

        displayPercentages: function(percentages) {
            let fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
            let fieldsArr = Array.from(fields);
            
            fieldsArr.forEach((x, i) => {
                if(percentages[i] > 0) {
                    x.textContent = percentages[i] + '%';
                }
                else {
                    x.textContent = '---';
                }
            })
        },

        displayMonth: function() {
            let now = new Date();
            let year = now.getFullYear();

            document.querySelector(DOMStrings.dateLabel).textContent = year;
        },

        getDOMStrings: function() {
            return DOMStrings;
        }
    }
})();

let controller = (function(budgetCtrl, UICtrl) {

    function updateBudget() {
        budgetCtrl.calculateBudget();
        let budget = budgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
    }

    function updatePercentages() {
        budgetCtrl.calculatePercentages();

        let percentages = budgetCtrl.getPercentages();
        UICtrl.displayPercentages(percentages);
    }

    function ctrlAddItem() {
        let input = UICtrl.getInput();
        
        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
            let newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            UICtrl.addListItem(newItem, input.type);

            UICtrl.clearFields();

            updateBudget();

            updatePercentages();

            return newItem;
        }
    }

    function ctrlDeleteItem(e) {
        let type, ID;
        let itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;
 
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            budgetCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemID);
            updateBudget();

            updatePercentages();
        }
    }

    function setupEventListeners() {
        let DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(e) {
            if(e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    }

    return {
        init: function() {
            UICtrl.displayMonth();

            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                totalPercentage: -1
            })

            setupEventListeners();
        }
    }
    

})(budgetController, UIController);

controller.init();