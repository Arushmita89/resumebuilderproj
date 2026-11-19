const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const TOKEN_KEY = 'resume_token';

function token() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!token();
}

export function getToken() {
  return token();
}

export function setToken(value) {
  if (value) {
    localStorage.setItem(TOKEN_KEY, value);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

function authHeaders() {
  const t = token();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

const AUTH_ENDPOINT = /^\/auth\/(login|register|forgot-password|reset-password)/;

function sessionExpired() {
  setToken(null);
  window.location.assign('/login?reason=expired');
}

async function handle(resp, path) {
  if (resp.status === 401) {
    setToken(null);
    if (!AUTH_ENDPOINT.test(path)) {
      sessionExpired();
    }
  }
  if (!resp.ok) {
    let message = `Request failed (${resp.status})`;
    try {
      const body = await resp.json();
      if (body && (body.message || body.error)) {
        message = body.message || body.error;
      }
    } catch (e) {
      // response had no JSON body
    }
    const error = new Error(message);
    error.status = resp.status;
    throw error;
  }
  if (resp.status === 204) {
    return null;
  }
  const text = await resp.text();
  return text ? JSON.parse(text) : null;
}

async function request(path, options) {
  const resp = await fetch(`${API_BASE}${path}`, options);
  return handle(resp, path);
}

const json = (method) => (path, body) =>
  request(path, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

const get = (path) => request(path, { headers: authHeaders() });
const post = json('POST');
const put = json('PUT');
const del = (path) => request(path, { method: 'DELETE', headers: authHeaders() });

/* ------------------------------------------------------------------ auth */

export const authApi = {
  login: (email, password) => post('/auth/login', { email, password }),
  register: (fullName, email, password) => post('/auth/register', { fullName, email, password }),
  me: () => get('/auth/me'),
  updateProfile: (fullName) => put('/auth/profile', { fullName }),
  changePassword: (currentPassword, newPassword, confirmPassword) =>
    put('/auth/password', { currentPassword, newPassword, confirmPassword }),
  forgotPassword: (email) => post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword, confirmPassword) =>
    post('/auth/reset-password', { token, newPassword, confirmPassword })
};

/* -------------------------------------------------------------- templates */

export const templateApi = {
  list: () => get('/templates')
};

/* ---------------------------------------------------------------- resumes */

export const resumeApi = {
  list: () => get('/resumes'),
  get: (id) => get(`/resumes/${id}`),
  create: (payload) => post('/resumes', payload),
  update: (id, payload) => put(`/resumes/${id}`, payload),
  remove: (id) => del(`/resumes/${id}`)
};

/* --------------------------------------------------------------- analysis */

export const analysisApi = {
  run: (resumeId, payload) => post(`/resumes/${resumeId}/analysis`, payload || {}),
  latest: (resumeId) => get(`/resumes/${resumeId}/analysis`),
  previous: (resumeId) => get(`/resumes/${resumeId}/analysis/previous`),
  history: () => get('/analysis/history'),
  entry: (historyId) => get(`/analysis/history/${historyId}`)
};

export async function downloadPdf(resumeId, fileName = 'resume.pdf') {
  const resp = await fetch(`${API_BASE}/resumes/${resumeId}/pdf`, { headers: authHeaders() });
  if (!resp.ok) {
    if (resp.status === 401) {
      sessionExpired();
    }
    throw new Error(`PDF download failed (${resp.status})`);
  }
  const blob = await resp.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}