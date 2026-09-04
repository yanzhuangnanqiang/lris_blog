const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function fetchComments(postId) {
  const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`)
  if (!res.ok) throw new Error('请求失败')
  const data = await res.json()
  return data.comments
}

export async function submitComment(postId, name, content) {
  const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, content })
  })
  if (!res.ok) throw new Error('请求失败')
  return res.json()
}
