<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-gradient-to-r from-orange-600 to-rose-600 py-12">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="text-4xl mb-3">💰</div>
        <h1 class="text-3xl font-bold text-white font-display mb-2">Wedding Budget Calculator</h1>
        <p class="text-orange-100">Plan your perfect Gujarat wedding budget with smart category splits</p>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Step 1: Enter Budget -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-orange-600 text-white text-sm flex items-center justify-center font-bold">1</span>
          Enter Your Total Wedding Budget
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Total Budget (₹)</label>
            <InputNumber
              v-model="totalBudget"
              :min="10000"
              :max="100000000"
              mode="currency"
              currency="INR"
              locale="en-IN"
              class="w-full"
              placeholder="e.g. 1500000"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Wedding City</label>
            <Dropdown
              v-model="weddingCity"
              :options="gujaratCities"
              placeholder="Select City"
              class="w-full"
              showClear
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Wedding Date (Optional)</label>
            <Calendar v-model="weddingDate" placeholder="Select date" class="w-full" dateFormat="dd/mm/yy" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Guest Count (Optional)</label>
            <InputNumber v-model="guestCount" :min="10" :max="10000" placeholder="e.g. 500" class="w-full" />
          </div>
        </div>

        <Button
          label="Calculate Budget Split"
          icon="pi pi-calculator"
          class="!bg-orange-600 !border-orange-600"
          :disabled="!totalBudget || totalBudget < 10000"
          @click="calculateBudget"
        />
      </div>

      <!-- Step 2: Adjust Percentages -->
      <div v-if="budgetCategories.length" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span class="w-7 h-7 rounded-full bg-orange-600 text-white text-sm flex items-center justify-center font-bold">2</span>
            Adjust Category Budgets
          </h2>
          <div class="text-sm" :class="totalPercentage === 100 ? 'text-green-600' : 'text-red-500'">
            Total: {{ totalPercentage }}%
            <i :class="totalPercentage === 100 ? 'pi pi-check-circle' : 'pi pi-exclamation-circle'" class="ml-1"></i>
          </div>
        </div>

        <div class="space-y-4">
          <div
            v-for="(cat, index) in budgetCategories"
            :key="cat.category"
            class="p-4 rounded-xl border border-gray-100 hover:border-orange-100 transition-colors"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-xl">{{ cat.icon }}</span>
                <span class="font-medium text-gray-800">{{ cat.category }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-sm font-semibold text-orange-600">{{ formatCurrency(cat.allocatedAmount) }}</span>
                <div class="flex items-center gap-1">
                  <InputNumber
                    v-model="cat.percentage"
                    :min="0"
                    :max="100"
                    suffix="%"
                    class="w-20 text-sm"
                    @input="updateAmount(index)"
                  />
                </div>
              </div>
            </div>
            <ProgressBar :value="cat.percentage" :showValue="false" class="h-2" />
          </div>
        </div>

        <div v-if="totalPercentage !== 100" class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
          <i class="pi pi-exclamation-triangle text-amber-500"></i>
          <span class="text-sm text-amber-700">Percentages should add up to 100%. Currently: {{ totalPercentage }}%</span>
        </div>
      </div>

      <!-- Step 3: Vendor Suggestions -->
      <div v-if="budgetCategories.length" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 class="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-orange-600 text-white text-sm flex items-center justify-center font-bold">3</span>
          Vendors Within Your Budget
        </h2>

        <div class="space-y-6">
          <div v-for="cat in vendorCategories" :key="cat.category">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold text-gray-800 flex items-center gap-2">
                <span>{{ cat.icon }}</span>
                {{ cat.category }}
                <span class="text-sm font-normal text-gray-400">Budget: {{ formatCurrency(cat.allocatedAmount) }}</span>
              </h3>
              <RouterLink :to="`/vendors?category=${cat.category}&maxPrice=${cat.allocatedAmount}&city=${weddingCity || ''}`">
                <Button label="See All" text size="small" class="!text-orange-600 !text-xs" />
              </RouterLink>
            </div>

            <div v-if="cat.vendors?.length" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                v-for="vendor in cat.vendors"
                :key="vendor._id"
                class="p-3 border border-gray-100 rounded-xl hover:border-orange-200 cursor-pointer transition-colors"
                @click="$router.push(`/vendors/${vendor.slug}`)"
              >
                <div class="flex items-center gap-2 mb-1">
                  <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img v-if="vendor.profilePhoto" :src="vendor.profilePhoto" class="w-full h-full object-cover" />
                    <span v-else class="text-sm">{{ cat.icon }}</span>
                  </div>
                  <div class="min-w-0">
                    <p class="text-xs font-semibold text-gray-800 truncate">{{ vendor.businessName }}</p>
                    <p class="text-xs text-gray-400">{{ vendor.city }}</p>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-orange-600">{{ formatCurrency(vendor.startingPrice) }}</span>
                  <div class="flex items-center gap-0.5">
                    <i class="pi pi-star-fill text-amber-400 text-xs"></i>
                    <span class="text-xs text-gray-600">{{ vendor.averageRating?.toFixed(1) }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-400 py-2">
              No vendors found within this budget. <RouterLink :to="`/vendors?category=${cat.category}`" class="text-orange-600 hover:underline">Browse all {{ cat.category }} vendors</RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Save & Share -->
      <div v-if="budgetCategories.length" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span class="w-7 h-7 rounded-full bg-orange-600 text-white text-sm flex items-center justify-center font-bold">4</span>
          Save & Share Your Budget Plan
        </h2>

        <div v-if="savedPlan" class="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
          <p class="text-green-700 font-medium mb-2">✅ Budget plan saved successfully!</p>
          <div class="flex gap-2">
            <InputText :value="shareLink" readonly class="flex-1 text-sm" />
            <Button icon="pi pi-copy" outlined size="small" @click="copyShareLink" />
            <a :href="`https://wa.me/?text=${encodeURIComponent('Check out my wedding budget plan: ' + shareLink)}`" target="_blank">
              <Button icon="pi pi-whatsapp" size="small" class="whatsapp-btn !text-white" />
            </a>
          </div>
        </div>

        <div class="flex gap-3 flex-wrap">
          <Button
            label="Save Budget Plan"
            icon="pi pi-save"
            class="!bg-orange-600 !border-orange-600"
            :loading="saving"
            @click="saveBudget"
          />
          <Button
            label="Print / Download"
            icon="pi pi-print"
            outlined
            class="!border-gray-300 !text-gray-700"
            @click="printBudget"
          />
          <Button
            label="Reset"
            icon="pi pi-refresh"
            text
            class="!text-gray-500"
            @click="resetBudget"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import api from '@/services/api';
import { GUJARAT_CITIES, BUDGET_CATEGORIES, formatCurrency } from '@/utils/helpers';

const toast = useToast();

const totalBudget = ref(null);
const weddingCity = ref(null);
const weddingDate = ref(null);
const guestCount = ref(null);
const budgetCategories = ref([]);
const vendorCategories = ref([]);
const saving = ref(false);
const savedPlan = ref(null);
const shareLink = ref('');

const gujaratCities = GUJARAT_CITIES;

const totalPercentage = computed(() =>
  budgetCategories.value.reduce((sum, cat) => sum + (cat.percentage || 0), 0)
);

const calculateBudget = async () => {
  if (!totalBudget.value) return;

  budgetCategories.value = BUDGET_CATEGORIES.map(cat => ({
    ...cat,
    allocatedAmount: Math.round((totalBudget.value * cat.percentage) / 100),
  }));

  // Fetch vendors for each vendor-relevant category
  await loadVendorSuggestions();
};

const loadVendorSuggestions = async () => {
  const vendorCats = ['Venue', 'Catering', 'Photography', 'Decoration', 'Makeup', 'Mehendi', 'DJ'];
  const catData = budgetCategories.value.filter(c => vendorCats.includes(c.category));

  const results = await Promise.all(
    catData.map(async (cat) => {
      try {
        const res = await api.get('/vendors/by-budget', {
          params: {
            category: cat.category,
            maxBudget: cat.allocatedAmount,
            city: weddingCity.value || undefined,
            limit: 3,
          },
        });
        return { ...cat, vendors: res.data.vendors };
      } catch {
        return { ...cat, vendors: [] };
      }
    })
  );

  vendorCategories.value = results;
};

const updateAmount = (index) => {
  const cat = budgetCategories.value[index];
  cat.allocatedAmount = Math.round((totalBudget.value * cat.percentage) / 100);
};

const saveBudget = async () => {
  saving.value = true;
  try {
    const res = await api.post('/budget/save', {
      totalBudget: totalBudget.value,
      categories: budgetCategories.value,
      weddingDate: weddingDate.value,
      guestCount: guestCount.value,
      city: weddingCity.value,
    });
    savedPlan.value = res.data.plan;
    shareLink.value = `${window.location.origin}/budget/share/${res.data.shareToken}`;
    toast.add({ severity: 'success', summary: 'Budget saved!', detail: 'You can now share your budget plan', life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Failed to save', detail: err.message, life: 3000 });
  } finally {
    saving.value = false;
  }
};

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareLink.value);
    toast.add({ severity: 'success', summary: 'Link copied!', life: 2000 });
  } catch {
    toast.add({ severity: 'error', summary: 'Failed to copy', life: 2000 });
  }
};

const printBudget = () => {
  window.print();
};

const resetBudget = () => {
  totalBudget.value = null;
  budgetCategories.value = [];
  vendorCategories.value = [];
  savedPlan.value = null;
  shareLink.value = '';
};
</script>
