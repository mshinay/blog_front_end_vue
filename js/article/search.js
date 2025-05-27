console.log("✅ search.js 被加载并执行");

let page = 1;
const pageSize = 10;
let loading = false;
let allLoaded = false;

const listContainer = document.createElement('ul');
listContainer.id = 'article-list';
listContainer.style.listStyleType = 'none';
listContainer.style.padding = '0';

const main = document.querySelector('main.articles');
const sentinel = document.querySelector('#scroll-sentinel');
const noResultText = document.querySelector('main > p');

const token = localStorage.getItem("jwt");
console.log("search.js的"+token)
const urlParams = new URLSearchParams(window.location.search);
const keyword = urlParams.get('search')?.trim();

if (!keyword) {
  console.log("🔍 无关键词，保留提示文本");
  // 不加载任何数据
} else {
  // 移除提示文字，加入 ul 列表容器
  noResultText.remove();
  main.insertBefore(listContainer, sentinel);

  // 加载文章
  loadArticles();
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      loadArticles();
    }
  });
  observer.observe(sentinel);
}

async function loadArticles() {
  if (loading || allLoaded) return;
  loading = true;

  try {
    const response = await fetch(`http://localhost:8080/article/search?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=${pageSize}`, {
      headers: {
        "authentication": token
      }
    });
    const result = await response.json();
    const data = result.data.records;

    if (data.length === 0) {
      allLoaded = true;
      if (page === 1) {
        showNoResult(); // 搜索结果为空
      }
      return;
    }

    data.forEach(article => {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="article.html?articleId=${article.id}" class="chapter-link">
          <div class="chapter">
            <h4>${article.title}</h4>
            <p>${article.summary}</p>
          </div>
        </a>
      `;
      listContainer.appendChild(li);
    });

    page++;
  } catch (err) {
    console.error("❌ 搜索请求失败", err);
  } finally {
    loading = false;
  }
}

function showNoResult() {
  const p = document.createElement('p');
  p.textContent = '没有你需要查找的内容';
  main.insertBefore(p, sentinel);
}
