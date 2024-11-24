document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout');
    const foodForm = document.getElementById('foodForm');
    const foodNameInput = document.getElementById('foodName');
    const caloriesInput = document.getElementById('calories');
    const foodList = document.getElementById('foodList');
    const totalCaloriesDisplay = document.getElementById('totalCalories');
    const caloriesPerDayInput = document.getElementById('calories-per-day');
    const setGoalButton = document.getElementById('setGoal');
    const goalStatus = document.getElementById('goalStatus');
    const goalDropdown = document.getElementById('goal');

    let totalCalories = 0;
    let dailyGoal = 0;

    // Food Database
    const foodDatabase = {
        "Apple": 95,
        "Banana": 105,
        "Orange": 62,
        "Broccoli": 55,
        "Chicken Breast": 165,
        "Egg": 78,
        "Bagel": 245,
        "Biscuit": 120,
        "Breadsticks": 150,
        "Bread white": 79,
        "Bread whole wheat": 81,
        "Cereal": 110,
        "Cookie (oatmeal raisin)(1)": 65,
        "Cornbread (1 square)": 190,
        "Cream of Rice (3/4 cup)": 120,
        "Cream of Wheat (3/4 cup)": 110,
        "English Muffin": 120,
        "Fig Bar": 110,
        "Waffles": 280,
    };

    // Log Out functionality
    logoutButton.addEventListener('click', function () {
        window.location.href = "index.html";
    });

    // Update calorie input when selecting food from datalist
    foodNameInput.addEventListener('input', function () {
        const selectedFood = foodNameInput.value;
        caloriesInput.value = foodDatabase[selectedFood] || '';
    });

    // Set Goal
    setGoalButton.addEventListener('click', function () {
        dailyGoal = parseInt(caloriesPerDayInput.value.trim(), 10);
        if (!dailyGoal || isNaN(dailyGoal)) {
            alert("Please enter a valid calorie goal.");
            return;
        }
        const goalType = goalDropdown.value;
        alert(`Goal set: ${goalType} with ${dailyGoal} calories per day.`);
        updateGoalStatus();
    });

    // Add Food
    foodForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const foodName = foodNameInput.value;
        const calories = parseInt(caloriesInput.value.trim(), 10);
        if (foodName && calories && !isNaN(calories)) {
            const listItem = document.createElement('li');
            listItem.innerHTML = `${foodName} - ${calories} kcal <button class="remove-btn">Remove</button>`;
            foodList.appendChild(listItem);

            // Update total calories
            totalCalories += calories;
            updateTotalCaloriesDisplay();

            // Add remove functionality
            listItem.querySelector('.remove-btn').addEventListener('click', function () {
                totalCalories -= calories;
                listItem.remove();
                updateTotalCaloriesDisplay();
                updateGoalStatus();
            });
        }
    });

    // Update Total Calories Display
    function updateTotalCaloriesDisplay() {
        totalCaloriesDisplay.textContent = totalCalories;
    }

    // Update Goal Status
    function updateGoalStatus() {
        if (dailyGoal === 0) return;

        let statusMessage = '';
        if (totalCalories < dailyGoal) {
            statusMessage = `You are under your calorie goal by ${dailyGoal - totalCalories} kcal.`;
        } else if (totalCalories === dailyGoal) {
            statusMessage = `You are exactly on track with your calorie goal!`;
        } else {
            statusMessage = `You have exceeded your calorie goal by ${totalCalories - dailyGoal} kcal.`;
        }
        goalStatus.textContent = statusMessage;
    }
});
