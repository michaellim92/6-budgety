/*
challenges for self
- autofocus add description input field
-adding comma to thousands
*/

//BUDGET controller --------------------------------------

var budgetController = (function() {

  //data model for expenses and income, different
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalInc) {
    if (totalInc > 0) {
      this.percentage = Math.round((this.value / totalInc) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
      return this.percentage;
  };

  var Income  = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value; //cur.value because value is the name of the expense/income object above
    });
    data.totals[type] = sum;
  };

  var data = { //grouping all data into one entity each is better than having them all seprated, grouping all spending, percentages, totals budgetCtrl
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
  };

  return {
    addItem: function(type, des, val) { //parameter in the function is info the user needs to input to create a new item on the list.
      var newItem, ID;
      /* [ 0 1 2 3 4 ], next ID = 6, the delete function will rearrange the order of ID, IE [0 1 3 4 6], using .length property would create duplicate IDs
      using last ID + 1*/
      // create new ID
      //.length cannot be less than 0, so at the beginning, when ID = 0, allows for the data to be stored
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //create new item based on type (inc/exp)
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      //push into data structure
      data.allItems[type].push(newItem);

      //return the new element
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;
      /*
      - conventional way of selecting the id from the inc.exp array doesnt work because if we delete an element in the array, the order of the ID is changed. [1 2 4 6 8]
      - need to store the actual data array into a different array and have the elements indexed so in the array [1 2 4 6 8], if id = 6 then index = 3
      .map will return something in a new array
      */

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });
      //indexOf returns the index number of the element of the array in the input 'id'
      index = ids.indexOf(id);

      if (index !== -1) { //-1 is when the element is not found in the array

        data.allItems[type].splice(index, 1);//first argument is where we want to delete, and second argument is number of argument to delete
      };
    },

    calculateBudget: function() {

      //total income and total expenses
      calculateTotal('exp');
      calculateTotal('inc');

      //budget income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      //expense % of money spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {

      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function() {
      //use .map because we want the calcpercentages done on each of the elements and then return it. so the percentage array needs to be stored in variable to return after
      var allPerc = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function() {
      //method to returning something from data structure or module, functions to only retrive or set data
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing: function() {
      console.log(data);
    }
  }
})();



//UI controller -----------------------------------------

var uiController = (function() {

  //create a private object to hold class names, if changes are made to the names, just change it in this private object instead of all the queryselectors,
   var DOMStrings = {
     inputType: '.add__type',
     inputDescription: '.add__description',
     inputValue: '.add__value',
     inputBtn: '.add__btn',
     incomeContainer: '.income__list',
     expensesContainer: '.expenses__list',
     budgetLabel: '.budget__value',
     incomeLabel: '.budget__income--value',
     expensesLabel: '.budget__expenses--value',
     percentageLabel: '.budget__expenses--percentage',
     container: '.container',
     expensesPercLabel: '.item__percentage',
     dateLabel: '.budget__title--month'
   }

   var formatNumber = function(num, type) {
     var numSplit, int, dec;
     /*
     +/- in front of number
     exactly 2 decimal
     commas, the thousands & mils
     */
     num = Math.abs(num); //abs = absolute, removes the sign of the number
     num = num.toFixed(2); //method of the number prototype, puts 2 decimal places on the number at all times

     numSplit = num.split('.'); //splits the number from the decimal 12.50 = ['12', '50']

     int = numSplit[0];

     //at this point int is still a string, using .length prototype will count the digits, '2000' = 4
     if (int.length > 3) {
       //use substring, returns part of the string
       //start at index number 0, and read 1 element, input = 2310, result = 2,310.00
       //int.length - 3, 2000, string = 4, 4 - 3 = 1; string = 5, 5 - 3 = 2
       int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
     }

      dec = numSplit[1];

      return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
   };

   var nodeListForEach = function(list, callback) {
     //for loop that in each iteration is going call the callback function, seperate function because it is now a reusable code for the rest of the app for nodelist.
     for (var i = 0; i < list.length; i++) {
       callback(list[i], i);
     }
   };

    //methods in this module or any other module must be a public function and not private because the method is called in a different modules
    return {
      getInput: function() { //three types of user input
        return{

          // add or minus from deposit
          type: document.querySelector(DOMStrings.inputType).value, //will either be 'inc' or 'exp'

          //item description
          description: document.querySelector(DOMStrings.inputDescription).value,

          //value
          value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
        };
      },

      //obj here refers to the addItem object
      addListItem: function(obj, type) {
        var html, newHTML, element;

        // add html string with placeholder
        if (type === 'inc') {
          element = DOMStrings.incomeContainer;

          html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        } else if (type === 'exp') {
          element = DOMStrings.expensesContainer;

          html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        }
        // replace placeholder Text with real input data from newItem
        newHTML = html.replace('%id%', obj.id);
        newHTML = newHTML.replace('%description%', obj.description); //need to use newHTML because the id data is stored in newHTML and not html
        newHTML = newHTML.replace('%value%', formatNumber(obj.value, type));

        //insert the HTML into the DOM, use element.insertAdjacentHTML(position, text)
        //newHTML because it has all our data stored
        //using beforeend position will make all the html be inserted as the last child of the income/expensesContainer
        document.querySelector(element).insertAdjacentHTML('beforeend', newHTML)
      },

      deleteListItem: function(selectorID) {//needs the entire ID, inc-0
        //removeChild method, javascript can only delete a child not element
        var el = document.getElementById(selectorID);
        el.parentNode.removeChild(el);
      },

      clearFields: function() {
        var fields, fieldsArr;

        //syntax here is CSS selecting, needs a string with comma to join the strings
        //querySelectorAll doesnt return an array that we can loop, but returns a list, lists doesnt have access to the methods written,
        //use array method SLICE, returns a copy of the array that its called on, can pass a list into SLICE and let it return an array
        fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);

        //cannnot use fields.slice() because fields is still currently a list, we have to use the call method to pass the fields var into it and change it to the this var

        fieldsArr = Array.prototype.slice.call(fields); //tricks slice method to read fields var as an array, slice is a prototype method under the Array function constructor, and because slice is now a function, pass the field var into the call method to let slice prototype read it as an array

        //need to pass a callback function, callback function is applied to each of the elements in the array,
        //forEach method loops over all elements of the fieldArr then sets the value of all them to the empty string "".
        //current = current element of the array that is currently being processed, inputDescription/inputValue
        //index = index number, no. 0 to Arr.length - 1
        //array = entire array
        fieldsArr.forEach(function(current, index, array) {
          current.value = ""; //setting the value back to empty, will clear the field
        });

        //refocus the cursor back to add description field after data is input, 0 in the array refers to the inputDescription element in the fieldArr array
        fieldsArr[0].focus();
      },

      displayBudget: function(obj) {
        var type;
        obj.budget > 0 ? type = 'inc' : type = 'exp';

        document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
        document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

        if (obj.percentage > 0) {
          document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
        } else {
          document.querySelector(DOMStrings.percentageLabel).textContent = '---';
        }
      },

      displayPercentages: function(percentages) {
        //dont know how many expense items on the list, use selectorall
        //returns a nodeList, because dom tree where all the HTml elements are stored, each element is called a node
        var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

        //loop over all nodes and then change the textContent
        nodeListForEach(fields, function(current, index) {
          if (percentages[index] > 0) {
            current.textContent = percentages[index] + '%';
          } else {
            current.textContent = '---';
          }
        });
      },

      displayMonth: function() {
        var now, year, month, months;

        now = new Date();

        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        month = now.getMonth();
        year = now.getFullYear();
        document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' +   year;
      },

      changedType: function() {

        //change all the input boxes on the UI to red when the type changes to 'exp', style manipulation, add/remove css classes
        var fields = document.querySelectorAll(
          DOMStrings.inputType + ',' +  DOMStrings.inputDescription + ',' + DOMStrings.inputValue
        );

        //this returns a nodelist, but in order to loop over it, we cannot use the foreach method, but we have the nodeListForEach function used before
        nodeListForEach(fields, function(cur) {
          cur.classList.toggle('red-focus'); //each time the type changes, toggle will change it back
        });
        document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
      },

      getDOMStrings: function() {
        return DOMStrings; //exposes the DOMstring object to the public, allowing var DOM in controller module to have access to the DOMstring objects in UI module
      }
    };
})();


//GLobal App Controller ---------------------------------
// this module connects and make the UI and budget modules interact with one another, and tells the other modules what to do (getting data/calculations and then in controller module the methods are called)
var controller = (function(budgetCtrl, UICtrl) {

    //putting all the random event listeners into an initilization function to group up and organize codes better
    var setupEventListeners = function() {

      var DOM = uiController.getDOMStrings(); // variable that allows the class names in controller module to access the domstrings object in UI module.

      document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

      //event listener add to global document
      document.addEventListener('keypress', function(event) {

        if (event.keyCode === 13 || event.which === 13) {
          ctrlAddItem();
        }
      });

      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

      document.querySelector(DOM.inputType).addEventListener('change', uiController.changedType);
    };

    var updateBudget = function() {

      //1. calculate budget
        budgetController.calculateBudget();

      //2. return budget
        var budget = budgetController.getBudget();

      //3. display budget on UI
        uiController.displayBudget(budget);
    };

    var updatePercentages = function() {

      //1. calculate getPercentages
      budgetController.calculatePercentages();
      //2. read percentages from budget Controller
      var percentages = budgetController.getPercentages();
      //3. update the UI
      uiController.displayPercentages(percentages);
    };

    var ctrlAddItem = function() { //stand alone function so if people clicks or presses enter, the function is evoked without having to repeat codes
      var input, newItem;
      // 1.input data
      input = uiController.getInput();

      //2. add data to budget controller
      if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
        newItem = budgetController.addItem(input.type, input.description, input.value);

        //3. add the new item to UI
        uiController.addListItem(newItem, input.type);

        //4. clear fields
        uiController.clearFields();

        //5. calculate and update budget
        updateBudget();

        //6. update percentages
        updatePercentages();
      }
    };

    var ctrlDeleteItem = function(event) {
      var itemID, splitID, type, ID;
      //target right now is selecting the 'x' icon on the line, but to delete the entire row of data, we must select the entire parent element 'inc-0'.  going up the parent elements is called DOM traversing
      //parentNode selects an element up from the selected target
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
      console.log(itemID);

      if (itemID) {
        //contains type and ID of the listed items, inc-1. need to split the string up to the type (inc/exp) and ID (0,1,2) to allocate the method
        splitID = itemID.split('-'); //splits into strings [type, ID]
        type = splitID[0];
        ID = parseInt(splitID[1]); //parseint converts the string to a whle integer

        //1. delete item from data structure
        budgetController.deleteItem(type, ID);

        //2. delete the item from UI
        uiController.deleteListItem(itemID);

        //3. update and show the new bugdet
        updateBudget();
        updatePercentages();
      };
    };

    return {
        init: function() {
            console.log('Application has started.');
            uiController.displayMonth();
            uiController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
  })(budgetController, uiController);

controller.init();



/*

MODULE EXAMPLE

  creating a module - to organize and help group up codes with similar purposes, advantage to using modules is that, you can use each module as a stand alone section of the app and transfer it to another or add to the existing module easily.

//in this case, the UI and budgetcontroller are two different, modules, so if you want to change the UI or have a more complex app, you can still use the budgetcontroller module in the new UI, seperation of concerns (each part of the app should only be interested in doing one part independently)

var budgetController = (function() { //creating a IIFE with the bracket aroudn the function constructor, allows for data privacy because it creates a new scope that is seperate from the outside scope, so variable and function cannot be accessed by the outside

  var x = 23;

  var add = function(a) {
    return x + a;
  }

  return {
    publicTest: function(b) { //using closures to store the 'add' function from before into the publicTest function, allows the user to access the function, but not the other way aroumd.
      return add(b);
    }
  }
})();
// when the javascript runtime starts, the module is invoked because of the function operator at the very end of the module '()', then var x and add function are declared  and we return the publicTest method where its stored in. the budgetcontroller is basically a module that contains the publictest method, then the publicTest method uses the add function to perform its task.

//-------------------------------------------------

var uiController = (function() {



})();


//-------------------------------------------------

var controller = (function(budgetCtrl, UICtrl){

  var z = budgetCtrl.publicTest(5); //using a different name in the module makes it easier to change the name of the parameter 'budgetController', so instead of having to change all the elements in the function one by one, we just need to change the name one time.
  return {
    anotherPublic: function() {
      console.log(z);
    }
  }

})(budgetController, uiController);
*/
