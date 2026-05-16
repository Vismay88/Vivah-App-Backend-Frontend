<template>
  <div class="auth-page">

    <!-- Ambient background blobs -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>

    <!-- Decorative rings -->
    <div class="ring ring-1"></div>
    <div class="ring ring-2"></div>

    <div class="auth-container">

      <!-- Left panel — branding (desktop only) -->
      <div class="brand-panel">
        <div class="brand-content">
          <div class="brand-logo">
            <span>V</span>
          </div>
          <h2 class="brand-title">
            Find Perfect<br />
            <em>Wedding Vendors</em><br />
            in Gujarat
          </h2>
          <p class="brand-sub">
            Gujarat's most trusted wedding marketplace. 500+ verified vendors across 30 cities.
          </p>

          <!-- Stats -->
          <div class="brand-stats">
            <div class="stat">
              <span class="stat-val">500+</span>
              <span class="stat-label">Vendors</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-val">30+</span>
              <span class="stat-label">Cities</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-val">4.8★</span>
              <span class="stat-label">Rating</span>
            </div>
          </div>

          <!-- Floating vendor cards -->
          <div class="float-cards">
            <div class="float-card" v-for="c in floatCards" :key="c.name">
              <span class="float-emoji">{{ c.emoji }}</span>
              <div>
                <p class="float-name">{{ c.name }}</p>
                <p class="float-cat">{{ c.cat }}</p>
              </div>
              <div class="float-rating">⭐ {{ c.rating }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right panel — form -->
      <div class="form-panel">
        <div class="glass-card">

          <!-- Logo (mobile) -->
          <RouterLink to="/" class="mobile-logo">
            <div class="mobile-logo-icon"><span>V</span></div>
            <span class="mobile-logo-text"><em>Vivah</em>Bazaar</span>
          </RouterLink>

          <!-- Header -->
          <div class="form-header">
            <h1 class="form-title">Welcome back 👋</h1>
            <p class="form-sub">Sign in to continue planning your dream wedding</p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleLogin" class="auth-form">

            <!-- Email -->
            <div class="field-group">
              <label class="field-label">Email address</label>
              <div class="field-wrap">
                <i class="pi pi-envelope field-icon"></i>
                <input
                  v-model="email"
                  type="email"
                  placeholder="your@email.com"
                  class="auth-input"
                  required
                  autofocus
                />
              </div>
            </div>

            <!-- Password -->
            <div class="field-group">
              <div class="field-label-row">
                <label class="field-label">Password</label>
                <a href="#" class="forgot-link">Forgot password?</a>
              </div>
              <div class="field-wrap">
                <i class="pi pi-lock field-icon"></i>
                <input
                  v-model="password"
                  :type="showPass ? 'text' : 'password'"
                  placeholder="Your password"
                  class="auth-input"
                  required
                />
                <button type="button" class="eye-btn" @click="showPass = !showPass">
                  <i :class="showPass ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
            </div>

            <!-- Error -->
            <Transition name="shake">
              <div v-if="error" class="error-box">
                <i class="pi pi-exclamation-triangle"></i>
                {{ error }}
              </div>
            </Transition>

            <!-- Submit -->
            <button type="submit" class="submit-btn" :disabled="loading">
              <span v-if="!loading" class="submit-content">
                <i class="pi pi-sign-in"></i>
                Sign In
              </span>
              <span v-else class="submit-content">
                <i class="pi pi-spin pi-spinner"></i>
                Signing in...
              </span>
            </button>
          </form>

          <!-- Divider -->
          <div class="or-divider">
            <span class="or-line"></span>
            <span class="or-text">or try a demo</span>
            <span class="or-line"></span>
          </div>

          <!-- Demo accounts -->
          <div class="demo-grid">
            <button
              v-for="demo in demoAccounts"
              :key="demo.email"
              class="demo-btn"
              @click="fillDemo(demo)"
            >
              <span class="demo-emoji">{{ demo.emoji }}</span>
              <div class="demo-info">
                <span class="demo-label">{{ demo.label }}</span>
                <span class="demo-email">{{ demo.email }}</span>
              </div>
            </button>
          </div>

          <!-- Footer -->
          <p class="auth-footer">
            Don't have an account?
            <RouterLink to="/register" class="auth-link">Create one free →</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const route  = useRoute();
const authStore = useAuthStore();

const email    = ref('');
const password = ref('');
const showPass = ref(false);
const loading  = ref(false);
const error    = ref('');

const demoAccounts = [
  { label: 'Couple',  emoji: '💑', email: 'couple@vivahbazaar.com',  password: 'couple123' },
  { label: 'Vendor',  emoji: '🏪', email: 'vendor1@vivahbazaar.com', password: 'vendor123' },
  { label: 'Admin',   emoji: '🛡️', email: 'admin@vivahbazaar.com',   password: 'admin123'  },
];

const floatCards = [
  { emoji: '📸', name: 'Moments by Mehul', cat: 'Photography', rating: '4.9' },
  { emoji: '🍽️', name: 'Shree Caterers',   cat: 'Catering',    rating: '4.8' },
  { emoji: '🌸', name: 'Dream Decor',       cat: 'Decoration',  rating: '4.7' },
];

const fillDemo = (demo) => {
  email.value    = demo.email;
  password.value = demo.password;
};

const handleLogin = async () => {
  error.value   = '';
  loading.value = true;
  try {
    await authStore.login(email.value, password.value);
    router.push(route.query.redirect || '/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Invalid email or password.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* ── Page ── */
.auth-page {
  min-height: 100vh;
  background: #0a0a0f;
  display: flex;
  align-items: stretch;
  position: relative;
  overflow: hidden;
}

/* ── Ambient blobs ── */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.18;
  pointer-events: none;
}
.blob-1 {
  width: 500px; height: 500px;
  background: #ea580c;
  top: -150px; left: -100px;
}
.blob-2 {
  width: 400px; height: 400px;
  background: #e11d48;
  bottom: -100px; right: 30%;
}
.blob-3 {
  width: 300px; height: 300px;
  background: #f59e0b;
  top: 40%; right: -80px;
}

/* ── Decorative rings ── */
.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.04);
  pointer-events: none;
}
.ring-1 { width: 600px; height: 600px; top: -200px; left: -200px; }
.ring-2 { width: 400px; height: 400px; bottom: -100px; right: -100px; }

/* ── Layout ── */
.auth-container {
  display: flex;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* ── Left brand panel ── */
.brand-panel {
  display: none;
  flex: 1;
  padding: 60px 48px;
  flex-direction: column;
  justify-content: center;
}
@media (min-width: 1024px) { .brand-panel { display: flex; } }

.brand-content { max-width: 420px; }

.brand-logo {
  width: 52px; height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f97316, #e11d48);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 24px rgba(249,115,22,0.4);
  margin-bottom: 32px;
}
.brand-logo span {
  color: #fff;
  font-size: 24px;
  font-weight: 800;
  font-family: 'Playfair Display', serif;
}

.brand-title {
  font-size: 38px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 16px;
  font-family: 'Playfair Display', serif;
}
.brand-title em {
  font-style: italic;
  color: #fbbf24;
}

.brand-sub {
  font-size: 15px;
  color: rgba(255,255,255,0.5);
  line-height: 1.6;
  margin-bottom: 36px;
}

.brand-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}
.stat { text-align: center; }
.stat-val {
  display: block;
  font-size: 22px;
  font-weight: 800;
  color: #f97316;
}
.stat-label {
  display: block;
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.stat-divider {
  width: 1px; height: 36px;
  background: rgba(255,255,255,0.1);
}

/* Floating vendor cards */
.float-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.float-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  backdrop-filter: blur(10px);
  transition: transform 0.2s;
}
.float-card:hover { transform: translateX(4px); }
.float-emoji { font-size: 22px; }
.float-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}
.float-cat {
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  margin: 0;
}
.float-rating {
  margin-left: auto;
  font-size: 12px;
  color: #fbbf24;
  font-weight: 600;
}

/* ── Right form panel ── */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}
@media (min-width: 1024px) {
  .form-panel {
    flex: 0 0 480px;
    border-left: 1px solid rgba(255,255,255,0.06);
  }
}

/* ── Glass card ── */
.glass-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 28px;
  padding: 40px 36px;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow:
    0 24px 64px rgba(0,0,0,0.4),
    0 1px 0 rgba(255,255,255,0.08) inset;
}

/* Mobile logo */
.mobile-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  margin-bottom: 28px;
  justify-content: center;
}
@media (min-width: 1024px) { .mobile-logo { display: none; } }

.mobile-logo-icon {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #e11d48);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 14px rgba(249,115,22,0.4);
}
.mobile-logo-icon span {
  color: #fff; font-size: 16px; font-weight: 800;
  font-family: 'Playfair Display', serif;
}
.mobile-logo-text {
  font-size: 20px; font-weight: 700; color: #fff;
  font-family: 'Playfair Display', serif;
}
.mobile-logo-text em { font-style: italic; color: #fbbf24; }

/* Form header */
.form-header { margin-bottom: 28px; }
.form-title {
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  margin: 0 0 6px;
  font-family: 'Playfair Display', serif;
}
.form-sub {
  font-size: 14px;
  color: rgba(255,255,255,0.45);
  margin: 0;
}

/* ── Form fields ── */
.auth-form { display: flex; flex-direction: column; gap: 18px; }

.field-group { display: flex; flex-direction: column; gap: 7px; }

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.field-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.01em;
}
.forgot-link {
  font-size: 12px;
  color: #f97316;
  text-decoration: none;
  transition: color 0.15s;
}
.forgot-link:hover { color: #fb923c; }

.field-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.field-icon {
  position: absolute;
  left: 14px;
  color: rgba(255,255,255,0.3);
  font-size: 14px;
  pointer-events: none;
  z-index: 1;
}
.auth-input {
  width: 100%;
  height: 48px;
  padding: 0 44px 0 42px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;
}
.auth-input::placeholder { color: rgba(255,255,255,0.25); }
.auth-input:focus {
  border-color: rgba(249,115,22,0.6);
  background: rgba(255,255,255,0.08);
  box-shadow: 0 0 0 3px rgba(249,115,22,0.12);
}

.eye-btn {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: rgba(255,255,255,0.3);
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  transition: color 0.15s;
}
.eye-btn:hover { color: rgba(255,255,255,0.7); }

/* Error */
.error-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.3);
  border-radius: 10px;
  color: #fca5a5;
  font-size: 13px;
}

/* Submit button */
.submit-btn {
  width: 100%;
  height: 50px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #ea580c, #f97316);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(249,115,22,0.35);
  font-family: inherit;
  margin-top: 4px;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(249,115,22,0.5);
}
.submit-btn:active:not(:disabled) { transform: translateY(0); }
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.submit-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* OR divider */
.or-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 24px 0 16px;
}
.or-line {
  flex: 1;
  height: 1px;
  background: rgba(255,255,255,0.08);
}
.or-text {
  font-size: 12px;
  color: rgba(255,255,255,0.3);
  white-space: nowrap;
}

/* Demo accounts */
.demo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 24px;
}
.demo-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}
.demo-btn:hover {
  background: rgba(249,115,22,0.1);
  border-color: rgba(249,115,22,0.3);
}
.demo-emoji { font-size: 18px; }
.demo-info { display: flex; flex-direction: column; gap: 1px; }
.demo-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.8);
}
.demo-email {
  font-size: 9px;
  color: rgba(255,255,255,0.3);
  word-break: break-all;
}

/* Footer */
.auth-footer {
  text-align: center;
  font-size: 13px;
  color: rgba(255,255,255,0.35);
  margin: 0;
}
.auth-link {
  color: #f97316;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.15s;
}
.auth-link:hover { color: #fb923c; }

/* Shake animation for error */
.shake-enter-active { animation: shake 0.4s ease; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}
</style>
