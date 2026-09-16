<template>
  <div class="flex min-h-screen w-full bg-white lg:h-screen">
    <!-- 左侧：产品展示背景 -->
    <div class="relative hidden flex-1 overflow-hidden lg:block">
      <img
        :src="loginBackgroundUrl"
        alt="Background"
        class="absolute inset-0 h-full w-full object-cover"
      />
      <div class="absolute inset-0 bg-[rgba(0,0,0,0.7)]"></div>
    </div>

    <!-- 右侧：登录表单面板 -->
    <div class="flex min-h-screen w-full flex-col bg-white lg:w-[560px] lg:shadow-2xl">
      <div class="flex h-full flex-col px-4 pt-8 lg:p-8">
        <!-- 标题栏 -->
        <div class="flex w-full items-center justify-between py-4">
          <h2 class="text-[20px] font-medium leading-5 text-[#191a1d]">
            {{ t('bbf44084.efae77') }}
          </h2>
          <button
            type="button"
            class="flex h-6 w-6 items-center justify-center text-gray-400 transition-colors hover:text-gray-600"
            @click="handleClose"
          >
            <UIcon name="i-heroicons-x-mark" class="h-6 w-6" />
          </button>
        </div>

        <div class="flex w-full flex-col gap-8 py-8">
          <!-- 说明文字 -->
          <p class="w-full text-[14px] font-normal leading-5 text-[#364153] lg:w-[434px]">
            {{ t('bbf44084.a2e4f4') }}
          </p>

          <!-- 登录方式 -->
          <div class="flex w-full items-center">
            <button
              type="button"
              class="flex-1 border-b pb-2 text-center text-[14px] leading-5 transition-colors"
              :class="
                loginMode === 'phone'
                  ? 'border-b-2 border-[#191a1d] pb-2.5 font-medium text-[#191a1d]'
                  : 'border-transparent font-normal text-[#4a5565]'
              "
              @click="switchLoginMode('phone')"
            >
              {{ t('bbf44084.cbbfff') }}
            </button>
            <button
              type="button"
              class="flex-1 border-b pb-2 text-center text-[14px] leading-5 transition-colors"
              :class="
                loginMode === 'email'
                  ? 'border-b-2 border-[#191a1d] pb-2.5 font-medium text-[#191a1d]'
                  : 'border-transparent font-normal text-[#4a5565]'
              "
              @click="switchLoginMode('email')"
            >
              {{ t('bbf44084.fc2898') }}
            </button>
          </div>

          <!-- 手机号登录表单 -->
          <form
            v-if="loginMode === 'phone'"
            class="flex w-full flex-col gap-8"
            autocomplete="off"
            @submit.prevent="handlePhoneLogin"
          >
            <div class="border-b border-[#e5e7eb]">
              <input
                v-model="phoneForm.phone"
                type="tel"
                name="phone"
                autocomplete="new-password"
                autocorrect="off"
                autocapitalize="off"
                :placeholder="t('bbf44084.92448a')"
                class="w-full bg-transparent py-4 text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
            </div>

            <div class="border-b border-[#e5e7eb] pb-[17px] pt-4">
              <input
                v-model="phoneForm.password"
                type="password"
                name="phone-password"
                autocomplete="new-password"
                :placeholder="t('bbf44084.a81052')"
                class="w-full bg-transparent text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                class="text-[12px] leading-4 text-[#4a5565] transition-colors hover:text-[#191a1d]"
                @click="goToForgotPassword"
              >
                {{ t('a3f7c9d1.forgotPwd') }}
              </button>
            </div>

            <div v-if="error" class="border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {{ error }}
            </div>

            <div class="flex flex-col gap-3">
              <button
                type="submit"
                class="w-full bg-[#0f0f10] py-4 text-center text-[14px] font-medium leading-5 text-white transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isLoading"
              >
                {{ isLoading ? t('bbf44084.04c8f7') : t('bbf44084.402d19') }}
              </button>
              <button
                type="button"
                class="h-[50px] w-full border border-[#0f0f10] bg-white text-center text-[14px] font-medium leading-5 text-[#191a1d] transition-all hover:bg-gray-50"
                @click="goToRegister"
              >
                {{ t('bbf44084.fe0e8b') }}
              </button>
            </div>
          </form>

          <!-- 邮箱登录表单 -->
          <form
            v-if="loginMode === 'email'"
            class="flex w-full flex-col gap-8"
            autocomplete="off"
            @submit.prevent="handleEmailLogin"
          >
            <div class="border-b border-[#e5e7eb]">
              <input
                v-model="emailForm.email"
                type="email"
                name="email"
                autocomplete="new-password"
                autocorrect="off"
                autocapitalize="off"
                :placeholder="t('bbf44084.6ab78f')"
                class="w-full bg-transparent py-4 text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
            </div>

            <div class="border-b border-[#e5e7eb] pb-[17px] pt-4">
              <input
                v-model="emailForm.password"
                type="password"
                name="email-password"
                autocomplete="new-password"
                :placeholder="t('bbf44084.a81052')"
                class="w-full bg-transparent text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                class="text-[12px] leading-4 text-[#4a5565] transition-colors hover:text-[#191a1d]"
                @click="goToForgotPassword"
              >
                {{ t('a3f7c9d1.forgotPwd') }}
              </button>
            </div>

            <div v-if="error" class="border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {{ error }}
            </div>

            <div class="flex flex-col gap-3">
              <button
                type="submit"
                class="w-full bg-[#0f0f10] py-4 text-center text-[14px] font-medium leading-5 text-white transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isLoading"
              >
                {{ isLoading ? t('bbf44084.04c8f7') : t('bbf44084.402d19') }}
              </button>
              <button
                type="button"
                class="h-[50px] w-full border border-[#0f0f10] bg-white text-center text-[14px] font-medium leading-5 text-[#191a1d] transition-all hover:bg-gray-50"
                @click="goToRegister"
              >
                {{ t('bbf44084.fe0e8b') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocalePath } from '#i18n'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useMallGlobalSetting } from '~/composables/useMallGlobalSetting'
import { AuthTransformer } from '~/infrastructure/transformers'
import { stripLocalePrefix } from '~/utils/localeRoute'

// 设置页面元信息
definePageMeta({
  layout: 'auth',
})

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const { loginBackgroundUrl } = await useMallGlobalSetting()

function toLocalePath(path: string) {
  return localePath(path as any)
}

function getSafeRedirectPath() {
  const redirect = router.currentRoute.value.query.redirect
  if (typeof redirect !== 'string') return ''
  if (redirect.startsWith('/') && !redirect.startsWith('//')) return redirect
  return ''
}

function isLoginPath(path: string) {
  return stripLocalePrefix(path).startsWith('/account/login')
}

function isProtectedClosePath(path: string) {
  const normalizedPath = stripLocalePrefix(path)
  return (
    normalizedPath.startsWith('/account') ||
    normalizedPath.startsWith('/member') ||
    normalizedPath.startsWith('/cart') ||
    normalizedPath.startsWith('/order')
  )
}

function isSafeClosePath(path: string) {
  return (
    path.startsWith('/') &&
    !path.startsWith('//') &&
    !isLoginPath(path) &&
    !isProtectedClosePath(path)
  )
}

function getSafeCloseTargetPath() {
  if (!import.meta.client) return ''

  const historyBack = window.history.state?.back
  if (typeof historyBack === 'string' && isSafeClosePath(historyBack)) return historyBack

  if (document.referrer) {
    try {
      const referrerUrl = new URL(document.referrer)
      const currentUrl = new URL(window.location.href)
      const referrerPath = `${referrerUrl.pathname}${referrerUrl.search}${referrerUrl.hash}`
      if (referrerUrl.origin === currentUrl.origin && isSafeClosePath(referrerPath))
        return referrerPath
    } catch {
      return ''
    }
  }

  return ''
}

// 使用 Composables
const { isLoading, error, login, loginWithPhone, clearError } = useAuth()

// 手机密码登录表单
const phoneForm = reactive({
  phone: '',
  password: '',
  remember: false,
})

// 邮箱登录表单
const emailForm = reactive({
  email: '',
  password: '',
})

// 登录模式：phone-手机号登录，email-邮箱登录
const loginMode = ref<'phone' | 'email'>('phone')

/**
 * 手机密码登录
 */
async function handlePhoneLogin() {
  clearError()

  // 简单验证
  if (!phoneForm.phone) {
    error.value = t('bbf44084.ff95a4')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    error.value = t('bbf44084.18d771')
    return
  }

  if (!phoneForm.password) {
    error.value = t('bbf44084.e39ffe')
    return
  }

  // 执行手机密码登录
  const success = await loginWithPhone({
    phone: phoneForm.phone,
    password: phoneForm.password,
  })

  if (success) {
    router.push(getSafeRedirectPath() || toLocalePath('/'))
  }
}

/**
 * 邮箱登录
 */
async function handleEmailLogin() {
  clearError()

  if (!emailForm.email) {
    error.value = t('bbf44084.2ba4c8')
    return
  }

  if (!AuthTransformer.validateEmail(emailForm.email)) {
    error.value = t('bbf44084.6a5f04')
    return
  }

  if (!emailForm.password) {
    error.value = t('bbf44084.e39ffe')
    return
  }

  // 执行邮箱登录，后端使用 username 字段接收登录账号
  // company_id 由 HTTP 插件自动添加
  const success = await login({
    username: emailForm.email,
    password: emailForm.password,
  })

  if (success) {
    router.push(getSafeRedirectPath() || toLocalePath('/'))
  }
}

function switchLoginMode(mode: 'phone' | 'email') {
  loginMode.value = mode
  clearError()
}

/**
 * 前往注册页面
 */
function goToRegister() {
  router.push(toLocalePath('/account/register'))
}

/**
 * 前往忘记密码页面
 */
function goToForgotPassword() {
  router.push(toLocalePath('/account/forgot-password'))
}

/**
 * 关闭登录页面
 */
function handleClose() {
  const closeTargetPath = getSafeCloseTargetPath()
  if (closeTargetPath) {
    router.replace(closeTargetPath)
    return
  }

  router.replace(toLocalePath('/'))
}
</script>

<style scoped>
/* 自定义复选框样式 */
input[type='checkbox']:checked {
  background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
}
</style>
