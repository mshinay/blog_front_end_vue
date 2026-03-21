const params = new URLSearchParams(window.location.search);
const targetUserId = params.get('userId');
if (!targetUserId) {
  alert("访问用户信息缺失");
  throw new Error("缺少 userId 参数");
}

const token = localStorage.getItem("jwt");
const list = document.querySelector('#article-list');
const sentinel = document.querySelector('#scroll-sentinel');
const nameDiv = document.querySelector('.name');
const profileImg = document.querySelector('.profile img');

let mode = 'normal';
let searchKeyword = '';
let page = 1;
const pageSize = 10;
let loading = false;
let allLoaded = false;

// 获取用户信息并渲染
async function loadUserInfo() {
  try {
    const response = await fetch(`http://localhost:8080/user/public/${targetUserId}`, {
      headers: {
        "authentication": token
      }
    });
    const result = await response.json();
    const user = result.data;
    profileImg.src = user.avatarUrl || "../../img/user-64.png";
    nameDiv.textContent = user.username || "未命名用户";
  } catch (err) {
    console.error("加载用户信息失败", err);
  }
}

// 加载文章函数
async function loadArticles() {
  if (loading || allLoaded) return;
  loading = true;

  const url = mode === 'search'
    ? `http://localhost:8080/article/user/search?authorId=${targetUserId}&keyword=${encodeURIComponent(searchKeyword)}&page=${page}&pageSize=${pageSize}`
    : `http://localhost:8080/article/user?authorId=${targetUserId}&page=${page}&pageSize=${pageSize}`;

  try {
    const response = await fetch(url, {
      headers: {
        "authentication": token
      }
    });

    const result = await response.json();
    const articles = result.data.records;

    if (articles.length === 0) {
      allLoaded = true;
      observer.disconnect();
      return;
    }

    articles.forEach(article => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="../ai-html/article.html?articleId=${article.id}" class="chapter-link">
          <div class="chapter">
            <h4>${article.title}</h4>
            <p>${article.summary}</p>
          </div>
        </a>
      `;
      list.appendChild(li);
    });

    page++;
  } catch (err) {
    console.error("加载文章失败", err);
  } finally {
    loading = false;
  }
}

// 搜索事件
document.querySelector("#search-form-user").addEventListener("submit", e => {
  e.preventDefault();
  const keyword = document.querySelector('input[name="search-user"]').value.trim();
  if (!keyword) return;

  mode = 'search';
  searchKeyword = keyword;
  page = 1;
  allLoaded = false;
  list.innerHTML = "";

  observer.observe(sentinel);
  loadArticles();
});

// 重置事件
document.querySelector("#reset-btn").addEventListener("click", () => {
  mode = 'normal';
  searchKeyword = '';
  page = 1;
  allLoaded = false;
  list.innerHTML = "";

  observer.observe(sentinel);
  loadArticles();
});

// 监听滚动加载
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    loadArticles();
  }
});

// 初始化
loadUserInfo();
loadArticles();
observer.observe(sentinel);
