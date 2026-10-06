document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'X-API-KEY': API_KEY,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, password: password })

    })
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            if (!result.data) {
                showToast('Login failed', result.detail || 'Please check your email and password.');
                return;
            }

            localStorage.setItem('accessToken', result.data.accessToken)
            localStorage.setItem('refreshToken', result.data.refreshToken);

            window.location.href = '../index.html';
        })
})


// პაროლისთვის 
document.getElementById('togglePassword').addEventListener('click', function () {
    const passwordInput = document.getElementById('password')

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text'
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');

    } else {
        passwordInput.type = 'password';
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
    }
})