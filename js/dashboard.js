document.addEventListener('DOMContentLoaded', async () => {
    const logoutButton = document.getElementById('logout');
    const foodForm = document.getElementById('foodForm');
    const foodNameInput = document.getElementById('foodName');
    const caloriesInput = document.getElementById('calories');
    const foodList = document.getElementById('foodList');
    const totalCaloriesDisplay = document.getElementById('totalCalories');
    const goalStatus = document.getElementById('goalStatus');
    const goalSelection = document.querySelector('.goal-selection');
    const historySection = document.getElementById('history'); // New

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
        "Waffles": 280
     };
    const token = localStorage.getItem('token');
    
    if (!token) {
        alert("Please sign in first");
        window.location.href = 'signin.html';
        return;
    }

    // Optional: verify token by calling a protected endpoint
    try {
        const res = await fetch('http://localhost:3000/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) {
            localStorage.removeItem('token');
            window.location.href = 'signin.html';
            return;
        }
        
        // proceed with normal dashboard loading
        const profile = await res.json();
        // ... rest of your code ...
        
    } catch (err) {
        console.error(err);
        localStorage.removeItem('token');
        window.location.href = 'signin.html';
    }

    logoutButton.addEventListener('click', () => {
        clearToken();
        window.location.href = 'index.html';
    });

    // Auto-fill calories - improved with change event for dropdown selection
    function updateCalories() {
        const selectedFood = foodNameInput.value.trim();
        console.log('Food input:', selectedFood); // Debug - check console

        if (!selectedFood) {
            caloriesInput.value = '';
            return;
        }

        const calories = foodDatabase[selectedFood];
        if (calories !== undefined) {
            caloriesInput.value = calories;
            console.log('Calories filled:', calories);
        } else {
            caloriesInput.value = '';
            console.log('No match for:', selectedFood);
        }
    }

    foodNameInput.addEventListener('input', updateCalories);
    foodNameInput.addEventListener('change', updateCalories); // Crucial for dropdown click

    // Fetch profile and setup
    let profile = await fetchProfile();
    if (!profile) {
        showProfileForm();
    } else {
        updateGoalDisplay(profile.daily_calories);
        if (goalSelection) {
        goalSelection.style.display = 'none';
    }
    }

    // Load food history
    await loadFoodHistory();

    // Set profile form submit
    function showProfileForm() {
        // Add form elements dynamically or assume added in HTML
        const profileForm = document.createElement('form');
        profileForm.innerHTML = `
            <h2>Set Your Profile</h2>
            <label for="goal">Goal:</label>
            <select id="goal" required>
                <option value="maintain">Maintain Weight</option>
                <option value="lose">Lose Weight</option>
                <option value="gain">Gain Weight</option>
            </select>
            <label for="weight">Weight (kg):</label>
            <input type="number" id="weight" required>
            <label for="height">Height (cm):</label>
            <input type="number" id="height" required>
            <label for="age">Age:</label>
            <input type="number" id="age" required>
            <label for="gender">Gender:</label>
            <select id="gender" required>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
            <button type="submit">Save Profile</button>
        `;
        goalSelection.appendChild(profileForm);
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const body = {
                goal: document.getElementById('goal').value,
                weight: parseFloat(document.getElementById('weight').value),
                height: parseFloat(document.getElementById('height').value),
                age: parseInt(document.getElementById('age').value),
                gender: document.getElementById('gender').value
            };
            try {
                const res = await fetch('http://localhost:3000/api/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                    body: JSON.stringify(body)
                });
                const data = await res.json();
                if (res.ok) {
                    profileForm.remove();
                    updateGoalDisplay(data.daily_calories);
                } else {
                    alert(data.error);
                }
            } catch (err) {
                alert('Error saving profile');
            }
        });
    }

    function updateGoalDisplay(dailyCal) {
        goalStatus.textContent = `Suggested Daily Calories: ${dailyCal} kcal`;
    }

    foodForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const foodName = foodNameInput.value.trim();
        const caloriesStr = caloriesInput.value.trim();
        const calories = parseInt(caloriesStr, 10);

        console.log('Add button clicked - Food:', foodName, 'Calories:', calories); // Debug 1

        if (!foodName || isNaN(calories) || calories <= 0) {
            alert("Please select a valid food and calories.");
            return;
        }

        const currentTotal = parseInt(totalCaloriesDisplay.textContent, 10) || 0;
        const dailyGoal = profile?.daily_calories || 0;

        if (dailyGoal > 0 && currentTotal >= dailyGoal) {
            alert(
                `You've already reached or exceeded your daily goal (${dailyGoal} kcal).\n\n` +
                `No more food can be added today. The counter will reset tomorrow.\n\n` +
                `Tip: Edit your profile to adjust your goal if needed.`
            );
            return;
        }

        if (dailyGoal > 0 && (currentTotal + calories) > dailyGoal) {
            const overBy = (currentTotal + calories) - dailyGoal;
            const confirmAdd = confirm(
                `This will exceed your daily goal (${dailyGoal} kcal) by ${overBy} kcal.\n\nAdd anyway?`
            );
            if (!confirmAdd) return;
        }

        try {
            console.log('Sending POST request...'); // Debug 2

            const response = await fetch('http://localhost:3000/api/food', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ food_name: foodName, calories })
            });

            console.log('Response status:', response.status); // Debug 3 - should be 201 or 200

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error('Server error:', response.status, errData); // Debug 4
                throw new Error(errData.error || `Server error ${response.status}`);
            }

            console.log('Food added to DB successfully!'); // Debug 5

            // Clear inputs
            foodNameInput.value = '';
            caloriesInput.value = '';

            // Refresh total & list
            await loadFoodHistory();

        } catch (err) {
            console.error('Add failed:', err.message); // Debug 6
            alert('Error adding food: ' + (err.message || 'Unknown error'));
        }
    });

    async function loadFoodHistory() {
    try {
        const res = await fetch('http://localhost:3000/api/food', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const entries = await res.json();
        console.log('Fetched entries:', entries); // Debug - check if new foods appear

        // Group by date
        const grouped = entries.reduce((acc, entry) => {
            acc[entry.entry_date] = acc[entry.entry_date] || [];
            acc[entry.entry_date].push(entry);
            return acc;
        }, {});

        // Clear history section
        historySection.innerHTML = '';

        // Add days
        Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a)).forEach(date => {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('history-day');
            let dayTotal = grouped[date].reduce((sum, e) => sum + e.calories, 0);
            dayDiv.innerHTML = `<h4>${date} - Total: ${dayTotal} kcal</h4><ul></ul>`;
            const ul = dayDiv.querySelector('ul');
            grouped[date].forEach(entry => {
                const li = document.createElement('li');
                li.innerHTML = `${entry.food_name} - ${entry.calories} kcal <button class="remove-btn" data-id="${entry.id}">Remove</button>`;
                li.querySelector('.remove-btn').addEventListener('click', async () => {
                    await fetch(`http://localhost:3000/api/food/${entry.id}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    loadFoodHistory();
                });
                ul.appendChild(li);
            });
            dayDiv.querySelector('h4').addEventListener('click', () => dayDiv.classList.toggle('open'));
            historySection.appendChild(dayDiv);
        });

        // Fix: Always update today's total
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = grouped[today] || [];
        let totalCalories = todayEntries.reduce((sum, e) => sum + e.calories, 0);
        console.log('Todays total calculated:', totalCalories); // Debug
        totalCaloriesDisplay.textContent = totalCalories; // This line must run

        // Update goal status
        updateGoalStatus(totalCalories, profile?.daily_calories || 0);
    } catch (err) {
        console.error('Load history error:', err);
        alert('Error loading history');
    }
}

    function updateGoalStatus(total, goal) {
        if (goal === 0) return;
        let msg = '';
        if (total < goal) msg = `Under by ${goal - total} kcal.`;
        else if (total === goal) msg = `On track!`;
        else msg = `Over by ${total - goal} kcal.`;
        goalStatus.textContent = msg;
    }

    async function fetchProfile() {
        try {
            const res = await fetch('http://localhost:3000/api/profile', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            return await res.json();
        } catch (err) {
            return null;
        }
    }

    if (dailyGoal > 0 && currentTotal >= dailyGoal) {
        alert(
            `You've already reached or exceeded your daily goal (${dailyGoal} kcal).\n\n` +
            `No more food can be added today. The counter will reset tomorrow.\n\n` +
            `Tip: Edit your profile to adjust your goal if needed.`
        );
        return; // Stop adding
    }

    // Load profile form for profile page
    if (window.location.pathname.includes('profile.html')) {
        showProfileForm();  // Shows the form on profile page
        if (profile) {
            // Pre-fill form with current profile
            document.getElementById('goal').value = profile.goal;
            document.getElementById('weight').value = profile.weight;
            document.getElementById('height').value = profile.height;
            document.getElementById('age').value = profile.age;
            document.getElementById('gender').value = profile.gender;
        }
    }

    // Load history for history page
    if (window.location.pathname.includes('history.html')) {
        await loadFoodHistory();  // Loads all days grouped
    }
    document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });
});