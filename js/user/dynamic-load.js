 //检验用户角色，动态显示 文章管理 和 评论管理
    const userString = localStorage.getItem("user"); // Get the string from localStorage

    if (userString) { // Check if user data exists in localStorage
        try {
            const user = JSON.parse(userString); // Parse the JSON string into an object

            // Assuming role 0 means an administrator or someone with management access
            if (user.role === 0) { 
                // Select the elements and change their display style
                const articleManagement = document.querySelector('.article-management');
                const commentManagement = document.querySelector('.comment-management');

                if (articleManagement) {
                    articleManagement.style.display = 'block'; // Or 'flex', 'inline-block' depending on your layout needs
                }
                if (commentManagement) {
                    commentManagement.style.display = 'block'; // Or 'flex', 'inline-block'
                }
            }
        } catch (e) {
            console.error("Error parsing user data from localStorage:", e);
            // Handle case where stored data is not valid JSON
        }
    } else {
        console.log("No user data found in localStorage. Cannot check role.");
    }