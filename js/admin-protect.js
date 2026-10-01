const adminAccessToken = localStorage.getItem('accessToken')

if (!adminAccessToken) {
    window.location.href = '../login.html'
} else {
    checkAdminAccess(adminAccessToken)
}

function checkAdminAccess(token) {
    fetch(`${API_BASE_URL}/api/users/me`, {
        headers: {
            'X-API-KEY': API_KEY,
            'Authorization': `Bearer ${token}`
        }
    })
        .then(function (response) {
            if (response.ok) {
                return response.json()
            }


            return refreshAndRetry()
        })
        .then(function (result) {
            if (result.data.email !== ADMIN_EMAIL) {
                throw new Error('not admin')
            }
        })
        .catch(function () {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '../../index.html'
        })
}

function refreshAndRetry() {
    const refreshToken = localStorage.getItem('refreshToken')

    if (!refreshToken) {
        return Promise.reject(new Error('no refresh token'))
    }

    return fetch(`${API_BASE_URL}/api/auth/refresh-access-token/${refreshToken}`, {
        method: 'POST',
        headers: {
            'X-API-KEY': API_KEY
        }
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error('refresh failed')
            }
            return response.json()
        })
        .then(function (result) {

            localStorage.setItem('accessToken', result.data.accessToken)
            localStorage.setItem('refreshToken', result.data.refreshToken)


            return fetch(`${API_BASE_URL}/api/users/me`, {
                headers: {
                    'X-API-KEY': API_KEY,
                    'Authorization': `Bearer ${result.data.accessToken}`
                }
            }).then(function (response) {
                if (!response.ok) {
                    throw new Error('still unauthorized')
                }
                return response.json()
            })
        })
}
