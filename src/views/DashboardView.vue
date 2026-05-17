<template>
  <div class="db-page">

    <!-- ── Hero banner ── -->
    <div class="db-hero">
      <div class="db-hero__glow db-hero__glow--1" />
      <div class="db-hero__glow db-hero__glow--2" />
      <div class="db-hero__inner">
        <div class="db-hero__left">
          <div class="db-hero__avatar">{{ authStore.user?.name?.charAt(0)?.toUpperCase() }}</div>
          <div>
            <div class="db-hero__greeting">Good {{ timeOfDay }}, {{ authStore.user?.name?.split(' ')[0] }} 👋</div>
            <div class="db-hero__role">
              <span class="db-hero__role-badge">
                {{ authStore.isVendor ? '🏪 Vendor' : authStore.isAdmin ? '⚙️ Admin' : '💑 Couple' }}
              </span>
              <span class="db-hero__role-sub">{{ authStore.user?.email }}</span>
            </div>
          </div>
        </div>
        <div class="db-hero__actions">
          <RouterLink v-if="authStore.isVendor" to="/vendor/edit" class="db-hero-btn db-hero-btn--outline">
            <i class="pi pi-pencil" /> Edit Profile
          </RouterLink>
          <RouterLink to="/vendors" class="db-hero-btn db-hero-btn--solid">
            <i class="pi pi-search" /> Find Vendors
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="db-body">

      <!-- ══════════ VENDOR DASHBOARD ══════════ -->
      <template v-if="authStore.isVendor">

        <!-- Loading -->
        <div v-if="loadingVendor" class="db-grid-4">
          <div v-for="i in 4" :key="i" class="db-skeleton-card" />
        </div>

        <template v-else-if="vendorProfile">

          <!-- Stats row -->
          <div class="db-grid-4">
            <div class="db-stat-card" style="--accent:#e8650a">
              <div class="db-stat-card__icon">👁️</div>
              <div class="db-stat-card__val">{{ vendorProfile.viewCount || 0 }}</div>
              <div class="db-stat-card__lbl">Profile Views</div>
              <div class="db-stat-card__bar" style="width:60%" />
            </div>
            <div class="db-stat-card" style="--accent:#f59e0b">
              <div class="db-stat-card__icon">⭐</div>
              <div class="db-stat-card__val">{{ vendorProfile.averageRating?.toFixed(1) || '—' }}</div>
              <div class="db-stat-card__lbl">Avg Rating</div>
              <div class="db-stat-card__bar" :style="`width:${(vendorProfile.averageRating||0)/5*100}%`" />
            </div>
            <div class="db-stat-card" style="--accent:#22c55e">
              <div class="db-stat-card__icon">💬</div>
              <div class="db-stat-card__val">{{ vendorProfile.totalReviews || 0 }}</div>
              <div class="db-stat-card__lbl">Reviews</div>
              <div class="db-stat-card__bar" style="width:45%" />
            </div>
            <div class="db-stat-card" style="--accent:#8b5cf6">
              <div class="db-stat-card__icon">🖼️</div>
              <div class="db-stat-card__val">{{ vendorProfile.portfolio?.length || 0 }}</div>
              <div class="db-stat-card__lbl">Portfolio Items</div>
              <div class="db-stat-card__bar" style="width:30%" />
            </div>
          </div>

          <!-- Profile card + quick actions -->
          <div class="db-grid-2-1">

            <!-- Profile card -->
            <div class="db-card db-profile-card">
              <div class="db-profile-card__cover">
                <img v-if="vendorProfile.coverPhoto" :src="vendorProfile.coverPhoto" class="db-profile-card__cover-img" />
                <div v-else class="db-profile-card__cover-placeholder">{{ getCategoryEmoji(vendorProfile.category) }}</div>
              </div>
              <div class="db-profile-card__body">
                <div class="db-profile-card__avatar">
                  <img v-if="vendorProfile.profilePhoto" :src="vendorProfile.profilePhoto" />
                  <span v-else>{{ getCategoryEmoji(vendorProfile.category) }}</span>
                </div>
                <div class="db-profile-card__info">
                  <div class="db-profile-card__name">
                    {{ vendorProfile.businessName }}
                    <span v-if="vendorProfile.isVerified" class="db-verified">✓ Verified</span>
                  </div>
                  <div class="db-profile-card__meta">
                    <span>{{ vendorProfile.category }}</span>
                    <span class="db-dot">·</span>
                    <span>{{ vendorProfile.city }}</span>
                    <span v-if="vendorProfile.yearsOfExperience" class="db-dot">·</span>
                    <span v-if="vendorProfile.yearsOfExperience">{{ vendorProfile.yearsOfExperience }}yr exp</span>
                  </div>
                  <p class="db-profile-card__desc">{{ vendorProfile.description }}</p>
                </div>
                <div class="db-profile-card__actions">
                  <RouterLink :to="`/vendors/${vendorProfile.slug}`" class="db-btn db-btn--outline">
                    <i class="pi pi-eye" /> View Public Profile
                  </RouterLink>
                  <RouterLink to="/vendor/edit" class="db-btn db-btn--primary">
                    <i class="pi pi-pencil" /> Edit Profile
                  </RouterLink>
                  <button class="db-btn db-btn--ghost" @click="copyProfileLink">
                    <i class="pi pi-copy" /> Copy Link
                  </button>
                </div>
              </div>
            </div>

            <!-- Quick actions -->
            <div class="db-quick-actions">
              <div class="db-card db-quick-card" @click="$router.push('/budget')">
                <div class="db-quick-card__icon" style="background:rgba(232,101,10,0.1)">💰</div>
                <div class="db-quick-card__text">
                  <div class="db-quick-card__title">Budget Planner</div>
                  <div class="db-quick-card__sub">Plan event budgets</div>
                </div>
                <i class="pi pi-arrow-right db-quick-card__arrow" />
              </div>
              <div class="db-card db-quick-card" @click="$router.push('/vendors')">
                <div class="db-quick-card__icon" style="background:rgba(59,130,246,0.1)">🔍</div>
                <div class="db-quick-card__text">
                  <div class="db-quick-card__title">Browse Vendors</div>
                  <div class="db-quick-card__sub">See all listings</div>
                </div>
                <i class="pi pi-arrow-right db-quick-card__arrow" />
              </div>
              <div class="db-card db-quick-card" @click="$router.push('/vendor/edit')">
                <div class="db-quick-card__icon" style="background:rgba(34,197,94,0.1)">📸</div>
                <div class="db-quick-card__text">
                  <div class="db-quick-card__title">Add Portfolio</div>
                  <div class="db-quick-card__sub">Upload your work</div>
                </div>
                <i class="pi pi-arrow-right db-quick-card__arrow" />
              </div>
              <div class="db-card db-quick-card" @click="$router.push(`/vendors/${vendorProfile.slug}`)">
                <div class="db-quick-card__icon" style="background:rgba(139,92,246,0.1)">💬</div>
                <div class="db-quick-card__text">
                  <div class="db-quick-card__title">View Reviews</div>
                  <div class="db-quick-card__sub">{{ vendorProfile.totalReviews }} reviews</div>
                </div>
                <i class="pi pi-arrow-right db-quick-card__arrow" />
              </div>
            </div>

          </div>

          <!-- Tips banner -->
          <div class="db-tips-banner">
            <div class="db-tips-banner__icon">💡</div>
            <div class="db-tips-banner__text">
              <strong>Pro tip:</strong> Vendors with portfolio photos get <strong>3× more inquiries</strong>. Add at least 5 photos to your profile.
            </div>
            <RouterLink to="/vendor/edit" class="db-tips-banner__cta">Add Photos →</RouterLink>
          </div>

        </template>

        <!-- No vendor profile yet -->
        <div v-else class="db-card db-empty-vendor">
          <div class="db-empty-vendor__emoji">🏪</div>
          <h2 class="db-empty-vendor__title">Set up your vendor profile</h2>
          <p class="db-empty-vendor__sub">Start receiving inquiries from couples planning their dream event.</p>
          <RouterLink to="/register-vendor" class="db-btn db-btn--primary db-btn--lg">
            <i class="pi pi-plus-circle" /> Create Vendor Profile
          </RouterLink>
        </div>

      </template>

      <!-- ══════════ COUPLE DASHBOARD ══════════ -->
      <template v-else>

        <!-- Quick stats -->
        <div class="db-grid-3">
          <div class="db-stat-card" style="--accent:#e8650a">
            <div class="db-stat-card__icon">❤️</div>
            <div class="db-stat-card__val">{{ authStore.user?.savedVendors?.length || 0 }}</div>
            <div class="db-stat-card__lbl">Saved Vendors</div>
          </div>
          <div class="db-stat-card" style="--accent:#f59e0b">
            <div class="db-stat-card__icon">📋</div>
            <div class="db-stat-card__val">{{ budgetPlansCount }}</div>
            <div class="db-stat-card__lbl">Budget Plans</div>
          </div>
          <div class="db-stat-card" style="--accent:#22c55e">
            <div class="db-stat-card__icon">🎊</div>
            <div class="db-stat-card__val">{{ daysToEvent || '—' }}</div>
            <div class="db-stat-card__lbl">Days to Event</div>
          </div>
        </div>

        <div class="db-grid-2-1">

          <!-- Saved vendors -->
          <div class="db-card">
            <div class="db-card__head">
              <span class="db-card__title">❤️ Saved Vendors</span>
              <RouterLink to="/vendors" class="db-card__link">Browse more →</RouterLink>
            </div>
            <div v-if="authStore.user?.savedVendors?.length" class="db-saved-list">
              <div
                v-for="vendor in authStore.user.savedVendors"
                :key="vendor._id || vendor"
                class="db-saved-item"
                @click="$router.push(`/vendors/${vendor.slug}`)"
              >
                <div class="db-saved-item__img">
                  <img v-if="vendor.profilePhoto" :src="vendor.profilePhoto" />
                  <span v-else>{{ getCategoryEmoji(vendor.category) }}</span>
                </div>
                <div class="db-saved-item__info">
                  <div class="db-saved-item__name">{{ vendor.businessName }}</div>
                  <div class="db-saved-item__meta">{{ vendor.category }} · {{ vendor.city }}</div>
                </div>
                <div class="db-saved-item__price">{{ formatCurrency(vendor.startingPrice) }}</div>
                <i class="pi pi-arrow-right db-saved-item__arrow" />
              </div>
            </div>
            <div v-else class="db-empty-saved">
              <div class="db-empty-saved__icon">🔍</div>
              <p>No saved vendors yet</p>
              <RouterLink to="/vendors" class="db-btn db-btn--outline db-btn--sm">Browse Vendors</RouterLink>
            </div>
          </div>

          <!-- Quick actions -->
          <div class="db-quick-actions">
            <div class="db-card db-quick-card" @click="$router.push('/vendors')">
              <div class="db-quick-card__icon" style="background:rgba(232,101,10,0.1)">🔍</div>
              <div class="db-quick-card__text">
                <div class="db-quick-card__title">Find Vendors</div>
                <div class="db-quick-card__sub">Browse all categories</div>
              </div>
              <i class="pi pi-arrow-right db-quick-card__arrow" />
            </div>
            <div class="db-card db-quick-card" @click="$router.push('/budget')">
              <div class="db-quick-card__icon" style="background:rgba(245,158,11,0.1)">💰</div>
              <div class="db-quick-card__text">
                <div class="db-quick-card__title">Budget Planner</div>
                <div class="db-quick-card__sub">Smart allocation</div>
              </div>
              <i class="pi pi-arrow-right db-quick-card__arrow" />
            </div>
            <div class="db-card db-quick-card" @click="$router.push('/register-vendor')">
              <div class="db-quick-card__icon" style="background:rgba(34,197,94,0.1)">🏪</div>
              <div class="db-quick-card__text">
                <div class="db-quick-card__title">List Your Business</div>
                <div class="db-quick-card__sub">Free forever</div>
              </div>
              <i class="pi pi-arrow-right db-quick-card__arrow" />
            </div>
          </div>

        </div>

        <!-- Category shortcuts -->
        <div class="db-card">
          <div class="db-card__head">
            <span class="db-card__title">🎯 Browse by Category</span>
          </div>
          <div class="db-cat-shortcuts">
            <RouterLink
              v-for="cat in quickCategories" :key="cat.name"
              :to="`/vendors?category=${cat.name}`"
              class="db-cat-shortcut"
            >
              <span class="db-cat-shortcut__emoji">{{ cat.emoji }}</span>
              <span class="db-cat-shortcut__name">{{ cat.name }}</span>
            </RouterLink>
          </div>
        </div>

      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useVendorStore } from '@/stores/vendor';
import { useToast } from 'primevue/usetoast';
import { getCategoryEmoji, copyToClipboard, formatCurrency } from '@/utils/helpers';

const authStore  = useAuthStore();
const vendorStore = useVendorStore();
const toast      = useToast();

const vendorProfile   = ref(null);
const loadingVendor   = ref(false);
const budgetPlansCount = ref(0);
const daysToEvent     = ref(null);

const timeOfDay = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
});

const quickCategories = [
  { name: 'Photography', emoji: '📸' },
  { name: 'Catering',    emoji: '🍽️' },
  { name: 'Decoration',  emoji: '🌸' },
  { name: 'Venue',       emoji: '🏛️' },
  { name: 'DJ',          emoji: '🎵' },
  { name: 'Makeup',      emoji: '💄' },
  { name: 'Mehendi',     emoji: '🌿' },
  { name: 'Videography', emoji: '🎬' },
];

const copyProfileLink = async () => {
  if (vendorProfile.value) {
    await copyToClipboard(`${window.location.origin}/vendors/${vendorProfile.value.slug}`);
    toast.add({ severity: 'success', summary: 'Link copied!', detail: 'Share it with your clients', life: 2500 });
  }
};

onMounted(async () => {
  if (authStore.isVendor) {
    loadingVendor.value = true;
    try {
      vendorProfile.value = await vendorStore.getMyVendorProfile();
    } catch {
      vendorProfile.value = null;
    } finally {
      loadingVendor.value = false;
    }
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');

.db-page { min-height: 100vh; background: #f8f4f0; font-family: 'DM Sans', sans-serif; }

/* ── Hero ── */
.db-hero {
  position: relative; overflow: hidden;
  background: linear-gradient(135deg, #0f0a05 0%, #1e1008 60%, #0f0a05 100%);
  padding: 32px 24px 40px;
}
.db-hero__glow { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
.db-hero__glow--1 { width: 400px; height: 400px; top: -150px; right: -80px; background: rgba(232,101,10,0.18); }
.db-hero__glow--2 { width: 300px; height: 300px; bottom: -100px; left: -60px; background: rgba(192,57,43,0.12); }
.db-hero__inner { position: relative; max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.db-hero__left { display: flex; align-items: center; gap: 16px; }
.db-hero__avatar {
  width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #f97316, #e11d48);
  color: #fff; font-size: 20px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 20px rgba(249,115,22,0.4);
}
.db-hero__greeting { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 700; color: #fff; line-height: 1.2; }
.db-hero__role { display: flex; align-items: center; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
.db-hero__role-badge { background: rgba(232,101,10,0.2); border: 1px solid rgba(232,101,10,0.3); color: #fba45c; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; }
.db-hero__role-sub { font-size: 12.5px; color: rgba(255,255,255,0.4); }
.db-hero__actions { display: flex; gap: 10px; flex-wrap: wrap; }
.db-hero-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 99px; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s; white-space: nowrap; }
.db-hero-btn--solid { background: linear-gradient(135deg, #e8650a, #c0392b); color: #fff; box-shadow: 0 4px 14px rgba(232,101,10,0.35); }
.db-hero-btn--solid:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(232,101,10,0.45); }
.db-hero-btn--outline { border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); }
.db-hero-btn--outline:hover { background: rgba(255,255,255,0.1); color: #fff; }

/* ── Body ── */
.db-body { max-width: 1100px; margin: -24px auto 48px; padding: 0 24px; display: flex; flex-direction: column; gap: 20px; }

/* ── Grids ── */
.db-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.db-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.db-grid-2-1 { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
@media (max-width: 900px) { .db-grid-4 { grid-template-columns: repeat(2, 1fr); } .db-grid-3 { grid-template-columns: repeat(3, 1fr); } .db-grid-2-1 { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .db-grid-3 { grid-template-columns: repeat(2, 1fr); } }

/* ── Stat cards ── */
.db-stat-card {
  background: #fff; border-radius: 20px; padding: 20px;
  border: 1px solid rgba(232,101,10,0.08); box-shadow: 0 2px 16px rgba(26,16,8,0.05);
  position: relative; overflow: hidden;
}
.db-stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--accent); border-radius: 20px 20px 0 0; }
.db-stat-card__icon { font-size: 24px; margin-bottom: 8px; }
.db-stat-card__val { font-size: 28px; font-weight: 700; color: #1a1008; line-height: 1; margin-bottom: 4px; }
.db-stat-card__lbl { font-size: 12px; font-weight: 600; color: #9a8a7a; text-transform: uppercase; letter-spacing: 0.05em; }
.db-stat-card__bar { height: 3px; background: var(--accent); border-radius: 99px; margin-top: 12px; opacity: 0.3; transition: width 0.8s ease; }

/* Skeleton */
.db-skeleton-card { background: #fff; border-radius: 20px; height: 120px; border: 1px solid rgba(232,101,10,0.06); background: linear-gradient(90deg, #f0e8e0 25%, #fdf8f3 50%, #f0e8e0 75%); background-size: 200% 100%; animation: dbShimmer 1.4s infinite; }
@keyframes dbShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* ── Base card ── */
.db-card { background: #fff; border-radius: 20px; border: 1px solid rgba(232,101,10,0.08); box-shadow: 0 2px 16px rgba(26,16,8,0.05); padding: 24px; }
.db-card__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.db-card__title { font-size: 15px; font-weight: 700; color: #1a1008; }
.db-card__link { font-size: 13px; font-weight: 600; color: #e8650a; text-decoration: none; }
.db-card__link:hover { text-decoration: underline; }

/* ── Profile card ── */
.db-profile-card { padding: 0; overflow: hidden; }
.db-profile-card__cover { height: 120px; background: linear-gradient(135deg, #1a1008, #2d1a08); position: relative; overflow: hidden; }
.db-profile-card__cover-img { width: 100%; height: 100%; object-fit: cover; }
.db-profile-card__cover-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; opacity: 0.3; }
.db-profile-card__body { padding: 0 24px 24px; }
.db-profile-card__avatar {
  width: 72px; height: 72px; border-radius: 18px; border: 3px solid #fff;
  background: rgba(232,101,10,0.1); overflow: hidden; margin-top: -36px; margin-bottom: 12px;
  display: flex; align-items: center; justify-content: center; font-size: 28px;
  box-shadow: 0 4px 16px rgba(26,16,8,0.15);
}
.db-profile-card__avatar img { width: 100%; height: 100%; object-fit: cover; }
.db-profile-card__name { font-size: 18px; font-weight: 700; color: #1a1008; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px; }
.db-verified { font-size: 11px; font-weight: 700; background: linear-gradient(135deg, #059669, #10b981); color: #fff; padding: 2px 8px; border-radius: 99px; }
.db-profile-card__meta { font-size: 13px; color: #9a8a7a; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.db-dot { opacity: 0.4; }
.db-profile-card__desc { font-size: 13.5px; color: #5a4a3a; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 16px; }
.db-profile-card__actions { display: flex; gap: 8px; flex-wrap: wrap; }

/* ── Buttons ── */
.db-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; transition: all 0.2s; font-family: 'DM Sans', sans-serif; border: none; white-space: nowrap; }
.db-btn--primary { background: linear-gradient(135deg, #e8650a, #c0392b); color: #fff; box-shadow: 0 3px 10px rgba(232,101,10,0.3); }
.db-btn--primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(232,101,10,0.4); }
.db-btn--outline { border: 1.5px solid rgba(232,101,10,0.25); color: #5a4a3a; background: transparent; }
.db-btn--outline:hover { border-color: #e8650a; color: #e8650a; background: rgba(232,101,10,0.04); }
.db-btn--ghost { border: 1.5px solid rgba(148,163,184,0.25); color: #9a8a7a; background: transparent; }
.db-btn--ghost:hover { border-color: #9a8a7a; color: #5a4a3a; }
.db-btn--lg { padding: 13px 28px; font-size: 15px; border-radius: 14px; }
.db-btn--sm { padding: 7px 14px; font-size: 12px; }

/* ── Quick actions ── */
.db-quick-actions { display: flex; flex-direction: column; gap: 12px; }
.db-quick-card { display: flex; align-items: center; gap: 14px; padding: 16px 18px; cursor: pointer; transition: all 0.2s; }
.db-quick-card:hover { border-color: rgba(232,101,10,0.25); box-shadow: 0 4px 20px rgba(232,101,10,0.1); transform: translateX(3px); }
.db-quick-card__icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
.db-quick-card__text { flex: 1; min-width: 0; }
.db-quick-card__title { font-size: 14px; font-weight: 700; color: #1a1008; }
.db-quick-card__sub { font-size: 12px; color: #9a8a7a; margin-top: 1px; }
.db-quick-card__arrow { font-size: 12px; color: #c0b0a0; transition: transform 0.2s; }
.db-quick-card:hover .db-quick-card__arrow { transform: translateX(3px); color: #e8650a; }

/* ── Tips banner ── */
.db-tips-banner { background: linear-gradient(135deg, #1a1008, #2d1a08); border-radius: 16px; padding: 16px 20px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.db-tips-banner__icon { font-size: 22px; flex-shrink: 0; }
.db-tips-banner__text { flex: 1; font-size: 13.5px; color: rgba(255,255,255,0.7); line-height: 1.5; min-width: 200px; }
.db-tips-banner__text strong { color: #fba45c; }
.db-tips-banner__cta { font-size: 13px; font-weight: 700; color: #fba45c; text-decoration: none; white-space: nowrap; border-bottom: 1px solid rgba(251,164,92,0.3); }
.db-tips-banner__cta:hover { border-color: #fba45c; }

/* ── Empty vendor ── */
.db-empty-vendor { text-align: center; padding: 48px 24px; }
.db-empty-vendor__emoji { font-size: 52px; margin-bottom: 16px; }
.db-empty-vendor__title { font-family: 'Cormorant Garamond', serif; font-size: 26px; font-weight: 700; color: #1a1008; margin-bottom: 8px; }
.db-empty-vendor__sub { font-size: 14.5px; color: #9a8a7a; margin-bottom: 24px; }

/* ── Saved vendors list ── */
.db-saved-list { display: flex; flex-direction: column; gap: 8px; }
.db-saved-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 14px; border: 1px solid rgba(232,101,10,0.08); cursor: pointer; transition: all 0.15s; }
.db-saved-item:hover { border-color: rgba(232,101,10,0.25); background: rgba(232,101,10,0.02); }
.db-saved-item__img { width: 42px; height: 42px; border-radius: 10px; background: rgba(232,101,10,0.08); overflow: hidden; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.db-saved-item__img img { width: 100%; height: 100%; object-fit: cover; }
.db-saved-item__info { flex: 1; min-width: 0; }
.db-saved-item__name { font-size: 13.5px; font-weight: 600; color: #1a1008; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.db-saved-item__meta { font-size: 11.5px; color: #9a8a7a; margin-top: 1px; }
.db-saved-item__price { font-size: 13px; font-weight: 700; color: #e8650a; white-space: nowrap; }
.db-saved-item__arrow { font-size: 11px; color: #c0b0a0; flex-shrink: 0; }

/* ── Empty saved ── */
.db-empty-saved { text-align: center; padding: 32px 16px; }
.db-empty-saved__icon { font-size: 36px; margin-bottom: 8px; }
.db-empty-saved p { font-size: 13.5px; color: #9a8a7a; margin: 0 0 16px; }

/* ── Category shortcuts ── */
.db-cat-shortcuts { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px; }
.db-cat-shortcut { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 14px 8px; border-radius: 14px; border: 1.5px solid rgba(232,101,10,0.1); text-decoration: none; transition: all 0.15s; }
.db-cat-shortcut:hover { border-color: #e8650a; background: rgba(232,101,10,0.04); transform: translateY(-2px); }
.db-cat-shortcut__emoji { font-size: 24px; }
.db-cat-shortcut__name { font-size: 11.5px; font-weight: 600; color: #5a4a3a; text-align: center; }
</style>
