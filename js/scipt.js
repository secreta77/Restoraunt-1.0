const accessToken = localStorage.getItem('accessToken')

if (accessToken) {
    document.getElementById('userMenu').hidden = false
    fetch(`${API_BASE_URL}/api/users/me`,{
        headers:{
            'X-API-KEY':API_KEY,
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(function(response){
        return response.json()
    })
    .then(function(result){
        document.getElementById('userNameLabel').textContent=result.data.firstName +' '+ result.data.lastName;
    })


} else {
    document.getElementById('authButtons').hidden = false
}

document.getElementById('avatarBtn').addEventListener('click', function () {
    const dropDown = document.getElementById('userDropdown')
    dropDown.hidden = !dropDown.hidden

})

document.getElementById('logoutBtn').addEventListener('click',function(){
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.reload()

})


