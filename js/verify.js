const urlParams = new URLSearchParams(window.location.search);
const email = urlParams.get('email');

document.getElementById('userEmail').textContent = email;

document.getElementById('verifyForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const code = document.getElementById('code').value;

    fetch(`${API_BASE_URL}/api/auth/verify-email`, {
        method: 'PUT',
        headers: {
            'X-API-KEY': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, code: code })
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            if (result.detail) {
                alert(result.detail);
                return;
            }

            alert('Email verified! You can now sign in.');
            window.location.href = './login.html';
        });
});

document.getElementById('resendCode').addEventListener('click', function (event) {
    event.preventDefault();

    fetch(`${API_BASE_URL}/api/auth/resend-email-verification/${email}`, {
        method: 'POST',
        headers: {
            'X-API-KEY': API_KEY
        }
    })
        .then(function (response) {
            return response.json();
        })
        .then(function () {
            showToast('Code sent!', 'A new verification code has been sent to your email');
        });
});