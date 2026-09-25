// We will create modules first
// 1-BudgetController 2-UIController 3-Controller

var BudgetController=(function(){

    var Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1
    };

    Expense.prototype.calcPercentage = function(totalIncome) {

        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome)*100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };

    var calculateTotal = function(type) {
        var sum=0;
        data.allItems[type].forEach(function(current) {
            sum+=current.value;
        });
        data.totals[type]=sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    };

    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into our data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem;
        },

        calculateBudget : function(){
            // Calculate total expense and income
            calculateTotal("exp");
            calculateTotal("inc");

            // calculate budget income-expense
            data.budget=data.totals.inc-data.totals.exp;

            // calculate percentage
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            }
            else{
                data.percentage = -1;
            }
            
        },

        calculatePercentage : function() {

            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentage: function() {
            
            var allPer = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPer;
        },

        deleteItem : function(type,id) {
            var ids,index;

            ids = data.allItems[type].map(function(current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index!== -1) {

                data.allItems[type].splice(index,1);
            }
        },

        budgetCtrl : function() {
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            };
        },

        testing: function(){
            console.log(data);
        }
    };


})();





var UIController=(function(){

    var DOMstring = {
        inputType:".add__type",
        inputDescription:".add__description",
        inputValue:".add__value",
        inputBtn:".add__btn",
        incomeContainer:".income__list",
        expenseContainer : ".expenses__list",
        budgetLabel : ".budget__value",
        incomeLabel : ".budget__income--value",
        expenseLabel : ".budget__expenses--value",
        percentageLabel : ".budget__expenses--percentage",
        container : ".container",
        expensePercentage : ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    var formatNumber = function(num,type) {
        var numSplit,int,dec,sign;

        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split(".");   // To seperate int and decimal

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
        }
        
        dec = numSplit[1];

        sign = type === "exp" ? "-" : "+" ;

        return sign +" "+ int + "." + dec;
    };

    nodeForEach = function(list,callback) {
        for(var i=0;i<list.length;i++) {
            callback(list[i],i);
        }
    
    };

    return {
        getInput:function(){
            return {
                type:document.querySelector(DOMstring.inputType).value,  // it can be either inc or exp
                discription:document.querySelector(DOMstring.inputDescription).value,
                value:parseFloat(document.querySelector(DOMstring.inputValue).value)  
            };
        },
        addListItem: function(obj,type){
            var html,newHtml,element;

            // Create html string with placeholder text
            if(type==="inc"){
                element=DOMstring.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if(type==="exp"){
                element=DOMstring.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // Replace the html string with actual data
            newHtml = html.replace("%id%",obj.id);
            newHtml = newHtml.replace("%description%",obj.description);
            newHtml = newHtml.replace("%value%",formatNumber(obj.value,type));

            // Insert html to the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend",newHtml);
        },

        deleteListItem : function(selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        
        },

        clearFields: function(){
            var fields,fieldArr;

            fields = document.querySelectorAll(DOMstring.inputDescription + "," + DOMstring.inputValue);

            fieldArr = Array.prototype.slice.call(fields);

            fieldArr.forEach(function(current, index, array) {
                current.value="";
            });

            fieldArr[0].focus();
        },

        displayBudget : function(obj){
            var type;

            obj.budget > 0 ? type = "inc" : type = "exp";

            document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget,type);            
            document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(obj.totalInc,"inc");
            document.querySelector(DOMstring.expenseLabel).textContent = formatNumber(obj.totalExp,"exp");
                        
            if(obj.percentage > 0) {
                document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + "%";
            }
            else {
                document.querySelector(DOMstring.percentageLabel).textContent = "---";
            }

        },

        displayPercentage : function(percentage) {

            var fields = document.querySelectorAll(DOMstring.expensePercentage);

            nodeForEach(fields, function(current, index) {
                if(percentage[index] > 0){
                    current.textContent = percentage[index] + "%";
                }
                else { 
                    current.textContent = "---";
                }
                
            })
        
        },

        displayMonth: function() {
            var now,month,year,months

            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMstring.dateLabel).textContent = months[month] + " " + year;
        },

        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstring.inputType + ',' +
                DOMstring.inputDescription + ',' +
                DOMstring.inputValue);
            
                nodeForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstring.inputBtn).classList.toggle('red');
            
        },

        getDOMstrings:function(){
            return DOMstring;
        }
    };
})();




// GLOBAL APP CONTROLLER
var Controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListerners = function() {
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click",ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }


   
    var ctrlAddItem=function() {
        
        // 1. get the field input data
        var input=UICtrl.getInput();

        if(input.description!=="" && !isNaN(input.value) && input.value > 0) {

            // 2. Add the items to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.discription, input.value);

            // 3. Add item to the UI
            UICtrl.addListItem(newItem,input.type);

            // 4. Clear UI fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentage
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function(event) { 
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from Data structure
            budgetCtrl.deleteItem(type,ID);

            // 2. Delete the item From UI
            UICtrl.deleteListItem(itemID);

            // 3. Update the budget
            updateBudget();

            // 4. Calculate and update percentage
            updatePercentage();
        }
    };

    var updateBudget = function() {
        // 1. Calculate budget
        budgetCtrl.calculateBudget();

        // 2. return budget
        var budget = budgetCtrl.budgetCtrl();

        // 3. Display the budget in the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentage = function() {

        // 1. Calculate percentage
        budgetCtrl.calculatePercentage();

        // 2. Read percentage from the budget controller
        var percentages = budgetCtrl.getPercentage();

        // 3. Update the UI with the new percentage
        UICtrl.displayPercentage(percentages);
    };

    return {
        init: function(){
            console.log("Application has started!!");
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : -1
            });
            setupEventListerners();

        }
    };

    

})(BudgetController,UIController);

Controller.init();