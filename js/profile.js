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
