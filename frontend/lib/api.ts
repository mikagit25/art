import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Token storage
const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

const getRefreshToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Auth endpoints
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: any) =>
    api.post('/auth/register', data),
  registerArtist: (data: any) =>
    api.post('/auth/register/artist', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// Artworks endpoints
export const artworksApi = {
  getAll: (params?: any) => api.get('/artworks', { params }),
  getNew: () => api.get('/artworks/new'),
  getPopular: () => api.get('/artworks/popular'),
  getBySlug: (slug: string) => api.get(`/artworks/${slug}`),
  getMy: (params?: any) => api.get('/artworks/my', { params }),
  create: (data: any) => api.post('/artworks', data),
  update: (id: string, data: any) => api.put(`/artworks/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.patch(`/artworks/${id}/status`, { status }),
  uploadImage: (id: string, file: File, order = 0) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/artworks/${id}/images?order=${order}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteImage: (imageId: string) => api.delete(`/artworks/images/${imageId}`),
  toggleFavorite: (id: string) => api.post(`/artworks/${id}/favorite`),
  getFavorites: () => api.get('/artworks/favorites'),
};

// Artists endpoints
export const artistsApi = {
  getAll: (params?: any) => api.get('/artists', { params }),
  getFeatured: () => api.get('/artists/featured'),
  getBySlug: (slug: string) => api.get(`/artists/${slug}`),
  getMe: () => api.get('/artists/me'),
  getMyStats: () => api.get('/artists/me/stats'),
  updateProfile: (data: any) => api.put('/artists/me', data),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.patch('/artists/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadCover: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.patch('/artists/me/cover', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Orders endpoints
export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  getArtistOrders: () => api.get('/orders/artist'),
  updateStatus: (id: string, data: any) => api.patch(`/orders/${id}/status`, data),
};

// Payments endpoints
export const paymentsApi = {
  createCheckout: (orderId: string) => api.post(`/payments/checkout/${orderId}`),
  getPayoutSettings: () => api.get('/payments/payout-settings'),
  updatePayoutSettings: (data: any) => api.put('/payments/payout-settings', data),
  getTransactions: () => api.get('/payments/transactions'),
};

// Admin endpoints
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPendingArtists: () => api.get('/admin/artists/pending'),
  getAllArtists: (params?: any) => api.get('/admin/artists', { params }),
  approveArtist: (id: string) => api.patch(`/admin/artists/${id}/approve`),
  rejectArtist: (id: string, reason?: string) =>
    api.patch(`/admin/artists/${id}/reject`, { reason }),
  updateCommission: (id: string, rate: number) =>
    api.patch(`/admin/artists/${id}/commission`, { rate }),
  getPendingArtworks: () => api.get('/admin/artworks/pending'),
  getAllArtworks: (params?: any) => api.get('/admin/artworks', { params }),
  approveArtwork: (id: string) => api.patch(`/admin/artworks/${id}/approve`),
  rejectArtwork: (id: string, reason?: string) =>
    api.patch(`/admin/artworks/${id}/reject`, { reason }),
  getBanners: () => api.get('/admin/banners'),
  createBanner: (data: any) => api.post('/admin/banners', data),
  updateBanner: (id: string, data: any) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id: string) => api.delete(`/admin/banners/${id}`),
  getSettings: () => api.get('/admin/settings'),
  updateSetting: (key: string, value: string) =>
    api.patch(`/admin/settings/${key}`, { value }),
  getFinancialReport: (params?: any) =>
    api.get('/admin/reports/financial', { params }),
  getAllUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUserRole: (id: string, role: string) =>
    api.patch(`/admin/users/${id}/role`, { role }),
  toggleUserActive: (id: string) =>
    api.patch(`/admin/users/${id}/toggle-active`),
};

export const searchApi = {
  search: (q: string, category?: string) =>
    api.get('/search', { params: { q, category } }),
};
