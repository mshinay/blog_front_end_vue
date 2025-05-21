document.addEventListener("DOMContentLoaded", async () => {
  const articleId = getArticleIdFromUrl(); // 假设 URL 是类似 /article.html?id=123
  const token = localStorage.getItem("jwt");

  try {
    const response = await fetch(`http://localhost:8080/article/detail/${articleId}`, {
      method: "GET",
      headers: {
        "authentication": token
      }
    });

    const result = await response.json();

    if (result.code !== 1) {
      alert("获取文章失败：" + result.msg);
      return;
    }

    const article = result.data;

    document.querySelector("#article-title").textContent = article.title;
    document.querySelector("#article-meta").innerHTML = `作者：<a href="/user/${article.authorId}">${article.authorName}</a> | 发布时间：${article.createTime}`;
    document.querySelector("#article-content").innerHTML = article.content;  // 💡 富文本 HTML
  } catch (error) {
    console.error("加载文章失败:", error);
    alert("加载失败，请检查网络或登录状态");
  }
});

function getArticleIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("articleId");
}
