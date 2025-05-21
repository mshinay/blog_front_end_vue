document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("login").addEventListener("click", function (e) {
        e.preventDefault(); // 阻止表单默认提交行为

        const username = document.querySelector('input[name="username"]').value;
        const password = document.querySelector('input[name="password"]').value;

        fetch("http://localhost:8080/user/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.code === 1) {
                alert("登录成功，欢迎 " + data.data.name);
                // location.href = "/dashboard.html"; // 跳转页面
                localStorage.setItem("jwt",data.data.jwtToken)

                window.location.href="http://127.0.0.1:5500/front-end/ai-html/main.html"
            } else {
                alert("登录失败: " + data.msg);
            }
        })
        .catch(error => {
            console.error("请求失败", error);
        });
    });
});