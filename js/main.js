function getToken() {
    return localStorage.getItem('token');
}

function setToken(token) {
    localStorage.setItem('token', token);
}

function clearToken() {
    localStorage.removeItem('token');
}

function isLoggedIn() {
    return !!getToken();
}

// For protected pages, redirect if not logged in
if (window.location.pathname.includes('dashboard.html') && !isLoggedIn()) {
    window.location.href = 'index.html';
}