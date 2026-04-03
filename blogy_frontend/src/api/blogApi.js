const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

/**
 * Stream the blog generation pipeline with real-time progress events.
 *
 * @param {string} keyword - The keyword to generate blogs for
 * @param {(step: number) => void} onProgress - Callback fired when a pipeline node completes
 * @returns {Promise<object>} The full GenerateResponse data
 */
export async function generateBlogStream(keyword, onProgress) {
  const response = await fetch(`${API_BASE}/api/generate/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyword }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.detail || `Server error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = null;
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const event = JSON.parse(data);
          if (event.type === 'progress' && onProgress) {
            onProgress(event.step);
          } else if (event.type === 'result') {
            result = event.data;
          } else if (event.type === 'error') {
            throw new Error(event.message || 'Pipeline stream error');
          }
        } catch (e) {
          // Skip JSON parse errors on partial chunks
          if (!(e instanceof SyntaxError)) throw e;
        }
      }
    }
  }

  if (!result) throw new Error('Stream ended without result');
  return result;
}

/**
 * Non-streaming fallback — calls the original POST /api/generate endpoint.
 */
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
