import {getArticleIdFromUrl} from "../util/tool.js"
document.addEventListener("DOMContentLoaded", function (){
        const token = localStorage.getItem("jwt");
        if (!token) {
        alert("请先登录");
        window.location.href = "http://127.0.0.1:5500/ai-html/login.html";
        return;
        }


             // 初始化 Quill
    const quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: '请输入评论内容...',
        modules: {
            toolbar: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

  const form = document.querySelector("#comment-form");
     form.addEventListener("submit", function (e){
        e.preventDefault(); // 阻止表单默认提交行为

        const content = quill.root.innerHTML;
        

        fetch("http://localhost:8080/comment/upload",{

            method: "post",
             headers: {
                "Content-Type": "application/json",
                "authentication": token  // 👈 带上 token
            },
            body: JSON.stringify({
                articleId: getArticleIdFromUrl("articleId"),
                content: content,
                
            })

        })
         .then(response => response.json())
        .then(data => {
            if (data.code === 1) {
                alert("上传成功");
                // location.href = "/dashboard.html"; // 跳转页面
            } else {
                alert("上传失败: " + data.msg);
            }
        })
        .catch(error => {
            console.error("请求失败", error);
        });
    });

})