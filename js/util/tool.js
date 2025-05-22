// 工具函数：从 URL 提取 articleId
export function getArticleIdFromUrl(para) {
    const params = new URLSearchParams(window.location.search);
    return params.get(para);
}