<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 font-display">
            Welcome, {{ authStore.user?.name?.split(' ')[0] }} 👋
          </h1>
          <p class="text-gray-500 text-sm mt-1">
            <span class="capitalize">{{ authStore.user?.role }}</span> account
          </p>
        </div>
        <RouterLink v-if="authStore.isVendor" to="/vendor/edit">
          <Button label="Edit Profile" icon="pi pi-pencil" outlined class="!border-orange-300 !text-orange-600" />
        </RouterLink>
      </div>

      <!-- Vendor Dashboard -->
      <div v-if="authStore.isVendor">
        <div v-if="loadingVendor" class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Skeleton v-for="i in 3" :key="i" height="6rem" class="rounded-xl" />
        </div>

        <div v-else-if="vendorProfile">
          <!-- Stats -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div class="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <div class="text-2xl font-bold text-orange-600">{{ vendorProfile.viewCount || 0 }}</div>
              <div class="text-xs text-gray-500 mt-1">Profile Views</div>
            </div>
            <div class="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <div class="text-2xl font-bold text-orange-600">{{ vendorProfile.totalReviews || 0 }}</div>
              <div class="text-xs text-gray-500 mt-1">Reviews</div>
            </div>
            <div class="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <div class="text-2xl font-bold text-orange-600">{{ vendorProfile.averageRating?.toFixed(1) || '0.0' }}</div>
              <div class="text-xs text-gray-500 mt-1">Avg Rating</div>
            </div>
            <div class="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <div class="text-2xl font-bold text-orange-600">{{ vendorProfile.portfolio?.length || 0 }}</div>
              <div class="text-xs text-gray-500 mt-1">Portfolio Items</div>
            </div>
          </div>

          <!-- Profile Card -->
          <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                <img v-if="vendorProfile.profilePhoto" :src="vendorProfile.profilePhoto" class="w-full h-full object-cover" />
                <span v-else>{{ getCategoryEmoji(vendorProfile.category) }}</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h2 class="font-bold text-gray-900 text-lg">{{ vendorProfile.businessName }}</h2>
                  <div v-if="vendorProfile.isVerified" class="verified-badge px-2 py-0.5 rounded-full flex items-center gap-1">
                    <i class="pi pi-verified text-white text-xs"></i>
                    <span class="text-white text-xs">Verified</span>
                  </div>
                </div>
                <p class="text-sm text-gray-500">{{ vendorProfile.category }} · {{ vendorProfile.city }}</p>
                <p class="text-sm text-gray-600 mt-2 line-clamp-2">{{ vendorProfile.description }}</p>
              </div>
            </div>
            <div class="flex gap-3 mt-4 flex-wrap">
              <RouterLink :to="`/vendors/${vendorProfile.slug}`">
                <Button label="View Public Profile" icon="pi pi-eye" outlined size="small" class="!border-orange-300 !text-orange-600" />
              </RouterLink>
              <RouterLink to="/vendor/edit">
                <Button label="Edit Profile" icon="pi pi-pencil" size="small" class="!bg-orange-600 !border-orange-600" />
              </RouterLink>
              <Button
                label="Copy Profile Link"
                icon="pi pi-copy"
                outlined
                size="small"
                class="!border-gray-300 !text-gray-600"
                @click="copyProfileLink"
              />
            </div>
          </div>
        </div>

        <div v-else class="bg-white rounded-2xl border border-gray-100 p-8 text-center mb-6">
          <div class="text-5xl mb-4">🏪</div>
          <h3 class="font-bold text-gray-900 mb-2">Complete your vendor profile</h3>
          <p class="text-gray-500 text-sm mb-4">Set up your business profile to start receiving inquiries</p>
          <RouterLink to="/register-vendor">
            <Button label="Create Vendor Profile" icon="pi pi-plus" class="!bg-orange-600 !border-orange-600" />
          </RouterLink>
        </div>
      </div>

      <!-- Couple Dashboard -->
      <div v-else>
        <!-- Saved Vendors -->
        <div class="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i class="pi pi-heart text-rose-500"></i>
            Saved Vendors
          </h2>
          <div v-if="authStore.user?.savedVendors?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="vendor in authStore.user.savedVendors"
              :key="vendor._id || vendor"
              class="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-orange-200 cursor-pointer"
              @click="$router.push(`/vendors/${vendor.slug}`)"
            >
              <div class="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img v-if="vendor.profilePhoto" :src="vendor.profilePhoto" class="w-full h-full object-cover" />
                <span v-else>{{ getCategoryEmoji(vendor.category) }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-800 text-sm truncate">{{ vendor.businessName }}</p>
                <p class="text-xs text-gray-400">{{ vendor.category }} · {{ vendor.city }}</p>
              </div>
              <i class="pi pi-arrow-right text-gray-300 text-sm"></i>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-400">
            <i class="pi pi-heart text-3xl mb-2 block"></i>
            <p class="text-sm">No saved vendors yet</p>
            <RouterLink to="/vendors">
              <Button label="Browse Vendors" text size="small" class="!text-orange-600 mt-2" />
            </RouterLink>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RouterLink to="/vendors" class="block">
            <div class="bg-white rounded-xl border border-gray-100 p-5 hover:border-orange-200 transition-colors cursor-pointer">
              <div class="text-2xl mb-2">🔍</div>
              <h3 class="font-semibold text-gray-800 text-sm">Find Vendors</h3>
              <p class="text-xs text-gray-400 mt-1">Browse all wedding vendors</p>
            </div>
          </RouterLink>
          <RouterLink to="/budget" class="block">
            <div class="bg-white rounded-xl border border-gray-100 p-5 hover:border-orange-200 transition-colors cursor-pointer">
              <div class="text-2xl mb-2">💰</div>
              <h3 class="font-semibold text-gray-800 text-sm">Budget Planner</h3>
              <p class="text-xs text-gray-400 mt-1">Plan your wedding budget</p>
            </div>
          </RouterLink>
          <RouterLink to="/register-vendor" class="block">
            <div class="bg-white rounded-xl border border-gray-100 p-5 hover:border-orange-200 transition-colors cursor-pointer">
              <div class="text-2xl mb-2">🏪</div>
              <h3 class="font-semibold text-gray-800 text-sm">List Your Business</h3>
              <p class="text-xs text-gray-400 mt-1">Are you a vendor?</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useVendorStore } from '@/stores/vendor';
import { useToast } from 'primevue/usetoast';
import { getCategoryEmoji, copyToClipboard } from '@/utils/helpers';

const authStore = useAuthStore();
const vendorStore = useVendorStore();
const toast = useToast();

const vendorProfile = ref(null);
const loadingVendor = ref(false);

const copyProfileLink = async () => {
  if (vendorProfile.value) {
    await copyToClipboard(`${window.location.origin}/vendors/${vendorProfile.value.slug}`);
    toast.add({ severity: 'success', summary: 'Link copied!', life: 2000 });
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
