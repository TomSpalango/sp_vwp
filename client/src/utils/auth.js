export function getToken() {
  return localStorage.getItem('vwp_token');
}

export function setToken(token) {
  localStorage.setItem('vwp_token', token);
}

export function clearToken() {
  localStorage.removeItem('vwp_token');
}

export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getUserFromToken() {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeJwt(token);
  if (!decoded) return null;
  return { id: decoded.id, email: decoded.email, role: decoded.role };
}
