
// profile
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

let originalFirstName = ''
let originalLastName = ''
let originalPhoneNumber = ''
let originalAddress = ''
let originalAge = ''
let originalPicture = ''


function updateProfilePicture(url) {
    const container = document.getElementById('profilePicture')

    if (url) {
        container.innerHTML = `<img src="${url}" alt="Profile picture">`
    } else {
        container.innerHTML = '<i class="fa-solid fa-user"></i>'
    }
}
    


tabButtons.forEach(function (button) {
    button.addEventListener('click', function () {
        const targetTab = button.dataset.tab;

        tabButtons.forEach(function (btn) {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        tabContents.forEach(function (content) {
            content.hidden = true;
        });
        document.getElementById(targetTab + '-tab').hidden = false;
    });
});


fetch(`${API_BASE_URL}/api/users/profile`,{
    headers:{
        'X-API-KEY':API_KEY,
         'Authorization': `Bearer ${accessToken}`
    }

})
.then(function(response){
    return response.json()
})
.then(function(result){
    const profile = result.data

    document.getElementById('firstName').value = profile.firstName || ''
    document.getElementById('lastName').value = profile.lastName || ''
    document.getElementById('email').value = profile.email || ''
    document.getElementById('phoneNumber').value = profile.phoneNumber || ''
    document.getElementById('address').value = profile.address || ''
    document.getElementById('age').value = profile.age || ''
    document.getElementById('picture').value = profile.picture || '', updateProfilePicture(profile.picture);

    originalFirstName = document.getElementById('firstName').value
    originalLastName = document.getElementById('lastName').value
    originalPhoneNumber = document.getElementById('phoneNumber').value
    originalAddress = document.getElementById('address').value
    originalAge = document.getElementById('age').value
    originalPicture = document.getElementById('picture').value
})


document.getElementById('personalForm').addEventListener('submit',function(event){
    event.preventDefault()


    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const address = document.getElementById('address').value;
    const age = document.getElementById('age').value;
    const picture = document.getElementById('picture').value;

    const updateData = {};

    if (firstName !== originalFirstName) updateData.firstName = firstName
    if (lastName !== originalLastName) updateData.lastName = lastName
    if (phoneNumber !== originalPhoneNumber) updateData.phoneNumber = phoneNumber
    if (address !== originalAddress) updateData.address = address
    if (age && age !== originalAge) updateData.age = Number(age)
    if (picture !== originalPicture) updateData.picture = picture

    fetch(`${API_BASE_URL}/api/users/edit`,{
        method:'PUT',
        headers:{
            'X-API-KEY':API_KEY,
             'Authorization': `Bearer ${accessToken}`,
             'Content-type':'application/json'
        },
        body: JSON.stringify(updateData)
    })

        .then(function(response){
            return response.json()
        })
        .then(function(result){
            if(result.detail){
                showToast('Error', result.detail);
                return;
            }
            showToast('Saved', 'Your profile has been updated.')
             updateProfilePicture(picture);

            originalFirstName = firstName;
            originalLastName = lastName;
            originalPhoneNumber = phoneNumber;
            originalAddress = address;
            originalAge = age;
            originalPicture = picture;
        })
})


// chnage password
document.getElementById('toggleCurrentPassword').addEventListener('click',function(){
    const passwordInput = document.getElementById('currentPassword')

    if(passwordInput.type==='password'){
        passwordInput.type ='text'
        this.classList.remove('fa-eye')
        this.classList.add('fa-eye-slash')
    }else{
        passwordInput.type ='password'
        this.classList.remove('fa-eye-slash')
        this.classList.add('fa-eye')
    }
})


document.getElementById('toggleNewPassword').addEventListener('click', function () {
    const passwordInput = document.getElementById('newPassword');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
    }
});


document.getElementById('passwordForm').addEventListener('submit',function(event){
    event.preventDefault()



    const currentPassword = document.getElementById('currentPassword').value
    const newPassword = document.getElementById('newPassword').value
    const confirmPassword = document.getElementById('confirmNewPassword').value


if(newPassword!==confirmPassword){
    showToast('Error', 'New passwords do not match.')
    return


}

fetch(`${API_BASE_URL}/api/users/change-password`,{
    method:'PUT',
    headers:{
        'X-API-KEY':API_KEY,
        'Content-type':'application/json',
        'Authorization':`Bearer ${accessToken}`
    },

    body:JSON.stringify({ oldPassword: currentPassword, newPassword: newPassword, confirmPassword: confirmPassword })

})
.then(function(response){
    return response.json()
})
.then(function(result){
    if(result.isSuccess===false){
        showToast('Error', result.error.message)
        return
    }

    showToast('Saved', 'Your password has been updated.')
    document.getElementById('passwordForm').reset();
})
})


// account settings

document.getElementById('deleteAccountBtn').addEventListener('click',function(){
    document.getElementById('deleteModal').hidden=false
})

document.getElementById('cancelDeleteBtn').addEventListener('click',function(){
    document.getElementById('deleteModal').hidden=true
})

document.getElementById('confirmDeleteBtn').addEventListener('click',function(){
    fetch(`${API_BASE_URL}/api/users/delete`,{
        method:'DELETE',
        headers:{
            'X-API-KEY':API_KEY,
            'Authorization':`Bearer ${accessToken}`
        }
    })
    .then(function(response){
        return response.json()
    })
    .then(function(result){
        if(result.detail){
            showToast('error',result.detail)
            return

        }

        if(result.isSuccess === false){
            showToast('Error', result.error.message)
            return
        }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    alert('your account has been deleted')
    window.location.href='../index.html'
    })
})
