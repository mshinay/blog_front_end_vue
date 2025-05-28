import {updateComment} from "./comment-update.js"
import {getArticleIdFromUrl} from "../util/tool.js"
let page = 1;
const pageSize = 10;
let loading = false;  // 防止重复请求
let allLoaded = false; // 判断是否还有数据

const user = JSON.parse(localStorage.getItem("user"));
const list = document.querySelector('#comment-list');
const sentinel = document.querySelector('#scroll-sentinel');
const articleId =getArticleIdFromUrl("articleId");
async function loadComment() {
    if (loading || allLoaded) return;
        loading = true;
    const token = localStorage.getItem("jwt");
    try{
         const response = await fetch(`http://localhost:8080/comment/list?userId=${user.id}&articleId=${articleId}&page=${page}&pageSize=${pageSize}`,{
             headers: {
                //"Content-Type": "application/json",
                "authentication": token  // 👈 带上 token
            }
         }
        );
        if (!response.ok) throw new Error('请求失败');
        const result = await response.json();
        const data=result.data.records;
         // 如果返回空数组，说明到底了
        if (data.length === 0) {
        allLoaded = true;
        observer.disconnect(); // 停止监听
        return;
        }

        data.forEach(comment => {
  let mode = 'view';
  const li = document.createElement('li');
  const currentUserId = user.id;
  const isOwner = currentUserId && currentUserId === comment.userId;

  li.classList.add('comment-item');

  const render = () => {
    li.innerHTML = `
      <a href="/user/${comment.userId}">@${comment.userName}</a>
      <div class="timestamp">${comment.createTime}</div>
      <div class="comment-content">${comment.content}</div>
      ${isOwner ? '<button class="edit-btn">修改</button>' : ''}
    `;

    if (isOwner) {
      const editBtn = li.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => {
        mode = 'edit';
        render();
      });
    }
  };

  const renderEdit = () => {
    li.innerHTML = `
      <a href="/user/${comment.userId}">@${comment.userName}</a>
      <div class="timestamp">${comment.createTime}</div>
      <div class="editor-container"></div>
      <button class="save-btn">保存</button>
      <button class="cancel-btn">取消</button>
    `;

    const editorContainer = li.querySelector('.editor-container');
    const editor = new Quill(editorContainer, {
      theme: 'snow',
      modules: {
        toolbar: [['bold', 'italic'], ['link'], ['clean']]
      }
    });

    editor.root.innerHTML = comment.content;

    li.querySelector('.save-btn').addEventListener('click', async () => {
      const newContent = editor.root.innerHTML;
      try {
        const result = await updateComment(comment.id, newContent, token);
        if (result.code === 1) {
          alert('修改成功');
          comment.content = newContent;
          mode = 'view';
          render();
        } else {
          alert('修改失败: ' + result.msg);
        }
      } catch (err) {
        console.error('请求失败', err);
      }
    });

    li.querySelector('.cancel-btn').addEventListener('click', () => {
      mode = 'view';
      render();
    });
  };

  // 主渲染入口，根据 mode 切换
  const renderMode = () => {
    if (mode === 'view') {
      render();
    } else if (mode === 'edit') {
      renderEdit();
    }
  };

  renderMode();
  list.appendChild(li);

  list.appendChild(li);
    });
    page += 1; // 下一页
    }catch (error) {
    console.error('加载失败:', error);
    }finally {
    loading = false;
  }

}

// 初始加载第一页
loadComment();

// 创建 IntersectionObserver 监听 sentinel 是否进入视图
const observer = new IntersectionObserver(entries => {
  if (entries[0].isIntersecting) {
     loadComment();
  }
});

observer.observe(sentinel);