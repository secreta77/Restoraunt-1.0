function logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    window.location.reload()
}

function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken')

    if (!refreshToken) {
        logout()
        return
    }

    fetch(`${API_BASE_URL}/api/auth/refresh-access-token/${refreshToken}`, {
        method: 'POST',
        headers: {
            'X-API-KEY': API_KEY
        }
    })
        .then(function (response) {
            if (!response.ok) {
                logout()
                return null
            }
            return response.json()
        })
        .then(function (result) {
            if (!result) {
                return
            }
            localStorage.setItem('accessToken', result.data.accessToken)
            localStorage.setItem('refreshToken', result.data.refreshToken)
            window.location.reload()
        })
}

const accessToken = localStorage.getItem('accessToken')

if (accessToken) {
    fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
            'X-API-KEY': API_KEY,
            'Authorization': `Bearer ${accessToken}`
        }
    })
        .then(function (response) {
            if (!response.ok) {
                refreshAccessToken()
                return null
            }

            document.getElementById('userMenu').hidden = false
            return response.json()
        })
        .then(function (result) {
            if (!result) {
                return
            }
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
    logout()
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
            if (!response.ok) {
                return null
            }
            return response.json()
        })
        .then(function (result) {
            if (!result) {
                return
            }
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


