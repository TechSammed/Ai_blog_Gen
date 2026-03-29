const API_BASE = 'http://localhost:8000';

export async function generateBlog(keyword) {
  const response = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyword }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `Server error: ${response.status}`);
  }

  return response.json();
}

export async function healthCheck() {
  const response = await fetch(`${API_BASE}/`, { method: 'GET' });
  return response.ok;
}
