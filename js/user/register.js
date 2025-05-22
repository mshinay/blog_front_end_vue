document.addEventListener("DOMContentLoaded", function (){
    const form = document.querySelector("form.inputBox");
     form.addEventListener("submit", function (e){
        e.preventDefault(); // 阻止表单默认提交行为

        const username = document.querySelector('input[name="username"]').value;
        const password = document.querySelector('input[name="password"]').value;
        const email = document.querySelector('input[name="email"]').value;

        fetch("http://localhost:8080/user/register",{

            method: "post",
             headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password,
                email: email
            })

        })
         .then(response => response.json())
        .then(data => {
            if (data.code === 1) {
                alert("注册成功");
                // location.href = "/dashboard.html"; // 跳转页面
            } else {
                alert("注册失败: " + data.msg);
            }
        })
        .catch(error => {
            console.error("请求失败", error);
        });
    });
})