<template>
  <USlideover v-model="isOpen" :ui="{ width: 'w-screen max-w-md' }">
    <div class="flex flex-col h-full bg-white shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-6 sm:px-6 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">Your cart</h2>
        <button type="button" class="text-gray-400 hover:text-gray-500" @click="closeCart">
          <span class="sr-only">Close panel</span>
          <UIcon name="i-heroicons-x-mark" class="h-6 w-6" />
        </button>
      </div>

      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div v-if="cartUIStore.loading && !cartStore.initialized" class="flex justify-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
        </div>

        <div
          v-else-if="cartStore.items.length === 0"
          class="flex flex-col items-center justify-center h-full text-gray-500"
        >
          <UIcon name="i-heroicons-shopping-bag" class="h-12 w-12 mb-4 text-gray-300" />
          <p>Your cart is empty</p>
          <button
            class="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            @click="closeCart"
          >
            Continue Shopping
          </button>
        </div>

        <ul v-else role="list" class="-my-6 divide-y divide-gray-200">
          <li v-for="item in cartStore.items" :key="item.id" class="flex py-6">
            <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
              <img
                :src="item.productImage"
                :alt="item.productName"
                class="h-full w-full object-cover object-center"
              />
            </div>

            <div class="ml-4 flex flex-1 flex-col">
              <div>
                <BCProductMarketingTags :tags="item.marketingTags" placement="inline" />
                <div class="flex justify-between text-base font-medium text-gray-900">
                  <h3>
                    <NuxtLink :to="`/products/${item.productId}`" @click="closeCart">{{
                      item.productName
                    }}</NuxtLink>
                  </h3>
                  <p class="ml-4">{{ item.price.display }}</p>
                </div>
                <p class="mt-1 text-sm text-gray-500">{{ item.specName }}</p>
              </div>
              <div class="flex flex-1 items-end justify-between text-sm">
                <div class="flex items-center border border-gray-300 rounded">
                  <button
                    type="button"
                    class="px-2 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    :disabled="item.quantity.value <= 1 || cartUIStore.isActionLoading(item.id)"
                    @click="cartStore.updateQuantity(item.id, item.quantity.value - 1)"
                  >
                    −
                  </button>
                  <span class="px-2 text-gray-900 min-w-[1.5rem] text-center">{{
                    item.quantity.value
                  }}</span>
                  <button
                    type="button"
                    class="px-2 py-1 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    :disabled="cartUIStore.isActionLoading(item.id)"
                    @click="cartStore.updateQuantity(item.id, item.quantity.value + 1)"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  class="font-medium text-gray-400 hover:text-gray-500"
                  :disabled="cartUIStore.isActionLoading(item.id)"
                  @click="cartStore.removeItem(item.id)"
                >
                  <UIcon
                    v-if="cartUIStore.isActionLoading(item.id)"
                    name="i-heroicons-arrow-path"
                    class="h-5 w-5 animate-spin"
                  />
                  <UIcon v-else name="i-heroicons-trash" class="h-5 w-5" />
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Footer -->
      <div v-if="cartStore.items.length > 0" class="border-t border-gray-200 px-4 py-6 sm:px-6">
        <div class="flex justify-between text-base font-medium text-gray-900">
          <p>Estimated total</p>
          <p>${{ cartStore.estimatedTotal.toFixed(2) }} USD</p>
        </div>
        <p class="mt-0.5 text-sm text-gray-500">
          Taxes, discounts and shipping calculated at checkout.
        </p>
        <div class="mt-6">
          <NuxtLink
            to="/cart"
            class="flex w-full items-center justify-center rounded-md border border-transparent bg-[#ea580c] px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-[#c2410c] transition-colors"
            @click="closeCart"
          >
            Check out • ${{ cartStore.estimatedTotal.toFixed(2) }}
          </NuxtLink>
        </div>
        <div class="mt-3">
          <button
            class="flex w-full items-center justify-center rounded-md bg-black px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-gray-800 transition-colors gap-2"
          >
            <UIcon name="i-simple-icons-google" class="w-4 h-4" />
            Made with Genstore
          </button>
        </div>
      </div>
    </div>
  </USlideover>
</template>

<script setup lang="ts">
import BCProductMarketingTags from '~/components/BCProductMarketingTags/BCProductMarketingTags.vue'
const cartUIStore = useCartUIStore()
const cartStore = useCartStore()

const isOpen = computed({
  get: () => cartUIStore.isOpen,
  set: (value) => {
    if (value) cartUIStore.open()
    else cartUIStore.close()
  },
})

const closeCart = () => {
  cartUIStore.close()
}
</script>
