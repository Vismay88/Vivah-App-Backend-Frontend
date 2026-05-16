import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '@/services/api';

export const useVendorStore = defineStore('vendor', () => {
  const vendors = ref([]);
  const currentVendor = ref(null);
  const stats = ref(null);
  const pagination = ref(null);
  const loading = ref(false);

  const fetchVendors = async (params = {}) => {
    loading.value = true;
    try {
      const res = await api.get('/vendors', { params });
      vendors.value = res.data.vendors;
      pagination.value = res.data.pagination;
      return res.data;
    } finally {
      loading.value = false;
    }
  };

  const fetchVendorBySlug = async (slug) => {
    loading.value = true;
    try {
      const res = await api.get(`/vendors/${slug}`);
      currentVendor.value = res.data.vendor;
      return res.data.vendor;
    } finally {
      loading.value = false;
    }
  };

  const fetchStats = async () => {
    const res = await api.get('/vendors/stats');
    stats.value = res.data.stats;
    return res.data.stats;
  };

  const fetchVendorsByBudget = async (params) => {
    const res = await api.get('/vendors/by-budget', { params });
    return res.data.vendors;
  };

  const createVendor = async (data) => {
    const res = await api.post('/vendors', data);
    return res.data.vendor;
  };

  const updateVendor = async (id, data) => {
    const res = await api.put(`/vendors/${id}`, data);
    return res.data.vendor;
  };

  const addReview = async (slug, reviewData) => {
    const res = await api.post(`/vendors/${slug}/reviews`, reviewData);
    currentVendor.value = res.data.vendor;
    return res.data.vendor;
  };

  const getMyVendorProfile = async () => {
    const res = await api.get('/vendors/my-profile');
    return res.data.vendor;
  };

  return {
    vendors,
    currentVendor,
    stats,
    pagination,
    loading,
    fetchVendors,
    fetchVendorBySlug,
    fetchStats,
    fetchVendorsByBudget,
    createVendor,
    updateVendor,
    addReview,
    getMyVendorProfile,
  };
});
