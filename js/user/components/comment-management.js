export function init() {
  let mode = 'normal'; // 'normal' 或 'search'
  let searchKeyword = '';
  let page = 1;
  const pageSize = 10;
  let loading = false;
  let allLoaded = false;

  const list = document.querySelector('#comment-list');
  const sentinel = document.querySelector('#scroll-sentinel');

  // 加载评论（支持普通和搜索模式）
  async function loadComments() {
    if (loading || allLoaded) return;
    loading = true;

    const token = localStorage.getItem("jwt");
    const urlBase = 'http://localhost:8080/comment/admin'; // 管理员接口基础地址
    let url = '';

    if (mode === 'normal') {
      url = `${urlBase}/list?page=${page}&pageSize=${pageSize}`;
    } else if (mode === 'search') {
      url = `${urlBase}/search?keyword=${encodeURIComponent(searchKeyword)}&page=${page}&pageSize=${pageSize}`;
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

      // 渲染结构：[ { articleId, articleTitle, comments: [ ... ] }, ... ]
      data.forEach(group => {
        const articleBlock = document.createElement('div');
        articleBlock.className = 'article-block';
        articleBlock.style.marginBottom = '20px';

        const title = document.createElement('h3');
        title.textContent = group.articleTitle || '无标题';
        articleBlock.appendChild(title);

        const ul = document.createElement('ul');
        ul.style.listStyle = 'none';
        ul.style.paddingLeft = '0';

        group.comments.forEach(comment => {
          const li = document.createElement('li');
          li.style.display = 'flex';
          li.style.justifyContent = 'space-between';
          li.style.alignItems = 'center';
          li.style.borderBottom = '1px solid #ccc';
          li.style.padding = '8px 0';

          li.innerHTML = `
            <div style="flex-grow: 1;">
              <div style="font-size: 12px; color: #666;">${comment.createTime}</div>
              <div>${comment.content}</div>
            </div>
            <button class="status-btn" data-id="${comment.id}" data-status="${comment.status}"
              style="margin-left: 15px; padding: 5px 10px; cursor: pointer;">
              ${comment.status === 1 ? '删除' : '恢复'}
            </button>
          `;
          ul.appendChild(li);
        });

        articleBlock.appendChild(ul);
        list.appendChild(articleBlock);
      });

      page += 1;
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      loading = false;
    }
  }

  // 监听按钮点击事件，处理评论的删除和恢复
list.addEventListener('click', async (e) => {
  if (e.target.classList.contains('status-btn')) {
    const commentId = e.target.dataset.id;
    const currentStatus = Number(e.target.dataset.status);
    const token = localStorage.getItem("jwt");
    if (!commentId || !token) return;

    // 状态反转逻辑
    const isDelete = currentStatus === 1;
    const newStatus = isDelete ? 0 : 1;
    const confirmMsg = isDelete ? '确定要删除该评论吗？' : '确定要恢复该评论吗？';
    if (!confirm(confirmMsg)) return;

    try {
      const response = await fetch(`http://localhost:8080/comment/admin/status/${commentId}`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          "authentication": token
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error(isDelete ? '删除失败' : '恢复失败');

      // 更新 UI 状态
      e.target.dataset.status = newStatus;
      e.target.textContent = newStatus === 1 ? '删除' : '恢复';

      alert(`${isDelete ? '删除' : '恢复'}成功`);
    } catch (err) {
      console.error(`${isDelete ? '删除' : '恢复'}失败:`, err);
      alert(`${isDelete ? '删除' : '恢复'}失败，请重试`);
    }
  }
});


  // IntersectionObserver 实现滚动加载
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadComments();
    }
  });

  // 搜索功能
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
    loadComments();
  });

  // 恢复默认视图
  document.querySelector("#reset-btn").addEventListener("click", () => {
    mode = 'normal';
    searchKeyword = '';
    page = 1;
    allLoaded = false;
    list.innerHTML = "";

    observer.observe(sentinel);
    loadComments();
  });

  // 初始化加载和监听
  loadComments();
  observer.observe(sentinel);
}