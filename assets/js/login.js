document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const viewerLink = document.querySelector('.view-only-link');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.textContent = ''; // Clear previous errors

        const username = e.target.username.value;
        const password = e.target.password.value;

        try {
            // STEP 1: Send the credentials to your backend API
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            // STEP 2: The backend confirms the login is successful
            const data = await response.json();

            if (data.success) {
                // STEP 3: Set the user role based on the backend's response
                // and redirect to the dashboard.
                sessionStorage.setItem('userRole', data.role || 'viewer');
                window.location.href = 'index.html';
            } else {
                throw new Error(data.message || 'Invalid credentials');
            }

        } catch (error) {
            errorMessage.textContent = error.message;
        }
    });

    viewerLink.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.setItem('userRole', 'viewer');
        window.location.href = 'index.html';
    });
});