<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-3 mb-6">
        <RouterLink to="/dashboard">
          <Button icon="pi pi-arrow-left" text class="!text-gray-600" />
        </RouterLink>
        <h1 class="text-2xl font-bold text-gray-900 font-display">Edit Vendor Profile</h1>
      </div>

      <div v-if="loading" class="space-y-4">
        <Skeleton height="4rem" class="rounded-xl" />
        <Skeleton height="20rem" class="rounded-xl" />
      </div>

      <div v-else-if="vendor" class="space-y-6">
        <!-- Basic Info -->
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 class="font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
              <InputText v-model="form.businessName" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Dropdown v-model="form.category" :options="vendorCategories" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
              <Dropdown v-model="form.city" :options="gujaratCities" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <InputText v-model="form.phone" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <InputText v-model="form.whatsapp" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Starting Price (₹) *</label>
              <InputNumber v-model="form.startingPrice" :min="0" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <InputNumber v-model="form.yearsOfExperience" :min="0" :max="50" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Events Completed</label>
              <InputNumber v-model="form.eventsCompleted" :min="0" class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <InputText v-model="form.email" type="email" class="w-full" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <InputText v-model="form.address" class="w-full" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <Textarea v-model="form.description" rows="4" class="w-full" />
            </div>
          </div>
        </div>

        <!-- Photos -->
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 class="font-semibold text-gray-900 mb-4">Photos</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Profile Photo URL</label>
              <InputText v-model="form.profilePhoto" placeholder="https://..." class="w-full" />
              <div v-if="form.profilePhoto" class="mt-2 w-16 h-16 rounded-xl overflow-hidden">
                <img :src="form.profilePhoto" class="w-full h-full object-cover" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cover Photo URL</label>
              <InputText v-model="form.coverPhoto" placeholder="https://..." class="w-full" />
              <div v-if="form.coverPhoto" class="mt-2 w-full h-20 rounded-xl overflow-hidden">
                <img :src="form.coverPhoto" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <!-- Social Links -->
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 class="font-semibold text-gray-900 mb-4">Social Links</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <InputText v-model="form.instagram" placeholder="https://instagram.com/..." class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <InputText v-model="form.facebook" placeholder="https://facebook.com/..." class="w-full" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
              <InputText v-model="form.youtube" placeholder="https://youtube.com/..." class="w-full" />
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div class="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 class="font-semibold text-gray-900 mb-4">Tags</h2>
          <div class="flex flex-wrap gap-2 mb-3">
            <Chip
              v-for="tag in form.tags"
              :key="tag"
              :label="tag"
              removable
              @remove="removeTag(tag)"
              class="!bg-orange-50 !text-orange-700"
            />
          </div>
          <div class="flex gap-2">
            <InputText v-model="newTag" placeholder="Add a tag..." class="flex-1" @keyup.enter="addTag" />
            <Button icon="pi pi-plus" outlined @click="addTag" class="!border-orange-300 !text-orange-600" />
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex gap-3">
          <Button
            label="Save Changes"
            icon="pi pi-save"
            class="!bg-orange-600 !border-orange-600"
            :loading="saving"
            @click="saveChanges"
          />
          <RouterLink to="/dashboard">
            <Button label="Cancel" outlined class="!border-gray-300 !text-gray-600" />
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVendorStore } from '@/stores/vendor';
import { useToast } from 'primevue/usetoast';
import { GUJARAT_CITIES, VENDOR_CATEGORIES } from '@/utils/helpers';

const router = useRouter();
const vendorStore = useVendorStore();
const toast = useToast();

const vendor = ref(null);
const loading = ref(true);
const saving = ref(false);
const newTag = ref('');
const gujaratCities = GUJARAT_CITIES;
const vendorCategories = VENDOR_CATEGORIES;

const form = ref({
  businessName: '',
  category: '',
  city: '',
  phone: '',
  whatsapp: '',
  email: '',
  startingPrice: 0,
  yearsOfExperience: 0,
  eventsCompleted: 0,
  description: '',
  address: '',
  profilePhoto: '',
  coverPhoto: '',
  instagram: '',
  facebook: '',
  youtube: '',
  tags: [],
});

const addTag = () => {
  const tag = newTag.value.trim().toLowerCase();
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag);
  }
  newTag.value = '';
};

const removeTag = (tag) => {
  form.value.tags = form.value.tags.filter(t => t !== tag);
};

const saveChanges = async () => {
  saving.value = true;
  try {
    const updateData = {
      businessName: form.value.businessName,
      category: form.value.category,
      city: form.value.city,
      phone: form.value.phone,
      whatsapp: form.value.whatsapp,
      email: form.value.email,
      startingPrice: form.value.startingPrice,
      yearsOfExperience: form.value.yearsOfExperience,
      eventsCompleted: form.value.eventsCompleted,
      description: form.value.description,
      address: form.value.address,
      profilePhoto: form.value.profilePhoto || null,
      coverPhoto: form.value.coverPhoto || null,
      tags: form.value.tags,
      socialLinks: {
        instagram: form.value.instagram || undefined,
        facebook: form.value.facebook || undefined,
        youtube: form.value.youtube || undefined,
      },
    };

    await vendorStore.updateVendor(vendor.value._id, updateData);
    toast.add({ severity: 'success', summary: 'Profile updated!', life: 3000 });
    router.push('/dashboard');
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Failed to update', detail: err.response?.data?.message, life: 3000 });
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  try {
    vendor.value = await vendorStore.getMyVendorProfile();
    form.value = {
      businessName: vendor.value.businessName || '',
      category: vendor.value.category || '',
      city: vendor.value.city || '',
      phone: vendor.value.phone || '',
      whatsapp: vendor.value.whatsapp || '',
      email: vendor.value.email || '',
      startingPrice: vendor.value.startingPrice || 0,
      yearsOfExperience: vendor.value.yearsOfExperience || 0,
      eventsCompleted: vendor.value.eventsCompleted || 0,
      description: vendor.value.description || '',
      address: vendor.value.address || '',
      profilePhoto: vendor.value.profilePhoto || '',
      coverPhoto: vendor.value.coverPhoto || '',
      instagram: vendor.value.socialLinks?.instagram || '',
      facebook: vendor.value.socialLinks?.facebook || '',
      youtube: vendor.value.socialLinks?.youtube || '',
      tags: vendor.value.tags || [],
    };
  } catch {
    router.push('/dashboard');
  } finally {
    loading.value = false;
  }
});
</script>
