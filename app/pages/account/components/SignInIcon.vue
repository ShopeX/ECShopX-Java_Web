<template>
  <!--
    会员签到页图标（Figma 会员签到 199:12931 / 199:12932）
    - check ：已签到实心圆勾（20×20，icon/check_circle）
    - missed：漏签空心圆（21×21，Frame 2，固定色）
    - boxes ：奖励礼盒（18×18 / 15×15，Frame）
    - coupon：优惠券（15×15，Frame）
    - close / chevronLeft / chevronRight：弹框关闭与翻页（24×24 / 16×16）
    - arrowRight：奖励行尾的小箭头（5×9）
    尺寸由调用方通过 class 指定，颜色除 missed 外都走 currentColor。
  -->
  <svg
    v-if="name === 'check'"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M10 2.5C14.1421 2.5 17.5 5.85786 17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5ZM8.52539 11.2666L6.5918 9.3252L5.3584 10.5586L8.52539 13.7334L14.6338 7.6084L13.4004 6.375L8.52539 11.2666Z"
      fill="currentColor"
    />
  </svg>

  <svg
    v-else-if="name === 'missed'"
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="10.5" cy="10.5" r="7.5" fill="#F2F2F2" stroke="#DADADA" />
  </svg>

  <svg
    v-else-if="name === 'close'"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <g stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 6L6 18" />
      <path d="M6 6L18 18" />
    </g>
  </svg>

  <svg
    v-else-if="name === 'chevronLeft' || name === 'chevronRight'"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      :d="name === 'chevronLeft' ? 'M10 12L6 8L10 4' : 'M6 12L10 8L6 4'"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>

  <svg
    v-else-if="name === 'boxes'"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path
        d="M9 3.75C9 4.78553 7.32107 5.625 5.25 5.625C3.17893 5.625 1.5 4.78553 1.5 3.75C1.5 2.71447 3.17893 1.875 5.25 1.875C7.32107 1.875 9 2.71447 9 3.75Z"
      />
      <path
        d="M1.5 3.75V6.375C1.5 7.41053 3.17893 8.25 5.25 8.25C7.32105 8.25 9 7.41053 9 6.375V3.75"
      />
      <path
        d="M1.5 6.375V9C1.5 10.0355 3.17893 10.875 5.25 10.875C7.32105 10.875 9 10.0355 9 9V6.375"
      />
      <path
        d="M1.5 9V11.625C1.5 12.6605 3.17893 13.5 5.25 13.5C7.32105 13.5 9 12.6605 9 11.625V9"
      />
      <path
        d="M1.5 11.625V14.25C1.5 15.2855 3.17893 16.125 5.25 16.125C7.32105 16.125 9 15.2855 9 14.25V11.625"
      />
      <path
        d="M16.5 9C16.5 10.0355 14.8211 10.875 12.75 10.875C10.6789 10.875 9 10.0355 9 9C9 7.96447 10.6789 7.125 12.75 7.125C14.8211 7.125 16.5 7.96447 16.5 9Z"
      />
      <path
        d="M9 9V11.625C9 12.6605 10.679 13.5 12.75 13.5C14.8211 13.5 16.5 12.6605 16.5 11.625V9"
      />
      <path
        d="M9 11.625V14.25C9 15.2855 10.679 16.125 12.75 16.125C14.8211 16.125 16.5 15.2855 16.5 14.25V11.625"
      />
    </g>
  </svg>

  <svg
    v-else-if="name === 'arrowRight'"
    viewBox="0 0 5 9"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <path
      d="M0.5 0.5L4.5 4.5L0.5 8.5"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2.81254 5.00003L10.625 1.87503L11.8751 5.00003" />
      <path
        d="M1.25 5H13.75V6.875C12.8125 6.875 11.875 7.5 11.875 8.59375C11.875 9.6875 12.8125 10.625 13.75 10.625V12.5H1.25V10.625C2.18755 10.625 3.125 10 3.125 8.75C3.125 7.5 2.1875 6.875 1.25 6.875V5Z"
      />
      <path d="M5.3125 7.93275H7.1875" />
      <path d="M5.3125 9.80775H9.6875" />
    </g>
  </svg>
</template>

<script setup lang="ts">
defineOptions({ name: 'SignInIcon' })

defineProps<{
  /** 图标名称 */
  name:
    | 'check'
    | 'missed'
    | 'boxes'
    | 'coupon'
    | 'close'
    | 'chevronLeft'
    | 'chevronRight'
    | 'arrowRight'
}>()
</script>
