window.addEventListener('DOMContentLoaded', () => {
  fetch('../ai-html/components/header.html')
    .then(res => res.text())
    .then(html => {
      const container = document.getElementById('header-container');
      container.innerHTML = html;

      // 等待 login-btn 元素出现再执行 header.js
      const waitForElement = (selector, callback) => {
        const el = document.querySelector(selector);
        if (el) {
          callback();
        } else {
          requestAnimationFrame(() => waitForElement(selector, callback));
        }
      };

      waitForElement('#login-btn', () => {
        const script = document.createElement('script');
        script.src = "../js/user/header.js";
        script.type = 'text/javascript';
        document.body.appendChild(script);
      });
    });
});
