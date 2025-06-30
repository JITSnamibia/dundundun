document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const viewerLink = document.querySelector('.view-only-link');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = e.target.username.value;
        const password = e.target.password.value;

        // --- Simulated Authentication ---
        if (username === 'admin' && password === 'password') {
            // Set user role to 'admin' in session storage
            sessionStorage.setItem('userRole', 'admin');
            // Redirect to the dashboard
            window.location.href = 'index.html';
        } else {
            errorMessage.textContent = 'Invalid username or password.';
        }
    });

    // NEW: Handle the viewer link click
    viewerLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Set user role to 'viewer' in session storage
        sessionStorage.setItem('userRole', 'viewer');
        // Redirect to the dashboard
        window.location.href = 'index.html';
    });
});