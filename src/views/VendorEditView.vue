<template>
  <div class="ve-page">

    <!-- ── Sticky header ── -->
    <div class="ve-topbar">
      <div class="ve-topbar__inner">
        <RouterLink to="/dashboard" class="ve-back">
          <i class="pi pi-arrow-left" /> Back to Dashboard
        </RouterLink>
        <div class="ve-topbar__title">Edit Vendor Profile</div>
        <div class="ve-topbar__actions">
          <RouterLink to="/dashboard" class="ve-btn ve-btn--ghost">Cancel</RouterLink>
          <button class="ve-btn ve-btn--primary" :disabled="saving" @click="saveChanges">
            <i :class="saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'" />
            {{ saving ? 'Saving…' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="ve-loading">
      <div v-for="i in 4" :key="i" class="ve-skeleton" />
    </div>

    <div v-else-if="vendor" class="ve-body">

      <!-- ── LEFT COLUMN ── -->
      <div class="ve-col-main">

        <!-- Section: Basic Info -->
        <div class="ve-card">
          <div class="ve-card__head">
            <span class="ve-card__icon">📋</span>
            <div>
              <div class="ve-card__title">Basic Information</div>
              <div class="ve-card__sub">Your business identity on VivahBazaar</div>
            </div>
          </div>

          <div class="ve-field ve-field--full">
            <label class="ve-label">Business Name <span class="ve-req">*</span></label>
            <input v-model="form.businessName" class="ve-input" placeholder="e.g. Moments by Mehul Photography" />
          </div>

          <div class="ve-grid-2">
            <div class="ve-field">
              <label class="ve-label">Category</label>
              <div class="ve-select-wrap">
                <select v-model="form.category" class="ve-select">
                  <option v-for="c in vendorCategories" :key="c" :value="c">{{ catEmoji(c) }} {{ c }}</option>
                </select>
                <i class="pi pi-chevron-down ve-select-arrow" />
              </div>
            </div>
            <div class="ve-field">
              <label class="ve-label">City</label>
              <div class="ve-select-wrap">
                <select v-model="form.city" class="ve-select">
                  <option v-for="c in gujaratCities" :key="c" :value="c">{{ c }}</option>
                </select>
                <i class="pi pi-chevron-down ve-select-arrow" />
              </div>
            </div>
            <div class="ve-field">
              <label class="ve-label">Phone <span class="ve-req">*</span></label>
              <input v-model="form.phone" class="ve-input" placeholder="10-digit number" />
            </div>
            <div class="ve-field">
              <label class="ve-label">WhatsApp</label>
              <input v-model="form.whatsapp" class="ve-input" placeholder="Same as phone or different" />
            </div>
            <div class="ve-field">
              <label class="ve-label">Starting Price (₹) <span class="ve-req">*</span></label>
              <div class="ve-input-prefix-wrap">
                <span class="ve-input-prefix">₹</span>
                <input v-model.number="form.startingPrice" type="number" min="0" class="ve-input ve-input--prefixed" placeholder="25000" />
              </div>
            </div>
            <div class="ve-field">
              <label class="ve-label">Email</label>
              <input v-model="form.email" type="email" class="ve-input" placeholder="business@email.com" />
            </div>
            <div class="ve-field">
              <label class="ve-label">Years of Experience</label>
              <input v-model.number="form.yearsOfExperience" type="number" min="0" max="50" class="ve-input" placeholder="e.g. 5" />
            </div>
            <div class="ve-field">
              <label class="ve-label">Events Completed</label>
              <input v-model.number="form.eventsCompleted" type="number" min="0" class="ve-input" placeholder="e.g. 120" />
            </div>
          </div>

          <div class="ve-field ve-field--full">
            <label class="ve-label">Business Description <span class="ve-req">*</span></label>
            <textarea v-model="form.description" class="ve-textarea" rows="5"
              placeholder="Describe your services, specialties, and what makes you unique. Couples read this carefully." />
            <div class="ve-char-count" :class="{ 've-char-count--warn': form.description.length > 1800 }">
              {{ form.description.length }} / 2000
            </div>
          </div>

          <div class="ve-field ve-field--full">
            <label class="ve-label">Address</label>
            <input v-model="form.address" class="ve-input" placeholder="Street, area, city" />
          </div>
        </div>

        <!-- Section: Portfolio -->
        <div class="ve-card">
          <div class="ve-card__head">
            <span class="ve-card__icon">🖼️</span>
            <div>
              <div class="ve-card__title">Portfolio</div>
              <div class="ve-card__sub">Showcase your best work — couples decide based on photos</div>
            </div>
          </div>

          <!-- Upload zone -->
          <div
            class="ve-upload-zone"
            :class="{ 've-upload-zone--drag': isDragging, 've-upload-zone--uploading': portfolioUploading }"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handlePortfolioDrop"
            @click="$refs.portfolioInput.click()"
          >
            <input
              ref="portfolioInput"
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/quicktime"
              class="ve-upload-zone__input"
              @change="handlePortfolioFiles"
            />
            <div v-if="portfolioUploading" class="ve-upload-zone__uploading">
              <i class="pi pi-spin pi-spinner ve-upload-zone__spinner" />
              <span>Uploading {{ uploadProgress.current }} of {{ uploadProgress.total }}…</span>
            </div>
            <div v-else class="ve-upload-zone__idle">
              <div class="ve-upload-zone__icon">📤</div>
              <div class="ve-upload-zone__text">
                <strong>Click to upload</strong> or drag & drop
              </div>
              <div class="ve-upload-zone__hint">JPG, PNG, WebP, MP4 · Max 10MB each · Up to 20 items</div>
            </div>
          </div>

          <!-- Portfolio grid -->
          <div v-if="form.portfolio.length" class="ve-portfolio-grid">
            <div
              v-for="(item, idx) in form.portfolio"
              :key="idx"
              class="ve-portfolio-item"
            >
              <div class="ve-portfolio-item__media">
                <video v-if="item.type === 'video'" :src="item.url" class="ve-portfolio-item__img" muted />
                <img v-else :src="item.url" :alt="item.caption || 'Portfolio'" class="ve-portfolio-item__img" loading="lazy" />
                <div class="ve-portfolio-item__overlay">
                  <button class="ve-portfolio-item__del" @click.stop="removePortfolioItem(idx)" title="Remove">
                    <i class="pi pi-trash" />
                  </button>
                  <span v-if="item.type === 'video'" class="ve-portfolio-item__type">🎬</span>
                </div>
              </div>
              <input
                v-model="item.caption"
                class="ve-portfolio-item__caption"
                placeholder="Add caption…"
                maxlength="100"
              />
            </div>
          </div>

          <div v-else class="ve-portfolio-empty">
            <span>No portfolio items yet. Upload your best work above.</span>
          </div>
        </div>

        <!-- Section: Tags -->
        <div class="ve-card">
          <div class="ve-card__head">
            <span class="ve-card__icon">🏷️</span>
            <div>
              <div class="ve-card__title">Tags</div>
              <div class="ve-card__sub">Help couples find you — add keywords about your style</div>
            </div>
          </div>
          <div class="ve-tags-wrap">
            <span v-for="tag in form.tags" :key="tag" class="ve-tag">
              {{ tag }}
              <button class="ve-tag__remove" @click="removeTag(tag)">×</button>
            </span>
          </div>
          <div class="ve-tag-input-row">
            <input
              v-model="newTag"
              class="ve-input"
              placeholder="e.g. candid, outdoor, traditional…"
              @keyup.enter="addTag"
              maxlength="30"
            />
            <button class="ve-btn ve-btn--outline" @click="addTag">
              <i class="pi pi-plus" /> Add
            </button>
          </div>
        </div>

      </div>

      <!-- ── RIGHT COLUMN ── -->
      <div class="ve-col-side">

        <!-- Profile & Cover photos -->
        <div class="ve-card">
          <div class="ve-card__head">
            <span class="ve-card__icon">📸</span>
            <div>
              <div class="ve-card__title">Profile & Cover</div>
              <div class="ve-card__sub">First impression matters</div>
            </div>
          </div>

          <!-- Cover photo -->
          <div class="ve-photo-section">
            <label class="ve-label">Cover Photo</label>
            <div class="ve-cover-preview" @click="$refs.coverInput.click()">
              <img v-if="form.coverPhoto" :src="form.coverPhoto" class="ve-cover-preview__img" />
              <div v-else class="ve-cover-preview__placeholder">
                <i class="pi pi-image" />
                <span>Click to upload cover</span>
              </div>
              <div class="ve-cover-preview__overlay">
                <i class="pi pi-camera" /> Change
              </div>
              <div v-if="coverUploading" class="ve-cover-preview__uploading">
                <i class="pi pi-spin pi-spinner" />
              </div>
            </div>
            <input ref="coverInput" type="file" accept="image/*" class="ve-hidden-input" @change="uploadCover" />
          </div>

          <!-- Profile photo -->
          <div class="ve-photo-section">
            <label class="ve-label">Profile Photo</label>
            <div class="ve-profile-preview-wrap">
              <div class="ve-profile-preview" @click="$refs.profileInput.click()">
                <img v-if="form.profilePhoto" :src="form.profilePhoto" class="ve-profile-preview__img" />
                <span v-else class="ve-profile-preview__placeholder">{{ catEmoji(form.category) }}</span>
                <div class="ve-profile-preview__overlay"><i class="pi pi-camera" /></div>
                <div v-if="profileUploading" class="ve-profile-preview__uploading"><i class="pi pi-spin pi-spinner" /></div>
              </div>
              <div class="ve-profile-preview__hint">Square image works best</div>
            </div>
            <input ref="profileInput" type="file" accept="image/*" class="ve-hidden-input" @change="uploadProfile" />
          </div>
        </div>

        <!-- Social links -->
        <div class="ve-card">
          <div class="ve-card__head">
            <span class="ve-card__icon">🔗</span>
            <div>
              <div class="ve-card__title">Social Links</div>
              <div class="ve-card__sub">Build trust with couples</div>
            </div>
          </div>
          <div class="ve-social-list">
            <div class="ve-social-item">
              <span class="ve-social-item__icon ve-social-item__icon--ig">📷</span>
              <input v-model="form.instagram" class="ve-input" placeholder="Instagram URL" />
            </div>
            <div class="ve-social-item">
              <span class="ve-social-item__icon ve-social-item__icon--fb">👤</span>
              <input v-model="form.facebook" class="ve-input" placeholder="Facebook URL" />
            </div>
            <div class="ve-social-item">
              <span class="ve-social-item__icon ve-social-item__icon--yt">▶️</span>
              <input v-model="form.youtube" class="ve-input" placeholder="YouTube URL" />
            </div>
          </div>
        </div>

        <!-- Profile completeness -->
        <div class="ve-card ve-completeness-card">
          <div class="ve-card__title" style="margin-bottom:12px">Profile Strength</div>
          <div class="ve-completeness-bar-wrap">
            <div class="ve-completeness-bar" :style="{ width: completeness + '%' }" />
          </div>
          <div class="ve-completeness-pct">{{ completeness }}% complete</div>
          <div class="ve-completeness-tips">
            <div v-for="tip in completenessTips" :key="tip.label" class="ve-completeness-tip" :class="{ 've-completeness-tip--done': tip.done }">
              <i :class="tip.done ? 'pi pi-check-circle' : 'pi pi-circle'" />
              {{ tip.label }}
            </div>
          </div>
        </div>

        <!-- Save (mobile sticky) -->
        <div class="ve-save-mobile">
          <button class="ve-btn ve-btn--primary ve-btn--full" :disabled="saving" @click="saveChanges">
            <i :class="saving ? 'pi pi-spin pi-spinner' : 'pi pi-check'" />
            {{ saving ? 'Saving…' : 'Save Changes' }}
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVendorStore } from '@/stores/vendor';
import { useToast } from 'primevue/usetoast';
import { GUJARAT_CITIES, VENDOR_CATEGORIES } from '@/utils/helpers';
import api from '@/services/api';

const router      = useRouter();
const vendorStore = useVendorStore();
const toast       = useToast();

const vendor           = ref(null);
const loading          = ref(true);
const saving           = ref(false);
const newTag           = ref('');
const isDragging       = ref(false);
const portfolioUploading = ref(false);
const coverUploading   = ref(false);
const profileUploading = ref(false);
const uploadProgress   = ref({ current: 0, total: 0 });

const gujaratCities    = GUJARAT_CITIES;
const vendorCategories = VENDOR_CATEGORIES;

const CAT_EMOJI = {
  Photography:'📸', Videography:'🎬', Catering:'🍽️', Decoration:'🌸',
  Mehendi:'🌿', DJ:'🎵', Makeup:'💄', Venue:'🏛️', Invitation:'💌', Pandit:'🙏',
};
const catEmoji = (c) => CAT_EMOJI[c] || '✨';

const form = ref({
  businessName: '', category: '', city: '', phone: '', whatsapp: '',
  email: '', startingPrice: 0, yearsOfExperience: 0, eventsCompleted: 0,
  description: '', address: '', profilePhoto: '', coverPhoto: '',
  instagram: '', facebook: '', youtube: '', tags: [], portfolio: [],
});

// ── Profile completeness ──────────────────────────────────────────────────
const completenessTips = computed(() => [
  { label: 'Business name',      done: !!form.value.businessName },
  { label: 'Description',        done: form.value.description.length > 50 },
  { label: 'Profile photo',      done: !!form.value.profilePhoto },
  { label: 'Cover photo',        done: !!form.value.coverPhoto },
  { label: 'Portfolio (5+ items)', done: form.value.portfolio.length >= 5 },
  { label: 'Phone number',       done: !!form.value.phone },
  { label: 'Starting price',     done: form.value.startingPrice > 0 },
  { label: 'Social links',       done: !!(form.value.instagram || form.value.facebook || form.value.youtube) },
  { label: 'Tags (3+)',          done: form.value.tags.length >= 3 },
]);

const completeness = computed(() => {
  const done = completenessTips.value.filter(t => t.done).length;
  return Math.round((done / completenessTips.value.length) * 100);
});

// ── Tags ──────────────────────────────────────────────────────────────────
const addTag = () => {
  const tag = newTag.value.trim().toLowerCase();
  if (tag && !form.value.tags.includes(tag) && form.value.tags.length < 20) {
    form.value.tags.push(tag);
  }
  newTag.value = '';
};

const removeTag = (tag) => {
  form.value.tags = form.value.tags.filter(t => t !== tag);
};

// ── Single file upload helper ─────────────────────────────────────────────
const uploadFile = async (file) => {
  const fd = new FormData();
  fd.append('file', file);
  const res = await api.post('/upload/single', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url;
};

// ── Cover photo upload ────────────────────────────────────────────────────
const uploadCover = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  coverUploading.value = true;
  try {
    form.value.coverPhoto = await uploadFile(file);
    toast.add({ severity: 'success', summary: 'Cover photo uploaded!', life: 2000 });
  } catch {
    toast.add({ severity: 'error', summary: 'Upload failed', detail: 'Could not upload cover photo', life: 3000 });
  } finally {
    coverUploading.value = false;
    e.target.value = '';
  }
};

// ── Profile photo upload ──────────────────────────────────────────────────
const uploadProfile = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  profileUploading.value = true;
  try {
    form.value.profilePhoto = await uploadFile(file);
    toast.add({ severity: 'success', summary: 'Profile photo uploaded!', life: 2000 });
  } catch {
    toast.add({ severity: 'error', summary: 'Upload failed', detail: 'Could not upload profile photo', life: 3000 });
  } finally {
    profileUploading.value = false;
    e.target.value = '';
  }
};

// ── Portfolio upload ──────────────────────────────────────────────────────
const processPortfolioFiles = async (files) => {
  const fileArr = Array.from(files).slice(0, 20 - form.value.portfolio.length);
  if (!fileArr.length) return;
  portfolioUploading.value = true;
  uploadProgress.value = { current: 0, total: fileArr.length };
  for (const file of fileArr) {
    try {
      const url = await uploadFile(file);
      const type = file.type.startsWith('video') ? 'video' : 'image';
      form.value.portfolio.push({ url, type, caption: '' });
      uploadProgress.value.current++;
    } catch {
      toast.add({ severity: 'warn', summary: `Failed: ${file.name}`, life: 2500 });
    }
  }
  portfolioUploading.value = false;
  toast.add({ severity: 'success', summary: `${uploadProgress.value.current} item(s) added!`, life: 2000 });
};

const handlePortfolioFiles = (e) => processPortfolioFiles(e.target.files);
const handlePortfolioDrop  = (e) => {
  isDragging.value = false;
  processPortfolioFiles(e.dataTransfer.files);
};

const removePortfolioItem = (idx) => {
  form.value.portfolio.splice(idx, 1);
};

// ── Save ──────────────────────────────────────────────────────────────────
const saveChanges = async () => {
  if (!form.value.businessName?.trim()) {
    toast.add({ severity: 'warn', summary: 'Business name is required', life: 3000 });
    return;
  }
  saving.value = true;
  try {
    await vendorStore.updateVendor(vendor.value._id, {
      businessName:     form.value.businessName,
      category:         form.value.category,
      city:             form.value.city,
      phone:            form.value.phone,
      whatsapp:         form.value.whatsapp,
      email:            form.value.email,
      startingPrice:    form.value.startingPrice,
      yearsOfExperience: form.value.yearsOfExperience,
      eventsCompleted:  form.value.eventsCompleted,
      description:      form.value.description,
      address:          form.value.address,
      profilePhoto:     form.value.profilePhoto || null,
      coverPhoto:       form.value.coverPhoto   || null,
      portfolio:        form.value.portfolio,
      tags:             form.value.tags,
      socialLinks: {
        instagram: form.value.instagram || undefined,
        facebook:  form.value.facebook  || undefined,
        youtube:   form.value.youtube   || undefined,
      },
    });
    toast.add({ severity: 'success', summary: 'Profile updated!', detail: 'Changes are live on your profile', life: 3000 });
    router.push('/dashboard');
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Failed to save', detail: err.response?.data?.message || err.message, life: 4000 });
  } finally {
    saving.value = false;
  }
};

// ── Load ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    vendor.value = await vendorStore.getMyVendorProfile();
    const v = vendor.value;
    form.value = {
      businessName:     v.businessName     || '',
      category:         v.category         || '',
      city:             v.city             || '',
      phone:            v.phone            || '',
      whatsapp:         v.whatsapp         || '',
      email:            v.email            || '',
      startingPrice:    v.startingPrice    || 0,
      yearsOfExperience: v.yearsOfExperience || 0,
      eventsCompleted:  v.eventsCompleted  || 0,
      description:      v.description      || '',
      address:          v.address          || '',
      profilePhoto:     v.profilePhoto     || '',
      coverPhoto:       v.coverPhoto       || '',
      instagram:        v.socialLinks?.instagram || '',
      facebook:         v.socialLinks?.facebook  || '',
      youtube:          v.socialLinks?.youtube   || '',
      tags:             v.tags             || [],
      portfolio:        (v.portfolio || []).map(p => ({ url: p.url, type: p.type || 'image', caption: p.caption || '' })),
    };
  } catch {
    router.push('/dashboard');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');

.ve-page { min-height: 100vh; background: #f8f4f0; font-family: 'DM Sans', sans-serif; padding-bottom: 80px; }

/* ── Topbar ── */
.ve-topbar { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(232,101,10,0.1); }
.ve-topbar__inner { max-width: 1100px; margin: 0 auto; padding: 12px 24px; display: flex; align-items: center; gap: 16px; }
.ve-back { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #9a8a7a; text-decoration: none; transition: color 0.15s; white-space: nowrap; }
.ve-back:hover { color: #e8650a; }
.ve-topbar__title { font-size: 15px; font-weight: 700; color: #1a1008; flex: 1; text-align: center; }
.ve-topbar__actions { display: flex; gap: 8px; flex-shrink: 0; }

/* ── Loading ── */
.ve-loading { max-width: 1100px; margin: 24px auto; padding: 0 24px; display: flex; flex-direction: column; gap: 16px; }
.ve-skeleton { height: 160px; border-radius: 20px; background: linear-gradient(90deg, #f0e8e0 25%, #fdf8f3 50%, #f0e8e0 75%); background-size: 200% 100%; animation: veShimmer 1.4s infinite; }
@keyframes veShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Body layout ── */
.ve-body { max-width: 1100px; margin: 24px auto; padding: 0 24px; display: grid; grid-template-columns: 1fr 320px; gap: 20px; align-items: start; }
@media (max-width: 900px) { .ve-body { grid-template-columns: 1fr; } }

.ve-col-main { display: flex; flex-direction: column; gap: 20px; }
.ve-col-side  { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 72px; }
@media (max-width: 900px) { .ve-col-side { position: static; } }

/* ── Card ── */
.ve-card { background: #fff; border-radius: 20px; border: 1px solid rgba(232,101,10,0.08); box-shadow: 0 2px 16px rgba(26,16,8,0.05); padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.ve-card__head { display: flex; align-items: flex-start; gap: 12px; padding-bottom: 4px; border-bottom: 1px solid rgba(232,101,10,0.08); }
.ve-card__icon { font-size: 22px; flex-shrink: 0; margin-top: 1px; }
.ve-card__title { font-size: 16px; font-weight: 700; color: #1a1008; }
.ve-card__sub { font-size: 12.5px; color: #9a8a7a; margin-top: 2px; }

/* ── Grids ── */
.ve-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 600px) { .ve-grid-2 { grid-template-columns: 1fr; } }

/* ── Fields ── */
.ve-field { display: flex; flex-direction: column; gap: 6px; }
.ve-field--full { grid-column: 1 / -1; }
.ve-label { font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #7a6a5a; }
.ve-req { color: #e8650a; }

/* ── Inputs ── */
.ve-input {
  width: 100%; padding: 10px 14px; border-radius: 12px;
  border: 1.5px solid rgba(232,101,10,0.15); background: #fdf8f3;
  font-size: 14px; font-weight: 500; color: #1a1008; outline: none;
  font-family: 'DM Sans', sans-serif; transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.ve-input:focus { border-color: #e8650a; box-shadow: 0 0 0 3px rgba(232,101,10,0.1); background: #fff; }
.ve-input::placeholder { color: #c0b0a0; }
.ve-input-prefix-wrap { position: relative; }
.ve-input-prefix { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 14px; font-weight: 700; color: #e8650a; pointer-events: none; }
.ve-input--prefixed { padding-left: 26px; }

/* ── Select ── */
.ve-select-wrap { position: relative; }
.ve-select {
  width: 100%; padding: 10px 32px 10px 14px; border-radius: 12px;
  border: 1.5px solid rgba(232,101,10,0.15); background: #fdf8f3;
  font-size: 14px; font-weight: 500; color: #1a1008; outline: none;
  font-family: 'DM Sans', sans-serif; appearance: none; cursor: pointer;
  transition: border-color 0.2s; box-sizing: border-box;
}
.ve-select:focus { border-color: #e8650a; box-shadow: 0 0 0 3px rgba(232,101,10,0.1); }
.ve-select-arrow { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); font-size: 10px; color: #b0a090; pointer-events: none; }

/* ── Textarea ── */
.ve-textarea {
  width: 100%; padding: 12px 14px; border-radius: 12px;
  border: 1.5px solid rgba(232,101,10,0.15); background: #fdf8f3;
  font-size: 14px; font-weight: 500; color: #1a1008; outline: none;
  font-family: 'DM Sans', sans-serif; resize: vertical; min-height: 120px;
  transition: border-color 0.2s; box-sizing: border-box;
}
.ve-textarea:focus { border-color: #e8650a; box-shadow: 0 0 0 3px rgba(232,101,10,0.1); background: #fff; }
.ve-textarea::placeholder { color: #c0b0a0; }
.ve-char-count { font-size: 11.5px; color: #b0a090; text-align: right; }
.ve-char-count--warn { color: #e8650a; font-weight: 600; }

/* ── Upload zone ── */
.ve-upload-zone {
  border: 2px dashed rgba(232,101,10,0.25); border-radius: 16px;
  padding: 32px 24px; text-align: center; cursor: pointer;
  transition: all 0.2s; background: rgba(232,101,10,0.02);
  position: relative;
}
.ve-upload-zone:hover, .ve-upload-zone--drag { border-color: #e8650a; background: rgba(232,101,10,0.06); }
.ve-upload-zone--uploading { pointer-events: none; opacity: 0.8; }
.ve-upload-zone__input { display: none; }
.ve-upload-zone__icon { font-size: 32px; margin-bottom: 8px; }
.ve-upload-zone__text { font-size: 14px; font-weight: 600; color: #5a4a3a; margin-bottom: 4px; }
.ve-upload-zone__text strong { color: #e8650a; }
.ve-upload-zone__hint { font-size: 12px; color: #b0a090; }
.ve-upload-zone__uploading { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #e8650a; font-size: 14px; font-weight: 600; }
.ve-upload-zone__spinner { font-size: 24px; }

/* ── Portfolio grid ── */
.ve-portfolio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; }
.ve-portfolio-item { display: flex; flex-direction: column; gap: 6px; }
.ve-portfolio-item__media { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 1; background: rgba(232,101,10,0.06); }
.ve-portfolio-item__img { width: 100%; height: 100%; object-fit: cover; display: block; }
.ve-portfolio-item__overlay { position: absolute; inset: 0; background: rgba(0,0,0,0); transition: background 0.2s; display: flex; align-items: flex-start; justify-content: flex-end; padding: 6px; }
.ve-portfolio-item__media:hover .ve-portfolio-item__overlay { background: rgba(0,0,0,0.35); }
.ve-portfolio-item__del {
  width: 28px; height: 28px; border-radius: 8px; border: none;
  background: rgba(239,68,68,0.9); color: #fff; font-size: 11px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.2s;
}
.ve-portfolio-item__media:hover .ve-portfolio-item__del { opacity: 1; }
.ve-portfolio-item__type { position: absolute; bottom: 6px; left: 6px; font-size: 14px; }
.ve-portfolio-item__caption { font-size: 11.5px; padding: 5px 8px; border-radius: 8px; border: 1px solid rgba(232,101,10,0.12); background: #fdf8f3; color: #5a4a3a; outline: none; font-family: 'DM Sans', sans-serif; width: 100%; box-sizing: border-box; }
.ve-portfolio-item__caption:focus { border-color: #e8650a; }
.ve-portfolio-empty { text-align: center; padding: 16px; font-size: 13px; color: #b0a090; }

/* ── Tags ── */
.ve-tags-wrap { display: flex; flex-wrap: wrap; gap: 8px; min-height: 32px; }
.ve-tag { display: flex; align-items: center; gap: 5px; padding: 5px 12px; background: rgba(232,101,10,0.08); border: 1px solid rgba(232,101,10,0.2); border-radius: 99px; font-size: 12.5px; font-weight: 600; color: #e8650a; }
.ve-tag__remove { background: none; border: none; color: #e8650a; cursor: pointer; font-size: 15px; line-height: 1; padding: 0; opacity: 0.7; }
.ve-tag__remove:hover { opacity: 1; }
.ve-tag-input-row { display: flex; gap: 8px; }
.ve-tag-input-row .ve-input { flex: 1; }

/* ── Photo sections ── */
.ve-photo-section { display: flex; flex-direction: column; gap: 8px; }
.ve-cover-preview {
  height: 110px; border-radius: 14px; overflow: hidden; cursor: pointer;
  background: linear-gradient(135deg, #1a1008, #2d1a08); position: relative;
  border: 2px dashed rgba(232,101,10,0.2); transition: border-color 0.2s;
}
.ve-cover-preview:hover { border-color: #e8650a; }
.ve-cover-preview__img { width: 100%; height: 100%; object-fit: cover; }
.ve-cover-preview__placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: rgba(255,255,255,0.4); font-size: 13px; }
.ve-cover-preview__placeholder .pi { font-size: 24px; }
.ve-cover-preview__overlay { position: absolute; inset: 0; background: rgba(0,0,0,0); display: flex; align-items: center; justify-content: center; gap: 6px; color: #fff; font-size: 13px; font-weight: 600; opacity: 0; transition: all 0.2s; }
.ve-cover-preview:hover .ve-cover-preview__overlay { background: rgba(0,0,0,0.4); opacity: 1; }
.ve-cover-preview__uploading { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 22px; }

.ve-profile-preview-wrap { display: flex; align-items: center; gap: 14px; }
.ve-profile-preview {
  width: 72px; height: 72px; border-radius: 16px; overflow: hidden; cursor: pointer;
  background: rgba(232,101,10,0.08); position: relative; flex-shrink: 0;
  border: 2px dashed rgba(232,101,10,0.2); transition: border-color 0.2s;
  display: flex; align-items: center; justify-content: center; font-size: 28px;
}
.ve-profile-preview:hover { border-color: #e8650a; }
.ve-profile-preview__img { width: 100%; height: 100%; object-fit: cover; }
.ve-profile-preview__placeholder { font-size: 28px; }
.ve-profile-preview__overlay { position: absolute; inset: 0; background: rgba(0,0,0,0); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; opacity: 0; transition: all 0.2s; }
.ve-profile-preview:hover .ve-profile-preview__overlay { background: rgba(0,0,0,0.45); opacity: 1; }
.ve-profile-preview__uploading { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 18px; }
.ve-profile-preview__hint { font-size: 12px; color: #b0a090; }

.ve-hidden-input { display: none; }

/* ── Social ── */
.ve-social-list { display: flex; flex-direction: column; gap: 10px; }
.ve-social-item { display: flex; align-items: center; gap: 10px; }
.ve-social-item__icon { font-size: 18px; flex-shrink: 0; width: 28px; text-align: center; }

/* ── Completeness ── */
.ve-completeness-card { background: linear-gradient(135deg, #1a1008, #2d1a08); border-color: transparent; }
.ve-completeness-card .ve-card__title { color: #fba45c; }
.ve-completeness-bar-wrap { height: 8px; background: rgba(255,255,255,0.1); border-radius: 99px; overflow: hidden; }
.ve-completeness-bar { height: 100%; background: linear-gradient(90deg, #e8650a, #fba45c); border-radius: 99px; transition: width 0.6s cubic-bezier(0.34,1.56,0.64,1); }
.ve-completeness-pct { font-size: 13px; font-weight: 700; color: #fba45c; }
.ve-completeness-tips { display: flex; flex-direction: column; gap: 7px; }
.ve-completeness-tip { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: rgba(255,255,255,0.5); }
.ve-completeness-tip .pi { font-size: 13px; }
.ve-completeness-tip--done { color: rgba(255,255,255,0.85); }
.ve-completeness-tip--done .pi { color: #22c55e; }

/* ── Buttons ── */
.ve-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif; border: none; white-space: nowrap; }
.ve-btn--primary { background: linear-gradient(135deg, #e8650a, #c0392b); color: #fff; box-shadow: 0 3px 10px rgba(232,101,10,0.3); }
.ve-btn--primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(232,101,10,0.4); }
.ve-btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }
.ve-btn--outline { border: 1.5px solid rgba(232,101,10,0.25); color: #5a4a3a; background: transparent; }
.ve-btn--outline:hover { border-color: #e8650a; color: #e8650a; }
.ve-btn--ghost { border: 1.5px solid rgba(148,163,184,0.25); color: #9a8a7a; background: transparent; }
.ve-btn--ghost:hover { color: #5a4a3a; border-color: #9a8a7a; }
.ve-btn--full { width: 100%; justify-content: center; padding: 13px; font-size: 14px; border-radius: 12px; }

/* ── Mobile save ── */
.ve-save-mobile { display: none; }
@media (max-width: 900px) { .ve-save-mobile { display: block; } }
</style>
