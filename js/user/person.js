import { loadComponent } from "../util/tool.js";
 
    //默认显示账号设置
    loadComponent("account-setting");
document.querySelectorAll('.side-bar-div div').forEach(item => {
   
  item.addEventListener('click', () => {
    const classList = item.classList;

    if (classList.contains('account-setting')) {
      loadComponent("account-setting");
      console.log("✅ 加载 account-setting");
    } else if (classList.contains('my-blogs')) {
      loadComponent("my-blogs");
      console.log("✅ 加载 my-blogs");
    } else if (classList.contains('my-comments')) {
      loadComponent("my-comments");
      console.log("✅ 加载 my-comments");
    } else if (classList.contains('article-management')) {
      loadComponent("article-management");
      console.log("✅ 加载 article-management");
    } else if (classList.contains('comment-management')) {
      loadComponent("comment-management");
      console.log("✅ 加载 comment-management");
    }
  });
});
