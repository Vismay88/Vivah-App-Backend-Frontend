import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue'),
    meta: { title: 'VivahBazaar - Find Wedding Vendors in Gujarat' },
  },
  {
    path: '/vendors',
    name: 'Vendors',
    component: () => import('@/views/VendorListView.vue'),
    meta: { title: 'Find Vendors - VivahBazaar' },
  },
  {
    path: '/vendors/:slug',
    name: 'VendorProfile',
    component: () => import('@/views/VendorProfileView.vue'),
    meta: { title: 'Vendor Profile - VivahBazaar' },
  },
  {
    path: '/budget',
    name: 'Budget',
    component: () => import('@/views/BudgetView.vue'),
    meta: { title: 'Smart Event Budget Planner - VivahBazaar' },
  },
  {
    path: '/budget/share/:token',
    name: 'SharedBudget',
    component: () => import('@/views/SharedBudgetView.vue'),
    meta: { title: 'Shared Budget Plan - VivahBazaar' },
  },
  {
    path: '/register-vendor',
    name: 'RegisterVendor',
    component: () => import('@/views/VendorRegisterView.vue'),
    meta: { title: 'List Your Business - VivahBazaar' },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Login - VivahBazaar', guestOnly: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { title: 'Register - VivahBazaar', guestOnly: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Dashboard - VivahBazaar', requiresAuth: true },
  },
  {
    path: '/vendor/edit',
    name: 'VendorEdit',
    component: () => import('@/views/VendorEditView.vue'),
    meta: { title: 'Edit Vendor Profile - VivahBazaar', requiresAuth: true, requiresVendor: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: '404 - VivahBazaar' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  // Update page title
  document.title = to.meta.title || 'VivahBazaar';

  const authStore = useAuthStore();

  // Initialize auth if not done
  if (!authStore.initialized) {
    await authStore.initAuth();
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  if (to.meta.guestOnly && authStore.isLoggedIn) {
    return next({ name: 'Home' });
  }

  if (to.meta.requiresVendor && authStore.user?.role !== 'vendor') {
    return next({ name: 'Dashboard' });
  }

  next();
});

export default router;
