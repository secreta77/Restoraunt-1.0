document.getElementById('registerForm').addEventListener('submit',function(event){
    event.preventDefault();


const firtsName = document.getElementById('firstName')
const lastName = document.getElementById('lastName')
const email = document.getElementById('email')
const password = document.getElementById('password')


fetch(`${API_BASE_URL}/api/auth/register`,{
    method:'POST',
    headers:{
        'X-API-LEY':API_KEY,
        'Content-Type':'application/json'
    },
    body:JSON.stringify({
        firtsName:firtsName,
        lastName:lastName,
        email:email,
        password:password
    })
})
.then(function(response){
    return response.json();
})

.then(function(result){
    if(!result.data){
        alert(result.detail || 'Registration failed')
        return
    }

    alert('Account created! Please check your email to verify your account.');
    window.location.href = './login.html';
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