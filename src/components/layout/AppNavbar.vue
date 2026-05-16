<template>
  <!-- Floating navbar wrapper — sits above page content -->
  <div class="nav-wrapper">
    <nav class="navbar" :class="{ scrolled: isScrolled }">

      <!-- Logo -->
      <RouterLink to="/" class="logo">
        <div class="logo-mark">
          <span>V</span>
        </div>
        <span class="logo-name"><em>Vivah</em>Bazaar</span>
      </RouterLink>

      <!-- Center nav links -->
      <div class="nav-links">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :class="{ active: isActive(link.to) }"
        >
          {{ link.label }}
        </RouterLink>
      </div>

      <!-- Right actions -->
      <div class="nav-actions">
        <RouterLink to="/register-vendor" class="btn-list">
          <i class="pi pi-plus"></i>
          <span class="hidden sm:inline">List Business</span>
        </RouterLink>

        <template v-if="!authStore.isLoggedIn">
          <RouterLink to="/login" class="btn-ghost">Login</RouterLink>
          <RouterLink to="/register" class="btn-solid">Sign Up</RouterLink>
        </template>

        <template v-else>
          <button class="user-pill" @click="toggleUserMenu">
            <div class="user-avatar">{{ authStore.user?.name?.charAt(0)?.toUpperCase() }}</div>
            <span class="hidden sm:block user-name">{{ authStore.user?.name?.split(' ')[0] }}</span>
            <i class="pi pi-chevron-down" style="font-size:10px;opacity:0.6"></i>
          </button>
          <Menu ref="userMenu" :model="userMenuItems" :popup="true" />
        </template>

        <!-- Hamburger -->
        <button class="hamburger" @click="mobileOpen = !mobileOpen" aria-label="Menu">
          <span class="bar" :class="{ open: mobileOpen }"></span>
          <span class="bar mid" :class="{ open: mobileOpen }"></span>
          <span class="bar" :class="{ open: mobileOpen }"></span>
        </button>
      </div>
    </nav>

    <!-- Mobile drawer -->
    <Transition name="drawer">
      <div v-if="mobileOpen" class="mobile-drawer">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="drawer-link"
          :class="{ active: isActive(link.to) }"
          @click="mobileOpen = false"
        >
          <i :class="link.icon"></i>
          {{ link.label }}
        </RouterLink>

        <div class="drawer-sep"></div>

        <RouterLink to="/register-vendor" class="drawer-cta" @click="mobileOpen = false">
          <i class="pi pi-plus-circle"></i> List Your Business Free
        </RouterLink>

        <div v-if="!authStore.isLoggedIn" class="drawer-auth">
          <RouterLink to="/login" class="drawer-login" @click="mobileOpen = false">Login</RouterLink>
          <RouterLink to="/register" class="drawer-signup" @click="mobileOpen = false">Sign Up</RouterLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const mobileOpen = ref(false);
const userMenu = ref(null);
const isScrolled = ref(false);

const navLinks = [
  { to: '/',        label: 'Home',           icon: 'pi pi-home' },
  { to: '/vendors', label: 'Find Vendors',   icon: 'pi pi-search' },
  { to: '/budget',  label: 'Budget Planner', icon: 'pi pi-calculator' },
];

const isActive = (path) =>
  path === '/' ? route.path === '/' : route.path.startsWith(path);

const toggleUserMenu = (e) => userMenu.value.toggle(e);

const handleScroll = () => { isScrolled.value = window.scrollY > 20; };
onMounted(() => window.addEventListener('scroll', handleScroll));
onUnmounted(() => window.removeEventListener('scroll', handleScroll));

const userMenuItems = computed(() => {
  const base = [
    { label: authStore.user?.name, items: [
      { label: 'Dashboard', icon: 'pi pi-th-large', command: () => router.push('/dashboard') },
    ]},
  ];
  if (authStore.isVendor)
    base[0].items.push({ label: 'Edit Profile', icon: 'pi pi-pencil', command: () => router.push('/vendor/edit') });
  base[0].items.push(
    { separator: true },
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => { authStore.logout(); router.push('/'); } }
  );
  return base;
});
</script>

<style scoped>
/* ── Wrapper: gives the floating effect ── */
.nav-wrapper {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 6px 16px 0;
  background: transparent;
  pointer-events: none;
}

/* ── The pill navbar itself ── */
.navbar {
  pointer-events: all;
  max-width: 1100px;
  margin: 0 auto;
  height: 58px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 8px 0 14px;
  border-radius: 100px;
  background: #000000ae;
  backdrop-filter: blur(18px) saturate(180%);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.35),
    0 1px 0 rgba(255,255,255,0.08) inset;
  transition: all 0.3s ease;
}

.navbar.scrolled {
  background: rgba(20, 8, 4, 0.82);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.5),
    0 1px 0 rgba(255,255,255,0.08) inset;
}

/* ── Logo ── */
.logo {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  flex-shrink: 0;
}

.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #e11d48);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 12px rgba(249, 115, 22, 0.5);
  flex-shrink: 0;
}
.logo-mark span {
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  font-family: 'Playfair Display', serif;
}

.logo-name {
  font-size: 17px;
  font-weight: 700;
  color: #fff;
  font-family: 'Playfair Display', serif;
  letter-spacing: -0.3px;
  display: none;
}
.logo-name em {
  font-style: italic;
  color: #fbbf24;
}
@media (min-width: 480px) { .logo-name { display: block; } }

/* ── Center nav links ── */
.nav-links {
  display: none;
  flex: 1;
  justify-content: center;
  align-items: center;
  gap: 2px;
}
@media (min-width: 768px) { .nav-links { display: flex; } }

.nav-link {
  position: relative;
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 13.5px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
  letter-spacing: 0.01em;
}
.nav-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
}
.nav-link.active {
  color: #fff;
  background: rgba(249, 115, 22, 0.25);
  font-weight: 600;
}
/* glowing dot under active link */
.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background:#111827;
  box-shadow: 0 0 6px #f97316;
}

/* ── Right actions ── */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex-shrink: 0;
}

/* List Business — subtle outline */
.btn-list {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 13px;
  border-radius: 100px;
  font-size: 12.5px;
  font-weight: 600;
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.2s ease;
  white-space: nowrap;
}
.btn-list:hover {
  color: #fff;
  border-color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.08);
}
.btn-list .pi { font-size: 11px; }

/* Login — ghost */
.btn-ghost {
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.btn-ghost:hover {
  color: #fff;
  background: rgba(255,255,255,0.1);
}

/* Sign Up — glowing orange pill */
.btn-solid {
  padding: 7px 18px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  text-decoration: none;
  background: linear-gradient(135deg, #ea580c, #f97316);
  box-shadow: 0 0 16px rgba(249, 115, 22, 0.45);
  transition: all 0.2s ease;
  white-space: nowrap;
}
.btn-solid:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 24px rgba(249, 115, 22, 0.65);
}

/* User pill */
.user-pill {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 12px 4px 4px;
  border-radius: 100px;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.18);
  cursor: pointer;
  transition: all 0.2s ease;
  color: #fff;
}
.user-pill:hover {
  background: rgba(255,255,255,0.18);
  border-color: rgba(255,255,255,0.35);
}
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #e11d48);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px rgba(249,115,22,0.4);
}
.user-name {
  font-size: 13px;
  font-weight: 600;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Hamburger — animated bars */
.hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.18);
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;
}
.hamburger:hover { background: rgba(255,255,255,0.18); }
@media (min-width: 768px) { .hamburger { display: none; } }

.bar {
  display: block;
  width: 16px;
  height: 1.5px;
  background: rgba(255,255,255,0.85);
  border-radius: 2px;
  transition: all 0.25s ease;
  transform-origin: center;
}
.bar.mid { width: 11px; align-self: flex-start; margin-left: 10px; }
.bar.open { width: 16px; }
.bar:first-child.open { transform: translateY(5.5px) rotate(45deg); }
.bar.mid.open { opacity: 0; transform: scaleX(0); }
.bar:last-child.open { transform: translateY(-5.5px) rotate(-45deg); }

/* ── Mobile drawer ── */
.mobile-drawer {
  pointer-events: all;
  max-width: 1100px;
  margin: 8px auto 0;
  border-radius: 24px;
  background: rgba(15, 5, 2, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
}

.drawer-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  transition: all 0.15s ease;
}
.drawer-link .pi { font-size: 15px; color: #f97316; }
.drawer-link:hover,
.drawer-link.active {
  background: rgba(249,115,22,0.15);
  color: #fff;
}

.drawer-sep {
  height: 1px;
  background: rgba(255,255,255,0.08);
  margin: 4px 0;
}

.drawer-cta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #ea580c, #f97316);
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(249,115,22,0.35);
  transition: all 0.15s ease;
}
.drawer-cta:hover { opacity: 0.9; }

.drawer-auth {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.drawer-login {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
  text-decoration: none;
  border: 1px solid rgba(255,255,255,0.2);
  transition: all 0.15s ease;
}
.drawer-login:hover { background: rgba(255,255,255,0.08); color: #fff; }

.drawer-signup {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #ea580c, #f97316);
  text-decoration: none;
  transition: all 0.15s ease;
}
.drawer-signup:hover { opacity: 0.9; }

/* ── Transitions ── */
.drawer-enter-active,
.drawer-leave-active { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.drawer-enter-from,
.drawer-leave-to { opacity: 0; transform: translateY(-12px) scale(0.97); }
</style>
