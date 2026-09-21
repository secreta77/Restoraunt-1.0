const UrlParams = new URLSearchParams(window.location.search);
const token  = UrlParams.get('token');


document.getElementById('resetForm').addEventListener('submit',function(event){
    event.preventDefault();


const password = document.getElementById('password').value;
const confirmPassword = document.getElementById('confirmPassword').value;


if(password!==confirmPassword){
    showToast('Error', 'Passwords do not match');
    return;

}


fetch(`${API_BASE_URL}/api/auth/reset-password`,{
    method:'PUT',
    headers:{
        'X-API-KEY':API_KEY,
        'Content-type':'application/json'
    },
    body: JSON.stringify({ token: token, newPassword: password })
})
.then(function(response){
    return response.json()
})
.then(function(result){
    if(result.detail){
        showToast('Error', result.detail);
        return;
    }

    alert('Your password has been reset. You can now sign in.');
    window.location.href = './login.html';
})
})

document.getElementById('togglePassword').addEventListener('click',function(){
    const passwordInput = document.getElementById('password');



    if(passwordInput.type==='password'){
        passwordInput.type='text'
        this.classList.remove('fa-eye')
        this.classList.add('fa-eye-slash')
    }else{
        passwordInput.type='password'
        this.classList.remove('fa-eye-slash')
        this.classList.add('fa-eye')
    }
})