(() => {
  console.log("✅ header.js 被加载并执行");

  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const usernameDisplay = document.getElementById('username');
  const avatar = document.getElementById('user-avatar');
  const searchForm = document.getElementById('search-form');
  const searchInput = searchForm?.querySelector('input[name="search"]');

  const token = localStorage.getItem('jwt');
  const user = JSON.parse(localStorage.getItem('user'));
  console.log(user);

  if (token && user) {
    renderUser(user.username);
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', () => location.href = 'login.html');
  }

  if (registerBtn) {
    registerBtn.addEventListener('click', () => location.href = 'register.html');
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      location.reload();
    });
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const keyword = searchInput.value.trim();
      if (keyword) {
        window.location.href = `search.html?search=${encodeURIComponent(keyword)}`;
      } else {
        alert("请输入搜索内容");
      }
    });
  }

  function renderUser(name) {
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
    usernameDisplay.style.display = 'inline-block';
    usernameDisplay.textContent = name;
    avatar.style.display = 'inline-block';
    avatar.src=user.avatarUrl;
  }
})();
