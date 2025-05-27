// 工具函数：从 URL 提取 articleId
export function getArticleIdFromUrl(para) {
    const params = new URLSearchParams(window.location.search);
    return params.get(para);
}

/**
 * 通用组件加载函数
 * @param {string} componentName 组件名称（不含路径和扩展名）
 *        如传入 "account-setting"，则会加载：
 *        - components/account-setting.html
 *        - components/account-setting.js
 */

const initMap = {};
export async function loadComponent(componentName) {
    
  const htmlPath = `./components/${componentName}.html`;
  const container = document.querySelector(".setting-detail-div");

  try {
    // 加载并注入 HTML
    const res = await fetch(htmlPath);
    const html = await res.text();
    container.innerHTML = html;

    

    // 如果组件尚未初始化（即JS未执行过）
    if (!initMap[componentName]) {
      const module = await import(`../user/components/${componentName}.js`);
      if (typeof module.init === "function") {
        module.init(); // 执行组件的初始化逻辑（如事件绑定等）
      }
      initMap[componentName] = true; // 标记为已初始化
    }
  } catch (err) {
    console.error(`❌ 加载组件失败: ${componentName}`, err);
  }
}


/**
 * 动态创建并插入 <script> 标签
 * @param {string} src JS 文件路径
 */
export function loadScript(src) {
  const script = document.createElement('script');
  script.src = src;
  script.defer = true; // 非必须，根据情况设置
  document.body.appendChild(script);
}
