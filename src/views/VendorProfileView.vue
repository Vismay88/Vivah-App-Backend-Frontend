<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading -->
    <div v-if="loading" class="max-w-5xl mx-auto px-4 py-8">
      <Skeleton height="20rem" class="rounded-2xl mb-4" />
      <div class="grid grid-cols-3 gap-4">
        <Skeleton height="8rem" class="rounded-xl col-span-2" />
        <Skeleton height="8rem" class="rounded-xl" />
      </div>
    </div>

    <!-- Vendor Profile -->
    <div v-else-if="vendor">
      <!-- Cover Photo -->
      <div class="relative h-64 sm:h-80 bg-gradient-to-br from-orange-200 to-rose-200 overflow-hidden">
        <img
          v-if="vendor.coverPhoto"
          :src="vendor.coverPhoto"
          :alt="vendor.businessName"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <span class="text-8xl opacity-30">{{ getCategoryEmoji(vendor.category) }}</span>
        </div>
        <!-- Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

        <!-- Share & Save buttons -->
        <div class="absolute top-4 right-4 flex gap-2">
          <button
            @click="shareVendor"
            class="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md"
            v-tooltip="'Share'"
          >
            <i class="pi pi-share-alt text-gray-700"></i>
          </button>
          <button
            v-if="authStore.isLoggedIn"
            @click="handleSave"
            class="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-md"
            v-tooltip="isSaved ? 'Saved' : 'Save'"
          >
            <i :class="isSaved ? 'pi pi-heart-fill text-rose-500' : 'pi pi-heart text-gray-700'"></i>
          </button>
        </div>
      </div>

      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-12">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Profile Header Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-start gap-4">
                <!-- Profile Photo -->
                <div class="w-20 h-20 rounded-2xl overflow-hidden bg-orange-50 flex-shrink-0 border-4 border-white shadow-lg">
                  <img
                    v-if="vendor.profilePhoto"
                    :src="vendor.profilePhoto"
                    :alt="vendor.businessName"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-3xl">
                    {{ getCategoryEmoji(vendor.category) }}
                  </div>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h1 class="text-2xl font-bold text-gray-900 font-display">{{ vendor.businessName }}</h1>
                      <div class="flex items-center gap-3 mt-1 flex-wrap">
                        <span
                          class="px-3 py-1 rounded-full text-sm font-medium"
                          :class="getCategoryColor(vendor.category).bg + ' ' + getCategoryColor(vendor.category).text"
                        >
                          {{ getCategoryEmoji(vendor.category) }} {{ vendor.category }}
                        </span>
                        <span class="flex items-center gap-1 text-sm text-gray-500">
                          <i class="pi pi-map-marker text-orange-400"></i>
                          {{ vendor.city }}, Gujarat
                        </span>
                        <div v-if="vendor.isVerified" class="verified-badge px-2 py-1 rounded-full flex items-center gap-1">
                          <i class="pi pi-verified text-white text-xs"></i>
                          <span class="text-white text-xs font-medium">Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Stats Row -->
                  <div class="flex items-center gap-4 mt-3 flex-wrap">
                    <div class="flex items-center gap-1">
                      <i class="pi pi-star-fill text-amber-400"></i>
                      <span class="font-semibold text-gray-800">{{ vendor.averageRating?.toFixed(1) }}</span>
                      <span class="text-gray-400 text-sm">({{ vendor.totalReviews }} reviews)</span>
                    </div>
                    <div v-if="vendor.yearsOfExperience" class="flex items-center gap-1 text-sm text-gray-500">
                      <i class="pi pi-clock text-orange-400"></i>
                      {{ vendor.yearsOfExperience }} years exp
                    </div>
                    <div v-if="vendor.eventsCompleted" class="flex items-center gap-1 text-sm text-gray-500">
                      <i class="pi pi-check-circle text-green-500"></i>
                      {{ vendor.eventsCompleted }}+ events
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tags -->
              <div v-if="vendor.tags?.length" class="flex flex-wrap gap-2 mt-4">
                <Chip
                  v-for="tag in vendor.tags"
                  :key="tag"
                  :label="tag"
                  class="!bg-orange-50 !text-orange-700 !text-xs"
                />
              </div>
            </div>

            <!-- Tabs -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <TabView>
                <!-- About -->
                <TabPanel header="About">
                  <div class="p-4">
                    <p class="text-gray-600 leading-relaxed">{{ vendor.description }}</p>
                    <div v-if="vendor.address" class="mt-4 flex items-start gap-2 text-sm text-gray-500">
                      <i class="pi pi-map-marker text-orange-400 mt-0.5"></i>
                      <span>{{ vendor.address }}</span>
                    </div>
                    <div v-if="vendor.socialLinks" class="flex gap-3 mt-4">
                      <a v-if="vendor.socialLinks.instagram" :href="vendor.socialLinks.instagram" target="_blank"
                        class="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center text-pink-600 hover:bg-pink-100 transition-colors">
                        <i class="pi pi-instagram"></i>
                      </a>
                      <a v-if="vendor.socialLinks.facebook" :href="vendor.socialLinks.facebook" target="_blank"
                        class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
                        <i class="pi pi-facebook"></i>
                      </a>
                      <a v-if="vendor.socialLinks.youtube" :href="vendor.socialLinks.youtube" target="_blank"
                        class="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors">
                        <i class="pi pi-youtube"></i>
                      </a>
                    </div>
                  </div>
                </TabPanel>

                <!-- Portfolio -->
                <TabPanel header="Portfolio">
                  <div class="p-4">
                    <div v-if="vendor.portfolio?.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div
                        v-for="(item, index) in vendor.portfolio"
                        :key="index"
                        class="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-gray-100"
                        @click="openGallery(index)"
                      >
                        <img
                          v-if="item.type === 'image'"
                          :src="item.url"
                          :alt="item.caption || 'Portfolio'"
                          class="w-full h-full object-cover"
                        />
                        <div v-else class="w-full h-full flex items-center justify-center bg-gray-800">
                          <i class="pi pi-play-circle text-white text-3xl"></i>
                        </div>
                      </div>
                    </div>
                    <div v-else class="text-center py-12 text-gray-400">
                      <i class="pi pi-images text-4xl mb-3 block"></i>
                      <p>No portfolio items yet</p>
                    </div>
                  </div>
                </TabPanel>

                <!-- Packages -->
                <TabPanel header="Packages">
                  <div class="p-4">
                    <div v-if="vendor.packages?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div
                        v-for="pkg in vendor.packages"
                        :key="pkg._id"
                        class="rounded-xl border-2 p-5 relative"
                        :class="pkg.isPopular ? 'border-orange-400 bg-orange-50' : 'border-gray-100'"
                      >
                        <div v-if="pkg.isPopular" class="absolute -top-3 left-4">
                          <span class="bg-orange-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
                        </div>
                        <h3 class="font-bold text-gray-900 text-lg mb-1">{{ pkg.name }}</h3>
                        <p class="text-2xl font-bold text-orange-600 mb-2">{{ formatCurrency(pkg.price) }}</p>
                        <p class="text-sm text-gray-500 mb-3">{{ pkg.description }}</p>
                        <ul class="space-y-1.5">
                          <li v-for="feature in pkg.features" :key="feature" class="flex items-center gap-2 text-sm text-gray-600">
                            <i class="pi pi-check-circle text-green-500 text-xs flex-shrink-0"></i>
                            {{ feature }}
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div v-else class="text-center py-12 text-gray-400">
                      <i class="pi pi-tag text-4xl mb-3 block"></i>
                      <p>No packages listed yet. Contact vendor for pricing.</p>
                    </div>
                  </div>
                </TabPanel>

                <!-- Reviews -->
                <TabPanel :header="`Reviews (${vendor.totalReviews})`">
                  <div class="p-4">
                    <!-- Rating Summary -->
                    <div class="flex items-center gap-6 mb-6 p-4 bg-orange-50 rounded-xl">
                      <div class="text-center">
                        <div class="text-4xl font-bold text-gray-900">{{ vendor.averageRating?.toFixed(1) }}</div>
                        <Rating :modelValue="vendor.averageRating" readonly :cancel="false" class="mt-1" />
                        <div class="text-xs text-gray-500 mt-1">{{ vendor.totalReviews }} reviews</div>
                      </div>
                    </div>

                    <!-- Add Review -->
                    <div v-if="authStore.isLoggedIn && !hasUserReviewed" class="mb-6 p-4 border border-gray-100 rounded-xl">
                      <h4 class="font-semibold text-gray-800 mb-3">Write a Review</h4>
                      <div class="mb-3">
                        <label class="text-sm text-gray-600 mb-1 block">Your Rating</label>
                        <Rating v-model="newReview.rating" :cancel="false" />
                      </div>
                      <Textarea
                        v-model="newReview.comment"
                        placeholder="Share your experience..."
                        rows="3"
                        class="w-full"
                      />
                      <Button
                        label="Submit Review"
                        icon="pi pi-send"
                        class="mt-3 !bg-orange-600 !border-orange-600"
                        :loading="submittingReview"
                        @click="submitReview"
                      />
                    </div>

                    <!-- Reviews List -->
                    <div v-if="vendor.reviews?.length" class="space-y-4">
                      <div
                        v-for="review in vendor.reviews"
                        :key="review._id"
                        class="p-4 border border-gray-100 rounded-xl"
                      >
                        <div class="flex items-start justify-between mb-2">
                          <div class="flex items-center gap-2">
                            <Avatar :label="review.userName?.charAt(0)" class="!bg-orange-100 !text-orange-700 !w-9 !h-9" />
                            <div>
                              <p class="font-medium text-gray-800 text-sm">{{ review.userName }}</p>
                              <p class="text-xs text-gray-400">{{ getRelativeTime(review.createdAt) }}</p>
                            </div>
                          </div>
                          <div class="flex items-center gap-1">
                            <i class="pi pi-star-fill text-amber-400 text-xs"></i>
                            <span class="text-sm font-semibold">{{ review.rating }}</span>
                          </div>
                        </div>
                        <p class="text-sm text-gray-600">{{ review.comment }}</p>
                      </div>
                    </div>
                    <div v-else class="text-center py-8 text-gray-400">
                      <i class="pi pi-comment text-4xl mb-3 block"></i>
                      <p>No reviews yet. Be the first to review!</p>
                    </div>
                  </div>
                </TabPanel>
              </TabView>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="space-y-4">
            <!-- Contact Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <div class="text-center mb-4">
                <p class="text-sm text-gray-500">Starting from</p>
                <p class="text-3xl font-bold text-orange-600">{{ formatCurrency(vendor.startingPrice) }}</p>
                <p v-if="vendor.category === 'Catering'" class="text-xs text-gray-400">per plate</p>
              </div>

              <div class="space-y-3">
                <a :href="whatsappLink" target="_blank" class="block">
                  <Button
                    label="WhatsApp"
                    icon="pi pi-whatsapp"
                    class="w-full whatsapp-btn !text-white"
                  />
                </a>
                <a :href="`tel:+91${vendor.phone}`" class="block">
                  <Button
                    label="Call Now"
                    icon="pi pi-phone"
                    outlined
                    class="w-full !border-orange-300 !text-orange-600"
                  />
                </a>
              </div>

              <Divider />

              <!-- Quick Info -->
              <div class="space-y-3">
                <div class="flex items-center gap-2 text-sm">
                  <i class="pi pi-map-marker text-orange-400 w-4"></i>
                  <span class="text-gray-600">{{ vendor.city }}, Gujarat</span>
                </div>
                <div v-if="vendor.phone" class="flex items-center gap-2 text-sm">
                  <i class="pi pi-phone text-orange-400 w-4"></i>
                  <span class="text-gray-600">+91 {{ vendor.phone }}</span>
                </div>
                <div v-if="vendor.email" class="flex items-center gap-2 text-sm">
                  <i class="pi pi-envelope text-orange-400 w-4"></i>
                  <span class="text-gray-600 truncate">{{ vendor.email }}</span>
                </div>
                <div v-if="vendor.website" class="flex items-center gap-2 text-sm">
                  <i class="pi pi-globe text-orange-400 w-4"></i>
                  <a :href="vendor.website" target="_blank" class="text-orange-600 hover:underline truncate">Website</a>
                </div>
              </div>

              <Divider />

              <!-- Share URL -->
              <div>
                <p class="text-xs text-gray-500 mb-2">Share this profile</p>
                <div class="flex gap-2">
                  <InputText :value="shareUrl" readonly class="flex-1 text-xs" />
                  <Button icon="pi pi-copy" outlined size="small" @click="copyShareUrl" v-tooltip="'Copy link'" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-20">
      <div class="text-6xl mb-4">😕</div>
      <h2 class="text-2xl font-bold text-gray-700 mb-2">Vendor not found</h2>
      <RouterLink to="/vendors">
        <Button label="Browse Vendors" class="!bg-orange-600 !border-orange-600 mt-4" />
      </RouterLink>
    </div>

    <!-- Gallery Dialog -->
    <Dialog v-model:visible="galleryVisible" modal :style="{ width: '90vw', maxWidth: '800px' }" :showHeader="false">
      <div class="relative">
        <button @click="galleryVisible = false" class="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center">
          <i class="pi pi-times text-sm"></i>
        </button>
        <img
          v-if="vendor?.portfolio?.[galleryIndex]?.type === 'image'"
          :src="vendor.portfolio[galleryIndex]?.url"
          class="w-full rounded-xl max-h-[80vh] object-contain"
        />
        <div class="flex justify-between mt-3">
          <Button icon="pi pi-chevron-left" text @click="galleryIndex = Math.max(0, galleryIndex - 1)" />
          <span class="text-sm text-gray-500">{{ galleryIndex + 1 }} / {{ vendor?.portfolio?.length }}</span>
          <Button icon="pi pi-chevron-right" text @click="galleryIndex = Math.min(vendor.portfolio.length - 1, galleryIndex + 1)" />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useVendorStore } from '@/stores/vendor';
import { useAuthStore } from '@/stores/auth';
import { useToast } from 'primevue/usetoast';
import {
  formatCurrency, getCategoryEmoji, getCategoryColor,
  getWhatsAppLink, getVendorShareUrl, copyToClipboard, getRelativeTime
} from '@/utils/helpers';

const route = useRoute();
const vendorStore = useVendorStore();
const authStore = useAuthStore();
const toast = useToast();

const vendor = ref(null);
const loading = ref(true);
const galleryVisible = ref(false);
const galleryIndex = ref(0);
const submittingReview = ref(false);
const newReview = ref({ rating: 5, comment: '' });

const isSaved = computed(() => vendor.value && authStore.isVendorSaved(vendor.value._id));
const whatsappLink = computed(() => vendor.value ? getWhatsAppLink(vendor.value.whatsapp || vendor.value.phone, `Hi, I found your profile on VivahBazaar. I'm interested in your ${vendor.value.category} services for my wedding.`) : '#');
const shareUrl = computed(() => vendor.value ? getVendorShareUrl(vendor.value.slug) : '');
const hasUserReviewed = computed(() => {
  if (!authStore.user || !vendor.value?.reviews) return false;
  return vendor.value.reviews.some(r => r.user === authStore.user._id);
});

const openGallery = (index) => {
  galleryIndex.value = index;
  galleryVisible.value = true;
};

const handleSave = async () => {
  try {
    await authStore.toggleSaveVendor(vendor.value._id);
    toast.add({ severity: 'success', summary: isSaved.value ? 'Saved' : 'Removed', life: 2000 });
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Please login first', life: 2000 });
  }
};

const shareVendor = async () => {
  await copyToClipboard(shareUrl.value);
  toast.add({ severity: 'success', summary: 'Link Copied', detail: 'Share link copied to clipboard', life: 2000 });
};

const copyShareUrl = async () => {
  await copyToClipboard(shareUrl.value);
  toast.add({ severity: 'success', summary: 'Copied', life: 1500 });
};

const submitReview = async () => {
  if (!newReview.value.comment.trim()) {
    toast.add({ severity: 'warn', summary: 'Please write a comment', life: 2000 });
    return;
  }
  submittingReview.value = true;
  try {
    await vendorStore.addReview(vendor.value.slug, newReview.value);
    vendor.value = vendorStore.currentVendor;
    newReview.value = { rating: 5, comment: '' };
    toast.add({ severity: 'success', summary: 'Review submitted', life: 2000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: err.response?.data?.message || 'Failed to submit review', life: 3000 });
  } finally {
    submittingReview.value = false;
  }
};

onMounted(async () => {
  try {
    vendor.value = await vendorStore.fetchVendorBySlug(route.params.slug);
    document.title = `${vendor.value.businessName} - VivahBazaar`;
  } catch {
    vendor.value = null;
  } finally {
    loading.value = false;
  }
});
</script>
