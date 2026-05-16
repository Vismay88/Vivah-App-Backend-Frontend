<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-bold text-gray-900 font-display mb-1">Find Wedding Vendors</h1>
        <p class="text-gray-500 text-sm">
          {{ pagination?.total || 0 }} vendors found
          <span v-if="filters.city"> in {{ filters.city }}</span>
          <span v-if="filters.category"> for {{ filters.category }}</span>
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex gap-6">
        <!-- Sidebar Filters (Desktop) -->
        <aside class="hidden lg:block w-72 flex-shrink-0">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <div class="flex items-center justify-between mb-5">
              <h2 class="font-semibold text-gray-900">Filters</h2>
              <button @click="clearFilters" class="text-xs text-orange-600 hover:underline">Clear all</button>
            </div>

            <!-- Category -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div class="space-y-2">
                <div
                  v-for="cat in vendorCategories"
                  :key="cat"
                  class="flex items-center gap-2 cursor-pointer group"
                  @click="filters.category = filters.category === cat ? null : cat"
                >
                  <div
                    class="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
                    :class="filters.category === cat ? 'bg-orange-600 border-orange-600' : 'border-gray-300 group-hover:border-orange-400'"
                  >
                    <i v-if="filters.category === cat" class="pi pi-check text-white text-xs"></i>
                  </div>
                  <span class="text-sm text-gray-700">{{ cat }}</span>
                </div>
              </div>
            </div>

            <Divider />

            <!-- City -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
              <Dropdown
                v-model="filters.city"
                :options="gujaratCities"
                placeholder="All Cities"
                class="w-full"
                showClear
              />
            </div>

            <Divider />

            <!-- Budget Range -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-gray-700 mb-3">
                Budget Range
                <span class="text-orange-600 font-normal ml-1">
                  {{ formatCurrency(filters.minPrice) }} - {{ formatCurrency(filters.maxPrice) }}
                </span>
              </label>
              <Slider
                v-model="priceRange"
                :min="0"
                :max="500000"
                :step="5000"
                range
                class="w-full"
              />
              <div class="flex justify-between text-xs text-gray-400 mt-2">
                <span>₹0</span>
                <span>₹5L+</span>
              </div>
            </div>

            <Divider />

            <!-- Rating -->
            <div class="mb-5">
              <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
              <div class="flex gap-2">
                <button
                  v-for="r in [3, 4, 4.5]"
                  :key="r"
                  @click="filters.rating = filters.rating === r ? null : r"
                  class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                  :class="filters.rating === r ? 'bg-orange-600 text-white border-orange-600' : 'border-gray-200 text-gray-600 hover:border-orange-300'"
                >
                  <i class="pi pi-star-fill text-amber-400 text-xs"></i>
                  {{ r }}+
                </button>
              </div>
            </div>

            <Button
              label="Apply Filters"
              icon="pi pi-filter"
              class="w-full !bg-orange-600 !border-orange-600"
              @click="applyFilters"
            />
          </div>
        </aside>

        <!-- Main Content -->
        <div class="flex-1 min-w-0">
          <!-- Mobile Filter + Sort Bar -->
          <div class="flex items-center gap-3 mb-4">
            <Button
              label="Filters"
              icon="pi pi-filter"
              outlined
              size="small"
              class="lg:hidden !border-gray-300 !text-gray-700"
              @click="mobileFilterOpen = true"
            />

            <!-- Sort -->
            <div class="flex items-center gap-2 ml-auto">
              <span class="text-sm text-gray-500 hidden sm:block">Sort by:</span>
              <Dropdown
                v-model="filters.sort"
                :options="sortOptions"
                optionLabel="label"
                optionValue="value"
                class="text-sm"
                @change="applyFilters"
              />
            </div>
          </div>

          <!-- Active Filters -->
          <div v-if="hasActiveFilters" class="flex flex-wrap gap-2 mb-4">
            <Chip
              v-if="filters.category"
              :label="filters.category"
              removable
              @remove="filters.category = null; applyFilters()"
              class="!bg-orange-50 !text-orange-700"
            />
            <Chip
              v-if="filters.city"
              :label="filters.city"
              removable
              @remove="filters.city = null; applyFilters()"
              class="!bg-orange-50 !text-orange-700"
            />
            <Chip
              v-if="filters.rating"
              :label="`${filters.rating}+ stars`"
              removable
              @remove="filters.rating = null; applyFilters()"
              class="!bg-orange-50 !text-orange-700"
            />
          </div>

          <!-- Loading -->
          <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <div v-for="i in 6" :key="i" class="rounded-2xl overflow-hidden bg-white">
              <Skeleton height="12rem" />
              <div class="p-4 space-y-2">
                <Skeleton height="1rem" />
                <Skeleton height="0.75rem" width="60%" />
              </div>
            </div>
          </div>

          <!-- Vendors Grid -->
          <div v-else-if="vendors.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            <VendorCard v-for="vendor in vendors" :key="vendor._id" :vendor="vendor" />
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-20">
            <div class="text-6xl mb-4">🔍</div>
            <h3 class="text-xl font-semibold text-gray-700 mb-2">No vendors found</h3>
            <p class="text-gray-400 mb-6">Try adjusting your filters or search in a different city</p>
            <Button label="Clear Filters" outlined @click="clearFilters" class="!border-orange-300 !text-orange-600" />
          </div>

          <!-- Pagination -->
          <div v-if="pagination && pagination.pages > 1" class="mt-8 flex justify-center">
            <Paginator
              :rows="pagination.limit"
              :totalRecords="pagination.total"
              :first="(pagination.page - 1) * pagination.limit"
              @page="onPageChange"
              template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Filter Sidebar -->
    <Sidebar v-model:visible="mobileFilterOpen" position="left" class="w-80">
      <template #header>
        <h2 class="font-semibold text-gray-900">Filters</h2>
      </template>
      <div class="p-4 space-y-5">
        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <Dropdown
            v-model="filters.category"
            :options="vendorCategories"
            placeholder="All Categories"
            class="w-full"
            showClear
          />
        </div>
        <!-- City -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
          <Dropdown
            v-model="filters.city"
            :options="gujaratCities"
            placeholder="All Cities"
            class="w-full"
            showClear
          />
        </div>
        <!-- Rating -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
          <div class="flex gap-2">
            <button
              v-for="r in [3, 4, 4.5]"
              :key="r"
              @click="filters.rating = filters.rating === r ? null : r"
              class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
              :class="filters.rating === r ? 'bg-orange-600 text-white border-orange-600' : 'border-gray-200 text-gray-600'"
            >
              <i class="pi pi-star-fill text-amber-400 text-xs"></i>
              {{ r }}+
            </button>
          </div>
        </div>
        <Button
          label="Apply Filters"
          class="w-full !bg-orange-600 !border-orange-600"
          @click="applyFilters(); mobileFilterOpen = false"
        />
        <Button
          label="Clear All"
          outlined
          class="w-full !border-gray-300 !text-gray-600"
          @click="clearFilters(); mobileFilterOpen = false"
        />
      </div>
    </Sidebar>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
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

const sortOptions = [
  { label: 'Top Rated', value: '-averageRating' },
  { label: 'Price: Low to High', value: 'startingPrice' },
  { label: 'Price: High to Low', value: '-startingPrice' },
  { label: 'Most Popular', value: '-viewCount' },
  { label: 'Newest', value: '-createdAt' },
];

const filters = ref({
  category: route.query.category || null,
  city: route.query.city || null,
  minPrice: null,
  maxPrice: null,
  rating: null,
  sort: '-averageRating',
  page: 1,
});

const priceRange = ref([0, 500000]);

watch(priceRange, (val) => {
  filters.value.minPrice = val[0] || null;
  filters.value.maxPrice = val[1] < 500000 ? val[1] : null;
});

const hasActiveFilters = computed(() =>
  filters.value.category || filters.value.city || filters.value.rating
);

const applyFilters = async () => {
  loading.value = true;
  filters.value.page = 1;

  const params = {};
  if (filters.value.category) params.category = filters.value.category;
  if (filters.value.city) params.city = filters.value.city;
  if (filters.value.minPrice) params.minPrice = filters.value.minPrice;
  if (filters.value.maxPrice) params.maxPrice = filters.value.maxPrice;
  if (filters.value.rating) params.rating = filters.value.rating;
  if (filters.value.sort) params.sort = filters.value.sort;
  params.page = filters.value.page;
  params.limit = 12;

  // Update URL
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
  filters.value = {
    category: null,
    city: null,
    minPrice: null,
    maxPrice: null,
    rating: null,
    sort: '-averageRating',
    page: 1,
  };
  priceRange.value = [0, 500000];
  applyFilters();
};

const onPageChange = (event) => {
  filters.value.page = event.page + 1;
  applyFilters();
};

onMounted(() => {
  applyFilters();
});
</script>
