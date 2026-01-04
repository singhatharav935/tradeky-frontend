const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://tradeky-backend.onrender.com';

export async function authFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem('token');

  // ✅ handle both relative and absolute URLs safely
  const url = path.startsWith('http')
    ? path
    : `${BASE_URL}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  // ❌ never throw, avoid frontend crash / logout loop
  if (res.status === 401) {
    return { __unauthorized: true };
  }

  return res.json();
}
