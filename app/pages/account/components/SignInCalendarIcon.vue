<template>
  <!-- 会员签到入口图标（Figma 会员签到 PC 195:7881 / H5 197:12907） -->
  <svg
    class="shrink-0"
    viewBox="0 0 38 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M3.958 15.042h30.084v17.416c0 .875-.709 1.584-1.584 1.584H5.542a1.583 1.583 0 0 1-1.584-1.584V15.042Z"
      stroke="currentColor"
      :stroke-width="strokeWidth"
      stroke-linejoin="round"
    />
    <path
      d="M3.958 7.917c0-.875.709-1.584 1.584-1.584h26.916c.875 0 1.584.709 1.584 1.584v7.125H3.958V7.917Z"
      stroke="currentColor"
      :stroke-width="strokeWidth"
      stroke-linejoin="round"
    />
    <path
      d="m12.667 24.542 4.75 4.75 9.5-9.5"
      stroke="currentColor"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M12.667 3.958v6.334M25.333 3.958v6.334"
      stroke="currentColor"
      :stroke-width="strokeWidth"
      stroke-linecap="round"
    />
  </svg>
</template>

<script setup lang="ts">
/**
 * 图标按 38×38 视窗绘制：PC 端 38px 显示时用 strokeWidth=2（对应设计稿 2px）；
 * H5 端 26px 显示时传 1.5，换算后约等于设计稿的 1px 描边。
 */
withDefaults(defineProps<{ strokeWidth?: number | string }>(), {
  strokeWidth: 2,
})
</script>
