const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

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
        document.getElementById('picture').value = profile.picture || ''
})


document.getElementById('personalForm').addEventListener('submit',function(event){
    event.preventDefault()


    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const phoneNumber = document.getElementById('phoneNumber').value;
    const address = document.getElementById('address').value;
    const age = document.getElementById('age').value;
    const picture = document.getElementById('picture').value;


    fetch(`${API_BASE_URL}/api/users/edit`,{
        method:'PUT',
        headers:{
            'X-API-KEY':API_KEY,
             'Authorization': `Bearer ${accessToken}`,
             'Content-type':'application/json'
        },
        body:JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            phoneNumber: phoneNumber,
            address: address,
            age: Number(age),
            picture: picture
        })
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
        })
})