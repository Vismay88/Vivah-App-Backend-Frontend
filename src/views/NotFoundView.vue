<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
    <div class="text-center max-w-md">
      <div class="text-8xl mb-6">💍</div>
      <h1 class="text-6xl font-bold text-orange-600 font-display mb-4">404</h1>
      <h2 class="text-2xl font-bold text-gray-900 mb-3">Page not found</h2>
      <p class="text-gray-500 mb-8">
        Looks like this page wandered off to find its wedding vendor. Let's get you back on track.
      </p>
      <div class="flex gap-3 justify-center">
        <RouterLink to="/">
          <Button label="Go Home" icon="pi pi-home" class="!bg-orange-600 !border-orange-600" />
        </RouterLink>
        <RouterLink to="/vendors">
          <Button label="Find Vendors" icon="pi pi-search" outlined class="!border-orange-300 !text-orange-600" />
        </RouterLink>
      </div>
    </div>
  </div>
</template>
