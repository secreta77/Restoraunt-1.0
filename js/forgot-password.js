document.getElementById('forgotForm').addEventListener('submit',function(event){
    event.preventDefault();



const email = document.getElementById('email').value



fetch(`${API_BASE_URL}/api/auth/forgot-password/${email}`,{
    method:'POST',
    headers:{
        'X-API-KEY':API_KEY
    }
})
.then(function(response){
    return response.json()
})
.then(function(result){
    if(result.detail){
        showToast('error' ,result.detail)
        return
    }


    showToast('Check your email', 'We sent a password reset link to ' + email);
})

})