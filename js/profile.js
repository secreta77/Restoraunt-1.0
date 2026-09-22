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