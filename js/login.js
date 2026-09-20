document.getElementById('loginForm').addEventListener('submit',function(event){
    event.preventDefault();

const email = document.getElementById('email').value
const password  = document.getElementById('password').value

fetch(`${API_BASE_URL}/api/auth/login`,{
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
      alert(result.detail || 'Login failed');
      return;
    }

localStorage.setItem('accessToken', result.data.accessToken)
localStorage.setItem('refreshToken', result.data.refreshToken);

window.location.href = '../index.html';
})
})