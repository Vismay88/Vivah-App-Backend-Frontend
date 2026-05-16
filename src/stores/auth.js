import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('vb_token') || null);
  const vendorProfile = ref(null);
  const initialized = ref(false);

  const isLoggedIn = computed(() => !!token.value && !!user.value);
  const isVendor = computed(() => user.value?.role === 'vendor');
  const isAdmin = computed(() => user.value?.role === 'admin');

  const setToken = (newToken) => {
    token.value = newToken;
    if (newToken) {
      localStorage.setItem('vb_token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } else {
      localStorage.removeItem('vb_token');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const initAuth = async () => {
    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      try {
        const res = await api.get('/auth/me');
        user.value = res.data.user;
        vendorProfile.value = res.data.vendorProfile;
      } catch {
        setToken(null);
        user.value = null;
      }
    }
    initialized.value = true;
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setToken(res.data.token);
    user.value = res.data.user;
    return res.data;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    setToken(res.data.token);
    user.value = res.data.user;
    return res.data;
  };

  const logout = () => {
    setToken(null);
    user.value = null;
    vendorProfile.value = null;
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    user.value = res.data.user;
    return res.data;
  };

  const toggleSaveVendor = async (vendorId) => {
    const res = await api.post(`/auth/save-vendor/${vendorId}`);
    if (user.value) {
      user.value.savedVendors = res.data.savedVendors;
    }
    return res.data;
  };

  const isVendorSaved = (vendorId) => {
    return user.value?.savedVendors?.includes(vendorId) || false;
  };

  return {
    user,
    token,
    vendorProfile,
    initialized,
    isLoggedIn,
    isVendor,
    isAdmin,
    initAuth,
    login,
    register,
    logout,
    updateProfile,
    toggleSaveVendor,
    isVendorSaved,
  };
});
