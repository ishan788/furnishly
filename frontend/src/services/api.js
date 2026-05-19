import axios from 'axios';

const createBaseURL = () => {
  const rawUrl = process.env.REACT_APP_API_URL;
  if (!rawUrl) return '/api';
  const normalized = rawUrl.replace(/\/+$/, '');
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

const API = axios.create({
  baseURL: createBaseURL(),
  timeout: 15000,
});

// Attach access token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${process.env.REACT_APP_API_URL || '/api'}/auth/refresh-token`,
            { refreshToken }
          );
          localStorage.setItem('accessToken', data.accessToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return API(original);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
  refreshToken: (token) => API.post('/auth/refresh-token', { refreshToken: token }),
  updatePassword: (data) => API.put('/auth/update-password', data),
};

// Products
export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getOne: (slugOrId) => API.get(`/products/${slugOrId}`),
  create: (data) => API.post('/products', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
  getFilterOptions: () => API.get('/products/filters/options'),
};

// Categories
export const categoryAPI = {
  getAll: () => API.get('/categories'),
  getOne: (slugOrId) => API.get(`/categories/${slugOrId}`),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

// Orders
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getMyOrders: (params) => API.get('/orders/my-orders', { params }),
  getOne: (id) => API.get(`/orders/${id}`),
  cancel: (id, reason) => API.put(`/orders/${id}/cancel`, { reason }),
};

// Payments
export const paymentAPI = {
  createRazorpayOrder: (orderId) => API.post('/payments/razorpay/create-order', { orderId }),
  verifyRazorpay: (data) => API.post('/payments/razorpay/verify', data),
  getRazorpayKey: () => API.get('/payments/razorpay/key'),
};

// Users
export const userAPI = {
  updateProfile: (data) => API.put('/users/profile', data),
  addAddress: (data) => API.post('/users/addresses', data),
  updateAddress: (id, data) => API.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => API.delete(`/users/addresses/${id}`),
  getWishlist: () => API.get('/users/wishlist'),
  toggleWishlist: (productId) => API.post(`/users/wishlist/${productId}`),
};

// Reviews
export const reviewAPI = {
  getProductReviews: (productId, params) => API.get(`/reviews/product/${productId}`, { params }),
  create: (data) => API.post('/reviews', data),
  markHelpful: (id) => API.post(`/reviews/${id}/helpful`),
  delete: (id) => API.delete(`/reviews/${id}`),
};

// Admin
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getAllOrders: (params) => API.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => API.put(`/admin/orders/${id}/status`, data),
  getAllUsers: (params) => API.get('/admin/users', { params }),
  toggleUserStatus: (id) => API.put(`/admin/users/${id}/toggle-status`),
};

// Upload
export const uploadAPI = {
  uploadImage: (formData) => API.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadImages: (formData) => API.post('/upload/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteImage: (publicId) => API.delete('/upload/image', { data: { publicId } }),
};

export const fetcher = (url) => API.get(url).then(res => res.data);

export default API;
