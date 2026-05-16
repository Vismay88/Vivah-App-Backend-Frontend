<template>
  <div class="auth-page">

    <!-- Ambient blobs -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>
    <div class="ring ring-1"></div>
    <div class="ring ring-2"></div>

    <div class="auth-container">

      <!-- Left brand panel -->
      <div class="brand-panel">
        <div class="brand-content">
          <div class="brand-logo"><span>V</span></div>

          <h2 class="brand-title">
            Start Your<br />
            <em>Wedding Journey</em><br />
            Today
          </h2>
          <p class="brand-sub">
            Join thousands of couples who found their perfect wedding vendors on VivahBazaar.
          </p>

          <!-- Benefits -->
          <div class="benefits">
            <div class="benefit" v-for="b in benefits" :key="b.text">
              <div class="benefit-icon">{{ b.icon }}</div>
              <div>
                <p class="benefit-title">{{ b.title }}</p>
                <p class="benefit-desc">{{ b.text }}</p>
              </div>
            </div>
          </div>

          <!-- Testimonial -->
          <div class="testimonial">
            <p class="testimonial-text">
              "Found our photographer, caterer and decorator all in one place. Saved us weeks of searching!"
            </p>
            <div class="testimonial-author">
              <div class="testimonial-avatar">P</div>
              <div>
                <p class="testimonial-name">Priya & Rahul Shah</p>
                <p class="testimonial-city">Ahmedabad · Married Dec 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right form panel -->
      <div class="form-panel">
        <div class="glass-card">

          <!-- Mobile logo -->
          <RouterLink to="/" class="mobile-logo">
            <div class="mobile-logo-icon"><span>V</span></div>
            <span class="mobile-logo-text"><em>Vivah</em>Bazaar</span>
          </RouterLink>

          <!-- Header -->
          <div class="form-header">
            <h1 class="form-title">Create account ✨</h1>
            <p class="form-sub">Free forever. No credit card needed.</p>
          </div>

          <!-- Role toggle -->
          <div class="role-toggle">
            <button
              class="role-btn"
              :class="{ active: role === 'couple' }"
              @click="role = 'couple'"
              type="button"
            >
              <span class="role-emoji">💑</span>
              <span class="role-label">I'm a Couple</span>
            </button>
            <button
              class="role-btn"
              :class="{ active: role === 'vendor' }"
              @click="role = 'vendor'"
              type="button"
            >
              <span class="role-emoji">🏪</span>
              <span class="role-label">I'm a Vendor</span>
            </button>
          </div>

          <!-- Role description -->
          <p class="role-desc">
            <template v-if="role === 'couple'">
              🎊 Search vendors, plan budget, save favourites
            </template>
            <template v-else>
              🚀 Get a free profile page, reach thousands of couples
            </template>
          </p>

          <!-- Form -->
          <form @submit.prevent="handleRegister" class="auth-form">

            <!-- Name -->
            <div class="field-group">
              <label class="field-label">Full Name *</label>
              <div class="field-wrap">
                <i class="pi pi-user field-icon"></i>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="Your full name"
                  class="auth-input"
                  required
                  autofocus
                />
              </div>
            </div>

            <!-- Email -->
            <div class="field-group">
              <label class="field-label">Email address *</label>
              <div class="field-wrap">
                <i class="pi pi-envelope field-icon"></i>
                <input
                  v-model="form.email"
                  type="email"
                  placeholder="your@email.com"
                  class="auth-input"
                  required
                />
              </div>
            </div>

            <!-- Phone -->
            <div class="field-group">
              <label class="field-label">Phone <span class="optional">(optional)</span></label>
              <div class="field-wrap">
                <span class="field-prefix">+91</span>
                <input
                  v-model="form.phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  class="auth-input with-prefix"
                  maxlength="10"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="field-group">
              <label class="field-label">Password *</label>
              <div class="field-wrap">
                <i class="pi pi-lock field-icon"></i>
                <input
                  v-model="form.password"
                  :type="showPass ? 'text' : 'password'"
                  placeholder="Min 6 characters"
                  class="auth-input"
                  required
                  minlength="6"
                />
                <button type="button" class="eye-btn" @click="showPass = !showPass">
                  <i :class="showPass ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
              <!-- Password strength -->
              <div v-if="form.password" class="strength-bar">
                <div
                  class="strength-fill"
                  :style="{ width: strengthWidth, background: strengthColor }"
                ></div>
              </div>
              <p v-if="form.password" class="strength-label" :style="{ color: strengthColor }">
                {{ strengthLabel }}
              </p>
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
              <span class="submit-content">
                <i v-if="loading" class="pi pi-spin pi-spinner"></i>
                <i v-else class="pi pi-user-plus"></i>
                {{ loading ? 'Creating account...' : (role === 'vendor' ? 'Create Vendor Account' : 'Create Account') }}
              </span>
            </button>

            <p class="terms-note">
              By signing up you agree to our
              <a href="#" class="terms-link">Terms</a> &
              <a href="#" class="terms-link">Privacy Policy</a>
            </p>
          </form>

          <!-- Footer -->
          <p class="auth-footer">
            Already have an account?
            <RouterLink to="/login" class="auth-link">Sign in →</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router    = useRouter();
const authStore = useAuthStore();

const role     = ref('couple');
const showPass = ref(false);
const loading  = ref(false);
const error    = ref('');
const form     = ref({ name: '', email: '', phone: '', password: '' });

const benefits = [
  { icon: '🔍', title: 'Smart Search',    text: 'Filter by category, city & budget' },
  { icon: '💰', title: 'Budget Planner',  text: 'Plan & track your wedding spend' },
  { icon: '⭐', title: 'Verified Vendors', text: '500+ trusted vendors across Gujarat' },
];

// Password strength
const strengthWidth = computed(() => {
  const p = form.value.password;
  if (!p) return '0%';
  let score = 0;
  if (p.length >= 6)  score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return `${(score / 5) * 100}%`;
});

const strengthColor = computed(() => {
  const p = form.value.password;
  if (!p) return '#6b7280';
  let score = 0;
  if (p.length >= 6)  score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score <= 1) return '#ef4444';
  if (score <= 3) return '#f59e0b';
  return '#22c55e';
});

const strengthLabel = computed(() => {
  const p = form.value.password;
  if (!p) return '';
  let score = 0;
  if (p.length >= 6)  score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  if (score <= 1) return 'Weak password';
  if (score <= 3) return 'Fair password';
  return 'Strong password ✓';
});

const handleRegister = async () => {
  error.value   = '';
  loading.value = true;
  try {
    await authStore.register({ ...form.value, role: role.value });
    router.push(role.value === 'vendor' ? '/register-vendor' : '/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Registration failed. Please try again.';
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

/* ── Blobs ── */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  pointer-events: none;
}
.blob-1 { width: 500px; height: 500px; background: #e11d48; top: -150px; right: -100px; }
.blob-2 { width: 400px; height: 400px; background: #ea580c; bottom: -100px; left: 20%; }
.blob-3 { width: 300px; height: 300px; background: #7c3aed; top: 30%; left: -80px; }

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.04);
  pointer-events: none;
}
.ring-1 { width: 700px; height: 700px; top: -250px; right: -250px; }
.ring-2 { width: 450px; height: 450px; bottom: -150px; left: -150px; }

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
  color: #fff; font-size: 24px; font-weight: 800;
  font-family: 'Playfair Display', serif;
}

.brand-title {
  font-size: 38px; font-weight: 800; color: #fff;
  line-height: 1.2; margin-bottom: 16px;
  font-family: 'Playfair Display', serif;
}
.brand-title em { font-style: italic; color: #fbbf24; }

.brand-sub {
  font-size: 15px; color: rgba(255,255,255,0.5);
  line-height: 1.6; margin-bottom: 36px;
}

/* Benefits */
.benefits { display: flex; flex-direction: column; gap: 16px; margin-bottom: 36px; }
.benefit {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 14px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
}
.benefit-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
.benefit-title { font-size: 13px; font-weight: 700; color: #fff; margin: 0 0 2px; }
.benefit-desc  { font-size: 12px; color: rgba(255,255,255,0.4); margin: 0; }

/* Testimonial */
.testimonial {
  padding: 18px 20px;
  background: rgba(249,115,22,0.08);
  border: 1px solid rgba(249,115,22,0.2);
  border-radius: 16px;
}
.testimonial-text {
  font-size: 13px; color: rgba(255,255,255,0.7);
  line-height: 1.6; margin: 0 0 14px;
  font-style: italic;
}
.testimonial-author { display: flex; align-items: center; gap: 10px; }
.testimonial-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg, #f97316, #e11d48);
  color: #fff; font-size: 13px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.testimonial-name  { font-size: 12px; font-weight: 700; color: #fff; margin: 0; }
.testimonial-city  { font-size: 11px; color: rgba(255,255,255,0.35); margin: 0; }

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
    flex: 0 0 500px;
    border-left: 1px solid rgba(255,255,255,0.06);
  }
}

/* ── Glass card ── */
.glass-card {
  width: 100%;
  max-width: 440px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 28px;
  padding: 36px 32px;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 24px 64px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.08) inset;
}

/* Mobile logo */
.mobile-logo {
  display: flex; align-items: center; gap: 8px;
  text-decoration: none; margin-bottom: 24px; justify-content: center;
}
@media (min-width: 1024px) { .mobile-logo { display: none; } }
.mobile-logo-icon {
  width: 36px; height: 36px; border-radius: 10px;
  background: linear-gradient(135deg, #f97316, #e11d48);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 14px rgba(249,115,22,0.4);
}
.mobile-logo-icon span { color: #fff; font-size: 16px; font-weight: 800; font-family: 'Playfair Display', serif; }
.mobile-logo-text { font-size: 20px; font-weight: 700; color: #fff; font-family: 'Playfair Display', serif; }
.mobile-logo-text em { font-style: italic; color: #fbbf24; }

/* Form header */
.form-header { margin-bottom: 20px; }
.form-title { font-size: 24px; font-weight: 800; color: #fff; margin: 0 0 5px; font-family: 'Playfair Display', serif; }
.form-sub   { font-size: 13px; color: rgba(255,255,255,0.4); margin: 0; }

/* ── Role toggle ── */
.role-toggle {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 10px;
  padding: 4px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
}
.role-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px 12px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: rgba(255,255,255,0.45);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.role-btn.active {
  background: linear-gradient(135deg, #ea580c, #f97316);
  color: #fff;
  box-shadow: 0 4px 14px rgba(249,115,22,0.35);
}
.role-emoji { font-size: 16px; }

.role-desc {
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  text-align: center;
  margin: 0 0 18px;
  min-height: 18px;
}

/* ── Form fields ── */
.auth-form { display: flex; flex-direction: column; gap: 14px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label {
  font-size: 12.5px; font-weight: 600;
  color: rgba(255,255,255,0.65); letter-spacing: 0.01em;
}
.optional { color: rgba(255,255,255,0.25); font-weight: 400; }

.field-wrap { position: relative; display: flex; align-items: center; }
.field-icon {
  position: absolute; left: 14px;
  color: rgba(255,255,255,0.3); font-size: 13px;
  pointer-events: none; z-index: 1;
}
.field-prefix {
  position: absolute; left: 14px;
  font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,0.4);
  pointer-events: none; z-index: 1;
}

.auth-input {
  width: 100%; height: 46px;
  padding: 0 42px 0 40px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 11px;
  color: #fff; font-size: 14px;
  outline: none; transition: all 0.2s ease;
  font-family: inherit;
}
.auth-input.with-prefix { padding-left: 46px; }
.auth-input::placeholder { color: rgba(255,255,255,0.22); }
.auth-input:focus {
  border-color: rgba(249,115,22,0.6);
  background: rgba(255,255,255,0.08);
  box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
}

.eye-btn {
  position: absolute; right: 13px;
  background: none; border: none;
  color: rgba(255,255,255,0.3); cursor: pointer;
  font-size: 13px; padding: 0; transition: color 0.15s;
}
.eye-btn:hover { color: rgba(255,255,255,0.7); }

/* Password strength */
.strength-bar {
  height: 3px; background: rgba(255,255,255,0.08);
  border-radius: 2px; overflow: hidden; margin-top: 4px;
}
.strength-fill { height: 100%; border-radius: 2px; transition: all 0.3s ease; }
.strength-label { font-size: 11px; margin: 2px 0 0; }

/* Error */
.error-box {
  display: flex; align-items: center; gap: 8px;
  padding: 11px 13px;
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.25);
  border-radius: 10px;
  color: #fca5a5; font-size: 13px;
}

/* Submit */
.submit-btn {
  width: 100%; height: 48px;
  border-radius: 12px; border: none;
  background: linear-gradient(135deg, #ea580c, #f97316);
  color: #fff; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s ease;
  box-shadow: 0 4px 20px rgba(249,115,22,0.3);
  font-family: inherit; margin-top: 4px;
}
.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(249,115,22,0.45);
}
.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.submit-content { display: flex; align-items: center; justify-content: center; gap: 8px; }

.terms-note {
  font-size: 11px; color: rgba(255,255,255,0.25);
  text-align: center; margin: 4px 0 0;
}
.terms-link { color: rgba(249,115,22,0.7); text-decoration: none; }
.terms-link:hover { color: #f97316; }

/* Footer */
.auth-footer {
  text-align: center; font-size: 13px;
  color: rgba(255,255,255,0.35); margin: 20px 0 0;
}
.auth-link { color: #f97316; text-decoration: none; font-weight: 600; }
.auth-link:hover { color: #fb923c; }

/* Shake */
.shake-enter-active { animation: shake 0.4s ease; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}
</style>
