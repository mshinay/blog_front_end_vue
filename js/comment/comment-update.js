export async function updateComment(commentId, newContent, token) {
  const response = await fetch(`http://localhost:8080/comment/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'authentication': token
    },
    body: JSON.stringify({ id: commentId, content: newContent })
  });

  return response.json();
}
