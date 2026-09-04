const API_BASE = import.meta.env.VITE_API_BASE || ''

export async function recordView(postId) {
  const res = await fetch(`${API_BASE}/api/posts/${postId}/views`, { method: 'POST' })
  if (!res.ok) throw new Error('请求失败')
  return res.json()
}
