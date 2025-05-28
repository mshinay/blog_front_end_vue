let mode = 'normal';             // 'normal' or 'search'
let searchKeyword = '';
let page = 1;
const pageSize = 10;
let loading = false;
let allLoaded = false;


const list = document.querySelector('#comment-list');
const sentinel = document.querySelector('#scroll-sentinel');

// 加载文章函数（支持两种模式）
async function loadComment() {
  if (loading || allLoaded) return;
  loading = true;

  const token = localStorage.getItem("jwt");
  const authorId =JSON.parse(localStorage.getItem('user')).id;
  let url = '';

  if (mode === 'normal') {
    url = `http://localhost:8080/comment/user?userId=${authorId}&page=${page}&pageSize=${pageSize}`;
  } else if (mode === 'search') {
    url = `http://localhost:8080/comment/user/search?userId=${authorId}&keyword=${encodeURIComponent(searchKeyword)}&page=${page}&pageSize=${pageSize}`;
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

    data.forEach(comment => {
      const li = document.createElement('li');
      li.innerHTML =`
        <a href="../ai-html/article.html?articleId=${comment.articleId}" class="chapter-link" style="flex-grow: 1;">
        <div class="timestamp">${comment.createTime}</div>
        ${comment.content}
        </a>
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
    loadComment();
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
  loadComment();
});

// 恢复默认文章视图
document.querySelector("#reset-btn").addEventListener("click", function () {
  mode = 'normal';
  searchKeyword = '';
  page = 1;
  allLoaded = false;
  list.innerHTML = "";

  observer.observe(sentinel);
  loadComment();
});

// 初始化加载
loadComment();
observer.observe(sentinel);
