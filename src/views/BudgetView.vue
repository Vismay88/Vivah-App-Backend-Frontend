<template>
  <div class="bp-page">

    <!-- ── Hero ── -->
    <section class="bp-hero">
      <div class="bp-hero__pattern" />
      <div class="bp-hero__content">
        <div class="bp-hero__badge">
          <span>✨</span> Smart Wedding Planner
        </div>
        <h1 class="bp-hero__title">
          Plan Your <em>Dream Wedding</em><br />Budget — Smartly
        </h1>
        <p class="bp-hero__sub">
          Enter your budget and we'll split it across all categories with verified Gujarat vendors shown in each range
        </p>
        <!-- Floating stat pills -->
        <div class="bp-hero__stats">
          <div class="bp-stat-pill">💑 5000+ weddings planned</div>
          <div class="bp-stat-pill">📍 20+ Gujarat cities</div>
          <div class="bp-stat-pill">⭐ 4.8 avg rating</div>
        </div>
      </div>
      <!-- Decorative rings -->
      <div class="bp-hero__ring bp-hero__ring--1" />
      <div class="bp-hero__ring bp-hero__ring--2" />
    </section>

    <div class="bp-body">

      <!-- ── Step 1: Budget Input ── -->
      <div class="bp-card" style="animation-delay:0s">
        <div class="bp-step-label">
          <span class="bp-step-num">1</span>
          Tell us your budget
        </div>

        <!-- Big budget input -->
        <div class="bp-amount-input-wrap">
          <span class="bp-amount-currency">₹</span>
          <input
            v-model="rawBudget"
            type="text"
            inputmode="numeric"
            class="bp-amount-input"
            placeholder="0"
            @input="handleBudgetInput"
          />
          <span class="bp-amount-words">{{ budgetInWords }}</span>
        </div>

        <!-- Quick presets -->
        <div class="bp-presets">
          <button
            v-for="p in presets"
            :key="p.value"
            class="bp-preset-btn"
            :class="{ 'bp-preset-btn--active': totalBudget === p.value }"
            @click="applyPreset(p)"
          >{{ p.label }}</button>
        </div>

        <!-- City + Date row -->
        <div class="bp-fields-row">
          <div class="bp-field">
            <label class="bp-field-label"><i class="pi pi-map-marker" /> Wedding City</label>
            <VivahDropdown
              v-model="weddingCity"
              :options="cityOptions"
              label="City"
              icon="pi pi-map-marker"
              placeholder="Select city"
              :searchable="true"
            />
          </div>
          <div class="bp-field">
            <label class="bp-field-label"><i class="pi pi-users" /> Guest Count</label>
            <div class="bp-input-plain-wrap">
              <input
                v-model.number="guestCount"
                type="number"
                class="bp-input-plain"
                placeholder="e.g. 300"
                min="10"
              />
            </div>
          </div>
          <div class="bp-field">
            <label class="bp-field-label"><i class="pi pi-calendar" /> Wedding Date</label>
            <div class="bp-input-plain-wrap">
              <input
                v-model="weddingDate"
                type="date"
                class="bp-input-plain"
              />
            </div>
          </div>
        </div>

        <!-- Tier badge -->
        <Transition name="tier-fade">
          <div v-if="tier" class="bp-tier" :style="{ '--tier-color': tier.hex }">
            <span class="bp-tier__emoji">{{ tier.emoji }}</span>
            <div>
              <div class="bp-tier__name">{{ tier.label }} Wedding</div>
              <div class="bp-tier__desc">{{ tier.desc }}</div>
            </div>
          </div>
        </Transition>

        <button
          class="bp-calculate-btn"
          :disabled="!totalBudget || totalBudget < 10000"
          :class="{ 'bp-calculate-btn--ready': totalBudget >= 10000 }"
          @click="calculateBudget"
        >
          <i class="pi pi-calculator" />
          Calculate My Budget Split
        </button>
      </div>

      <!-- ── Step 2: Category Sliders ── -->
      <Transition name="step-reveal">
        <div v-if="budgetCategories.length" class="bp-card" style="animation-delay:0.1s">
          <div class="bp-step-label">
            <span class="bp-step-num">2</span>
            Adjust your priorities
            <span class="bp-pct-total" :class="{ 'bp-pct-total--ok': totalPct === 100, 'bp-pct-total--over': totalPct > 100 }">
              {{ totalPct }}% allocated
            </span>
          </div>

          <!-- Visual stacked bar -->
          <div class="bp-stack-bar">
            <div
              v-for="cat in budgetCategories"
              :key="cat.key"
              class="bp-stack-seg"
              :style="{ width: cat.percentage + '%', background: cat.color }"
              :title="`${cat.name}: ${cat.percentage}%`"
            />
          </div>

          <!-- Category rows -->
          <div class="bp-cats-grid">
            <div
              v-for="(cat, i) in budgetCategories"
              :key="cat.key"
              class="bp-cat-row"
              :style="{ animationDelay: i * 0.05 + 's' }"
            >
              <div class="bp-cat-row__left">
                <div class="bp-cat-row__icon" :style="{ background: cat.lightColor }">
                  {{ cat.emoji }}
                </div>
                <div>
                  <div class="bp-cat-row__name">{{ cat.name }}</div>
                  <div class="bp-cat-row__amount">{{ formatCurrency(cat.allocated) }}</div>
                </div>
              </div>
              <div class="bp-cat-row__right">
                <input
                  type="range"
                  class="bp-range"
                  :min="0" :max="60" :step="1"
                  v-model.number="cat.percentage"
                  @input="onSliderChange(cat)"
                  :style="{ '--fill': cat.percentage / 60 * 100 + '%', '--clr': cat.color }"
                />
                <div class="bp-pct-badge" :style="{ color: cat.color }">{{ cat.percentage }}%</div>
              </div>
            </div>
          </div>

          <!-- Remaining buffer -->
          <div class="bp-buffer" :class="{ 'bp-buffer--warn': remaining < 0, 'bp-buffer--ok': remaining >= 0 }">
            <i :class="remaining >= 0 ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle'" />
            <span v-if="remaining >= 0">
              {{ formatCurrency(remaining) }} kept as buffer — smart for last minute expenses
            </span>
            <span v-else>
              Over budget by {{ formatCurrency(Math.abs(remaining)) }} — please reduce some categories
            </span>
          </div>
        </div>
      </Transition>

      <!-- ── Step 3: Vendor Suggestions ── -->
      <Transition name="step-reveal">
        <div v-if="vendorCategories.length" class="bp-card" style="animation-delay:0.2s">
          <div class="bp-step-label">
            <span class="bp-step-num">3</span>
            Vendors within your budget
          </div>

          <div class="bp-vendor-sections">
            <div v-for="cat in vendorCategories" :key="cat.key" class="bp-vendor-section">
              <div class="bp-vendor-section__header">
                <div class="bp-vendor-section__title">
                  <span>{{ cat.emoji }}</span>
                  {{ cat.name }}
                  <span class="bp-vendor-section__budget">{{ formatCurrency(cat.allocated) }}</span>
                </div>
                <RouterLink
                  :to="`/vendors?category=${cat.name}&maxPrice=${cat.allocated}&city=${weddingCity || ''}`"
                  class="bp-see-all"
                >
                  See all <i class="pi pi-arrow-right" />
                </RouterLink>
              </div>

              <!-- Vendor cards -->
              <div v-if="cat.vendors?.length" class="bp-vendor-cards">
                <div
                  v-for="vendor in cat.vendors"
                  :key="vendor._id"
                  class="bp-vendor-card"
                  @click="$router.push(`/vendors/${vendor.slug}`)"
                >
                  <div class="bp-vendor-card__img">
                    <img v-if="vendor.profilePhoto" :src="vendor.profilePhoto" :alt="vendor.businessName" />
                    <span v-else>{{ cat.emoji }}</span>
                  </div>
                  <div class="bp-vendor-card__body">
                    <div class="bp-vendor-card__name">{{ vendor.businessName }}</div>
                    <div class="bp-vendor-card__city">
                      <i class="pi pi-map-marker" /> {{ vendor.city }}
                    </div>
                    <div class="bp-vendor-card__footer">
                      <span class="bp-vendor-card__price">{{ formatCurrency(vendor.startingPrice) }}</span>
                      <span class="bp-vendor-card__rating">
                        <i class="pi pi-star-fill" /> {{ vendor.averageRating?.toFixed(1) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="bp-vendor-empty">
                No vendors in this range yet.
                <RouterLink :to="`/vendors?category=${cat.name}`" class="bp-vendor-empty__link">
                  Browse all {{ cat.name }} vendors
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- ── Step 4: Tips ── -->
      <Transition name="step-reveal">
        <div v-if="tier && budgetCategories.length" class="bp-card bp-tips-card" style="animation-delay:0.3s">
          <div class="bp-step-label">
            <span class="bp-step-num">💡</span>
            Smart tips for your budget
          </div>
          <div class="bp-tips-grid">
            <div v-for="tip in tier.tips" :key="tip" class="bp-tip">
              <span class="bp-tip__dot" />
              {{ tip }}
            </div>
          </div>
        </div>
      </Transition>

      <!-- ── Step 5: Save & Share ── -->
      <Transition name="step-reveal">
        <div v-if="budgetCategories.length" class="bp-card" style="animation-delay:0.4s">
          <div class="bp-step-label">
            <span class="bp-step-num">4</span>
            Save &amp; share your plan
          </div>

          <div v-if="savedPlan" class="bp-share-box">
            <div class="bp-share-box__success">
              <i class="pi pi-check-circle" /> Budget saved successfully!
            </div>
            <div class="bp-share-row">
              <input :value="shareLink" readonly class="bp-share-link" />
              <button class="bp-share-copy" @click="copyLink">
                <i class="pi pi-copy" />
              </button>
              <a
                :href="`https://wa.me/?text=${encodeURIComponent('My wedding budget plan: ' + shareLink)}`"
                target="_blank"
                class="bp-share-wa"
              >
                <i class="pi pi-whatsapp" />
              </a>
            </div>
          </div>

          <div class="bp-actions">
            <button class="bp-btn-primary" :class="{ 'bp-btn-loading': saving }" @click="saveBudget">
              <i class="pi pi-save" />
              {{ saving ? 'Saving...' : 'Save Budget Plan' }}
            </button>
            <button class="bp-btn-outline" @click="printBudget">
              <i class="pi pi-print" /> Print / PDF
            </button>
            <button class="bp-btn-ghost" @click="resetBudget">
              <i class="pi pi-refresh" /> Reset
            </button>
          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import api from '@/services/api';
import { GUJARAT_CITIES, formatCurrency } from '@/utils/helpers';
import VivahDropdown from '@/components/ui/Dropdown-Component.vue';

const router = useRouter();
const toast  = useToast();

// ── State ──
const rawBudget      = ref('');
const totalBudget    = ref(0);
const weddingCity    = ref('');
const weddingDate    = ref('');
const guestCount     = ref(null);
const budgetCategories = ref([]);
const vendorCategories = ref([]);
const saving         = ref(false);
const savedPlan      = ref(null);
const shareLink      = ref('');

// ── City options for VivahDropdown ──
const cityOptions = GUJARAT_CITIES.map(c => ({ value: c, label: c }));

// ── Presets ──
const presets = [
  { label: '₹2L',  value: 200000  },
  { label: '₹5L',  value: 500000  },
  { label: '₹10L', value: 1000000 },
  { label: '₹15L', value: 1500000 },
  { label: '₹25L', value: 2500000 },
  { label: '₹50L', value: 5000000 },
];

const applyPreset = (p) => {
  totalBudget.value = p.value;
  rawBudget.value   = p.value.toLocaleString('en-IN');
};

// ── Budget input handler ──
const handleBudgetInput = () => {
  const num = parseInt(rawBudget.value.replace(/[^0-9]/g, ''), 10);
  totalBudget.value = isNaN(num) ? 0 : num;
  rawBudget.value   = num ? num.toLocaleString('en-IN') : '';
};

// ── Budget in words ──
const budgetInWords = computed(() => {
  const n = totalBudget.value;
  if (!n) return '';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Crore`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} Lakh`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return '';
});

// ── Tier detection ──
const TIERS = {
  budget: {
    label: 'Budget', emoji: '💚', hex: '#22c55e',
    desc: 'Smart & simple celebration',
    tips: [
      'Book photographers who offer combined photo+video deals — saves 20-25%',
      'Choose buffet catering over plated — costs 35-40% less per head',
      'Digital invitations save ₹15,000–20,000 easily',
      'Book local decorators who know Gujarati wedding style well',
      'Avoid peak wedding season (Nov–Feb) for 15% lower vendor pricing',
    ],
    pcts: { Venue:28, Catering:30, Photography:8, Videography:4, Decoration:12, Mehendi:3, Makeup:4, DJ:4, Invitation:2, Pandit:2, Miscellaneous:3 }
  },
  standard: {
    label: 'Standard', emoji: '💛', hex: '#f59e0b',
    desc: 'Beautiful without breaking the bank',
    tips: [
      'Negotiate combo packages — most vendors give 10-15% off bundles',
      'Book at least 4 months early for better pricing and availability',
      'Combine mehendi artist and makeup artist from same studio for discount',
      'Use the venue\'s in-house catering — often 20% cheaper than outside',
      'Allocate ₹50,000 hidden reserve — it always gets used in Indian weddings',
    ],
    pcts: { Venue:30, Catering:28, Photography:10, Videography:5, Decoration:12, Mehendi:3, Makeup:4, DJ:4, Invitation:1, Pandit:1, Miscellaneous:2 }
  },
  premium: {
    label: 'Premium', emoji: '🧡', hex: '#e8650a',
    desc: 'Refined experience with quality vendors',
    tips: [
      'Hire a wedding coordinator — saves you 10x the stress for 2-3% of budget',
      'Invest in a pre-wedding shoot — great photos become family heirlooms',
      'Spend more on venue and catering — guests remember food and ambience most',
      'Use drone videography — cinematic results that wow guests',
      'Book verified vendors — avoid last minute cancellations at this budget level',
    ],
    pcts: { Venue:32, Catering:25, Photography:12, Videography:6, Decoration:13, Mehendi:2, Makeup:3, DJ:3, Invitation:1, Pandit:1, Miscellaneous:2 }
  },
  luxury: {
    label: 'Luxury', emoji: '❤️', hex: '#c0392b',
    desc: 'No compromise, only excellence',
    tips: [
      'Hire a full-service wedding management company',
      'Fly in specialists for makeup and photography if needed',
      'Consider destination pre-wedding shoots — Udaipur, Goa, or international',
      'Custom floral installations make the venue truly unforgettable',
      'Live music or celebrity performances elevate the entire experience',
    ],
    pcts: { Venue:35, Catering:22, Photography:12, Videography:6, Decoration:14, Mehendi:2, Makeup:3, DJ:2, Invitation:1, Pandit:1, Miscellaneous:2 }
  }
};

const CATEGORY_META = [
  { key:'Venue',        name:'Venue',         emoji:'🏛️', color:'#e8650a', lightColor:'rgba(232,101,10,0.1)'  },
  { key:'Catering',     name:'Catering',      emoji:'🍽️', color:'#f59e0b', lightColor:'rgba(245,158,11,0.1)'  },
  { key:'Photography',  name:'Photography',   emoji:'📸', color:'#3b82f6', lightColor:'rgba(59,130,246,0.1)'  },
  { key:'Videography',  name:'Videography',   emoji:'🎬', color:'#8b5cf6', lightColor:'rgba(139,92,246,0.1)'  },
  { key:'Decoration',   name:'Decoration',    emoji:'🌸', color:'#ec4899', lightColor:'rgba(236,72,153,0.1)'  },
  { key:'Mehendi',      name:'Mehendi',       emoji:'🌿', color:'#22c55e', lightColor:'rgba(34,197,94,0.1)'   },
  { key:'Makeup',       name:'Makeup',        emoji:'💄', color:'#f43f5e', lightColor:'rgba(244,63,94,0.1)'   },
  { key:'DJ',           name:'DJ / Music',    emoji:'🎵', color:'#06b6d4', lightColor:'rgba(6,182,212,0.1)'   },
  { key:'Invitation',   name:'Invitation',    emoji:'💌', color:'#14b8a6', lightColor:'rgba(20,184,166,0.1)'  },
  { key:'Pandit',       name:'Pandit',        emoji:'🙏', color:'#f97316', lightColor:'rgba(249,115,22,0.1)'  },
  { key:'Miscellaneous',name:'Miscellaneous', emoji:'📦', color:'#94a3b8', lightColor:'rgba(148,163,184,0.1)' },
];

const tier = computed(() => {
  const b = totalBudget.value;
  if (!b) return null;
  if (b < 300000)  return TIERS.budget;
  if (b < 1000000) return TIERS.standard;
  if (b < 2500000) return TIERS.premium;
  return TIERS.luxury;
});

// ── Totals ──
const totalPct = computed(() =>
  budgetCategories.value.reduce((s, c) => s + (c.percentage || 0), 0)
);

const remaining = computed(() => {
  if (!totalBudget.value) return 0;
  const used = budgetCategories.value.reduce((s, c) => s + c.allocated, 0);
  return totalBudget.value - used;
});

// ── Calculate ──
const calculateBudget = async () => {
  if (!totalBudget.value || !tier.value) return;
  const pcts = tier.value.pcts;
  budgetCategories.value = CATEGORY_META.map(meta => ({
    ...meta,
    percentage: pcts[meta.key] ?? 2,
    allocated:  Math.round((totalBudget.value * (pcts[meta.key] ?? 2)) / 100),
  }));
  await loadVendorSuggestions();
};

// ── Slider change ──
const onSliderChange = (cat) => {
  cat.allocated = Math.round((totalBudget.value * cat.percentage) / 100);
};

// ── Vendor suggestions ──
const VENDOR_CATS = ['Venue','Catering','Photography','Decoration','Makeup','Mehendi','DJ'];

const loadVendorSuggestions = async () => {
  const filtered = budgetCategories.value.filter(c => VENDOR_CATS.includes(c.key));
  const results = await Promise.all(
    filtered.map(async cat => {
      try {
        const res = await api.get('/vendors/by-budget', {
          params: { category: cat.key, maxBudget: cat.allocated, city: weddingCity.value || undefined, limit: 3 }
        });
        return { ...cat, vendors: res.data.vendors };
      } catch {
        return { ...cat, vendors: [] };
      }
    })
  );
  vendorCategories.value = results;
};

// ── Save ──
const saveBudget = async () => {
  saving.value = true;
  try {
    const res = await api.post('/budget/save', {
      totalBudget: totalBudget.value,
      categories:  budgetCategories.value,
      weddingDate: weddingDate.value,
      guestCount:  guestCount.value,
      city:        weddingCity.value,
    });
    savedPlan.value = res.data.plan;
    shareLink.value = `${window.location.origin}/budget/share/${res.data.shareToken}`;
    toast.add({ severity:'success', summary:'Budget saved!', detail:'Share your plan with family', life:3000 });
  } catch (err) {
    toast.add({ severity:'error', summary:'Failed to save', detail: err.message, life:3000 });
  } finally {
    saving.value = false;
  }
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value);
    toast.add({ severity:'success', summary:'Link copied!', life:2000 });
  } catch {
    toast.add({ severity:'error', summary:'Failed to copy', life:2000 });
  }
};

const printBudget = () => window.print();

const resetBudget = () => {
  rawBudget.value = '';
  totalBudget.value = 0;
  weddingCity.value = '';
  weddingDate.value = '';
  guestCount.value = null;
  budgetCategories.value = [];
  vendorCategories.value = [];
  savedPlan.value = null;
  shareLink.value = '';
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@400;500;600&display=swap');

/* ── Page ── */
.bp-page {
  min-height: 100vh;
  background: #fdf8f3;
  font-family: 'DM Sans', sans-serif;
}

/* ── Hero ── */
.bp-hero {
  position: relative;
  background: linear-gradient(135deg, #1a1008 0%, #2d1a08 50%, #1a0f0a 100%);
  padding: 72px 24px 80px;
  overflow: hidden;
  text-align: center;
}

.bp-hero__pattern {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(232,101,10,0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(192,57,43,0.12) 0%, transparent 40%);
}

.bp-hero__ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.06);
}
.bp-hero__ring--1 { width: 400px; height: 400px; top: -100px; right: -100px; }
.bp-hero__ring--2 { width: 280px; height: 280px; bottom: -80px; left: -60px; }

.bp-hero__content {
  position: relative;
  max-width: 680px;
  margin: 0 auto;
}

.bp-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(232,101,10,0.2);
  border: 1px solid rgba(232,101,10,0.3);
  color: #fba45c;
  padding: 6px 16px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: 0.02em;
}

.bp-hero__title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 16px;
}

.bp-hero__title em {
  font-style: italic;
  color: #fba45c;
}

.bp-hero__sub {
  font-size: 16px;
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  margin-bottom: 28px;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
}

.bp-hero__stats {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.bp-stat-pill {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.75);
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 500;
}

/* ── Body ── */
.bp-body {
  max-width: 860px;
  margin: -32px auto 60px;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Card ── */
.bp-card {
  background: #fff;
  border-radius: 24px;
  border: 1px solid rgba(232,101,10,0.1);
  box-shadow: 0 4px 24px rgba(26,16,8,0.07);
  padding: 32px;
  animation: cardIn 0.5s cubic-bezier(0.34,1.2,0.64,1) both;
}

@keyframes cardIn {
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0); }
}

/* ── Step label ── */
.bp-step-label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 17px;
  font-weight: 700;
  color: #1a1008;
  margin-bottom: 24px;
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
}

.bp-step-num {
  width: 30px;
  height: 30px;
  border-radius: 10px;
  background: linear-gradient(135deg, #e8650a, #c0392b);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'DM Sans', sans-serif;
}

.bp-pct-total {
  margin-left: auto;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 99px;
  background: rgba(34,197,94,0.1);
  color: #16a34a;
}
.bp-pct-total--over { background: rgba(239,68,68,0.1); color: #dc2626; }

/* ── Amount Input ── */
.bp-amount-input-wrap {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid rgba(232,101,10,0.12);
}

.bp-amount-currency {
  font-family: 'Cormorant Garamond', serif;
  font-size: 40px;
  font-weight: 700;
  color: #e8650a;
  line-height: 1;
}

.bp-amount-input {
  font-family: 'Cormorant Garamond', serif;
  font-size: 48px;
  font-weight: 700;
  color: #1a1008;
  border: none;
  outline: none;
  background: transparent;
  width: 100%;
  min-width: 0;
  line-height: 1;
}

.bp-amount-input::placeholder { color: #d0c0b0; }

.bp-amount-words {
  font-size: 14px;
  font-weight: 600;
  color: #e8650a;
  white-space: nowrap;
  flex-shrink: 0;
  background: rgba(232,101,10,0.08);
  padding: 4px 10px;
  border-radius: 8px;
}

/* ── Presets ── */
.bp-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.bp-preset-btn {
  padding: 7px 16px;
  border-radius: 10px;
  border: 1.5px solid rgba(232,101,10,0.2);
  background: transparent;
  color: #7a5a3a;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
}

.bp-preset-btn:hover {
  border-color: #e8650a;
  color: #e8650a;
  background: rgba(232,101,10,0.05);
}

.bp-preset-btn--active {
  background: linear-gradient(135deg, #e8650a, #c0392b);
  border-color: transparent;
  color: #fff;
  box-shadow: 0 4px 12px rgba(232,101,10,0.3);
}

/* ── Fields row ── */
.bp-fields-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

@media (max-width: 640px) {
  .bp-fields-row { grid-template-columns: 1fr; }
}

.bp-field-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #e8650a;
  margin-bottom: 6px;
}

.bp-field-label .pi { font-size: 10px; }

.bp-input-plain-wrap {
  border: 1.5px solid rgba(232,101,10,0.15);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.bp-input-plain-wrap:focus-within {
  border-color: rgba(232,101,10,0.4);
}

.bp-input-plain {
  width: 100%;
  padding: 10px 14px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #1a1008;
  font-family: 'DM Sans', sans-serif;
}

/* ── Tier badge ── */
.bp-tier {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 14px;
  border: 1.5px solid rgba(255,255,255,0.2);
  background: var(--tier-color);
  color: #fff;
  margin-bottom: 20px;
}

.bp-tier__emoji { font-size: 24px; }

.bp-tier__name {
  font-size: 15px;
  font-weight: 700;
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
}

.bp-tier__desc { font-size: 12.5px; opacity: 0.85; }

/* ── Calculate button ── */
.bp-calculate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 15px;
  border-radius: 14px;
  border: none;
  background: linear-gradient(135deg, #c0c0c0, #a0a0a0);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: not-allowed;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
}

.bp-calculate-btn--ready {
  background: linear-gradient(135deg, #e8650a, #c0392b);
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(232,101,10,0.3);
}

.bp-calculate-btn--ready:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(232,101,10,0.4);
}

/* ── Stacked bar ── */
.bp-stack-bar {
  height: 10px;
  border-radius: 99px;
  display: flex;
  overflow: hidden;
  margin-bottom: 28px;
  background: #f0e8e0;
}

.bp-stack-seg {
  transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
  min-width: 2px;
}

/* ── Category rows ── */
.bp-cats-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bp-cat-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid transparent;
  transition: all 0.2s;
  animation: catRowIn 0.4s cubic-bezier(0.34,1.2,0.64,1) both;
}

@keyframes catRowIn {
  from { opacity:0; transform:translateX(-10px); }
  to   { opacity:1; transform:translateX(0); }
}

.bp-cat-row:hover {
  background: rgba(232,101,10,0.03);
  border-color: rgba(232,101,10,0.08);
}

.bp-cat-row__left {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 200px;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .bp-cat-row { flex-wrap: wrap; }
  .bp-cat-row__left { width: 100%; }
}

.bp-cat-row__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.bp-cat-row__name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1008;
}

.bp-cat-row__amount {
  font-size: 12.5px;
  font-weight: 500;
  color: #e8650a;
}

.bp-cat-row__right {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

/* Custom range slider */
.bp-range {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  height: 5px;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--clr) var(--fill), #e8e0d8 var(--fill));
  outline: none;
  cursor: pointer;
  transition: background 0.2s;
}

.bp-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #fff;
  border: 2.5px solid var(--clr);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  cursor: pointer;
  transition: transform 0.2s;
}

.bp-range::-webkit-slider-thumb:hover { transform: scale(1.2); }

.bp-pct-badge {
  font-size: 13px;
  font-weight: 700;
  width: 36px;
  text-align: right;
  flex-shrink: 0;
}

/* ── Buffer bar ── */
.bp-buffer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 500;
}

.bp-buffer--ok {
  background: rgba(34,197,94,0.08);
  color: #16a34a;
  border: 1px solid rgba(34,197,94,0.2);
}

.bp-buffer--warn {
  background: rgba(239,68,68,0.08);
  color: #dc2626;
  border: 1px solid rgba(239,68,68,0.2);
}

/* ── Vendor section ── */
.bp-vendor-sections { display: flex; flex-direction: column; gap: 28px; }

.bp-vendor-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.bp-vendor-section__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  color: #1a1008;
}

.bp-vendor-section__budget {
  font-size: 12.5px;
  font-weight: 600;
  color: #e8650a;
  background: rgba(232,101,10,0.08);
  padding: 2px 8px;
  border-radius: 6px;
}

.bp-see-all {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  font-weight: 600;
  color: #e8650a;
  text-decoration: none;
  transition: gap 0.2s;
}

.bp-see-all:hover { gap: 7px; }

.bp-vendor-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

@media (max-width: 600px) {
  .bp-vendor-cards { grid-template-columns: 1fr; }
}

.bp-vendor-card {
  display: flex;
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid rgba(232,101,10,0.1);
  cursor: pointer;
  transition: all 0.2s;
  background: #fdf8f3;
}

.bp-vendor-card:hover {
  border-color: rgba(232,101,10,0.3);
  box-shadow: 0 4px 16px rgba(232,101,10,0.1);
  transform: translateY(-2px);
}

.bp-vendor-card__img {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgba(232,101,10,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  overflow: hidden;
  flex-shrink: 0;
}

.bp-vendor-card__img img { width:100%; height:100%; object-fit:cover; }

.bp-vendor-card__body { flex: 1; min-width: 0; }

.bp-vendor-card__name {
  font-size: 13px;
  font-weight: 600;
  color: #1a1008;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bp-vendor-card__city {
  font-size: 11.5px;
  color: #9a8a7a;
  margin: 2px 0 6px;
}

.bp-vendor-card__city .pi { font-size: 10px; }

.bp-vendor-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bp-vendor-card__price {
  font-size: 13px;
  font-weight: 700;
  color: #e8650a;
}

.bp-vendor-card__rating {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 12px;
  color: #7a6a5a;
}

.bp-vendor-card__rating .pi { color: #f59e0b; font-size: 10px; }

.bp-vendor-empty {
  font-size: 13.5px;
  color: #b0a090;
  padding: 16px 0;
}

.bp-vendor-empty__link {
  color: #e8650a;
  text-decoration: none;
  font-weight: 600;
}

/* ── Tips card ── */
.bp-tips-card { background: linear-gradient(135deg, #1a1008, #2d1a08); }
.bp-tips-card .bp-step-label { color: #fba45c; }

.bp-tips-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 600px) {
  .bp-tips-grid { grid-template-columns: 1fr; }
}

.bp-tip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13.5px;
  color: rgba(255,255,255,0.75);
  line-height: 1.5;
}

.bp-tip__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #e8650a;
  flex-shrink: 0;
  margin-top: 6px;
}

/* ── Save section ── */
.bp-share-box {
  margin-bottom: 20px;
}

.bp-share-box__success {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #16a34a;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.bp-share-row {
  display: flex;
  gap: 8px;
}

.bp-share-link {
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1.5px solid rgba(232,101,10,0.15);
  background: rgba(232,101,10,0.03);
  font-size: 13px;
  color: #5a4a3a;
  outline: none;
  font-family: 'DM Sans', sans-serif;
}

.bp-share-copy, .bp-share-wa {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1.5px solid rgba(232,101,10,0.2);
  background: transparent;
  color: #e8650a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.2s;
  text-decoration: none;
  flex-shrink: 0;
}

.bp-share-copy:hover { background: rgba(232,101,10,0.08); }
.bp-share-wa { background: #25d366; border-color: #25d366; color: #fff; }
.bp-share-wa:hover { background: #1fba59; }

.bp-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.bp-btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #e8650a, #c0392b);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  box-shadow: 0 4px 14px rgba(232,101,10,0.3);
  transition: all 0.25s;
}

.bp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(232,101,10,0.4); }
.bp-btn-loading { opacity: 0.7; cursor: not-allowed; }

.bp-btn-outline {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  border: 1.5px solid rgba(232,101,10,0.25);
  background: transparent;
  color: #5a4a3a;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
}

.bp-btn-outline:hover {
  border-color: #e8650a;
  color: #e8650a;
  background: rgba(232,101,10,0.04);
}

.bp-btn-ghost {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  border: none;
  background: transparent;
  color: #b0a090;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: color 0.2s;
}

.bp-btn-ghost:hover { color: #5a4a3a; }

/* ── Transitions ── */
.tier-fade-enter-active { transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1); }
.tier-fade-enter-from   { opacity:0; transform:translateY(8px) scale(0.97); }

.step-reveal-enter-active { transition: all 0.5s cubic-bezier(0.34,1.2,0.64,1); }
.step-reveal-enter-from   { opacity:0; transform:translateY(20px); }
</style>