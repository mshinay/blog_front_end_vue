export function init() {
  console.log("account-setting init 开始");
  const token = localStorage.getItem("jwt");

  const avatarBtn = document.getElementById("avatar-button");
  const avatarInput = document.getElementById("profile");
  const userAvatar = document.getElementById("user-avatar-setting");
  const emailInput = document.getElementById("email-setting");
  const usernameInput = document.getElementById("username-setting");
console.log("👀 获取 user-avatar DOM：", userAvatar);

  const user = JSON.parse(localStorage.getItem('user'));

  if (token && user) {
    render(user)
  }

  // 头像按钮点击处理函数
  function avatarBtnHandler(e) {
    e.preventDefault();
    avatarInput.click();
  }
  // 先解绑再绑定，防止重复绑定
  avatarBtn.removeEventListener("click", avatarBtnHandler);
  avatarBtn.addEventListener("click", avatarBtnHandler);

  // 头像上传处理函数
  async function avatarInputHandler() {
    console.log("头像上传监听器已绑定");
    const file = avatarInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    console.log(formData);
    try {
      const response = await fetch("http://localhost:8080/common/upload", {
        method: "POST",
        headers: {
          "authentication": token
        },
        body: formData
      });

      if (response.ok) {
         const result = await response.json();
        const avatarUrl = result.data; // 假设这是返回的 URL
        console.log("avatarUrl是"+avatarUrl)
         // 👇 自动提交更新头像 URL 到数据库
         updateField("avatarUrl", avatarUrl);
        alert("头像更新成功！");

      } else {
        alert("头像上传失败");
      }
    } catch (error) {
      console.error("头像上传出错", error);
    }
  }
  // 先解绑再绑定，防止重复绑定
  avatarInput.removeEventListener("change", avatarInputHandler);
  avatarInput.addEventListener("change", avatarInputHandler);

  // 提交按钮点击处理函数
async function submitBtnHandler(e) {
  const btn = e.currentTarget;
  const field = btn.dataset.field;
  const value = btn.previousElementSibling.value.trim();
  if (!value) return alert("输入不能为空");

  updateField(field, value);
}



  async function updateField(field, value) {
  const token = localStorage.getItem("jwt");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;

  if (!userId) {
    alert("用户未登录或信息异常");
    return;
  }

  const payload = {
    id: userId,
    [field]: value
  };

  try {
    const res = await fetch("http://localhost:8080/user/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authentication": token
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();  // 👈 解析 JSON 响应

    if (data.code === 1) {
      // 更新本地用户信息
      localStorage.removeItem("jwt");
      localStorage.removeItem("user");

      localStorage.setItem("jwt", data.data.jwtToken);
      localStorage.setItem("user", JSON.stringify(data.data));

      alert(`${field} 更新成功`);
        // ❗ 简单粗暴法：刷新页面重新渲染 header
     location.reload();

    } else {
      alert(`${field} 更新失败: ${data.msg || '服务器返回错误'}`);
    }
  } catch (err) {
    console.error(`${field} 更新出错`, err);
    alert(`${field} 更新出错`);
  }
}


  // 给所有提交按钮解绑再绑定事件，防止多次绑定
  document.querySelectorAll(".submit-btn").forEach((btn) => {
    btn.removeEventListener("click", submitBtnHandler);
    btn.addEventListener("click", submitBtnHandler);
  });

  function render(user){
    userAvatar.src=user.avatarUrl + "?t=" + Date.now();
    usernameInput.value=user.username;
    emailInput.value=user.email;
  }
}
