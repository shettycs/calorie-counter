// js/auth.js
// Complete authentication handler for both signin.html and signup.html

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) {
        console.error("No <form> element found on this page");
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent page reload / default form submission

        // ────────────────────────────────────────────────
        // Get form fields using IDs (must match your HTML)
        // ────────────────────────────────────────────────
        const emailInput       = document.getElementById('email');
        const passwordInput    = document.getElementById('password');
        const confirmInput     = document.getElementById('confirmPassword'); // only exists on signup

        // Basic validation – fields must exist and have values
        if (!emailInput || !passwordInput) {
            alert("Email or password field is missing in HTML");
            console.error("Missing input fields: email or password");
            return;
        }

        const email    = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            alert("Please enter both email and password");
            return;
        }

        // Determine if this is signup or signin
        const isSignup = window.location.pathname.includes('signup.html') ||
                         window.location.pathname.includes('signup');

        let username = null;
        let confirmPassword = null;

        if (isSignup) {
            if (!confirmInput) {
                alert("Confirm password field is missing on signup page");
                console.error("confirmPassword input not found");
                return;
            }
            confirmPassword = confirmInput.value.trim();

            if (password !== confirmPassword) {
                alert("Passwords do not match");
                return;
            }

            // Generate simple username from email (you can change this logic)
            username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || 'user';
        }

        // Prepare payload
        const payload = isSignup 
            ? { username, email, password }
            : { email, password };

        const endpoint = isSignup 
            ? '/api/auth/signup'
            : '/api/auth/login';

        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                if (!isSignup) {
                    // Login successful → save token
                    localStorage.setItem('token', data.token);
                    alert("Login successful! Redirecting to dashboard...");
                    window.location.href = 'dashboard.html';
                } else {
                    // Signup successful
                    alert("Account created successfully!\nPlease sign in with your new credentials.");
                    window.location.href = 'signin.html';
                }
            } else {
                // Server returned error (e.g. user exists, wrong credentials)
                alert(data.error || "Something went wrong. Please try again.");
                console.warn("Server response:", data);
            }
        } catch (err) {
            console.error("Fetch error:", err);
            alert("Cannot connect to the server.\n\nPossible reasons:\n• Backend not running\n• Wrong port (should be 3000)\n• Network issue");
        }
    });
});