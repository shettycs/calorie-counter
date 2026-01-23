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

    const foodDatabase = { /* Your original foodDatabase */ };

    logoutButton.addEventListener('click', () => {
        clearToken();
        window.location.href = 'index.html';
    });

    foodNameInput.addEventListener('input', () => {
        const selectedFood = foodNameInput.value;
        caloriesInput.value = foodDatabase[selectedFood] || '';
    });

    // Fetch profile and setup
    let profile = await fetchProfile();
    if (!profile) {
        showProfileForm();
    } else {
        updateGoalDisplay(profile.daily_calories);
        goalSelection.style.display = 'none'; // Hide if set
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

    // Add food
    foodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const foodName = foodNameInput.value;
        const calories = parseInt(caloriesInput.value);
        if (foodName && calories) {
            try {
                await fetch('http://localhost:3000/api/food', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
                    body: JSON.stringify({ food_name: foodName, calories })
                });
                loadFoodHistory(); // Refresh
            } catch (err) {
                alert('Error adding food');
            }
        }
    });

    async function loadFoodHistory() {
        try {
            const res = await fetch('http://localhost:3000/api/food', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const entries = await res.json();
            // Group by date
            const grouped = entries.reduce((acc, entry) => {
                acc[entry.entry_date] = acc[entry.entry_date] || [];
                acc[entry.entry_date].push(entry);
                return acc;
            }, {});

            historySection.innerHTML = '';
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
                            headers: { 'Authorization': `Bearer ${getToken()}` }
                        });
                        loadFoodHistory();
                    });
                    ul.appendChild(li);
                });
                dayDiv.querySelector('h4').addEventListener('click', () => dayDiv.classList.toggle('open'));
                historySection.appendChild(dayDiv);
            });

            // Update current day total (assume today is foodList)
            const today = new Date().toISOString().split('T')[0];
            const todayEntries = grouped[today] || [];
            let totalCalories = todayEntries.reduce((sum, e) => sum + e.calories, 0);
            totalCaloriesDisplay.textContent = totalCalories;
            updateGoalStatus(totalCalories, profile?.daily_calories || 0);
        } catch (err) {
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
});