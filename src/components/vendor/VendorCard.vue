<template>
  <div
    class="vendor-card bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer"
    @click="$router.push(`/vendors/${vendor.slug}`)"
  >
    <!-- Cover Image -->
    <div class="relative h-48 bg-gradient-to-br from-orange-100 to-rose-100 overflow-hidden">
      <img
        v-if="vendor.coverPhoto || vendor.profilePhoto"
        :src="vendor.coverPhoto || vendor.profilePhoto"
        :alt="vendor.businessName"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <span class="text-5xl">{{ getCategoryEmoji(vendor.category) }}</span>
      </div>

      <!-- Category Badge -->
      <div class="absolute top-3 left-3">
        <span
          class="px-2.5 py-1 rounded-full text-xs font-semibold"
          :class="getCategoryColor(vendor.category).bg + ' ' + getCategoryColor(vendor.category).text"
        >
          {{ vendor.category }}
        </span>
      </div>

      <!-- Verified Badge -->
      <div v-if="vendor.isVerified" class="absolute top-3 right-3">
        <div class="verified-badge px-2 py-1 rounded-full flex items-center gap-1">
          <i class="pi pi-verified text-white text-xs"></i>
          <span class="text-white text-xs font-medium">Verified</span>
        </div>
      </div>

      <!-- Featured Badge -->
      <div v-if="vendor.isFeatured" class="absolute bottom-3 left-3">
        <span class="bg-gold-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
          <i class="pi pi-star-fill text-xs"></i>
          Featured
        </span>
      </div>

      <!-- Save Button -->
      <button
        v-if="authStore.isLoggedIn"
        @click.stop="handleSave"
        class="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition-transform"
      >
        <i
          :class="isSaved ? 'pi pi-heart-fill text-rose-500' : 'pi pi-heart text-gray-400'"
          class="text-sm"
        ></i>
      </button>
    </div>

    <!-- Content -->
    <div class="p-4">
      <!-- Profile + Name -->
      <div class="flex items-start gap-3 mb-3">
        <div class="w-12 h-12 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0 border-2 border-white shadow-sm -mt-8">
          <img
            v-if="vendor.profilePhoto"
            :src="vendor.profilePhoto"
            :alt="vendor.businessName"
            class="w-full h-full object-cover"
            @error="handleProfileError"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <span class="text-xl">{{ getCategoryEmoji(vendor.category) }}</span>
          </div>
        </div>
        <div class="flex-1 min-w-0 pt-1">
          <h3 class="font-semibold text-gray-900 text-sm leading-tight truncate">
            {{ vendor.businessName }}
          </h3>
          <p class="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <i class="pi pi-map-marker text-orange-400"></i>
            {{ vendor.city }}
          </p>
        </div>
      </div>

      <!-- Rating -->
      <div class="flex items-center gap-2 mb-3">
        <div class="flex items-center gap-1">
          <i class="pi pi-star-fill text-amber-400 text-xs"></i>
          <span class="text-sm font-semibold text-gray-800">{{ vendor.averageRating?.toFixed(1) || '0.0' }}</span>
        </div>
        <span class="text-xs text-gray-400">({{ vendor.totalReviews || 0 }} reviews)</span>
        <span v-if="vendor.yearsOfExperience" class="ml-auto text-xs text-gray-400">
          {{ vendor.yearsOfExperience }}yr exp
        </span>
      </div>

      <!-- Tags -->
      <div v-if="vendor.tags?.length" class="flex flex-wrap gap-1 mb-3">
        <span
          v-for="tag in vendor.tags.slice(0, 3)"
          :key="tag"
          class="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-100"
        >
          {{ tag }}
        </span>
      </div>

      <!-- Price -->
      <div class="flex items-center justify-between pt-3 border-t border-gray-50">
        <div>
          <span class="text-xs text-gray-400">Starting from</span>
          <p class="text-base font-bold text-orange-600">
            {{ formatCurrency(vendor.startingPrice) }}
            <span v-if="vendor.category === 'Catering'" class="text-xs font-normal text-gray-400">/plate</span>
          </p>
        </div>
        <Button
          label="View"
          size="small"
          icon="pi pi-arrow-right"
          iconPos="right"
          class="!bg-orange-600 !border-orange-600 !text-xs !py-1.5 !px-3"
          @click.stop="$router.push(`/vendors/${vendor.slug}`)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import { formatCurrency, getCategoryEmoji, getCategoryColor } from '@/utils/helpers';

const props = defineProps({
  vendor: { type: Object, required: true },
});

const authStore = useAuthStore();
const toast = useToast();

const isSaved = computed(() => authStore.isVendorSaved(props.vendor._id));

const handleSave = async () => {
  try {
    await authStore.toggleSaveVendor(props.vendor._id);
    toast.add({
      severity: 'success',
      summary: isSaved.value ? 'Saved' : 'Removed',
      detail: isSaved.value ? 'Vendor saved to your list' : 'Vendor removed from saved list',
      life: 2000,
    });
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please login to save vendors', life: 2000 });
  }
};

const handleImageError = (e) => {
  e.target.style.display = 'none';
};

const handleProfileError = (e) => {
  e.target.style.display = 'none';
};
</script>
