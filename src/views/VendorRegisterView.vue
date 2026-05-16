<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-gradient-to-r from-gray-900 to-gray-800 py-12">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="text-4xl mb-3">🏪</div>
        <h1 class="text-3xl font-bold text-white font-display mb-2">List Your Wedding Business</h1>
        <p class="text-gray-300">Get a free profile page and reach thousands of couples in Gujarat</p>
        <div class="flex justify-center gap-6 mt-6">
          <div class="text-center">
            <div class="text-xl font-bold text-orange-400">Free</div>
            <div class="text-xs text-gray-400">Forever</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-orange-400">0%</div>
            <div class="text-xs text-gray-400">Commission</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-bold text-orange-400">5min</div>
            <div class="text-xs text-gray-400">Setup time</div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Already has profile -->
      <div v-if="authStore.isLoggedIn && authStore.isVendor" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div class="text-5xl mb-4">✅</div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">You already have a vendor profile!</h2>
        <p class="text-gray-500 mb-6">Manage and update your existing profile from the dashboard.</p>
        <div class="flex gap-3 justify-center">
          <RouterLink to="/vendor/edit">
            <Button label="Edit Profile" icon="pi pi-pencil" class="!bg-orange-600 !border-orange-600" />
          </RouterLink>
          <RouterLink to="/dashboard">
            <Button label="Dashboard" icon="pi pi-th-large" outlined class="!border-gray-300 !text-gray-700" />
          </RouterLink>
        </div>
      </div>

      <!-- Registration Form -->
      <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <!-- Login prompt if not logged in -->
        <div v-if="!authStore.isLoggedIn" class="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
          <p class="text-sm text-orange-700">
            <i class="pi pi-info-circle mr-1"></i>
            Already have an account?
            <RouterLink to="/login" class="font-semibold underline">Login here</RouterLink>
            to list your business.
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Account Info (if not logged in) -->
          <div v-if="!authStore.isLoggedIn">
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i class="pi pi-user text-orange-500"></i>
              Your Account
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <InputText v-model="form.ownerName" placeholder="Full name" class="w-full" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <InputText v-model="form.email" type="email" placeholder="email@example.com" class="w-full" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <Password v-model="form.password" placeholder="Min 6 characters" class="w-full" :feedback="false" toggleMask />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <InputText v-model="form.phone" placeholder="10-digit mobile number" class="w-full" required />
              </div>
            </div>
            <Divider />
          </div>

          <!-- Business Info -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i class="pi pi-building text-orange-500"></i>
              Business Information
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                <InputText v-model="form.businessName" placeholder="e.g. Moments by Mehul Photography" class="w-full" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <Dropdown
                  v-model="form.category"
                  :options="vendorCategories"
                  placeholder="Select category"
                  class="w-full"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <Dropdown
                  v-model="form.city"
                  :options="gujaratCities"
                  placeholder="Select city"
                  class="w-full"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Business Phone *</label>
                <InputText v-model="form.businessPhone" placeholder="10-digit number" class="w-full" required />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <InputText v-model="form.whatsapp" placeholder="10-digit number" class="w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Starting Price (₹) *</label>
                <InputNumber
                  v-model="form.startingPrice"
                  :min="0"
                  placeholder="e.g. 25000"
                  class="w-full"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <InputNumber v-model="form.yearsOfExperience" :min="0" :max="50" placeholder="e.g. 5" class="w-full" />
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Business Description *</label>
                <Textarea
                  v-model="form.description"
                  placeholder="Describe your services, specialties, and what makes you unique..."
                  rows="4"
                  class="w-full"
                  required
                />
                <p class="text-xs text-gray-400 mt-1">{{ form.description.length }}/2000 characters</p>
              </div>
              <div class="sm:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <InputText v-model="form.address" placeholder="Business address" class="w-full" />
              </div>
            </div>
          </div>

          <!-- Social Links -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <i class="pi pi-share-alt text-orange-500"></i>
              Social Links (Optional)
            </h3>
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

          <!-- Terms -->
          <div class="flex items-start gap-3">
            <Checkbox v-model="agreedToTerms" :binary="true" inputId="terms" />
            <label for="terms" class="text-sm text-gray-600 cursor-pointer">
              I agree to the <a href="#" class="text-orange-600 hover:underline">Terms of Service</a> and confirm that all information provided is accurate.
            </label>
          </div>

          <Button
            type="submit"
            label="Submit My Business"
            icon="pi pi-check"
            class="w-full !bg-orange-600 !border-orange-600 !py-3 !text-base"
            :loading="submitting"
            :disabled="!agreedToTerms"
          />
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useVendorStore } from '@/stores/vendor';
import { useToast } from 'primevue/usetoast';
import { GUJARAT_CITIES, VENDOR_CATEGORIES } from '@/utils/helpers';

const router = useRouter();
const authStore = useAuthStore();
const vendorStore = useVendorStore();
const toast = useToast();

const submitting = ref(false);
const agreedToTerms = ref(false);
const gujaratCities = GUJARAT_CITIES;
const vendorCategories = VENDOR_CATEGORIES;

const form = ref({
  ownerName: '',
  email: '',
  password: '',
  phone: '',
  businessName: '',
  category: null,
  city: null,
  businessPhone: '',
  whatsapp: '',
  startingPrice: null,
  yearsOfExperience: null,
  description: '',
  address: '',
  instagram: '',
  facebook: '',
  youtube: '',
});

const handleSubmit = async () => {
  if (!form.value.businessName || !form.value.category || !form.value.city || !form.value.description || !form.value.startingPrice) {
    toast.add({ severity: 'warn', summary: 'Please fill all required fields', life: 3000 });
    return;
  }

  submitting.value = true;
  try {
    // Register user if not logged in
    if (!authStore.isLoggedIn) {
      await authStore.register({
        name: form.value.ownerName,
        email: form.value.email,
        password: form.value.password,
        phone: form.value.phone,
        role: 'vendor',
      });
    }

    // Create vendor profile
    const vendorData = {
      businessName: form.value.businessName,
      category: form.value.category,
      city: form.value.city,
      phone: form.value.businessPhone || form.value.phone,
      whatsapp: form.value.whatsapp || form.value.businessPhone || form.value.phone,
      startingPrice: form.value.startingPrice,
      yearsOfExperience: form.value.yearsOfExperience || 0,
      description: form.value.description,
      address: form.value.address,
      socialLinks: {
        instagram: form.value.instagram || undefined,
        facebook: form.value.facebook || undefined,
        youtube: form.value.youtube || undefined,
      },
    };

    const vendor = await vendorStore.createVendor(vendorData);

    toast.add({
      severity: 'success',
      summary: 'Business listed successfully!',
      detail: 'Your profile is now live on VivahBazaar',
      life: 4000,
    });

    router.push(`/vendors/${vendor.slug}`);
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Registration failed',
      detail: err.response?.data?.message || err.message,
      life: 4000,
    });
  } finally {
    submitting.value = false;
  }
};
</script>
