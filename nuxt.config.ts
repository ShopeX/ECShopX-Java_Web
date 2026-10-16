import { defineNuxtConfig } from 'nuxt/config'
import {
  DEFAULT_LOCALE_CODE,
  getApiCountryCodeByLocale,
  LOCALE_DEFINITIONS,
} from './app/shared/localeConfig'

const buildEnvLog = Object.fromEntries(
  Object.entries(process.env).filter(([key]) => key.startsWith('NUXT_'))
)

console.log('[Nuxt Config] Build env:', buildEnvLog)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 开发模式配置
  devtools: { enabled: true },

  // 开发服务器配置
  devServer: {
    host: '0.0.0.0',
    port: 3000,
  },

  // Nitro 配置
  nitro: {
    compatibilityDate: '2025-11-07',
  },

  // 兼容性日期（Nuxt 4）
  compatibilityDate: '2025-11-07',

  // 应用配置
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      title: 'ECSHOPX',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
    },
  },

  routeRules: {
    '/?designMode=1': { ssr: false },
  },

  // 源码目录
  srcDir: 'app',

  // 类型检查配置
  typescript: {
    strict: true,
    shim: false,
    typeCheck: false, // 禁用运行时类型检查（避免 vite-plugin-checker 问题）
  },

  // 实验性功能
  experimental: {
    componentIslands: true,
    typedPages: true,
    payloadExtraction: false,
  },

  // 构建配置
  vite: {
    define: {
      'process.env.DEBUG': false,
      global: {},
    },
    resolve: {
      alias: {
        'form-data': 'form-data',
        'node-fetch': 'node-fetch',
      },
    },
    css: {
      // 确保CSS被正确处理
      devSourcemap: true,
    },
    build: {
      // 优化 CSS 代码分割以减少FOUC
      cssCodeSplit: false,
    },
  },

  // 模块配置
  modules: [
    [
      '@nuxt/ui',
      {
        // 禁用 Google Fonts 的预获取
        fonts: false,
      },
    ],
    '@pinia/nuxt', // ✅ 添加 Pinia 模块
    '@nuxtjs/i18n',
  ],

  i18n: {
    lazy: true,
    langDir: '../app/locales',
    locales: LOCALE_DEFINITIONS,
    defaultLocale: DEFAULT_LOCALE_CODE,
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },

  // CSS 配置
  css: ['~/assets/css/main.css'],

  // 优化 CSS 以防止 FOUC
  features: {
    // 内联关键 CSS
    inlineStyles: true,
  },

  // 运行时配置
  runtimeConfig: {
    // 服务端 SSR 请求用（避免经 8080 回环 Nginx 导致死锁）
    apiBaseInternal:
      process.env.NUXT_INTERNAL_API_BASE ||
      process.env.NUXT_API_BASE ||
      '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      companyId: process.env.NUXT_PUBLIC_COMPANY_ID,
      defaultCountryCode:
        process.env.NUXT_PUBLIC_DEFAULT_COUNTRY_CODE ||
        getApiCountryCodeByLocale(DEFAULT_LOCALE_CODE),
      businessMode: process.env.NUXT_PUBLIC_BUSINESS_MODE || 'b2c', // bbc 或 b2c
      decorationAdminOrigins: process.env.NUXT_PUBLIC_DECORATION_ADMIN_ORIGINS || '',
      aiAssistant: process.env.NUXT_PUBLIC_AI_ASSISTANT || '',
      aiBaseUrl: process.env.NUXT_PUBLIC_AI_BASE_URL || '',
      aiAssistantBackendUrl: process.env.NUXT_PUBLIC_AI_ASSISTANT_BACKEND_URL || '',
      aiEmbedPageUrl: process.env.NUXT_PUBLIC_AI_EMBED_PAGE_URL || '',
      aiTenantId: process.env.NUXT_PUBLIC_AI_TENANT_ID || '',
    },
  },

  // 自动导入配置
  imports: {
    dirs: ['composables', 'utils'],
  },

  // 组件自动导入配置
  components: {
    dirs: [
      {
        path: '~/components',
        extensions: ['vue'],
        pattern: '**/*.vue', // 递归扫描所有子目录
        pathPrefix: false,
      },
      '~/templateEngines',
      // DecorationRenderer 等使用的宿主组件在 decoration-engine 下，需参与自动注册
      {
        path: '~/decoration-engine/components',
        extensions: ['vue'],
        pattern: '**/*.vue',
        pathPrefix: false,
      },
    ],
  },
})
