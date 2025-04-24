document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const messageDiv = document.getElementById('message');

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        const data = await response.json();
        
        messageDiv.textContent = data.message;
        messageDiv.className = 'message ' + (response.ok ? 'success' : 'error');
        messageDiv.style.display = 'block';

        if (response.ok) {
            document.getElementById('loginForm').reset();
            // Redirect to dashboard after successful login
            setTimeout(() => {
                window.location.href = data.redirect;
            }, 1000);
        }
    } catch (error) {
        messageDiv.textContent = 'An error occurred. Please try again.';
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
    }
}); 