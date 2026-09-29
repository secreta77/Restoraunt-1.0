const adminAccessToken = localStorage.getItem('accessToken')

if(!adminAccessToken){
    window.location.href = '../login.html'
}else{
    fetch(`${API_BASE_URL}/api/users/me`,{
        headers: {
            'X-API-KEY': API_KEY,
            'Authorization': `Bearer ${adminAccessToken}`
        }
    })
    .then(function(response){
        if(!response.ok){
            throw new Error('unauthorized')
        }
        return response.json()
    })
    .then(function(result){
        if(result.data.email !== ADMIN_EMAIL){
            throw new Error('dont match')

        }

    })
    .catch(function () {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '../../index.html'
    })


}
