const accessToken = localStorage.getItem('accessToken')

if (accessToken) {
    document.getElementById('userMenu').hidden = false
    fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
            'X-API-KEY': API_KEY,
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(function (response) {
            return response.json()
        })
        .then(function (result) {
            document.getElementById('userNameLabel').textContent = result.data.firstName + ' ' + result.data.lastName;
        })



} else {
    document.getElementById('authButtons').hidden = false
}

document.getElementById('avatarBtn').addEventListener('click', function () {
    const dropDown = document.getElementById('userDropdown')
    dropDown.hidden = !dropDown.hidden

})

document.getElementById('logoutBtn').addEventListener('click', function () {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.reload()

})


function updateCart() {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) {
        return
    }

    fetch(`${API_BASE_URL}/api/cart`, {
        headers: {
            'X-API-KEY': API_KEY,
            'Authorization': `Bearer ${accessToken}`

        }

    })
        .then(function (response) {
            return response.json()
        })
        .then(function (result) {
            const cartBadge = document.getElementById('cartBadge')
            if (result.data.totalItems > 0) {
                cartBadge.textContent = result.data.totalItems
                cartBadge.hidden = false

            } else {
                cartBadge.hidden = true
            }

        })
}

updateCart()





window.addEventListener('pageshow',function(event){
    if(event.persisted){
        updateCart()
    }
})


