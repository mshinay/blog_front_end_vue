let page = 1;
const pageSize = 10;
let loading = false;  // 防止重复请求
let allLoaded = false; // 判断是否还有数据

const list = document.querySelector('#article-list');
const sentinel = document.querySelector('#scroll-sentinel');
async function loadArticles() {
      if (loading || allLoaded) return;
        loading = true;
 const token = localStorage.getItem("jwt");
         try {
    const response = await fetch(`http://localhost:8080/article/list?page=${page}&pageSize=${pageSize}`,{
           headers: {
                //"Content-Type": "application/json",
                "authentication": token  // 👈 带上 token
            }
        }
    );
    if (!response.ok) throw new Error('请求失败');
    const result = await response.json();
    const data=result.data.records;
    // 如果返回空数组，说明到底了
    if (data.length === 0) {
      allLoaded = true;
      observer.disconnect(); // 停止监听
      return;
    }

    data.forEach(article => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="#article/${article.id}" class="chapter-link">
          <div class="chapter">
            <h4>${article.title}</h4>
            <p>${article.summary}</p>
          </div>
        </a>
      `;
      list.appendChild(li);
    });

    page += 1; // 下一页
  } catch (error) {
    console.error('加载失败:', error);
  } finally {
    loading = false;
  }
}

// 初始加载第一页
loadArticles();

// 创建 IntersectionObserver 监听 sentinel 是否进入视图
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
    loadArticles();
  }
});

observer.observe(sentinel);