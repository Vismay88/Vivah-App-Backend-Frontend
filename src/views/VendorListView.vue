<template>
  <div class="vl-page">

    <!-- ── Page Header ── -->
    <div class="vl-header">
      <div class="vl-header__inner">
        <div>
          <h1 class="vl-header__title">
            <span v-if="filters.category">{{ catEmoji(filters.category) }} {{ filters.category }} Vendors</span>
            <span v-else>Find Event Vendors</span>
          </h1>
          <p class="vl-header__sub">
            <span v-if="!loading">
              <strong>{{ pagination?.total || 0 }}</strong> vendors found
              <span v-if="filters.city"> in <strong>{{ filters.city }}</strong></span>
            </span>
            <span v-else>Searching…</span>
          </p>
        </div>
        <!-- Active filter chips -->
        <div class="vl-chips" v-if="hasActiveFilters">
          <button v-if="filters.category" class="vl-chip" @click="setCategory(null)">
            {{ catEmoji(filters.category) }} {{ filters.category }} <span class="vl-chip__x">×</span>
          </button>
          <button v-if="filters.city" class="vl-chip" @click="filters.city = null; applyFilters()">
            📍 {{ filters.city }} <span class="vl-chip__x">×</span>
          </button>
          <button v-if="filters.rating" class="vl-chip" @click="filters.rating = null; applyFilters()">
            ⭐ {{ filters.rating }}+ stars <span class="vl-chip__x">×</span>
          </button>
          <button class="vl-chip vl-chip--clear" @click="clearFilters">Clear all</button>
        </div>
      </div>
    </div>

    <div class="vl-body">

      <!-- ── Sidebar ── -->
      <aside class="vl-sidebar">
        <div class="vl-sidebar__card">

          <!-- Category pills -->
          <div class="vl-filter-section">
            <div class="vl-filter-label">Category</div>
            <div class="vl-cat-grid">
              <button
                v-for="cat in vendorCategories" :key="cat"
                class="vl-cat-btn"
                :class="{ 'vl-cat-btn--active': filters.category === cat }"
                @click="setCategory(filters.category === cat ? null : cat)"
              >
                <span class="vl-cat-btn__emoji">{{ catEmoji(cat) }}</span>
                <span class="vl-cat-btn__name">{{ cat }}</span>
              </button>
            </div>
          </div>

          <div class="vl-filter-divider" />

          <!-- City -->
          <div class="vl-filter-section">
            <div class="vl-filter-label">City</div>
            <div class="vl-select-wrap">
              <select v-model="filters.city" class="vl-select" @change="applyFilters">
                <option value="">All Cities</option>
                <option v-for="c in gujaratCities" :key="c" :value="c">{{ c }}</option>
              </select>
              <i class="pi pi-chevron-down vl-select-arrow" />
            </div>
          </div>

          <div class="vl-filter-divider" />

          <!-- Budget -->
          <div class="vl-filter-section">
            <div class="vl-filter-label">
              Max Budget
              <span class="vl-filter-label__val">{{ filters.maxPrice ? formatCurrency(filters.maxPrice) : 'Any' }}</span>
            </div>
            <input
              type="range" class="vl-range"
              :min="0" :max="500000" :step="5000"
              :value="filters.maxPrice || 500000"
              @input="e => { filters.maxPrice = +e.target.value < 500000 ? +e.target.value : null }"
              @change="applyFilters"
            />
            <div class="vl-range-labels"><span>₹0</span><span>₹5L+</span></div>
          </div>

          <div class="vl-filter-divider" />

          <!-- Rating -->
          <div class="vl-filter-section">
            <div class="vl-filter-label">Min Rating</div>
            <div class="vl-rating-btns">
              <button
                v-for="r in [3, 4, 4.5]" :key="r"
                class="vl-rating-btn"
                :class="{ 'vl-rating-btn--active': filters.rating === r }"
                @click="filters.rating = filters.rating === r ? null : r; applyFilters()"
              >⭐ {{ r }}+</button>
            </div>
          </div>

        </div>
      </aside>

      <!-- ── Main ── -->
      <div class="vl-main">

        <!-- Sort bar -->
        <div class="vl-sort-bar">
          <!-- Mobile filter toggle -->
          <button class="vl-mobile-filter-btn" @click="mobileFilterOpen = true">
            <i class="pi pi-sliders-h" /> Filters
            <span v-if="activeFilterCount" class="vl-mobile-filter-badge">{{ activeFilterCount }}</span>
          </button>

          <div class="vl-sort-group">
            <span class="vl-sort-label">Sort:</span>
            <div class="vl-sort-pills">
              <button
                v-for="opt in sortOptions" :key="opt.value"
                class="vl-sort-pill"
                :class="{ 'vl-sort-pill--active': filters.sort === opt.value }"
                @click="filters.sort = opt.value; applyFilters()"
              >{{ opt.label }}</button>
            </div>
          </div>
        </div>

        <!-- Loading skeletons -->
        <div v-if="loading" class="vl-grid">
          <div v-for="i in 9" :key="i" class="vl-skeleton">
            <div class="vl-skeleton__img" />
            <div class="vl-skeleton__body">
              <div class="vl-skeleton__line vl-skeleton__line--wide" />
              <div class="vl-skeleton__line vl-skeleton__line--mid" />
              <div class="vl-skeleton__line vl-skeleton__line--short" />
            </div>
          </div>
        </div>

        <!-- Vendors grid -->
        <div v-else-if="vendors.length" class="vl-grid">
          <VendorCard v-for="vendor in vendors" :key="vendor._id" :vendor="vendor" />
        </div>

        <!-- Empty state — Pikachu doodle -->
        <div v-else class="vl-empty">
          <div class="vl-empty__doodle">
            <!-- Pikachu SVG doodle -->
            <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="vl-empty__svg">
              <!-- Body -->
              <ellipse cx="100" cy="130" rx="52" ry="44" fill="#FFD93D"/>
              <!-- Head -->
              <circle cx="100" cy="82" r="46" fill="#FFD93D"/>
              <!-- Ears -->
              <polygon points="62,44 52,8 78,36" fill="#FFD93D"/>
              <polygon points="62,44 52,8 78,36" fill="#FFD93D"/>
              <polygon points="138,44 148,8 122,36" fill="#FFD93D"/>
              <!-- Ear tips black -->
              <polygon points="62,38 55,12 74,32" fill="#2d2d2d"/>
              <polygon points="138,38 145,12 126,32" fill="#2d2d2d"/>
              <!-- Eyes -->
              <circle cx="84" cy="78" r="9" fill="#2d2d2d"/>
              <circle cx="116" cy="78" r="9" fill="#2d2d2d"/>
              <circle cx="87" cy="75" r="3" fill="white"/>
              <circle cx="119" cy="75" r="3" fill="white"/>
              <!-- Cheeks -->
              <circle cx="72" cy="92" r="10" fill="#FF6B6B" opacity="0.7"/>
              <circle cx="128" cy="92" r="10" fill="#FF6B6B" opacity="0.7"/>
              <!-- Nose -->
              <ellipse cx="100" cy="88" rx="3" ry="2" fill="#2d2d2d"/>
              <!-- Mouth — sad -->
              <path d="M90 98 Q100 93 110 98" stroke="#2d2d2d" stroke-width="2.5" stroke-linecap="round" fill="none"/>
              <!-- Tail -->
              <path d="M148 148 L168 120 L180 132 L162 152 Z" fill="#FFD93D"/>
              <path d="M148 148 L168 120 L180 132 L162 152 Z" fill="#2d2d2d" opacity="0.15"/>
              <!-- Arms -->
              <ellipse cx="60" cy="138" rx="14" ry="9" fill="#FFD93D" transform="rotate(-20 60 138)"/>
              <ellipse cx="140" cy="138" rx="14" ry="9" fill="#FFD93D" transform="rotate(20 140 138)"/>
              <!-- Belly -->
              <ellipse cx="100" cy="136" rx="28" ry="22" fill="#F5C842" opacity="0.5"/>
              <!-- Legs -->
              <ellipse cx="82" cy="168" rx="14" ry="9" fill="#FFD93D"/>
              <ellipse cx="118" cy="168" rx="14" ry="9" fill="#FFD93D"/>
              <!-- Lightning bolt on tail -->
              <path d="M158 122 L164 130 L160 130 L166 140" stroke="#FFD93D" stroke-width="3" stroke-linecap="round" fill="none"/>
            </svg>
          </div>
          <h3 class="vl-empty__title">No vendors found</h3>
          <p class="vl-empty__sub">
            <span v-if="filters.category">No <strong>{{ filters.category }}</strong> vendors</span>
            <span v-else>No vendors</span>
            <span v-if="filters.city"> in <strong>{{ filters.city }}</strong></span>
            match your filters. Try broadening your search.
          </p>
          <button class="vl-empty__btn" @click="clearFilters">Clear all filters</button>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.pages > 1" class="vl-pagination">
          <button
            class="vl-page-btn" :disabled="pagination.page <= 1"
            @click="goToPage(pagination.page - 1)"
          ><i class="pi pi-chevron-left" /></button>
          <button
            v-for="p in pageNumbers" :key="p"
            class="vl-page-btn"
            :class="{ 'vl-page-btn--active': p === pagination.page, 'vl-page-btn--dots': p === '…' }"
            :disabled="p === '…'"
            @click="p !== '…' && goToPage(p)"
          >{{ p }}</button>
          <button
            class="vl-page-btn" :disabled="pagination.page >= pagination.pages"
            @click="goToPage(pagination.page + 1)"
          ><i class="pi pi-chevron-right" /></button>
        </div>

      </div>
    </div>

    <!-- ── Mobile filter drawer ── -->
    <Transition name="mob-drawer">
      <div v-if="mobileFilterOpen" class="vl-mob-overlay" @click.self="mobileFilterOpen = false">
        <div class="vl-mob-drawer">
          <div class="vl-mob-drawer__head">
            <span>Filters</span>
            <button @click="mobileFilterOpen = false" class="vl-mob-drawer__close">×</button>
          </div>
          <div class="vl-mob-drawer__body">
            <div class="vl-filter-label">Category</div>
            <div class="vl-cat-grid">
              <button
                v-for="cat in vendorCategories" :key="cat"
                class="vl-cat-btn"
                :class="{ 'vl-cat-btn--active': filters.category === cat }"
                @click="setCategory(filters.category === cat ? null : cat)"
              >
                <span class="vl-cat-btn__emoji">{{ catEmoji(cat) }}</span>
                <span class="vl-cat-btn__name">{{ cat }}</span>
              </button>
            </div>
            <div class="vl-filter-divider" />
            <div class="vl-filter-label">City</div>
            <div class="vl-select-wrap">
              <select v-model="filters.city" class="vl-select">
                <option value="">All Cities</option>
                <option v-for="c in gujaratCities" :key="c" :value="c">{{ c }}</option>
              </select>
              <i class="pi pi-chevron-down vl-select-arrow" />
            </div>
            <div class="vl-filter-divider" />
            <div class="vl-filter-label">Min Rating</div>
            <div class="vl-rating-btns">
              <button
                v-for="r in [3, 4, 4.5]" :key="r"
                class="vl-rating-btn"
                :class="{ 'vl-rating-btn--active': filters.rating === r }"
                @click="filters.rating = filters.rating === r ? null : r"
              >⭐ {{ r }}+</button>
            </div>
          </div>
          <div class="vl-mob-drawer__foot">
            <button class="vl-mob-apply" @click="applyFilters(); mobileFilterOpen = false">Apply Filters</button>
            <button class="vl-mob-clear" @click="clearFilters(); mobileFilterOpen = false">Clear All</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useVendorStore } from '@/stores/vendor';
import VendorCard from '@/components/vendor/VendorCard.vue';
import { GUJARAT_CITIES, VENDOR_CATEGORIES, formatCurrency } from '@/utils/helpers';

const route = useRoute();
const router = useRouter();
const vendorStore = useVendorStore();

const vendors = ref([]);
const pagination = ref(null);
const loading = ref(true);
const mobileFilterOpen = ref(false);

const gujaratCities = GUJARAT_CITIES;
const vendorCategories = VENDOR_CATEGORIES;

const CAT_EMOJI = {
  Photography:'📸', Videography:'🎬', Catering:'🍽️', Decoration:'🌸',
  Mehendi:'🌿', DJ:'🎵', Makeup:'💄', Venue:'🏛️', Invitation:'💌', Pandit:'🙏',
};
const catEmoji = (c) => CAT_EMOJI[c] || '✨';

const sortOptions = [
  { label: '⭐ Top Rated',       value: '-averageRating' },
  { label: '💰 Price: Low→High', value: 'startingPrice'  },
  { label: '💎 Price: High→Low', value: '-startingPrice' },
  { label: '🔥 Most Popular',    value: '-viewCount'     },
  { label: '🆕 Newest',          value: '-createdAt'     },
];

const filters = ref({
  category: route.query.category || null,
  city:     route.query.city     || '',
  maxPrice: null,
  rating:   null,
  sort:     '-averageRating',
  page:     1,
});

const hasActiveFilters = computed(() =>
  filters.value.category || filters.value.city || filters.value.rating || filters.value.maxPrice
);

const activeFilterCount = computed(() =>
  [filters.value.category, filters.value.city, filters.value.rating, filters.value.maxPrice].filter(Boolean).length
);

// Smart page number list with ellipsis
const pageNumbers = computed(() => {
  if (!pagination.value) return [];
  const { page, pages } = pagination.value;
  const nums = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) nums.push(i);
    else if (nums[nums.length - 1] !== '…') nums.push('…');
  }
  return nums;
});

const setCategory = (cat) => {
  filters.value.category = cat;
  applyFilters();
};

const applyFilters = async () => {
  loading.value = true;
  filters.value.page = 1;

  const params = {};
  if (filters.value.category) params.category = filters.value.category;
  if (filters.value.city)     params.city     = filters.value.city;
  if (filters.value.maxPrice) params.maxPrice = filters.value.maxPrice;
  if (filters.value.rating)   params.rating   = filters.value.rating;
  if (filters.value.sort)     params.sort     = filters.value.sort;
  params.page  = 1;
  params.limit = 12;

  router.replace({ query: params });

  try {
    const res = await vendorStore.fetchVendors(params);
    vendors.value = res.vendors;
    pagination.value = res.pagination;
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  filters.value = { category: null, city: '', maxPrice: null, rating: null, sort: '-averageRating', page: 1 };
  applyFilters();
};

const goToPage = async (p) => {
  loading.value = true;
  const params = {};
  if (filters.value.category) params.category = filters.value.category;
  if (filters.value.city)     params.city     = filters.value.city;
  if (filters.value.maxPrice) params.maxPrice = filters.value.maxPrice;
  if (filters.value.rating)   params.rating   = filters.value.rating;
  if (filters.value.sort)     params.sort     = filters.value.sort;
  params.page  = p;
  params.limit = 12;
  try {
    const res = await vendorStore.fetchVendors(params);
    vendors.value = res.vendors;
    pagination.value = res.pagination;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } finally {
    loading.value = false;
  }
};

onMounted(() => applyFilters());
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

.vl-page { min-height: 100vh; background: #f8f4f0; font-family: 'DM Sans', sans-serif; }

/* ── Header ── */
.vl-header { background: #fff; border-bottom: 1px solid rgba(232,101,10,0.1); padding: 20px 0; }
.vl-header__inner { max-width: 1280px; margin: 0 auto; padding: 0 24px; display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
.vl-header__title { font-size: 22px; font-weight: 700; color: #1a1008; margin: 0 0 4px; }
.vl-header__sub { font-size: 13.5px; color: #9a8a7a; margin: 0; }
.vl-header__sub strong { color: #e8650a; }

/* Active chips */
.vl-chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
.vl-chip {
  display: flex; align-items: center; gap: 5px; padding: 5px 12px;
  background: rgba(232,101,10,0.08); border: 1px solid rgba(232,101,10,0.2);
  border-radius: 99px; font-size: 12.5px; font-weight: 600; color: #e8650a;
  cursor: pointer; transition: all 0.15s;
}
.vl-chip:hover { background: rgba(232,101,10,0.15); }
.vl-chip__x { font-size: 15px; line-height: 1; opacity: 0.7; }
.vl-chip--clear { background: transparent; border-color: rgba(148,163,184,0.3); color: #9a8a7a; }
.vl-chip--clear:hover { border-color: #e8650a; color: #e8650a; background: rgba(232,101,10,0.05); }

/* ── Body layout ── */
.vl-body { max-width: 1280px; margin: 0 auto; padding: 24px; display: flex; gap: 24px; align-items: flex-start; }

/* ── Sidebar ── */
.vl-sidebar { width: 260px; flex-shrink: 0; display: none; }
@media (min-width: 1024px) { .vl-sidebar { display: block; } }
.vl-sidebar__card { background: #fff; border-radius: 20px; border: 1px solid rgba(232,101,10,0.08); box-shadow: 0 2px 16px rgba(26,16,8,0.05); padding: 20px; position: sticky; top: 80px; }

.vl-filter-section { display: flex; flex-direction: column; gap: 10px; }
.vl-filter-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #9a8a7a; display: flex; justify-content: space-between; align-items: center; }
.vl-filter-label__val { font-size: 12px; font-weight: 600; color: #e8650a; text-transform: none; letter-spacing: 0; }
.vl-filter-divider { height: 1px; background: rgba(232,101,10,0.08); margin: 4px 0; }

/* Category grid */
.vl-cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.vl-cat-btn {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 8px 4px; border-radius: 12px; border: 1.5px solid rgba(232,101,10,0.12);
  background: transparent; cursor: pointer; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
}
.vl-cat-btn:hover { border-color: #e8650a; background: rgba(232,101,10,0.04); }
.vl-cat-btn--active { border-color: #e8650a; background: linear-gradient(135deg, rgba(232,101,10,0.12), rgba(192,57,43,0.06)); box-shadow: 0 2px 8px rgba(232,101,10,0.15); }
.vl-cat-btn__emoji { font-size: 18px; }
.vl-cat-btn__name { font-size: 10.5px; font-weight: 600; color: #5a4a3a; text-align: center; }
.vl-cat-btn--active .vl-cat-btn__name { color: #e8650a; }

/* Select */
.vl-select-wrap { position: relative; }
.vl-select {
  width: 100%; padding: 9px 32px 9px 12px; border-radius: 10px;
  border: 1.5px solid rgba(232,101,10,0.15); background: #fdf8f3;
  font-size: 13px; font-weight: 500; color: #1a1008; outline: none;
  font-family: 'DM Sans', sans-serif; appearance: none; cursor: pointer;
  transition: border-color 0.2s;
}
.vl-select:focus { border-color: #e8650a; }
.vl-select-arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 10px; color: #b0a090; pointer-events: none; }

/* Range */
.vl-range { width: 100%; accent-color: #e8650a; cursor: pointer; }
.vl-range-labels { display: flex; justify-content: space-between; font-size: 11px; color: #b0a090; margin-top: 4px; }

/* Rating buttons */
.vl-rating-btns { display: flex; gap: 6px; }
.vl-rating-btn { padding: 6px 12px; border-radius: 8px; border: 1.5px solid rgba(232,101,10,0.15); background: transparent; font-size: 12px; font-weight: 600; color: #7a6a5a; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
.vl-rating-btn:hover { border-color: #e8650a; color: #e8650a; }
.vl-rating-btn--active { background: linear-gradient(135deg, #e8650a, #c0392b); border-color: transparent; color: #fff; box-shadow: 0 3px 10px rgba(232,101,10,0.3); }

/* ── Main ── */
.vl-main { flex: 1; min-width: 0; }

/* Sort bar */
.vl-sort-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.vl-mobile-filter-btn {
  display: flex; align-items: center; gap: 6px; padding: 8px 14px;
  border-radius: 10px; border: 1.5px solid rgba(232,101,10,0.2);
  background: #fff; font-size: 13px; font-weight: 600; color: #5a4a3a;
  cursor: pointer; font-family: 'DM Sans', sans-serif; position: relative;
}
@media (min-width: 1024px) { .vl-mobile-filter-btn { display: none; } }
.vl-mobile-filter-badge {
  position: absolute; top: -6px; right: -6px; width: 18px; height: 18px;
  border-radius: 50%; background: #e8650a; color: #fff; font-size: 10px;
  font-weight: 700; display: flex; align-items: center; justify-content: center;
}
.vl-sort-group { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-wrap: wrap; }
.vl-sort-label { font-size: 12.5px; font-weight: 600; color: #9a8a7a; white-space: nowrap; }
.vl-sort-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.vl-sort-pill {
  padding: 6px 12px; border-radius: 99px; border: 1.5px solid rgba(232,101,10,0.15);
  background: #fff; font-size: 12px; font-weight: 600; color: #7a6a5a;
  cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; white-space: nowrap;
}
.vl-sort-pill:hover { border-color: #e8650a; color: #e8650a; background: rgba(232,101,10,0.04); }
.vl-sort-pill--active { background: linear-gradient(135deg, #e8650a, #c0392b); border-color: transparent; color: #fff; box-shadow: 0 3px 10px rgba(232,101,10,0.25); }

/* Grid */
.vl-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }

/* Skeleton */
.vl-skeleton { background: #fff; border-radius: 20px; overflow: hidden; border: 1px solid rgba(232,101,10,0.06); }
.vl-skeleton__img { height: 180px; background: linear-gradient(90deg, #f0e8e0 25%, #fdf8f3 50%, #f0e8e0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
.vl-skeleton__body { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
.vl-skeleton__line { height: 12px; border-radius: 6px; background: linear-gradient(90deg, #f0e8e0 25%, #fdf8f3 50%, #f0e8e0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; }
.vl-skeleton__line--wide { width: 80%; }
.vl-skeleton__line--mid  { width: 55%; }
.vl-skeleton__line--short{ width: 35%; }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* Empty state */
.vl-empty { display: flex; flex-direction: column; align-items: center; padding: 60px 24px; text-align: center; }
.vl-empty__doodle { width: 160px; height: 160px; margin-bottom: 24px; }
.vl-empty__svg { width: 100%; height: 100%; filter: drop-shadow(0 8px 24px rgba(255,217,61,0.3)); }
.vl-empty__title { font-size: 22px; font-weight: 700; color: #1a1008; margin: 0 0 8px; }
.vl-empty__sub { font-size: 14.5px; color: #9a8a7a; margin: 0 0 24px; max-width: 360px; line-height: 1.6; }
.vl-empty__sub strong { color: #e8650a; }
.vl-empty__btn { padding: 12px 28px; border-radius: 12px; border: none; background: linear-gradient(135deg, #e8650a, #c0392b); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; box-shadow: 0 4px 14px rgba(232,101,10,0.3); transition: all 0.2s; }
.vl-empty__btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(232,101,10,0.4); }

/* Pagination */
.vl-pagination { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 32px; }
.vl-page-btn { width: 38px; height: 38px; border-radius: 10px; border: 1.5px solid rgba(232,101,10,0.15); background: #fff; font-size: 13px; font-weight: 600; color: #5a4a3a; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
.vl-page-btn:hover:not(:disabled) { border-color: #e8650a; color: #e8650a; }
.vl-page-btn--active { background: linear-gradient(135deg, #e8650a, #c0392b); border-color: transparent; color: #fff; box-shadow: 0 3px 10px rgba(232,101,10,0.3); }
.vl-page-btn--dots { border-color: transparent; background: transparent; cursor: default; }
.vl-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── Mobile drawer ── */
.vl-mob-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; }
.vl-mob-drawer { width: 300px; background: #fff; height: 100%; display: flex; flex-direction: column; box-shadow: 4px 0 32px rgba(0,0,0,0.2); }
.vl-mob-drawer__head { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid rgba(232,101,10,0.1); font-size: 16px; font-weight: 700; color: #1a1008; }
.vl-mob-drawer__close { background: none; border: none; font-size: 22px; color: #9a8a7a; cursor: pointer; line-height: 1; }
.vl-mob-drawer__body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.vl-mob-drawer__foot { padding: 16px; border-top: 1px solid rgba(232,101,10,0.1); display: flex; flex-direction: column; gap: 8px; }
.vl-mob-apply { padding: 13px; border-radius: 12px; border: none; background: linear-gradient(135deg, #e8650a, #c0392b); color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; }
.vl-mob-clear { padding: 11px; border-radius: 12px; border: 1.5px solid rgba(232,101,10,0.2); background: transparent; color: #7a6a5a; font-size: 14px; font-weight: 600; cursor: pointer; font-family: 'DM Sans', sans-serif; }

/* Drawer transition */
.mob-drawer-enter-active { transition: all 0.25s cubic-bezier(0.16,1,0.3,1); }
.mob-drawer-leave-active { transition: all 0.18s ease; }
.mob-drawer-enter-from .vl-mob-drawer, .mob-drawer-leave-to .vl-mob-drawer { transform: translateX(-100%); }
.mob-drawer-enter-from, .mob-drawer-leave-to { opacity: 0; }
</style>
