<template>
  <div class="sbp-page">

    <!-- ── Hero ── -->
    <section class="sbp-hero">
      <div class="sbp-hero__glow sbp-hero__glow--1" />
      <div class="sbp-hero__glow sbp-hero__glow--2" />
      <div class="sbp-hero__content">
        <div class="sbp-hero__badge">
          <span>✨</span> Smart Event Budget Planner
        </div>
        <h1 class="sbp-hero__title">
          Plan Any <em>Special Event</em><br />Budget — Intelligently
        </h1>
        <p class="sbp-hero__sub">
          Tell us your event type and what matters most. We'll allocate your budget smartly and show you the best vendors for each category.
        </p>
        <div class="sbp-hero__pills">
          <span v-for="et in EVENT_TYPES.slice(0,5)" :key="et" class="sbp-hero__pill">{{ eventEmoji(et) }} {{ et }}</span>
          <span class="sbp-hero__pill">& more…</span>
        </div>
      </div>
    </section>

    <div class="sbp-body">

      <!-- ── STEP 1: Event Type ── -->
      <div class="sbp-card" id="step-event">
        <div class="sbp-step-label">
          <span class="sbp-step-num">1</span>
          What are you planning?
        </div>
        <div class="sbp-event-grid">
          <button
            v-for="et in EVENT_TYPES"
            :key="et"
            class="sbp-event-btn"
            :class="{ 'sbp-event-btn--active': eventType === et }"
            @click="eventType = et"
          >
            <span class="sbp-event-btn__emoji">{{ eventEmoji(et) }}</span>
            <span class="sbp-event-btn__label">{{ et }}</span>
          </button>
        </div>
      </div>

      <!-- ── STEP 2: Budget + Details ── -->
      <div class="sbp-card" id="step-budget">
        <div class="sbp-step-label">
          <span class="sbp-step-num">2</span>
          Set your total budget
        </div>

        <div class="sbp-amount-wrap">
          <span class="sbp-amount-symbol">₹</span>
          <input
            v-model="rawBudget"
            type="text"
            inputmode="numeric"
            class="sbp-amount-input"
            placeholder="0"
            @input="handleBudgetInput"
          />
          <span v-if="budgetInWords" class="sbp-amount-words">{{ budgetInWords }}</span>
        </div>

        <div class="sbp-presets">
          <button
            v-for="p in presets"
            :key="p.value"
            class="sbp-preset"
            :class="{ 'sbp-preset--active': totalBudget === p.value }"
            @click="applyPreset(p)"
          >{{ p.label }}</button>
        </div>

        <div class="sbp-details-row">
          <div class="sbp-detail-field">
            <!-- <label class="sbp-detail-label"><i class="pi pi-map-marker" /> City</label> -->
            <div class="sbp-plain-wrap sbp-plain-wrap--dropdown">
              <VivahDropdown
                v-model="eventCity"
                :options="cityOptions"
                label="City"
                icon="pi pi-map-marker"
                placeholder="Select city"
                :searchable="true"
              />
            </div>
          </div>
          <div class="sbp-detail-field">
            <label class="sbp-detail-label"><i class="pi pi-users" /> Guest Count</label>
            <div class="sbp-plain-wrap">
              <input v-model.number="guestCount" type="number" class="sbp-plain-input" placeholder="e.g. 200" min="1" />
            </div>
          </div>
          <div class="sbp-detail-field">
            <label class="sbp-detail-label"><i class="pi pi-calendar" /> Event Date</label>
            <div class="sbp-plain-wrap">
              <input v-model="eventDate" type="date" class="sbp-plain-input" />
            </div>
          </div>
        </div>

        <Transition name="tier-pop">
          <div v-if="tier" class="sbp-tier" :style="{ background: tier.hex }">
            <span class="sbp-tier__emoji">{{ tier.emoji }}</span>
            <div>
              <div class="sbp-tier__name">{{ tier.label }} {{ eventType }}</div>
              <div class="sbp-tier__desc">{{ tier.desc }}</div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- ── STEP 3: Priority Picker ── -->
      <div class="sbp-card" id="step-priority">
        <div class="sbp-step-label">
          <span class="sbp-step-num">3</span>
          What matters most to you?
          <span class="sbp-step-hint">Pick up to 3 — we'll allocate more budget there</span>
        </div>

        <div class="sbp-priority-grid">
          <button
            v-for="cat in priorityOptions"
            :key="cat.key"
            class="sbp-priority-btn"
            :class="{
              'sbp-priority-btn--selected': priorities.includes(cat.key),
              'sbp-priority-btn--disabled': !priorities.includes(cat.key) && priorities.length >= 3
            }"
            @click="togglePriority(cat.key)"
          >
            <span class="sbp-priority-btn__rank" v-if="priorities.includes(cat.key)">
              {{ priorities.indexOf(cat.key) + 1 }}
            </span>
            <span class="sbp-priority-btn__emoji">{{ cat.emoji }}</span>
            <span class="sbp-priority-btn__name">{{ cat.name }}</span>
          </button>
        </div>

        <div v-if="priorities.length" class="sbp-priority-summary">
          <span class="sbp-priority-summary__label">Your focus:</span>
          <span v-for="(p, i) in priorities" :key="p" class="sbp-priority-tag">
            {{ priorityMeta(p)?.emoji }} {{ p }}
            <button @click="removePriority(p)" class="sbp-priority-tag__remove">×</button>
          </span>
        </div>

        <button
          class="sbp-allocate-btn"
          :disabled="!totalBudget || totalBudget < 8000"
          :class="{ 'sbp-allocate-btn--ready': totalBudget >= 8000 }"
          @click="runSmartAllocate"
        >
          <i :class="allocating ? 'pi pi-spin pi-spinner' : 'pi pi-bolt'" />
          {{ allocating ? 'Calculating…' : 'Generate Smart Budget Plan' }}
        </button>
      </div>


      <!-- ── STEP 4: Allocation Result ── -->
      <Transition name="step-reveal">
        <div v-if="allocResult" class="sbp-card" id="step-result">
          <div class="sbp-step-label">
            <span class="sbp-step-num">4</span>
            Your smart budget breakdown
            <span
              class="sbp-pct-badge"
              :class="{ 'sbp-pct-badge--ok': totalPct === 100, 'sbp-pct-badge--over': totalPct > 100 }"
            >{{ totalPct }}% allocated</span>
          </div>

          <!-- Stacked bar -->
          <div class="sbp-stack-bar" role="img" :aria-label="`Budget allocation bar: ${totalPct}% allocated`">
            <div
              v-for="cat in allocResult.categories"
              :key="cat.category"
              class="sbp-stack-seg"
              :style="{ width: cat.percentage + '%', background: catMeta(cat.category)?.color || '#94a3b8' }"
              :title="`${cat.category}: ${cat.percentage}%`"
            />
          </div>

          <!-- Category rows -->
          <div class="sbp-alloc-list">
            <div
              v-for="(cat, idx) in allocResult.categories"
              :key="cat.category"
              class="sbp-alloc-row"
              :class="{ 'sbp-alloc-row--priority': priorities.includes(cat.category) }"
              :style="{ animationDelay: idx * 0.04 + 's' }"
            >
              <div class="sbp-alloc-row__left">
                <div
                  class="sbp-alloc-row__icon"
                  :style="{ background: catMeta(cat.category)?.lightColor || 'rgba(148,163,184,0.1)' }"
                >
                  {{ catMeta(cat.category)?.emoji || '📦' }}
                </div>
                <div>
                  <div class="sbp-alloc-row__name">
                    {{ cat.category }}
                    <span v-if="priorities.includes(cat.category)" class="sbp-priority-star" title="Priority category">★</span>
                  </div>
                  <div class="sbp-alloc-row__amount">{{ formatCurrency(cat.allocatedAmount) }}</div>
                </div>
              </div>
              <div class="sbp-alloc-row__right">
                <input
                  type="range"
                  class="sbp-range"
                  :min="0" :max="60" :step="1"
                  v-model.number="cat.percentage"
                  @input="onSliderChange(cat)"
                  :style="{ '--fill': (cat.percentage / 60 * 100) + '%', '--clr': catMeta(cat.category)?.color || '#94a3b8' }"
                  :aria-label="`${cat.category} budget percentage`"
                />
                <span class="sbp-pct-num" :style="{ color: catMeta(cat.category)?.color || '#94a3b8' }">
                  {{ cat.percentage }}%
                </span>
                <button
                  v-if="cat.isVendorLinked"
                  class="sbp-find-btn"
                  :class="{ 'sbp-find-btn--open': expandedCategory === cat.category }"
                  @click="toggleVendors(cat)"
                  :aria-expanded="expandedCategory === cat.category"
                  :aria-label="`Find ${cat.category} vendors`"
                >
                  <i class="pi pi-search" />
                  <span>Vendors</span>
                  <i :class="expandedCategory === cat.category ? 'pi pi-chevron-up' : 'pi pi-chevron-down'" />
                </button>
              </div>

              <!-- Inline vendor panel -->
              <Transition name="vendor-panel">
                <div
                  v-if="expandedCategory === cat.category"
                  class="sbp-vendor-panel"
                  :aria-label="`${cat.category} vendor suggestions`"
                >
                  <div v-if="vendorLoading" class="sbp-vendor-panel__loading">
                    <i class="pi pi-spin pi-spinner" /> Finding best vendors…
                  </div>
                  <template v-else>
                    <div v-if="cat.vendors?.length" class="sbp-vendor-cards">
                      <div
                        v-for="vendor in cat.vendors"
                        :key="vendor._id"
                        class="sbp-vcard"
                        @click="$router.push(`/vendors/${vendor.slug}`)"
                        role="button"
                        tabindex="0"
                        @keydown.enter="$router.push(`/vendors/${vendor.slug}`)"
                        :aria-label="`View ${vendor.businessName} profile`"
                      >
                        <div class="sbp-vcard__img">
                          <img v-if="vendor.profilePhoto" :src="vendor.profilePhoto" :alt="vendor.businessName" loading="lazy" />
                          <span v-else>{{ catMeta(cat.category)?.emoji }}</span>
                        </div>
                        <div class="sbp-vcard__body">
                          <div class="sbp-vcard__name">{{ vendor.businessName }}</div>
                          <div class="sbp-vcard__city"><i class="pi pi-map-marker" /> {{ vendor.city }}</div>
                          <div class="sbp-vcard__footer">
                            <span class="sbp-vcard__price">{{ formatCurrency(vendor.startingPrice) }}</span>
                            <span class="sbp-vcard__rating">
                              <i class="pi pi-star-fill" /> {{ vendor.averageRating?.toFixed(1) || '—' }}
                            </span>
                          </div>
                        </div>
                        <div v-if="vendor.isVerified" class="sbp-vcard__verified" title="Verified vendor">✓</div>
                      </div>
                    </div>
                    <div v-else class="sbp-vendor-panel__empty">
                      No vendors found in this budget range.
                      <RouterLink :to="`/vendors?category=${cat.category}`" class="sbp-vendor-panel__link">
                        Browse all {{ cat.category }} vendors →
                      </RouterLink>
                    </div>
                    <RouterLink
                      v-if="cat.vendors?.length"
                      :to="`/vendors?category=${cat.category}&maxPrice=${cat.allocatedAmount}${eventCity ? '&city=' + eventCity : ''}`"
                      class="sbp-vendor-panel__see-all"
                    >
                      See all {{ cat.category }} vendors within {{ formatCurrency(cat.allocatedAmount) }}
                      <i class="pi pi-arrow-right" />
                    </RouterLink>
                  </template>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Buffer indicator -->
          <div
            class="sbp-buffer"
            :class="{ 'sbp-buffer--ok': remaining >= 0, 'sbp-buffer--warn': remaining < 0 }"
            role="status"
          >
            <i :class="remaining >= 0 ? 'pi pi-check-circle' : 'pi pi-exclamation-triangle'" />
            <span v-if="remaining >= 0">
              {{ formatCurrency(remaining) }} kept as buffer — smart for last-minute expenses
            </span>
            <span v-else>
              Over budget by {{ formatCurrency(Math.abs(remaining)) }} — reduce some categories
            </span>
          </div>
        </div>
      </Transition>


      <!-- ── STEP 5: Smart Tips ── -->
      <Transition name="step-reveal">
        <div v-if="allocResult && tier" class="sbp-card sbp-tips-card" id="step-tips">
          <div class="sbp-step-label">
            <span class="sbp-step-num">💡</span>
            Smart tips for your {{ eventType.toLowerCase() }}
          </div>
          <div class="sbp-tips-grid">
            <div v-for="tip in tier.tips" :key="tip" class="sbp-tip">
              <span class="sbp-tip__dot" />
              {{ tip }}
            </div>
          </div>
        </div>
      </Transition>

      <!-- ── STEP 6: Save & Share ── -->
      <Transition name="step-reveal">
        <div v-if="allocResult" class="sbp-card" id="step-save">
          <div class="sbp-step-label">
            <span class="sbp-step-num">5</span>
            Save &amp; share your plan
          </div>

          <div v-if="savedPlan" class="sbp-share-box">
            <div class="sbp-share-success">
              <i class="pi pi-check-circle" /> Budget plan saved successfully!
            </div>
            <div class="sbp-share-row">
              <input :value="shareLink" readonly class="sbp-share-link" aria-label="Share link" />
              <button class="sbp-share-icon-btn" @click="copyLink" title="Copy link" aria-label="Copy share link">
                <i class="pi pi-copy" />
              </button>
              <a
                :href="`https://wa.me/?text=${encodeURIComponent('My ' + eventType + ' budget plan: ' + shareLink)}`"
                target="_blank"
                rel="noopener noreferrer"
                class="sbp-share-icon-btn sbp-share-icon-btn--wa"
                title="Share on WhatsApp"
                aria-label="Share on WhatsApp"
              >
                <i class="pi pi-whatsapp" />
              </a>
            </div>
          </div>

          <div class="sbp-actions">
            <button
              class="sbp-btn-primary"
              :class="{ 'sbp-btn-loading': saving }"
              :disabled="saving"
              @click="saveBudget"
            >
              <i class="pi pi-save" />
              {{ saving ? 'Saving…' : 'Save Budget Plan' }}
            </button>
            <button class="sbp-btn-outline" @click="printBudget">
              <i class="pi pi-print" /> Print / PDF
            </button>
            <button class="sbp-btn-ghost" @click="resetAll">
              <i class="pi pi-refresh" /> Start Over
            </button>
          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>


<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import api from '@/services/api';
import { GUJARAT_CITIES, EVENT_TYPES, formatCurrency } from '@/utils/helpers';
import VivahDropdown from '@/components/ui/Dropdown-Component.vue';

const router = useRouter();
const toast  = useToast();

// ── State ──────────────────────────────────────────────────────────────────
const eventType      = ref('Wedding');
const rawBudget      = ref('');
const totalBudget    = ref(0);
const eventCity      = ref('');
const eventDate      = ref('');
const guestCount     = ref(null);
const priorities     = ref([]);
const allocResult    = ref(null);
const allocating     = ref(false);
const expandedCategory = ref(null);
const vendorLoading  = ref(false);
const saving         = ref(false);
const savedPlan      = ref(null);
const shareLink      = ref('');

// ── Derived ────────────────────────────────────────────────────────────────
const cityOptions = GUJARAT_CITIES.map(c => ({ value: c, label: c }));

const presets = [
  { label: '₹50K',  value: 50000   },
  { label: '₹1L',   value: 100000  },
  { label: '₹2L',   value: 200000  },
  { label: '₹5L',   value: 500000  },
  { label: '₹10L',  value: 1000000 },
  { label: '₹25L',  value: 2500000 },
  { label: '₹50L',  value: 5000000 },
];

const applyPreset = (p) => {
  totalBudget.value = p.value;
  rawBudget.value   = p.value.toLocaleString('en-IN');
};

const handleBudgetInput = () => {
  const num = parseInt(rawBudget.value.replace(/[^0-9]/g, ''), 10);
  totalBudget.value = isNaN(num) ? 0 : num;
  rawBudget.value   = num ? num.toLocaleString('en-IN') : '';
};

const budgetInWords = computed(() => {
  const n = totalBudget.value;
  if (!n) return '';
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Crore`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)} Lakh`;
  if (n >= 1000)     return `₹${(n / 1000).toFixed(0)}K`;
  return '';
});

// ── Tier system ────────────────────────────────────────────────────────────
const TIERS = {
  micro: {
    label: 'Micro', emoji: '💚', hex: '#16a34a',
    desc: 'Intimate & meaningful celebration',
    tips: [
      'Keep the guest list tight — quality over quantity saves significantly',
      'Home or community hall venues cut costs by 60% vs banquet halls',
      'DIY decoration with fairy lights and flowers looks stunning on a budget',
      'Potluck-style catering works beautifully for close family events',
      'A good smartphone photographer can capture memories just as well',
    ],
  },
  budget: {
    label: 'Budget', emoji: '💛', hex: '#ca8a04',
    desc: 'Smart & joyful celebration',
    tips: [
      'Book photographers who offer combined photo+video deals — saves 20-25%',
      'Choose buffet catering over plated — costs 35-40% less per head',
      'Digital invitations save ₹10,000–20,000 easily',
      'Book local decorators who know the regional style well',
      'Avoid peak season dates for 15% lower vendor pricing',
    ],
  },
  standard: {
    label: 'Standard', emoji: '🧡', hex: '#e8650a',
    desc: 'Beautiful without breaking the bank',
    tips: [
      'Negotiate combo packages — most vendors give 10-15% off bundles',
      'Book at least 4 months early for better pricing and availability',
      'Combine mehendi artist and makeup artist from same studio for discount',
      'Use the venue\'s in-house catering — often 20% cheaper than outside',
      'Allocate ₹50,000 hidden reserve — it always gets used',
    ],
  },
  premium: {
    label: 'Premium', emoji: '❤️', hex: '#c0392b',
    desc: 'Refined experience with quality vendors',
    tips: [
      'Hire an event coordinator — saves 10x the stress for 2-3% of budget',
      'Invest in a pre-event shoot — great photos become family heirlooms',
      'Spend more on venue and catering — guests remember food and ambience most',
      'Use drone videography — cinematic results that wow guests',
      'Book verified vendors — avoid last-minute cancellations at this budget level',
    ],
  },
  luxury: {
    label: 'Luxury', emoji: '💎', hex: '#7c3aed',
    desc: 'No compromise, only excellence',
    tips: [
      'Hire a full-service event management company',
      'Custom floral installations make the venue truly unforgettable',
      'Live music or celebrity performances elevate the entire experience',
      'Consider destination pre-event shoots — Udaipur, Goa, or international',
      'Personalised gifting and premium stationery create lasting impressions',
    ],
  },
};

const tier = computed(() => {
  const b = totalBudget.value;
  if (!b) return null;
  if (b < 75000)   return TIERS.micro;
  if (b < 300000)  return TIERS.budget;
  if (b < 1000000) return TIERS.standard;
  if (b < 2500000) return TIERS.premium;
  return TIERS.luxury;
});

// ── Category metadata ──────────────────────────────────────────────────────
const CATEGORY_META = [
  { key:'Venue',         name:'Venue',         emoji:'🏛️', color:'#e8650a', lightColor:'rgba(232,101,10,0.1)'  },
  { key:'Catering',      name:'Catering',      emoji:'🍽️', color:'#f59e0b', lightColor:'rgba(245,158,11,0.1)'  },
  { key:'Photography',   name:'Photography',   emoji:'📸', color:'#3b82f6', lightColor:'rgba(59,130,246,0.1)'  },
  { key:'Videography',   name:'Videography',   emoji:'🎬', color:'#8b5cf6', lightColor:'rgba(139,92,246,0.1)'  },
  { key:'Decoration',    name:'Decoration',    emoji:'🌸', color:'#ec4899', lightColor:'rgba(236,72,153,0.1)'  },
  { key:'Mehendi',       name:'Mehendi',       emoji:'🌿', color:'#22c55e', lightColor:'rgba(34,197,94,0.1)'   },
  { key:'Makeup',        name:'Makeup',        emoji:'💄', color:'#f43f5e', lightColor:'rgba(244,63,94,0.1)'   },
  { key:'DJ',            name:'DJ / Music',    emoji:'🎵', color:'#06b6d4', lightColor:'rgba(6,182,212,0.1)'   },
  { key:'Invitation',    name:'Invitation',    emoji:'💌', color:'#14b8a6', lightColor:'rgba(20,184,166,0.1)'  },
  { key:'Pandit',        name:'Pandit',        emoji:'🙏', color:'#f97316', lightColor:'rgba(249,115,22,0.1)'  },
  { key:'Clothing',      name:'Clothing',      emoji:'👗', color:'#9333ea', lightColor:'rgba(147,51,234,0.1)'  },
  { key:'Jewelry',       name:'Jewelry',       emoji:'💍', color:'#d97706', lightColor:'rgba(217,119,6,0.1)'   },
  { key:'Miscellaneous', name:'Miscellaneous', emoji:'📦', color:'#94a3b8', lightColor:'rgba(148,163,184,0.1)' },
];

const catMeta = (key) => CATEGORY_META.find(m => m.key === key);

// ── Per-event practical categories for priority picker ─────────────────────
// Only show categories that make real-world sense for each event type
const EVENT_PRIORITY_CATS = {
  'Wedding':              ['Venue','Catering','Photography','Decoration','Makeup','Mehendi','DJ','Clothing'],
  'Engagement':           ['Venue','Catering','Photography','Decoration','Makeup','Mehendi'],
  'Reception':            ['Venue','Catering','Photography','Decoration','Makeup','DJ'],
  'Birthday':             ['Venue','Catering','Decoration','DJ','Photography'],
  'Anniversary':          ['Venue','Catering','Photography','Decoration','Makeup','DJ'],
  'Baby Shower':          ['Venue','Catering','Decoration','Photography'],
  'Corporate Event':      ['Venue','Catering','Decoration','Photography','DJ'],
  'Festival Celebration': ['Venue','Catering','Decoration','Mehendi','DJ'],
  'Other':                ['Venue','Catering','Decoration','Photography','DJ','Makeup'],
};

const priorityOptions = computed(() => {
  const allowed = EVENT_PRIORITY_CATS[eventType.value] || EVENT_PRIORITY_CATS['Other'];
  return CATEGORY_META.filter(m => allowed.includes(m.key));
});

// Reset priorities when event type changes so stale selections are cleared
watch(eventType, () => {
  priorities.value = [];
});

const priorityMeta = (key) => CATEGORY_META.find(m => m.key === key);

const togglePriority = (key) => {
  const idx = priorities.value.indexOf(key);
  if (idx > -1) {
    priorities.value.splice(idx, 1);
  } else if (priorities.value.length < 3) {
    priorities.value.push(key);
  }
};

const removePriority = (key) => {
  priorities.value = priorities.value.filter(p => p !== key);
};

// ── Event type emoji map ───────────────────────────────────────────────────
const EVENT_EMOJI_MAP = {
  'Wedding': '💍',
  'Engagement': '💑',
  'Reception': '🥂',
  'Birthday': '🎂',
  'Anniversary': '🌹',
  'Baby Shower': '🍼',
  'Corporate Event': '🏢',
  'Festival Celebration': '🎊',
  'Other': '✨',
};

const eventEmoji = (et) => EVENT_EMOJI_MAP[et] || '✨';

// ── Totals ─────────────────────────────────────────────────────────────────
const totalPct = computed(() => {
  if (!allocResult.value) return 0;
  return allocResult.value.categories.reduce((s, c) => s + (c.percentage || 0), 0);
});

const remaining = computed(() => {
  if (!allocResult.value || !totalBudget.value) return 0;
  // remaining = total - sum of all allocated amounts (not percentage-based, to avoid rounding drift)
  const used = allocResult.value.categories.reduce((s, c) => s + (c.allocatedAmount || 0), 0);
  return totalBudget.value - used;
});

// ── Smart allocate ─────────────────────────────────────────────────────────
const runSmartAllocate = async () => {
  if (!totalBudget.value || totalBudget.value < 8000) {
    toast.add({ severity: 'warn', summary: 'Budget too low', detail: 'Minimum budget is ₹8,000', life: 3000 });
    return;
  }
  allocating.value = true;
  expandedCategory.value = null;
  try {
    const res = await api.post('/budget/smart-allocate', {
      totalBudget: totalBudget.value,
      eventType: eventType.value,
      priorities: priorities.value,
      city: eventCity.value || undefined,
    });

    // Merge categories with very small allocations into Miscellaneous
    // to avoid showing confusingly tiny amounts (e.g. ₹1,000 for Pandit)
    const MIN_MEANINGFUL_AMOUNT = Math.max(5000, Math.round(totalBudget.value * 0.005));
    const cats = res.data.categories;
    let miscExtra = 0;
    const meaningful = cats.filter(c => {
      if (c.category === 'Miscellaneous') return true; // always keep
      if (c.allocatedAmount < MIN_MEANINGFUL_AMOUNT) {
        miscExtra += c.allocatedAmount;
        return false;
      }
      return true;
    });

    // Add overflow to Miscellaneous
    if (miscExtra > 0) {
      const misc = meaningful.find(c => c.category === 'Miscellaneous');
      if (misc) {
        misc.allocatedAmount += miscExtra;
        misc.percentage = Math.round((misc.allocatedAmount / totalBudget.value) * 100);
      } else {
        meaningful.push({
          category: 'Miscellaneous',
          percentage: Math.round((miscExtra / totalBudget.value) * 100),
          allocatedAmount: miscExtra,
          isVendorLinked: false,
          vendors: [],
        });
      }
    }

    // Final safety: ensure percentages sum to exactly 100
    const pctSum = meaningful.reduce((s, c) => s + c.percentage, 0);
    if (pctSum !== 100 && meaningful.length > 0) {
      meaningful[0].percentage += (100 - pctSum);
      meaningful[0].allocatedAmount = Math.round((totalBudget.value * meaningful[0].percentage) / 100);
    }

    res.data.categories = meaningful;
    allocResult.value = res.data;
    savedPlan.value = null;
    shareLink.value = '';
    // Scroll to result
    setTimeout(() => {
      document.getElementById('step-result')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Failed', detail: err.response?.data?.message || err.message, life: 3000 });
  } finally {
    allocating.value = false;
  }
};

// ── Slider change ──────────────────────────────────────────────────────────
const onSliderChange = (cat) => {
  cat.allocatedAmount = Math.round((totalBudget.value * cat.percentage) / 100);
};

// ── Vendor panel toggle ────────────────────────────────────────────────────
const toggleVendors = async (cat) => {
  if (expandedCategory.value === cat.category) {
    expandedCategory.value = null;
    return;
  }
  expandedCategory.value = cat.category;
  // If vendors not yet loaded or budget changed, re-fetch
  if (!cat.vendors || cat.vendors.length === 0) {
    vendorLoading.value = true;
    try {
      const res = await api.get('/vendors/by-budget', {
        params: {
          category: cat.category,
          maxBudget: cat.allocatedAmount,
          city: eventCity.value || undefined,
          limit: 4,
        },
      });
      cat.vendors = res.data.vendors;
    } catch {
      cat.vendors = [];
    } finally {
      vendorLoading.value = false;
    }
  }
};

// ── Save ───────────────────────────────────────────────────────────────────
const saveBudget = async () => {
  if (!allocResult.value) return;
  saving.value = true;
  try {
    const res = await api.post('/budget/save', {
      totalBudget: totalBudget.value,
      eventType: eventType.value,
      categories: allocResult.value.categories.map(c => ({
        category: c.category,
        percentage: c.percentage,
        allocatedAmount: c.allocatedAmount,
      })),
      weddingDate: eventDate.value || undefined,
      guestCount: guestCount.value || undefined,
      city: eventCity.value || undefined,
      priorities: priorities.value,
    });
    savedPlan.value = res.data.plan;
    shareLink.value = `${window.location.origin}/budget/share/${res.data.shareToken}`;
    toast.add({ severity: 'success', summary: 'Saved!', detail: 'Share your plan with family & friends', life: 3000 });
    setTimeout(() => {
      document.getElementById('step-save')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Failed to save', detail: err.response?.data?.message || err.message, life: 3000 });
  } finally {
    saving.value = false;
  }
};

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value);
    toast.add({ severity: 'success', summary: 'Link copied!', life: 2000 });
  } catch {
    toast.add({ severity: 'error', summary: 'Failed to copy', life: 2000 });
  }
};

const printBudget = () => window.print();

const resetAll = () => {
  rawBudget.value = '';
  totalBudget.value = 0;
  eventCity.value = '';
  eventDate.value = '';
  guestCount.value = null;
  priorities.value = [];
  allocResult.value = null;
  expandedCategory.value = null;
  savedPlan.value = null;
  shareLink.value = '';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@400;500;600&display=swap');

/* ── Page ── */
.sbp-page { min-height: 100vh; background: #fdf8f3; font-family: 'DM Sans', sans-serif; }

/* ── Hero ── */
.sbp-hero {
  position: relative;
  background: linear-gradient(135deg, #0f0a05 0%, #1e1008 50%, #120a06 100%);
  padding: 72px 24px 88px;
  overflow: hidden;
  text-align: center;
}
.sbp-hero__glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.sbp-hero__glow--1 { width: 400px; height: 400px; top: -100px; right: -80px; background: rgba(232,101,10,0.18); }
.sbp-hero__glow--2 { width: 300px; height: 300px; bottom: -80px; left: -60px; background: rgba(192,57,43,0.14); }
.sbp-hero__content { position: relative; max-width: 680px; margin: 0 auto; }
.sbp-hero__badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(232,101,10,0.2); border: 1px solid rgba(232,101,10,0.3);
  color: #fba45c; padding: 6px 16px; border-radius: 99px;
  font-size: 13px; font-weight: 600; margin-bottom: 20px;
}
.sbp-hero__title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(30px, 5vw, 52px); font-weight: 700;
  color: #fff; line-height: 1.2; margin-bottom: 16px;
}
.sbp-hero__title em { font-style: italic; color: #fba45c; }
.sbp-hero__sub { font-size: 16px; color: rgba(255,255,255,0.6); line-height: 1.6; margin-bottom: 24px; }
.sbp-hero__pills { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.sbp-hero__pill {
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.7); padding: 5px 12px; border-radius: 99px; font-size: 12.5px;
}

/* ── Body ── */
.sbp-body {
  max-width: 880px; margin: -36px auto 60px;
  padding: 0 16px; display: flex; flex-direction: column; gap: 20px;
}

/* ── Card ── */
.sbp-card {
  background: #fff; border-radius: 24px;
  border: 1px solid rgba(232,101,10,0.1);
  box-shadow: 0 4px 24px rgba(26,16,8,0.07);
  padding: 32px;
  /* overflow must be visible so dropdowns inside can escape */
  overflow: visible;
  /* Use opacity-only animation to avoid creating a transform stacking context */
  animation: cardFadeIn 0.4s ease both;
}
@keyframes cardFadeIn { from { opacity: 0; } to { opacity: 1; } }

/* ── Step label ── */
.sbp-step-label {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 700;
  color: #1a1008; margin-bottom: 24px;
}
.sbp-step-num {
  width: 30px; height: 30px; border-radius: 10px;
  background: linear-gradient(135deg, #e8650a, #c0392b);
  color: #fff; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  font-family: 'DM Sans', sans-serif;
}
.sbp-step-hint { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 400; color: #9a8a7a; }

/* ── Event type grid ── */
.sbp-event-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px;
}
.sbp-event-btn {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 16px 10px; border-radius: 16px;
  border: 1.5px solid rgba(232,101,10,0.15); background: transparent;
  cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
}
.sbp-event-btn:hover { border-color: #e8650a; background: rgba(232,101,10,0.04); }
.sbp-event-btn--active {
  border-color: #e8650a; background: linear-gradient(135deg, rgba(232,101,10,0.1), rgba(192,57,43,0.06));
  box-shadow: 0 4px 16px rgba(232,101,10,0.15);
}
.sbp-event-btn__emoji { font-size: 26px; }
.sbp-event-btn__label { font-size: 12.5px; font-weight: 600; color: #3a2a1a; text-align: center; }
.sbp-event-btn--active .sbp-event-btn__label { color: #e8650a; }

/* ── Amount input ── */
.sbp-amount-wrap {
  display: flex; align-items: baseline; gap: 10px;
  margin-bottom: 20px; padding-bottom: 16px;
  border-bottom: 2px solid rgba(232,101,10,0.12);
}
.sbp-amount-symbol { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 700; color: #e8650a; }
.sbp-amount-input {
  font-family: 'Cormorant Garamond', serif; font-size: 48px; font-weight: 700;
  color: #1a1008; border: none; outline: none; background: transparent; width: 100%; min-width: 0;
}
.sbp-amount-input::placeholder { color: #d0c0b0; }
.sbp-amount-words {
  font-size: 13px; font-weight: 600; color: #e8650a; white-space: nowrap; flex-shrink: 0;
  background: rgba(232,101,10,0.08); padding: 4px 10px; border-radius: 8px;
}

/* ── Presets ── */
.sbp-presets { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
.sbp-preset {
  padding: 7px 14px; border-radius: 10px; border: 1.5px solid rgba(232,101,10,0.2);
  background: transparent; color: #7a5a3a; font-size: 13px; font-weight: 600;
  cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
}
.sbp-preset:hover { border-color: #e8650a; color: #e8650a; background: rgba(232,101,10,0.05); }
.sbp-preset--active {
  background: linear-gradient(135deg, #e8650a, #c0392b); border-color: transparent;
  color: #fff; box-shadow: 0 4px 12px rgba(232,101,10,0.3);
}

/* ── Details row ── */
.sbp-details-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px; overflow: visible; }
@media (max-width: 640px) { .sbp-details-row { grid-template-columns: 1fr; } }
.sbp-detail-field { position: relative; }
/* City field (first child) gets higher z-index so its dropdown floats above siblings */
.sbp-detail-field:first-child { z-index: 20; }
.sbp-detail-label {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.07em; color: #e8650a; margin-bottom: 6px;
}
.sbp-detail-label .pi { font-size: 10px; }
.sbp-plain-wrap { border: 1.5px solid rgba(232,101,10,0.15); border-radius: 12px; overflow: hidden; transition: border-color 0.2s; }
.sbp-plain-wrap:focus-within { border-color: rgba(232,101,10,0.4); }
/* Dropdown variant — no overflow:hidden so the teleported panel isn't affected */
.sbp-plain-wrap--dropdown { border: 1.5px solid rgba(232,101,10,0.15); border-radius: 12px; transition: border-color 0.2s; }
.sbp-plain-wrap--dropdown:focus-within { border-color: rgba(232,101,10,0.4); }
.sbp-plain-input {
  width: 100%; padding: 10px 14px; border: none; outline: none;
  background: transparent; font-size: 14px; font-weight: 500; color: #1a1008;
  font-family: 'DM Sans', sans-serif;
}

/* ── Tier badge ── */
.sbp-tier {
  display: flex; align-items: center; gap: 14px; padding: 14px 18px;
  border-radius: 14px; color: #fff; margin-bottom: 20px;
}
.sbp-tier__emoji { font-size: 24px; }
.sbp-tier__name { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 700; }
.sbp-tier__desc { font-size: 12.5px; opacity: 0.85; }

/* ── Priority grid ── */
.sbp-priority-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 10px; margin-bottom: 16px; }
.sbp-priority-btn {
  position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 14px 8px; border-radius: 14px; border: 1.5px solid rgba(232,101,10,0.15);
  background: transparent; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif;
}
.sbp-priority-btn:hover:not(.sbp-priority-btn--disabled) { border-color: #e8650a; background: rgba(232,101,10,0.04); }
.sbp-priority-btn--selected {
  border-color: #e8650a; background: linear-gradient(135deg, rgba(232,101,10,0.12), rgba(192,57,43,0.06));
  box-shadow: 0 4px 14px rgba(232,101,10,0.18);
}
.sbp-priority-btn--disabled { opacity: 0.4; cursor: not-allowed; }
.sbp-priority-btn__rank {
  position: absolute; top: -8px; right: -8px;
  width: 20px; height: 20px; border-radius: 50%;
  background: linear-gradient(135deg, #e8650a, #c0392b);
  color: #fff; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.sbp-priority-btn__emoji { font-size: 22px; }
.sbp-priority-btn__name { font-size: 12px; font-weight: 600; color: #3a2a1a; text-align: center; }
.sbp-priority-btn--selected .sbp-priority-btn__name { color: #e8650a; }

/* ── Priority summary ── */
.sbp-priority-summary { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.sbp-priority-summary__label { font-size: 13px; font-weight: 600; color: #7a6a5a; }
.sbp-priority-tag {
  display: flex; align-items: center; gap: 4px;
  background: rgba(232,101,10,0.1); color: #e8650a;
  padding: 4px 10px; border-radius: 99px; font-size: 12.5px; font-weight: 600;
}
.sbp-priority-tag__remove {
  background: none; border: none; color: #e8650a; cursor: pointer;
  font-size: 14px; line-height: 1; padding: 0 0 0 2px;
}

/* ── Allocate button ── */
.sbp-allocate-btn {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; padding: 15px; border-radius: 14px; border: none;
  background: linear-gradient(135deg, #c0c0c0, #a0a0a0);
  color: #fff; font-size: 15px; font-weight: 600; cursor: not-allowed;
  font-family: 'DM Sans', sans-serif; transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
.sbp-allocate-btn--ready {
  background: linear-gradient(135deg, #e8650a, #c0392b); cursor: pointer;
  box-shadow: 0 6px 20px rgba(232,101,10,0.3);
}
.sbp-allocate-btn--ready:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(232,101,10,0.4); }

/* ── Stacked bar ── */
.sbp-stack-bar {
  height: 10px; border-radius: 99px; display: flex; overflow: hidden;
  margin-bottom: 28px; background: #f0e8e0;
}
.sbp-stack-seg { transition: width 0.5s cubic-bezier(0.4,0,0.2,1); min-width: 2px; }

/* ── Allocation list ── */
.sbp-alloc-list { display: flex; flex-direction: column; gap: 4px; }
.sbp-alloc-row {
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  padding: 12px 14px; border-radius: 14px; border: 1px solid transparent;
  transition: all 0.2s; animation: rowIn 0.4s cubic-bezier(0.34,1.2,0.64,1) both;
}
@keyframes rowIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
.sbp-alloc-row:hover { background: rgba(232,101,10,0.03); border-color: rgba(232,101,10,0.08); }
.sbp-alloc-row--priority { background: rgba(232,101,10,0.03); border-color: rgba(232,101,10,0.12); }
.sbp-alloc-row__left { display: flex; align-items: center; gap: 12px; width: 200px; flex-shrink: 0; }
@media (max-width: 600px) { .sbp-alloc-row { flex-wrap: wrap; } .sbp-alloc-row__left { width: 100%; } }
.sbp-alloc-row__icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;
}
.sbp-alloc-row__name { font-size: 14px; font-weight: 600; color: #1a1008; }
.sbp-alloc-row__amount { font-size: 12.5px; font-weight: 500; color: #e8650a; }
.sbp-priority-star { color: #e8650a; margin-left: 4px; font-size: 12px; }
.sbp-alloc-row__right { flex: 1; display: flex; align-items: center; gap: 10px; min-width: 0; flex-wrap: wrap; }

/* ── Range slider ── */
.sbp-range {
  -webkit-appearance: none; appearance: none; flex: 1; height: 5px; border-radius: 99px;
  background: linear-gradient(90deg, var(--clr) var(--fill), #e8e0d8 var(--fill));
  outline: none; cursor: pointer; transition: background 0.2s; min-width: 80px;
}
.sbp-range::-webkit-slider-thumb {
  -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
  background: #fff; border: 2.5px solid var(--clr);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12); cursor: pointer; transition: transform 0.2s;
}
.sbp-range::-webkit-slider-thumb:hover { transform: scale(1.2); }
.sbp-pct-num { font-size: 13px; font-weight: 700; width: 34px; text-align: right; flex-shrink: 0; }
.sbp-pct-badge {
  margin-left: auto; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  padding: 4px 12px; border-radius: 99px; background: rgba(34,197,94,0.1); color: #16a34a;
}
.sbp-pct-badge--over { background: rgba(239,68,68,0.1); color: #dc2626; }

/* ── Find vendors button ── */
.sbp-find-btn {
  display: flex; align-items: center; gap: 5px; padding: 6px 12px;
  border-radius: 10px; border: 1.5px solid rgba(232,101,10,0.25);
  background: transparent; color: #e8650a; font-size: 12px; font-weight: 600;
  cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s; white-space: nowrap;
}
.sbp-find-btn:hover, .sbp-find-btn--open {
  background: rgba(232,101,10,0.08); border-color: #e8650a;
}

/* ── Vendor panel ── */
.sbp-vendor-panel {
  width: 100%; margin-top: 12px; padding-top: 16px;
  border-top: 1px solid rgba(232,101,10,0.1);
}
.sbp-vendor-panel__loading { display: flex; align-items: center; gap: 8px; color: #9a8a7a; font-size: 13.5px; padding: 12px 0; }
.sbp-vendor-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-bottom: 12px; }
.sbp-vcard {
  position: relative; display: flex; gap: 10px; padding: 12px; border-radius: 14px;
  border: 1px solid rgba(232,101,10,0.1); cursor: pointer; transition: all 0.2s; background: #fdf8f3;
}
.sbp-vcard:hover { border-color: rgba(232,101,10,0.3); box-shadow: 0 4px 16px rgba(232,101,10,0.1); transform: translateY(-2px); }
.sbp-vcard:focus { outline: 2px solid #e8650a; outline-offset: 2px; }
.sbp-vcard__img {
  width: 44px; height: 44px; border-radius: 10px; background: rgba(232,101,10,0.1);
  display: flex; align-items: center; justify-content: center; font-size: 20px; overflow: hidden; flex-shrink: 0;
}
.sbp-vcard__img img { width: 100%; height: 100%; object-fit: cover; }
.sbp-vcard__body { flex: 1; min-width: 0; }
.sbp-vcard__name { font-size: 13px; font-weight: 600; color: #1a1008; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sbp-vcard__city { font-size: 11.5px; color: #9a8a7a; margin: 2px 0 6px; }
.sbp-vcard__city .pi { font-size: 10px; }
.sbp-vcard__footer { display: flex; justify-content: space-between; align-items: center; }
.sbp-vcard__price { font-size: 13px; font-weight: 700; color: #e8650a; }
.sbp-vcard__rating { display: flex; align-items: center; gap: 3px; font-size: 12px; color: #7a6a5a; }
.sbp-vcard__rating .pi { color: #f59e0b; font-size: 10px; }
.sbp-vcard__verified {
  position: absolute; top: 6px; right: 6px; width: 18px; height: 18px; border-radius: 50%;
  background: #16a34a; color: #fff; font-size: 10px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.sbp-vendor-panel__empty { font-size: 13.5px; color: #b0a090; padding: 12px 0; }
.sbp-vendor-panel__link { color: #e8650a; text-decoration: none; font-weight: 600; }
.sbp-vendor-panel__see-all {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 13px; font-weight: 600; color: #e8650a; text-decoration: none;
  padding: 8px 14px; border-radius: 10px; border: 1.5px solid rgba(232,101,10,0.2);
  transition: all 0.2s;
}
.sbp-vendor-panel__see-all:hover { background: rgba(232,101,10,0.06); border-color: #e8650a; }

/* ── Buffer ── */
.sbp-buffer {
  display: flex; align-items: center; gap: 8px; margin-top: 20px;
  padding: 12px 16px; border-radius: 12px; font-size: 13.5px; font-weight: 500;
}
.sbp-buffer--ok { background: rgba(34,197,94,0.08); color: #16a34a; border: 1px solid rgba(34,197,94,0.2); }
.sbp-buffer--warn { background: rgba(239,68,68,0.08); color: #dc2626; border: 1px solid rgba(239,68,68,0.2); }

/* ── Tips card ── */
.sbp-tips-card { background: linear-gradient(135deg, #1a1008, #2d1a08); }
.sbp-tips-card .sbp-step-label { color: #fba45c; }
.sbp-tips-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 600px) { .sbp-tips-grid { grid-template-columns: 1fr; } }
.sbp-tip { display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; color: rgba(255,255,255,0.75); line-height: 1.5; }
.sbp-tip__dot { width: 6px; height: 6px; border-radius: 50%; background: #e8650a; flex-shrink: 0; margin-top: 6px; }

/* ── Share box ── */
.sbp-share-box { margin-bottom: 20px; }
.sbp-share-success { display: flex; align-items: center; gap: 8px; color: #16a34a; font-size: 14px; font-weight: 600; margin-bottom: 12px; }
.sbp-share-row { display: flex; gap: 8px; }
.sbp-share-link {
  flex: 1; padding: 10px 14px; border-radius: 10px;
  border: 1.5px solid rgba(232,101,10,0.15); background: rgba(232,101,10,0.03);
  font-size: 13px; color: #5a4a3a; outline: none; font-family: 'DM Sans', sans-serif;
}
.sbp-share-icon-btn {
  width: 42px; height: 42px; border-radius: 10px; border: 1.5px solid rgba(232,101,10,0.2);
  background: transparent; color: #e8650a; display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 15px; transition: all 0.2s; text-decoration: none; flex-shrink: 0;
}
.sbp-share-icon-btn:hover { background: rgba(232,101,10,0.08); }
.sbp-share-icon-btn--wa { background: #25d366; border-color: #25d366; color: #fff; }
.sbp-share-icon-btn--wa:hover { background: #1fba59; }

/* ── Actions ── */
.sbp-actions { display: flex; flex-wrap: wrap; gap: 10px; }
.sbp-btn-primary {
  display: flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 12px;
  border: none; background: linear-gradient(135deg, #e8650a, #c0392b); color: #fff;
  font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif;
  box-shadow: 0 4px 14px rgba(232,101,10,0.3); transition: all 0.25s;
}
.sbp-btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(232,101,10,0.4); }
.sbp-btn-primary:disabled, .sbp-btn-loading { opacity: 0.7; cursor: not-allowed; }
.sbp-btn-outline {
  display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 12px;
  border: 1.5px solid rgba(232,101,10,0.25); background: transparent; color: #5a4a3a;
  font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.2s;
}
.sbp-btn-outline:hover { border-color: #e8650a; color: #e8650a; background: rgba(232,101,10,0.04); }
.sbp-btn-ghost {
  display: flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 12px;
  border: none; background: transparent; color: #b0a090; font-size: 14px; font-weight: 500;
  cursor: pointer; font-family: 'DM Sans', sans-serif; transition: color 0.2s;
}
.sbp-btn-ghost:hover { color: #5a4a3a; }

/* ── Transitions ── */
.tier-pop-enter-active { transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1); }
.tier-pop-enter-from { opacity:0; transform:translateY(8px) scale(0.97); }
.step-reveal-enter-active { transition: all 0.5s cubic-bezier(0.34,1.2,0.64,1); }
.step-reveal-enter-from { opacity:0; transform:translateY(20px); }
.vendor-panel-enter-active { transition: all 0.35s cubic-bezier(0.34,1.2,0.64,1); }
.vendor-panel-leave-active { transition: all 0.2s ease; }
.vendor-panel-enter-from { opacity:0; transform:translateY(-8px); }
.vendor-panel-leave-to { opacity:0; transform:translateY(-4px); }

/* ── Print ── */
@media print {
  .sbp-hero, .sbp-allocate-btn, .sbp-find-btn, .sbp-actions, .sbp-vendor-panel { display: none !important; }
  .sbp-card { box-shadow: none; border: 1px solid #ddd; break-inside: avoid; }
}
</style>
