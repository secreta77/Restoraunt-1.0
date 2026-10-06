const API_BASE_URL = 'https://restaurantapi.stepacademy.ge';
const API_KEY = 'f887274c-e7f2-4235-924f-a98e24c2b577';
const ADMIN_EMAIL = 'giorgiqoqashvili422@gmail.com'
const ANTHROPIC_API_KEY = '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'




function showToast(title, message) {
    const toast = document.createElement('div');
    toast.className = 'alert';
    toast.innerHTML = `
        <button class="alert-close" type="button" aria-label="Close">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="alert-title">${title}</div>
        <div class="alert-message">${message}</div>
    `;

    document.body.appendChild(toast);

    toast.querySelector('.alert-close').addEventListener('click', function () {
        toast.remove();
    });

    setTimeout(function () {
        toast.remove();
    }, 5000);
}

