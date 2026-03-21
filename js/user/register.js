document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("register-username");
  const emailInput = document.getElementById("register-email");
  const passwordInput = document.getElementById("register-password");
  const confirmInput = document.getElementById("confirm-password");
  const submitBtn = document.getElementById("register-submit");

  submitBtn.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    if (!username || !email || !password || !confirmPassword) {
      alert("请填写所有字段");
      return;
    }

    if (password !== confirmPassword) {
      alert("两次输入的密码不一致");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          email,
          password
        })
      });

      const data = await response.json();

      if (data.code === 1) {
        alert("注册成功！");
        console.log(data.data);
        
        localStorage.setItem("jwt", data.data.jwtToken);
        localStorage.setItem("user", JSON.stringify(data.data));

        // 注册成功后跳转
        window.location.href = "/main.html";  // 或跳转到首页、登录页等
      } else {
        alert(`注册失败：${data.msg || "服务器错误"}`);
      }
    } catch (err) {
      console.error("注册请求异常", err);
      alert("注册失败，请检查网络或稍后重试");
    }
  });
});
