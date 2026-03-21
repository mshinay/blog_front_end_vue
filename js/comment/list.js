import {updateComment} from "./comment-update.js"
import {getArticleIdFromUrl} from "../util/tool.js"
let page = 1;
const pageSize = 10;
let loading = false;  // 防止重复请求
let allLoaded = false; // 判断是否还有数据


const list = document.querySelector('#comment-list');
const sentinel = document.querySelector('#scroll-sentinel');
async function loadComment() {
  if (loading || allLoaded) return;
  loading = true;

  const token = localStorage.getItem("jwt");
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.id;
  const list = document.querySelector('#comment-list');
  const articleId = getArticleIdFromUrl("articleId");

  try {
    const response = await fetch(`http://localhost:8080/comment/list?articleId=${articleId}&page=${page}&pageSize=${pageSize}`, {
      headers: {
        "authentication": token
      }
    });

    if (!response.ok) throw new Error('请求失败');
    const result = await response.json();
    const data = result.data.records;

    if (data.length === 0) {
      allLoaded = true;
      observer.disconnect();
      return;
    }

    data.forEach(comment => {
      let mode = 'view';
      const li = document.createElement('li');
      li.classList.add('comment-item');
      const isOwner = currentUserId === comment.userId;

      const renderViewMode = () => {
        li.innerHTML = `
          <a href="/ai-html/user-page.html?userId=${comment.userId}">@${comment.userName}</a>
          <div class="timestamp">${comment.createTime}</div>
          <div class="comment-content">${comment.content}</div>
          ${
            isOwner
              ? `
              <div style="margin-top: 8px;">
                <button class="edit-btn">修改</button>
                <button class="delete-btn" style="margin-left: 8px;">删除</button>
              </div>`
              : ''
          }
        `;

        if (isOwner) {
          li.querySelector('.edit-btn').addEventListener('click', () => {
            mode = 'edit';
            render();
          });

          li.querySelector('.delete-btn').addEventListener('click', async () => {
            const confirmed = confirm("确定要删除该评论吗？");
            if (!confirmed) return;
            try {
              const res = await fetch(`http://localhost:8080/comment/${comment.id}`, {
                method: "DELETE",
                headers: {
                  "authentication": token
                }
              });
              const result = await res.json();
              if (result.code === 1) {
                alert("删除成功");
                li.remove(); // 从 DOM 中移除该项
              } else {
                alert("删除失败: " + result.msg);
              }
            } catch (err) {
              console.error("删除请求失败:", err);
            }
          });
        }
      };

      const renderEditMode = () => {
        li.innerHTML = `
          <a href="/user/${comment.userId}">@${comment.userName}</a>
          <div class="timestamp">${comment.createTime}</div>
          <div class="editor-container"></div>
          <div style="margin-top: 8px;">
            <button class="save-btn">保存</button>
            <button class="cancel-btn" style="margin-left: 8px;">取消</button>
          </div>
        `;

        const editorContainer = li.querySelector('.editor-container');
        const editor = new Quill(editorContainer, {
          theme: 'snow',
          modules: {
            toolbar: [['bold', 'italic', 'underline'], ['link'], ['clean']]
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
            console.error('修改失败:', err);
          }
        });

        li.querySelector('.cancel-btn').addEventListener('click', () => {
          mode = 'view';
          render();
        });
      };

      const render = () => {
        if (mode === 'view') {
          renderViewMode();
        } else if (mode === 'edit') {
          renderEditMode();
        }
      };

      render();
      list.appendChild(li);
    });

    page += 1;
  } catch (error) {
    console.error('加载失败:', error);
  } finally {
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