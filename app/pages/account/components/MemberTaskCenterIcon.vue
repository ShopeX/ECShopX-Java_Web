<template>
  <!-- 任务中心入口图标（对齐 Figma 个人中心头部） -->
  <svg
    class="shrink-0"
    viewBox="0 0 38 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <rect
      x="6"
      y="5"
      width="26"
      height="28"
      rx="2"
      stroke="currentColor"
      :stroke-width="strokeWidth"
    />
    <path
      d="M12 13h14M12 19h14M12 25h9"
      stroke="currentColor"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
    />
    <path
      d="m24 23 3 3 5-6"
      stroke="currentColor"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ strokeWidth?: number | string }>(), {
  strokeWidth: 2,
})
</script>
