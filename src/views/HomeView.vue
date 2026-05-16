<template>
  <div>
    <!-- Hero Section -->
    <section class="relative min-h-[85vh] flex items-center overflow-hidden -mt-[70px] pt-[70px]">
      <!-- Background -->
      <div class="absolute inset-0 hero-gradient"></div>
      <!-- Decorative pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
        <div class="absolute top-20 right-20 w-20 h-20 border-2 border-white rounded-full"></div>
        <div class="absolute bottom-20 left-1/4 w-16 h-16 border-2 border-white rounded-full"></div>
        <div class="absolute bottom-10 right-1/3 w-24 h-24 border-2 border-white rounded-full"></div>
      </div>
      <!-- Floral decorations -->
      <div class="absolute top-0 right-0 w-64 h-64 opacity-20 text-9xl flex items-start justify-end p-8">🌸</div>
      <div class="absolute bottom-0 left-0 w-64 h-64 opacity-20 text-9xl flex items-end justify-start p-8">🌺</div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div class="max-w-3xl mx-auto text-center">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span>🎊</span>
            <span>Gujarat's #1 Wedding Vendor Marketplace</span>
          </div>

          <!-- Title -->
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-display leading-tight">
            Find Perfect
            <span class="text-amber-300 italic"> Wedding Vendors</span>
            <br />in Gujarat
          </h1>

          <p class="text-lg text-orange-100 mb-10 max-w-xl mx-auto">
            Connect with verified photographers, caterers, decorators, and more. Plan your dream wedding with confidence.
          </p>

          <!-- Search Bar -->
          <div class="search-container">
            <div class="search-box">

              <!-- City Select -->
              <div class="search-item">
                <label class="search-label">
                  <i class="pi pi-map-marker"></i> City
                </label>
                <select v-model="searchCity" class="search-select">
                  <option value="">All Cities</option>
                  <option v-for="city in gujaratCities" :key="city" :value="city">{{ city }}</option>
                </select>
              </div>

              <div class="search-divider"></div>

              <!-- Category Select -->
              <div class="search-item">
                <label class="search-label">
                  <i class="pi pi-tag"></i> Category
                </label>
                <select v-model="searchCategory" class="search-select">
                  <option value="">All Categories</option>
                  <option v-for="cat in vendorCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>

              <!-- Search Button -->
              <button class="search-btn" @click="handleSearch">
                <i class="pi pi-search"></i>
                <span>Search</span>
              </button>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="flex flex-wrap justify-center gap-6 mt-10">
            <div v-for="stat in heroStats" :key="stat.label" class="text-center">
              <div class="text-2xl font-bold text-white">{{ stat.value }}</div>
              <div class="text-xs text-orange-200">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Grid -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold text-gray-900 font-display mb-3">Browse by Category</h2>
          <p class="text-gray-500">Find the right vendor for every part of your wedding</p>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div
            v-for="cat in categories"
            :key="cat.name"
            class="category-card bg-white rounded-2xl p-5 text-center cursor-pointer border border-gray-100 hover:border-orange-200"
            @click="$router.push(`/vendors?category=${cat.name}`)"
          >
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
              :style="{ background: cat.bgColor }"
            >
              {{ cat.emoji }}
            </div>
            <h3 class="font-semibold text-gray-800 text-sm">{{ cat.name }}</h3>
            <p class="text-xs text-gray-400 mt-1">{{ cat.count }}+ vendors</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-16 bg-orange-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 font-display mb-3">How It Works</h2>
          <p class="text-gray-500">Plan your perfect wedding in 3 simple steps</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <!-- Connector line (desktop) -->
          <div class="hidden md:block absolute top-12 left-1/4 right-1/4 h-0.5 bg-orange-200 z-0"></div>

          <div
            v-for="(step, index) in howItWorks"
            :key="index"
            class="relative text-center fade-in-up"
            :style="{ animationDelay: `${index * 0.15}s` }"
          >
            <div class="relative z-10 w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center mx-auto mb-6 border-4 border-orange-100">
              <span class="text-3xl">{{ step.emoji }}</span>
              <div class="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-orange-600 text-white text-xs font-bold flex items-center justify-center">
                {{ index + 1 }}
              </div>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">{{ step.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Vendors -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between mb-10">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 font-display mb-2">Featured Vendors</h2>
            <p class="text-gray-500">Top-rated vendors trusted by couples across Gujarat</p>
          </div>
          <RouterLink to="/vendors">
            <Button label="View All" icon="pi pi-arrow-right" iconPos="right" text class="text-orange-600" />
          </RouterLink>
        </div>

        <div v-if="loadingVendors" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="i in 4" :key="i" class="rounded-2xl overflow-hidden">
            <Skeleton height="12rem" />
            <div class="p-4 space-y-2">
              <Skeleton height="1rem" />
              <Skeleton height="0.75rem" width="60%" />
              <Skeleton height="0.75rem" width="40%" />
            </div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <VendorCard v-for="vendor in featuredVendors" :key="vendor._id" :vendor="vendor" />
        </div>
      </div>
    </section>

    <!-- Budget Calculator CTA -->
    <section class="py-16 bg-gradient-to-r from-orange-600 to-rose-600">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="text-5xl mb-6">💰</div>
        <h2 class="text-3xl font-bold text-white font-display mb-4">
          Plan Your Wedding Budget
        </h2>
        <p class="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
          Use our smart budget calculator to allocate your wedding budget across all categories and find vendors within your range.
        </p>
        <RouterLink to="/budget">
          <Button
            label="Calculate My Budget"
            icon="pi pi-calculator"
            size="large"
            class="!bg-white !text-orange-600 !border-white hover:!bg-orange-50 !font-semibold"
          />
        </RouterLink>
      </div>
    </section>

    <!-- Trust Section -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 font-display mb-3">Trusted Across Gujarat</h2>
          <p class="text-gray-500">Thousands of couples have found their perfect vendors on VivahBazaar</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div
            v-for="stat in trustStats"
            :key="stat.label"
            class="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100"
          >
            <div class="text-3xl mb-2">{{ stat.emoji }}</div>
            <div class="text-2xl font-bold text-gray-900 mb-1">{{ stat.value }}</div>
            <div class="text-sm text-gray-500">{{ stat.label }}</div>
          </div>
        </div>

        <!-- Cities -->
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-4">Vendors available in</p>
          <div class="flex flex-wrap justify-center gap-2">
            <span
              v-for="city in topCities"
              :key="city"
              class="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 border border-gray-200 hover:border-orange-300 hover:text-orange-600 cursor-pointer transition-colors"
              @click="$router.push(`/vendors?city=${city}`)"
            >
              📍 {{ city }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Vendor CTA -->
    <section class="py-16 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div class="absolute top-0 right-0 text-8xl opacity-10 p-4">🎊</div>
          <div class="absolute bottom-0 left-0 text-8xl opacity-10 p-4">💍</div>
          <div class="relative">
            <h2 class="text-3xl font-bold text-white font-display mb-4">
              Are You a Wedding Vendor?
            </h2>
            <p class="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              Get a free profile page and reach thousands of couples planning their wedding in Gujarat. No commission, no hidden fees.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <RouterLink to="/register-vendor">
                <Button
                  label="List Your Business Free"
                  icon="pi pi-plus-circle"
                  size="large"
                  class="!bg-orange-600 !border-orange-600 !font-semibold"
                />
              </RouterLink>
              <RouterLink to="/vendors">
                <Button
                  label="See How It Looks"
                  icon="pi pi-eye"
                  size="large"
                  outlined
                  class="!text-white !border-white hover:!bg-white/10"
                />
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVendorStore } from '@/stores/vendor';
import VendorCard from '@/components/vendor/VendorCard.vue';
import { GUJARAT_CITIES, VENDOR_CATEGORIES } from '@/utils/helpers';

const router = useRouter();
const vendorStore = useVendorStore();

const searchCity = ref('');
const searchCategory = ref('');
const featuredVendors = ref([]);
const loadingVendors = ref(true);
const statsData = ref(null);

const gujaratCities = GUJARAT_CITIES;
const vendorCategories = VENDOR_CATEGORIES;

const heroStats = ref([
  { value: '500+', label: 'Verified Vendors' },
  { value: '20+', label: 'Cities in Gujarat' },
  { value: '5000+', label: 'Happy Couples' },
  { value: '4.8★', label: 'Average Rating' },
]);

const categories = [
  { name: 'Photography', emoji: '📸', bgColor: '#dbeafe', count: 50 },
  { name: 'Catering', emoji: '🍽️', bgColor: '#ffedd5', count: 80 },
  { name: 'Decoration', emoji: '🌸', bgColor: '#fce7f3', count: 60 },
  { name: 'Mehendi', emoji: '🌿', bgColor: '#dcfce7', count: 40 },
  { name: 'DJ', emoji: '🎵', bgColor: '#f3e8ff', count: 35 },
  { name: 'Makeup', emoji: '💄', bgColor: '#ffe4e6', count: 45 },
  { name: 'Venue', emoji: '🏛️', bgColor: '#fef3c7', count: 70 },
  { name: 'Videography', emoji: '🎬', bgColor: '#e0e7ff', count: 30 },
  { name: 'Invitation', emoji: '💌', bgColor: '#ccfbf1', count: 25 },
  { name: 'Pandit', emoji: '🙏', bgColor: '#fef9c3', count: 20 },
];

const howItWorks = [
  {
    emoji: '🔍',
    title: 'Search & Filter',
    description: 'Browse vendors by category, city, and budget. Use smart filters to find exactly what you need.',
  },
  {
    emoji: '📋',
    title: 'Compare & Connect',
    description: 'View detailed profiles, portfolios, packages, and reviews. WhatsApp or call vendors directly.',
  },
  {
    emoji: '💍',
    title: 'Book & Celebrate',
    description: 'Finalize your vendors, plan your budget, and enjoy your perfect Gujarat wedding.',
  },
];

const trustStats = ref([
  { emoji: '🏪', value: '500+', label: 'Verified Vendors' },
  { emoji: '📍', value: '20+', label: 'Cities Covered' },
  { emoji: '💑', value: '5000+', label: 'Weddings Planned' },
  { emoji: '⭐', value: '4.8/5', label: 'Average Rating' },
]);

const topCities = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand'];

const handleSearch = () => {
  const query = {};
  if (searchCity.value) query.city = searchCity.value;
  if (searchCategory.value) query.category = searchCategory.value;
  router.push({ name: 'Vendors', query });
};

onMounted(async () => {
  try {
    const [vendorsRes, statsRes] = await Promise.all([
      vendorStore.fetchVendors({ featured: 'true', limit: 8 }),
      vendorStore.fetchStats(),
    ]);
    featuredVendors.value = vendorsRes.vendors;
    statsData.value = statsRes;

    if (statsRes) {
      heroStats.value[0].value = statsRes.totalVendors + '+';
      heroStats.value[1].value = statsRes.totalCities + '+';
      trustStats.value[0].value = statsRes.totalVendors + '+';
      trustStats.value[1].value = statsRes.totalCities + '+';
    }
  } catch (err) {
    console.error('Failed to load home data:', err);
  } finally {
    loadingVendors.value = false;
  }
});
</script>

<style scoped>
/* ── Search Container ── */
.search-container {
  max-width: 680px;
  margin: 2.5rem auto 0;
}

.search-box {
  display: flex;
  align-items: center;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  padding: 8px 8px 8px 0;
  gap: 0;
}

/* ── Each field slot ── */
.search-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px 20px;
  min-width: 0;
}

.search-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #f97316;
  margin-bottom: 3px;
  white-space: nowrap;
}

.search-label .pi {
  font-size: 11px;
}

.search-select {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
  font-weight: 500;
  color: #111827;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  padding-right: 20px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239ca3af' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0 center;
}

.search-select option {
  color: #111827;
  font-size: 14px;
}

/* ── Divider ── */
.search-divider {
  width: 1px;
  height: 40px;
  background: #e5e7eb;
  flex-shrink: 0;
}

/* ── Search Button ── */
.search-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #ea580c, #f97316);
  color: white;
  border: none;
  border-radius: 14px;
  padding: 0 28px;
  height: 56px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s ease;
  margin-left: 4px;
}

.search-btn:hover {
  background: linear-gradient(135deg, #c2410c, #ea580c);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(234, 88, 12, 0.4);
}

.search-btn:active {
  transform: translateY(0);
}

.search-btn .pi {
  font-size: 14px;
}

/* ── Mobile ── */
@media (max-width: 640px) {
  .search-box {
    flex-direction: column;
    padding: 12px;
    gap: 4px;
    border-radius: 16px;
  }

  .search-item {
    width: 100%;
    padding: 10px 14px;
    border-bottom: 1px solid #f3f4f6;
  }

  .search-item:last-of-type {
    border-bottom: none;
  }

  .search-divider {
    display: none;
  }

  .search-btn {
    width: 100%;
    justify-content: center;
    margin-left: 0;
    margin-top: 4px;
    border-radius: 12px;
  }
}
</style>