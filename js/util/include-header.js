// public/js/include.js
window.addEventListener('DOMContentLoaded', () => {
    fetch('../ai-html/components/header.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('header-container').innerHTML = html;
        });
});
