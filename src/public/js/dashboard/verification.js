document.getElementById('verificationForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const code = document.getElementById('code').value.trim();
    const email = document.getElementById('email').value.trim();
    const errorDiv = document.getElementById('verification-error');
    errorDiv.classList.add('hidden');
    try {
        const response = await fetch('/api/authentication/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code }),
        });
        const data = await response.json();
        if (response.ok) {
            window.location.href = '/dashboard/guest';
        } else {
            errorDiv.textContent = data.message;
            errorDiv.classList.remove('hidden');
        }
    } catch {
        errorDiv.textContent = 'Error verifying code';
        errorDiv.classList.remove('hidden');
    }
});