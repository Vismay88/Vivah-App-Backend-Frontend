<template>
  <div class="vr-page">

    <!-- ── Hero ── -->
    <section class="vr-hero">
      <div class="vr-hero__glow vr-hero__glow--1" />
      <div class="vr-hero__glow vr-hero__glow--2" />
      <div class="vr-hero__content">
        <div class="vr-hero__badge">🏪 Join VivahBazaar</div>
        <h1 class="vr-hero__title">Grow Your <em>Wedding Business</em></h1>
        <p class="vr-hero__sub">Get discovered by thousands of couples planning their dream event across Gujarat. Free forever, zero commission.</p>
        <div class="vr-hero__stats">
          <div class="vr-stat"><span class="vr-stat__val">Free</span><span class="vr-stat__lbl">Forever</span></div>
          <div class="vr-stat__sep" />
          <div class="vr-stat"><span class="vr-stat__val">0%</span><span class="vr-stat__lbl">Commission</span></div>
          <div class="vr-stat__sep" />
          <div class="vr-stat"><span class="vr-stat__val">5 min</span><span class="vr-stat__lbl">Setup</span></div>
          <div class="vr-stat__sep" />
          <div class="vr-stat"><span class="vr-stat__val">500+</span><span class="vr-stat__lbl">Vendors</span></div>
        </div>
      </div>
    </section>

    <div class="vr-body">

      <!-- Already a vendor -->
      <div v-if="authStore.isLoggedIn && authStore.isVendor" class="vr-already">
        <div class="vr-already__icon">✅</div>
        <h2 class="vr-already__title">You already have a vendor profile!</h2>
        <p class="vr-already__sub">Manage and update your existing profile from the dashboard.</p>
        <div class="vr-already__actions">
          <RouterLink to="/vendor/edit" class="vr-btn-primary"><i class="pi pi-pencil" /> Edit Profile</RouterLink>
          <RouterLink to="/dashboard" class="vr-btn-outline"><i class="pi pi-th-large" /> Dashboard</RouterLink>
        </div>
      </div>

      <!-- Registration form -->
      <form v-else class="vr-form" @submit.prevent="handleSubmit" novalidate>

        <!-- Login prompt -->
        <div v-if="!authStore.isLoggedIn" class="vr-login-prompt">
          <i class="pi pi-info-circle" />
          <span>Already have an account? <RouterLink to="/login" class="vr-login-prompt__link">Login here</RouterLink> to list your business.</span>
        </div>

        <!-- ── Section: Account ── -->
        <div v-if="!authStore.isLoggedIn" class="vr-section">
          <div class="vr-section__head">
            <div class="vr-section__icon">👤</div>
            <div>
              <div class="vr-section__title">Your Account</div>
              <div class="vr-section__sub">Create your login credentials</div>
            </div>
          </div>
          <div class="vr-grid-2">
            <div class="vr-field">
              <label class="vr-label">Full Name <span class="vr-req">*</span></label>
              <input v-model="form.ownerName" class="vr-input" placeholder="e.g. Mehul Patel" required />
            </div>
            <div class="vr-field">
              <label class="vr-label">Email Address <span class="vr-req">*</span></label>
              <input v-model="form.email" type="email" class="vr-input" placeholder="you@example.com" required />
            </div>
            <div class="vr-field">
              <label class="vr-label">Password <span class="vr-req">*</span></label>
              <div class="vr-input-icon-wrap">
                <input v-model="form.password" :type="showPass ? 'text' : 'password'" class="vr-input" placeholder="Min 6 characters" required />
                <button type="button" class="vr-input-icon-btn" @click="showPass = !showPass" tabindex="-1">
                  <i :class="showPass ? 'pi pi-eye-slash' : 'pi pi-eye'" />
                </button>
              </div>
            </div>
            <div class="vr-field">
              <label class="vr-label">Mobile Number <span class="vr-req">*</span></label>
              <input v-model="form.phone" class="vr-input" placeholder="10-digit number" required />
            </div>
          </div>
        </div>


        <!-- ── Section: Business Info ── -->
        <div class="vr-section">
          <div class="vr-section__head">
            <div class="vr-section__icon">🏪</div>
            <div>
              <div class="vr-section__title">Business Information</div>
              <div class="vr-section__sub">Tell couples about your services</div>
            </div>
          </div>

          <div class="vr-field vr-field--full">
            <label class="vr-label">Business Name <span class="vr-req">*</span></label>
            <input v-model="form.businessName" class="vr-input" placeholder="e.g. Moments by Mehul Photography" required />
          </div>

          <div class="vr-grid-2">
            <div class="vr-field">
              <label class="vr-label">Category <span class="vr-req">*</span></label>
              <div class="vr-select-wrap">
                <select v-model="form.category" class="vr-select" required>
                  <option value="" disabled>Select category</option>
                  <option v-for="c in vendorCategories" :key="c" :value="c">{{ categoryEmoji(c) }} {{ c }}</option>
                </select>
                <i class="pi pi-chevron-down vr-select-arrow" />
              </div>
            </div>
            <div class="vr-field">
              <label class="vr-label">City <span class="vr-req">*</span></label>
              <div class="vr-select-wrap">
                <select v-model="form.city" class="vr-select" required>
                  <option value="" disabled>Select city</option>
                  <option v-for="c in gujaratCities" :key="c" :value="c">{{ c }}</option>
                </select>
                <i class="pi pi-chevron-down vr-select-arrow" />
              </div>
            </div>
            <div class="vr-field">
              <label class="vr-label">Business Phone <span class="vr-req">*</span></label>
              <input v-model="form.businessPhone" class="vr-input" placeholder="10-digit number" required />
            </div>
            <div class="vr-field">
              <label class="vr-label">WhatsApp Number</label>
              <input v-model="form.whatsapp" class="vr-input" placeholder="Same as phone or different" />
            </div>
            <div class="vr-field">
              <label class="vr-label">Starting Price (₹) <span class="vr-req">*</span></label>
              <div class="vr-input-prefix-wrap">
                <span class="vr-input-prefix">₹</span>
                <input v-model.number="form.startingPrice" type="number" min="0" class="vr-input vr-input--prefixed" placeholder="e.g. 25000" required />
              </div>
            </div>
            <div class="vr-field">
              <label class="vr-label">Years of Experience</label>
              <input v-model.number="form.yearsOfExperience" type="number" min="0" max="50" class="vr-input" placeholder="e.g. 5" />
            </div>
          </div>

          <div class="vr-field vr-field--full">
            <label class="vr-label">Business Description <span class="vr-req">*</span></label>
            <textarea v-model="form.description" class="vr-textarea" rows="4"
              placeholder="Describe your services, specialties, and what makes you unique. Be specific — couples read this carefully." required />
            <div class="vr-char-count" :class="{ 'vr-char-count--warn': form.description.length > 1800 }">
              {{ form.description.length }} / 2000
            </div>
          </div>

          <div class="vr-field vr-field--full">
            <label class="vr-label">Business Address</label>
            <input v-model="form.address" class="vr-input" placeholder="Street, area, city" />
          </div>
        </div>

        <!-- ── Section: Social Links ── -->
        <div class="vr-section">
          <div class="vr-section__head">
            <div class="vr-section__icon">🔗</div>
            <div>
              <div class="vr-section__title">Social Links <span class="vr-optional">Optional</span></div>
              <div class="vr-section__sub">Help couples find and trust you faster</div>
            </div>
          </div>
          <div class="vr-grid-3">
            <div class="vr-field">
              <label class="vr-label"><i class="pi pi-instagram" /> Instagram</label>
              <input v-model="form.instagram" class="vr-input" placeholder="https://instagram.com/..." />
            </div>
            <div class="vr-field">
              <label class="vr-label"><i class="pi pi-facebook" /> Facebook</label>
              <input v-model="form.facebook" class="vr-input" placeholder="https://facebook.com/..." />
            </div>
            <div class="vr-field">
              <label class="vr-label"><i class="pi pi-youtube" /> YouTube</label>
              <input v-model="form.youtube" class="vr-input" placeholder="https://youtube.com/..." />
            </div>
          </div>
        </div>

        <!-- ── Terms + Submit ── -->
        <div class="vr-footer">
          <label class="vr-terms">
            <input type="checkbox" v-model="agreedToTerms" class="vr-terms__check" />
            <span>I agree to the <a href="#" class="vr-terms__link">Terms of Service</a> and confirm all information is accurate.</span>
          </label>

          <button type="submit" class="vr-submit" :disabled="!agreedToTerms || submitting">
            <span v-if="submitting"><i class="pi pi-spin pi-spinner" /> Submitting…</span>
            <span v-else><i class="pi pi-check-circle" /> List My Business Free</span>
          </button>

          <p class="vr-footer__note">
            <i class="pi pi-shield" /> Your information is secure and never shared with third parties.
          </p>
        </div>

      </form>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useVendorStore } from '@/stores/vendor';
import { useToast } from 'primevue/usetoast';
import { GUJARAT_CITIES, VENDOR_CATEGORIES } from '@/utils/helpers';

const router     = useRouter();
const authStore  = useAuthStore();
const vendorStore = useVendorStore();
const toast      = useToast();

const submitting   = ref(false);
const agreedToTerms = ref(false);
const showPass     = ref(false);
const gujaratCities   = GUJARAT_CITIES;
const vendorCategories = VENDOR_CATEGORIES;

const form = ref({
  ownerName: '', email: '', password: '', phone: '',
  businessName: '', category: '', city: '',
  businessPhone: '', whatsapp: '',
  startingPrice: null, yearsOfExperience: null,
  description: '', address: '',
  instagram: '', facebook: '', youtube: '',
});

const CATEGORY_EMOJI = {
  Photography:'📸', Videography:'🎬', Catering:'🍽️', Decoration:'🌸',
  Mehendi:'🌿', DJ:'🎵', Makeup:'💄', Venue:'🏛️', Invitation:'💌', Pandit:'🙏',
};
const categoryEmoji = (c) => CATEGORY_EMOJI[c] || '✨';

const handleSubmit = async () => {
  const f = form.value;
  if (!f.businessName || !f.category || !f.city || !f.description || !f.startingPrice) {
    toast.add({ severity: 'warn', summary: 'Missing fields', detail: 'Please fill all required fields', life: 3000 });
    return;
  }
  submitting.value = true;
  try {
    if (!authStore.isLoggedIn) {
      await authStore.register({ name: f.ownerName, email: f.email, password: f.password, phone: f.phone, role: 'vendor' });
    }
    const vendor = await vendorStore.createVendor({
      businessName: f.businessName, category: f.category, city: f.city,
      phone: f.businessPhone || f.phone,
      whatsapp: f.whatsapp || f.businessPhone || f.phone,
      startingPrice: f.startingPrice, yearsOfExperience: f.yearsOfExperience || 0,
      description: f.description, address: f.address,
      socialLinks: {
        instagram: f.instagram || undefined,
        facebook:  f.facebook  || undefined,
        youtube:   f.youtube   || undefined,
      },
    });
    toast.add({ severity: 'success', summary: 'Business listed!', detail: 'Your profile is now live on VivahBazaar', life: 4000 });
    router.push(`/vendors/${vendor.slug}`);
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Registration failed', detail: err.response?.data?.message || err.message, life: 4000 });
  } finally {
    submitting.value = false;
  }
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');

.vr-page { min-height: 100vh; background: #faf7f4; font-family: 'DM Sans', sans-serif; }

/* ── Hero ── */
.vr-hero {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #0f0a05 0%, #1e1008 60%, #0f0a05 100%);
  padding: 64px 24px 72px; text-align: center;
}
.vr-hero__glow {
  position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
}
.vr-hero__glow--1 { width: 500px; height: 500px; top: -150px; right: -100px; background: rgba(232,101,10,0.15); }
.vr-hero__glow--2 { width: 350px; height: 350px; bottom: -100px; left: -80px; background: rgba(192,57,43,0.12); }
.vr-hero__content { position: relative; max-width: 640px; margin: 0 auto; }
.vr-hero__badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(232,101,10,0.18); border: 1px solid rgba(232,101,10,0.3);
  color: #fba45c; padding: 6px 18px; border-radius: 99px; font-size: 13px; font-weight: 600; margin-bottom: 20px;
}
.vr-hero__title {
  font-family: 'Cormorant Garamond', serif; font-size: clamp(32px, 5vw, 52px);
  font-weight: 700; color: #fff; line-height: 1.15; margin-bottom: 16px;
}
.vr-hero__title em { font-style: italic; color: #fba45c; }
.vr-hero__sub { font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 32px; max-width: 480px; margin-left: auto; margin-right: auto; }
.vr-hero__stats { display: flex; align-items: center; justify-content: center; gap: 0; flex-wrap: wrap; }
.vr-stat { display: flex; flex-direction: column; align-items: center; padding: 0 24px; }
.vr-stat__val { font-size: 22px; font-weight: 700; color: #fba45c; line-height: 1; }
.vr-stat__lbl { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 3px; text-transform: uppercase; letter-spacing: 0.06em; }
.vr-stat__sep { width: 1px; height: 32px; background: rgba(255,255,255,0.12); }

/* ── Body ── */
.vr-body { max-width: 760px; margin: -32px auto 60px; padding: 0 16px; }

/* ── Already vendor ── */
.vr-already {
  background: #fff; border-radius: 24px; border: 1px solid rgba(232,101,10,0.1);
  box-shadow: 0 4px 24px rgba(26,16,8,0.07); padding: 48px 32px; text-align: center;
}
.vr-already__icon { font-size: 48px; margin-bottom: 16px; }
.vr-already__title { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 700; color: #1a1008; margin-bottom: 8px; }
.vr-already__sub { font-size: 15px; color: #7a6a5a; margin-bottom: 28px; }
.vr-already__actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

/* ── Form ── */
.vr-form { display: flex; flex-direction: column; gap: 16px; }

/* ── Login prompt ── */
.vr-login-prompt {
  display: flex; align-items: center; gap: 10px;
  background: rgba(232,101,10,0.06); border: 1px solid rgba(232,101,10,0.2);
  border-radius: 14px; padding: 14px 18px; font-size: 14px; color: #7a4a1a;
}
.vr-login-prompt .pi { color: #e8650a; font-size: 15px; flex-shrink: 0; }
.vr-login-prompt__link { color: #e8650a; font-weight: 700; text-decoration: none; border-bottom: 1px solid rgba(232,101,10,0.3); }
.vr-login-prompt__link:hover { border-color: #e8650a; }

/* ── Section card ── */
.vr-section {
  background: #fff; border-radius: 20px; border: 1px solid rgba(232,101,10,0.08);
  box-shadow: 0 2px 16px rgba(26,16,8,0.05); padding: 28px;
  display: flex; flex-direction: column; gap: 20px;
}
.vr-section__head { display: flex; align-items: flex-start; gap: 14px; padding-bottom: 4px; border-bottom: 1px solid rgba(232,101,10,0.08); }
.vr-section__icon { font-size: 26px; line-height: 1; flex-shrink: 0; margin-top: 2px; }
.vr-section__title { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 700; color: #1a1008; }
.vr-section__sub { font-size: 13px; color: #9a8a7a; margin-top: 2px; }
.vr-optional { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; color: #b0a090; background: rgba(148,163,184,0.12); padding: 2px 8px; border-radius: 99px; margin-left: 8px; vertical-align: middle; }

/* ── Grids ── */
.vr-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.vr-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
@media (max-width: 600px) { .vr-grid-2, .vr-grid-3 { grid-template-columns: 1fr; } }

/* ── Field ── */
.vr-field { display: flex; flex-direction: column; gap: 6px; }
.vr-field--full { grid-column: 1 / -1; }
.vr-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #7a6a5a; }
.vr-req { color: #e8650a; }

/* ── Inputs ── */
.vr-input {
  width: 100%; padding: 11px 14px; border-radius: 12px;
  border: 1.5px solid rgba(232,101,10,0.15); background: #fdf8f3;
  font-size: 14px; font-weight: 500; color: #1a1008; outline: none;
  font-family: 'DM Sans', sans-serif; transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.vr-input:focus { border-color: #e8650a; box-shadow: 0 0 0 3px rgba(232,101,10,0.1); background: #fff; }
.vr-input::placeholder { color: #c0b0a0; }

.vr-input-icon-wrap { position: relative; }
.vr-input-icon-wrap .vr-input { padding-right: 42px; }
.vr-input-icon-btn {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #b0a090; cursor: pointer; font-size: 14px; padding: 4px;
}
.vr-input-icon-btn:hover { color: #e8650a; }

.vr-input-prefix-wrap { position: relative; }
.vr-input-prefix {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  font-size: 15px; font-weight: 700; color: #e8650a; pointer-events: none;
}
.vr-input--prefixed { padding-left: 28px; }

/* ── Select ── */
.vr-select-wrap { position: relative; }
.vr-select {
  width: 100%; padding: 11px 36px 11px 14px; border-radius: 12px;
  border: 1.5px solid rgba(232,101,10,0.15); background: #fdf8f3;
  font-size: 14px; font-weight: 500; color: #1a1008; outline: none;
  font-family: 'DM Sans', sans-serif; appearance: none; cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.vr-select:focus { border-color: #e8650a; box-shadow: 0 0 0 3px rgba(232,101,10,0.1); background: #fff; }
.vr-select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 11px; color: #b0a090; pointer-events: none; }

/* ── Textarea ── */
.vr-textarea {
  width: 100%; padding: 12px 14px; border-radius: 12px;
  border: 1.5px solid rgba(232,101,10,0.15); background: #fdf8f3;
  font-size: 14px; font-weight: 500; color: #1a1008; outline: none;
  font-family: 'DM Sans', sans-serif; resize: vertical; min-height: 110px;
  transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
}
.vr-textarea:focus { border-color: #e8650a; box-shadow: 0 0 0 3px rgba(232,101,10,0.1); background: #fff; }
.vr-textarea::placeholder { color: #c0b0a0; }
.vr-char-count { font-size: 11.5px; color: #b0a090; text-align: right; margin-top: 4px; }
.vr-char-count--warn { color: #e8650a; font-weight: 600; }

/* ── Footer ── */
.vr-footer {
  background: #fff; border-radius: 20px; border: 1px solid rgba(232,101,10,0.08);
  box-shadow: 0 2px 16px rgba(26,16,8,0.05); padding: 28px;
  display: flex; flex-direction: column; gap: 16px;
}
.vr-terms { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 13.5px; color: #5a4a3a; line-height: 1.5; }
.vr-terms__check { width: 16px; height: 16px; accent-color: #e8650a; flex-shrink: 0; margin-top: 2px; cursor: pointer; }
.vr-terms__link { color: #e8650a; font-weight: 600; text-decoration: none; }
.vr-terms__link:hover { text-decoration: underline; }

.vr-submit {
  width: 100%; padding: 15px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #e8650a, #c0392b);
  color: #fff; font-size: 15px; font-weight: 700; cursor: pointer;
  font-family: 'DM Sans', sans-serif; letter-spacing: 0.02em;
  box-shadow: 0 6px 20px rgba(232,101,10,0.35); transition: all 0.25s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.vr-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(232,101,10,0.45); }
.vr-submit:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.vr-footer__note { text-align: center; font-size: 12.5px; color: #b0a090; display: flex; align-items: center; justify-content: center; gap: 5px; }
.vr-footer__note .pi { color: #22c55e; }

/* ── Shared buttons ── */
.vr-btn-primary {
  display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px;
  border-radius: 12px; background: linear-gradient(135deg, #e8650a, #c0392b);
  color: #fff; font-size: 14px; font-weight: 700; text-decoration: none;
  box-shadow: 0 4px 14px rgba(232,101,10,0.3); transition: all 0.2s;
}
.vr-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(232,101,10,0.4); }
.vr-btn-outline {
  display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px;
  border-radius: 12px; border: 1.5px solid rgba(232,101,10,0.25);
  color: #5a4a3a; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.2s;
}
.vr-btn-outline:hover { border-color: #e8650a; color: #e8650a; background: rgba(232,101,10,0.04); }
</style>
