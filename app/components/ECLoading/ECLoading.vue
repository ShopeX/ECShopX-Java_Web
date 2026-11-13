<template>
  <div class="loading-container">
    <svg class="loading-spinner" viewBox="0 0 50 50">
      <circle class="loading-circle" cx="25" cy="25" r="20"></circle>
    </svg>
    <p v-if="showText" class="loading-text">{{ displayText }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** 是否显示文字 */
  showText?: boolean
  /** 加载文字 */
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  showText: false,
  text: undefined,
})
const { t } = useI18n()
const displayText = computed(() => props.text || t('73a71897.f013ea'))
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
}

/* Loading Spinner */
.loading-spinner {
  width: 3.25em;
  transform-origin: center;
  animation: rotate 2s linear infinite;
}

.loading-circle {
  fill: none;
  stroke: #000000;
  stroke-width: 2;
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  stroke-linecap: round;
  animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 90, 200;
    stroke-dashoffset: -35px;
  }

  100% {
    stroke-dashoffset: -125px;
  }
}

/* 加载文字 */
.loading-text {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}
</style>
