document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    if (!form) {
        console.error("No <form> found on this page");
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const isSignup = window.location.pathname.includes('signup.html');
        const email = document.getElementById('email')?.value.trim();
        const password = document.getElementById('password')?.value.trim();
        const confirmPw = document.getElementById('confirmPassword')?.value.trim();

        if (!email || !password) {
            alert("Email and password are required");
            return;
        }

        if (isSignup && password !== confirmPw) {
            alert("Passwords do not match");
            return;
        }

        let payload = { email, password };
        if (isSignup) {
            payload.username = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') || 'user';
        }

        const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';

        try {
            console.log(`Attempting ${isSignup ? 'signup' : 'login'} with email: ${email}`);
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log('Response status:', response.status, 'Data:', data);

            if (response.ok) {
                if (!isSignup) {
                    // Login success
                    localStorage.setItem('token', data.token);
                    console.log('Token saved:', data.token.substring(0, 20) + '...');
                    console.log('Current path:', window.location.pathname);
                    alert("Login successful! Redirecting...");
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 500);  // Redirect after 0.5 seconds

                } else {
                    alert("Account created! Please sign in.");
                    window.location.href = 'signin.html';
                }
            } else {
                alert(data.error || "Login failed. Check credentials.");
                console.warn("Server error:", data);
            }
        } catch (err) {
            console.error("Network/fetch error:", err);
            alert("Cannot connect to server. Is backend running on port 3000?");
        }
    });
});