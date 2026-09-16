import type { Component } from 'vue'

/// <reference types="nuxt" />

declare module '#app' {
  interface NuxtApp {
    $fetch: typeof import('ofetch').$fetch
    $decorationRegistry: Record<string, Component>
  }
}

declare module '#imports' {
  export * from 'nuxt/app'
}

// 全局可用的 Nuxt Composables
declare global {
  const useAsyncData: (typeof import('nuxt/app'))['useAsyncData']
  const useRoute: (typeof import('nuxt/app'))['useRoute']
  const useRouter: (typeof import('nuxt/app'))['useRouter']
  const useFetch: (typeof import('nuxt/app'))['useFetch']
  const useRuntimeConfig: (typeof import('nuxt/app'))['useRuntimeConfig']
  const defineNuxtPlugin: (typeof import('nuxt/app'))['defineNuxtPlugin']
}

export {}

// 确保 TypeScript 将此文件视为模块
export {}
