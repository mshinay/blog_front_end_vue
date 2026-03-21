export function init(){
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
  // 管理员可查看所有文章，不限制authorId，接口可调整
  let url = '';

  if (mode === 'normal') {
    url = `http://localhost:8080/article/admin/list?page=${page}&pageSize=${pageSize}`;
  } else if (mode === 'search') {
    url = `http://localhost:8080/article/admin/search?keyword=${encodeURIComponent(searchKeyword)}&page=${page}&pageSize=${pageSize}`;
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
      observer.disconnect();
      return;
    }

    data.forEach(article => {
      const li = document.createElement('li');
      // 根据状态显示按钮文字，1为正常显示，0为已软删除（隐藏）
      const btnText = article.status === 1 ? '删除' : '恢复';

      li.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <a href="../ai-html/article.html?articleId=${article.id}" class="chapter-link" style="flex-grow: 1;">
            <div class="chapter">
              <h4>${article.title}</h4>
              <p>${article.summary}</p>
            </div>
          </a>
          <div style="margin-left: 10px;">
            <button style="padding: 5px 10px;" class="status-btn" data-id="${article.id}" data-status="${article.status}">${btnText}</button>
          </div>
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

// 事件委托：删除或恢复按钮点击事件
list.addEventListener('click', async (e) => {
  if (e.target.classList.contains('status-btn')) {
    const articleId = e.target.dataset.id;
    const currentStatus = Number(e.target.dataset.status);
    if (!articleId) return;

    // 根据当前状态确认操作
    const isDelete = currentStatus === 1; // 当前是可见状态，点击即软删除
    const confirmMsg = isDelete ? '确定删除（软删除）这篇文章吗？' : '确定恢复这篇文章吗？';
    if (!confirm(confirmMsg)) return;

    try {
      const token = localStorage.getItem("jwt");
      // 假设后端提供了软删除和恢复接口，或者统一接口用PATCH更新status
      const newStatus = isDelete ? 0 : 1;
      const response = await fetch(`http://localhost:8080/article/admin/status/${articleId}`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          "authentication": token
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error(isDelete ? '删除失败' : '恢复失败');

      // 更新按钮状态和文本
      e.target.dataset.status = newStatus;
      e.target.textContent = newStatus === 1 ? '删除' : '恢复';

      console.log(`${isDelete ? '删除' : '恢复'}成功，文章ID:`, articleId);
    } catch (err) {
      console.error('操作失败:', err);
      alert(`${isDelete ? '删除' : '恢复'}失败，请重试`);
    }
  }
});

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
  if (!keyword) return;

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
}