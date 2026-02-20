const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

export { API_BASE_URL };
