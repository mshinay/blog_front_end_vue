import {getArticleIdFromUrl} from "../util/tool.js"
document.addEventListener("DOMContentLoaded", function (){
        const token = localStorage.getItem("jwt");
        if (!token) {
        alert("请先登录");
        window.location.href = "http://127.0.0.1:5500/front-end/html/login.html";
        return;
        }
 
         // 初始化 Quill
    const quill = new Quill('#editor', {
        theme: 'snow',
        placeholder: '请输入文章内容...',
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

  const articleId = getArticleIdFromUrl("articleId"); // 假设 URL 是类似 /article.html?id=123
 if (!articleId) {
    alert("缺少文章ID");
    return;
}

// 请求文章详情并填充
fetch(`http://localhost:8080/article/detail/${articleId}`, {
    method: "get",
    headers: {
        "authentication": token
    }
})
.then(res => res.json())
.then(data => {
    if (data.code === 1 && data.data) {
        document.querySelector('input[name="title"]').value = data.data.title;
        quill.root.innerHTML = data.data.content;
    } else {
        alert("加载文章失败：" + data.msg);
    }
})
.catch(err => {
    console.error("获取文章失败", err);
});



    const form = document.querySelector("#article-form");
     form.addEventListener("submit", function (e){
        e.preventDefault(); // 阻止表单默认提交行为

        const title = document.querySelector('input[name="title"]').value;
        const content = quill.root.innerHTML;
        

        fetch("http://localhost:8080/article/edit",{

            method: "post",
             headers: {
                "Content-Type": "application/json",
                "authentication": token  // 👈 带上 token
            },
            body: JSON.stringify({
                id: articleId,
                title: title,
                content: content
                
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