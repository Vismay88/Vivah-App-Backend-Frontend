<template>
  <footer class="bg-gray-900 text-gray-300">
    <!-- Main Footer -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="lg:col-span-1">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
              <span class="text-white text-lg font-bold">V</span>
            </div>
            <span class="text-xl font-bold text-white font-display">VivahBazaar</span>
          </div>
          <p class="text-sm text-gray-400 leading-relaxed mb-4">
            Gujarat's most trusted wedding vendor marketplace. Find the perfect vendors for your dream wedding.
          </p>
          <div class="flex gap-3">
            <a href="#" class="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-orange-600 transition-colors">
              <i class="pi pi-instagram text-sm"></i>
            </a>
            <a href="#" class="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-orange-600 transition-colors">
              <i class="pi pi-facebook text-sm"></i>
            </a>
            <a href="#" class="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-orange-600 transition-colors">
              <i class="pi pi-youtube text-sm"></i>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-white font-semibold mb-4">Quick Links</h3>
          <ul class="space-y-2">
            <li v-for="link in quickLinks" :key="link.to">
              <RouterLink :to="link.to" class="text-sm text-gray-400 hover:text-orange-400 transition-colors">
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Categories -->
        <div>
          <h3 class="text-white font-semibold mb-4">Vendor Categories</h3>
          <ul class="space-y-2">
            <li v-for="cat in categories" :key="cat">
              <RouterLink :to="`/vendors?category=${cat}`" class="text-sm text-gray-400 hover:text-orange-400 transition-colors">
                {{ cat }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Cities -->
        <div>
          <h3 class="text-white font-semibold mb-4">Top Cities</h3>
          <ul class="space-y-2">
            <li v-for="city in topCities" :key="city">
              <RouterLink :to="`/vendors?city=${city}`" class="text-sm text-gray-400 hover:text-orange-400 transition-colors">
                {{ city }}
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p class="text-xs text-gray-500">
          © 2024 VivahBazaar. Made with ❤️ for Gujarat weddings.
        </p>
        <div class="flex gap-4">
          <a href="#" class="text-xs text-gray-500 hover:text-gray-300">Privacy Policy</a>
          <a href="#" class="text-xs text-gray-500 hover:text-gray-300">Terms of Service</a>
          <a href="#" class="text-xs text-gray-500 hover:text-gray-300">Contact Us</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/vendors', label: 'Find Vendors' },
  { to: '/budget', label: 'Budget Calculator' },
  { to: '/register-vendor', label: 'List Your Business' },
  { to: '/register', label: 'Create Account' },
];

const categories = ['Photography', 'Catering', 'Decoration', 'Mehendi', 'DJ', 'Makeup', 'Venue'];

const topCities = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar'];
</script>
