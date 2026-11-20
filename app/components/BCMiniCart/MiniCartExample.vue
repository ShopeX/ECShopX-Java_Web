<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">MiniCart 组件使用示例</h1>

    <!-- 触发按钮 -->
    <button
      class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      @click="showMiniCart = true"
    >
      打开 Mini 购物车
    </button>

    <!-- Mini 购物车侧边栏 -->
    <USlideover v-model="showMiniCart" side="right">
      <BCMiniCart v-model="showMiniCart" @close="handleClose" />
    </USlideover>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BCMiniCart from './BCMiniCart.vue'

const showMiniCart = ref(false)

/**
 * 处理关闭
 */
function handleClose() {
  console.log('Mini 购物车已关闭')
  showMiniCart.value = false
}
</script>
