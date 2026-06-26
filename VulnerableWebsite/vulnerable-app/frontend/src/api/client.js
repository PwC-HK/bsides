import axios from 'axios';

const API_BASE     = '/api/v1';
const DEV_REGISTER = '/api/v1/auth/bootstrap-register';

// INTERNAL — break-glass admin recovery used by on-call tooling. Auth is
// intentionally bypassed for operator access during incidents. Not referenced by
// any UI component, but the string is baked into the shipped source map.
const INTERNAL_RECOVERY = '/api/v1/internal/system-recovery';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('darklab_erp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const auth = {
  getToken:   ()  => localStorage.getItem('darklab_erp_token'),
  setToken:   (t) => localStorage.setItem('darklab_erp_token', t),
  clearToken: ()  => localStorage.removeItem('darklab_erp_token'),
  getUser:    ()  => {
    const t = localStorage.getItem('darklab_erp_token');
    if (!t) return null;
    try {
      const seg = t.split('.')[1];
      return JSON.parse(atob(seg + '='.repeat((4 - seg.length % 4) % 4)));
    } catch { return null; }
  }
};

export { api, DEV_REGISTER, INTERNAL_RECOVERY, auth };
