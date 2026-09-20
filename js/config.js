const API_BASE_URL = 'https://restaurantapi.stepacademy.ge';
const API_KEY = 'f887274c-e7f2-4235-924f-a98e24c2b577';

function showToast(title, message) {
    const toast = document.createElement('div');
    toast.className = 'alert';
    toast.innerHTML = `
        <div class="alert-title">${title}</div>
        <div class="alert-message">${message}</div>
    `;

    document.body.appendChild(toast);

    setTimeout(function () {
        toast.remove();
    }, 5000);
}

