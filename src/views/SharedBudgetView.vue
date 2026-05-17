<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div v-if="loading" class="space-y-4">
        <Skeleton height="4rem" class="rounded-xl" />
        <Skeleton height="20rem" class="rounded-xl" />
      </div>

      <div v-else-if="plan">
        <!-- Header -->
        <div class="bg-gradient-to-r from-orange-600 to-rose-600 rounded-2xl p-6 text-white mb-6">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 class="text-2xl font-bold font-display">
                {{ plan.eventType || 'Wedding' }} Budget Plan
              </h1>
              <p class="text-orange-100 text-sm mt-1">
                <span v-if="plan.city">📍 {{ plan.city }}</span>
                <span v-if="plan.weddingDate"> · 📅 {{ formatDate(plan.weddingDate) }}</span>
                <span v-if="plan.guestCount"> · 👥 {{ plan.guestCount }} guests</span>
              </p>
              <div v-if="plan.priorities?.length" class="flex flex-wrap gap-1 mt-2">
                <span class="text-xs text-orange-200">Priorities:</span>
                <span
                  v-for="p in plan.priorities"
                  :key="p"
                  class="text-xs bg-white/20 px-2 py-0.5 rounded-full"
                >{{ p }}</span>
              </div>
            </div>
            <div class="text-right">
              <p class="text-orange-200 text-sm">Total Budget</p>
              <p class="text-3xl font-bold">{{ formatCurrency(plan.totalBudget) }}</p>
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 class="font-bold text-gray-900 mb-4">Budget Breakdown</h2>
          <div class="space-y-4">
            <div v-for="cat in plan.categories" :key="cat.category" class="flex items-center gap-4">
              <div class="w-8 text-xl flex-shrink-0">{{ getCategoryIcon(cat.category) }}</div>
              <div class="flex-1">
                <div class="flex justify-between mb-1">
                  <span class="text-sm font-medium text-gray-700">{{ cat.category }}</span>
                  <span class="text-sm font-bold text-orange-600">{{ formatCurrency(cat.allocatedAmount) }}</span>
                </div>
                <ProgressBar :value="cat.percentage" :showValue="false" class="h-2" />
                <span class="text-xs text-gray-400">{{ cat.percentage }}% of total</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 flex-wrap">
          <RouterLink to="/budget">
            <Button label="Plan My Own Event" icon="pi pi-bolt" class="!bg-orange-600 !border-orange-600" />
          </RouterLink>
          <RouterLink to="/vendors">
            <Button label="Find Vendors" icon="pi pi-search" outlined class="!border-orange-300 !text-orange-600" />
          </RouterLink>
        </div>
      </div>

      <div v-else class="text-center py-20">
        <div class="text-6xl mb-4">😕</div>
        <h2 class="text-xl font-bold text-gray-700 mb-2">Budget plan not found</h2>
        <RouterLink to="/budget">
          <Button label="Create New Budget" class="!bg-orange-600 !border-orange-600 mt-4" />
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
import { formatCurrency, formatDate } from '@/utils/helpers';

const route = useRoute();
const plan = ref(null);
const loading = ref(true);

const getCategoryIcon = (category) => {
  const icons = { Venue: '🏛️', Catering: '🍽️', Photography: '📸', Decoration: '🌸', Makeup: '💄', Mehendi: '🌿', DJ: '🎵', Invitation: '💌', Clothing: '👗', Jewelry: '💍', Pandit: '🙏', Miscellaneous: '✨' };
  return icons[category] || '✨';
};

onMounted(async () => {
  try {
    const res = await api.get(`/budget/share/${route.params.token}`);
    plan.value = res.data.plan;
  } catch {
    plan.value = null;
  } finally {
    loading.value = false;
  }
});
</script>
