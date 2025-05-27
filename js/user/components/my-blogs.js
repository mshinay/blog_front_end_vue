let mode = 'normal';             // 'normal' or 'search'
let searchKeyword = '';
let page = 1;
const pageSize = 10;
let loading = false;
let allLoaded = false;


const list = document.querySelector('#article-list');
const sentinel = document.querySelector('#scroll-sentinel');

// 加载文章函数（支持两种模式）
async function loadArticles() {
  if (loading || allLoaded) return;
  loading = true;

  const token = localStorage.getItem("jwt");
  const authorId =JSON.parse(localStorage.getItem('user')).id;
  let url = '';

  if (mode === 'normal') {
    url = `http://localhost:8080/article/user?authorId=${authorId}&page=${page}&pageSize=${pageSize}`;
  } else if (mode === 'search') {
    url = `http://localhost:8080/article/user/search?authorId=${authorId}&keyword=${encodeURIComponent(searchKeyword)}&page=${page}&pageSize=${pageSize}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        "authentication": token
      }
    });

    if (!response.ok) throw new Error('请求失败');
    const result = await response.json();

    const data = result.data.records;
    if (data.length === 0) {
      allLoaded = true;
      observer.disconnect(); // 停止监听
      return;
    }

    data.forEach(article => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <a href="../ai-html/article.html?articleId=${article.id}" class="chapter-link" style="flex-grow: 1;">
            <div class="chapter">
              <h4>${article.title}</h4>
              <p>${article.summary}</p>
            </div>
          </a>
          <a href="../ai-html/edit-article.html?articleId=${article.id}" style="margin-left: 10px;">
            <button style="padding: 5px 10px;">修改</button>
          </a>
        </div>
      `;
      list.appendChild(li);
    });

    page += 1;
  } catch (error) {
    console.error('加载失败:', error);
  } finally {
    loading = false;
  }
}

// 初始化 IntersectionObserver 监听滚动
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    loadArticles();
  }
});

// 搜索提交事件
document.querySelector("#search-form-user").addEventListener("submit", function (e) {
    
  e.preventDefault();

  const keyword = document.querySelector('input[name="search-user"]').value.trim();
  console.log("gdgdfdf");
  if (!keyword) return;
console.log("gdgdfdf");
  // 切换到搜索模式
  mode = 'search';
  searchKeyword = keyword;
  page = 1;
  allLoaded = false;
  list.innerHTML = "";

  observer.observe(sentinel);
  loadArticles();
});

// 恢复默认文章视图
document.querySelector("#reset-btn").addEventListener("click", function () {
  mode = 'normal';
  searchKeyword = '';
  page = 1;
  allLoaded = false;
  list.innerHTML = "";

  observer.observe(sentinel);
  loadArticles();
});

// 初始化加载
loadArticles();
observer.observe(sentinel);
