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

    <!-- 右侧：注册表单面板 -->
    <div class="flex min-h-screen w-full flex-col bg-white lg:w-[560px] lg:shadow-2xl">
      <div class="flex h-full flex-col px-4 pt-8 lg:p-8">
        <!-- 标题栏 -->
        <div class="flex w-full items-center justify-between py-4">
          <h2 class="text-[20px] font-medium leading-5 text-[#191a1d]">
            {{ t('5a21f3db.fe0e8b') }}
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
            {{ t('5a21f3db.199a9d') }}
          </p>

          <!-- 注册方式 -->
          <div class="flex w-full items-center">
            <button
              type="button"
              class="flex-1 border-b pb-2 text-center text-[14px] leading-5 transition-colors"
              :class="
                registerMode === 'phone'
                  ? 'border-b-2 border-[#191a1d] pb-2.5 font-medium text-[#191a1d]'
                  : 'border-transparent font-normal text-[#4a5565]'
              "
              @click="switchRegisterMode('phone')"
            >
              {{ t('5a21f3db.de46a3') }}
            </button>
            <button
              type="button"
              class="flex-1 border-b pb-2 text-center text-[14px] leading-5 transition-colors"
              :class="
                registerMode === 'email'
                  ? 'border-b-2 border-[#191a1d] pb-2.5 font-medium text-[#191a1d]'
                  : 'border-transparent font-normal text-[#4a5565]'
              "
              @click="switchRegisterMode('email')"
            >
              {{ t('5a21f3db.921b9f') }}
            </button>
          </div>

          <!-- 手机注册表单 -->
          <form
            v-if="registerMode === 'phone'"
            class="flex w-full flex-col gap-8"
            autocomplete="off"
            @submit.prevent="handlePhoneRegister"
          >
            <div class="border-b border-[#e5e7eb]">
              <input
                v-model="phoneForm.phone"
                type="tel"
                autocomplete="new-password"
                :placeholder="t('5a21f3db.92448a')"
                class="w-full bg-transparent py-4 text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
            </div>

            <div class="flex items-center justify-between border-b border-[#e5e7eb] pb-px">
              <input
                v-model="phoneForm.captchaCode"
                type="text"
                autocomplete="new-password"
                :placeholder="t('5a21f3db.fcbe6f')"
                class="min-w-0 flex-1 bg-transparent text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
              <button
                type="button"
                class="h-10 w-[101px] shrink-0 overflow-hidden bg-[#f8fafc] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="captchaLoading"
                @click="handleRefreshCaptcha"
              >
                <img
                  v-if="captcha?.imageData"
                  :src="captcha?.imageData"
                  :alt="t('5a21f3db.fcbe6f')"
                  class="h-full w-full object-cover"
                />
                <span
                  v-else
                  class="flex h-full w-full items-center justify-center px-2 text-[12px] text-[#4a5565]"
                >
                  {{ captchaLoading ? t('5a21f3db.ba1a3a') : t('5a21f3db.d369f4') }}
                </span>
              </button>
            </div>

            <div class="flex items-center justify-between border-b border-[#e5e7eb] pb-[17px] pt-4">
              <input
                v-model="phoneForm.code"
                type="text"
                autocomplete="new-password"
                :placeholder="t('5a21f3db.eb76c0')"
                class="min-w-0 flex-1 bg-transparent text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
              <button
                type="button"
                class="ml-4 whitespace-nowrap text-[14px] font-medium leading-5 text-[#191a1d] disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!canSend || isSending"
                @click="handleSendCode"
              >
                <template v-if="isSending">{{ t('5a21f3db.ba1a3a') }}</template>
                <template v-else-if="countdown > 0">
                  {{ t('5a21f3db.5a9c8a', { count: countdown }) }}
                </template>
                <template v-else>{{ t('5a21f3db.d369f4') }}</template>
              </button>
            </div>

            <div class="border-b border-[#e5e7eb] pb-[17px] pt-4">
              <input
                v-model="phoneForm.password"
                type="password"
                autocomplete="new-password"
                :placeholder="t('5a21f3db.209f2b')"
                class="w-full bg-transparent text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
            </div>

            <div class="border-b border-[#e5e7eb] py-4">
              <input
                v-model="phoneForm.confirmPassword"
                type="password"
                autocomplete="new-password"
                :placeholder="t('5a21f3db.8562a6')"
                class="w-full bg-transparent text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
            </div>

            <label class="flex w-full items-center gap-2 text-[12px] leading-4 text-[#4a5565]">
              <input
                v-model="agreedToTerms"
                type="checkbox"
                class="h-4 w-4 shrink-0 cursor-pointer appearance-none border border-[#191a1d] checked:border-[#191a1d] checked:bg-[#191a1d]"
              />
              <span>
                {{ t('5a21f3db.b840cb') }}
                <NuxtLink
                  :to="`${localePath('/protocol' as any)}?type=member_register`"
                  class="underline"
                  target="_blank"
                  >{{ t('5a21f3db.df410b') }}</NuxtLink
                >
                {{ t('5a21f3db.ab20cc') }}
                <NuxtLink
                  :to="`${localePath('/protocol' as any)}?type=privacy`"
                  class="underline"
                  target="_blank"
                  >{{ t('5a21f3db.be8324') }}</NuxtLink
                >
              </span>
            </label>

            <div v-if="error" class="border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {{ error }}
            </div>
            <div
              v-if="successMessage"
              class="border border-green-200 bg-green-50 p-3 text-sm text-green-600"
            >
              {{ successMessage }}
            </div>

            <div class="flex w-full flex-col gap-8">
              <button
                type="submit"
                class="w-full bg-[#0f0f10] py-4 text-center text-[14px] font-medium leading-5 text-white transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isLoading || !agreedToTerms"
              >
                {{ isLoading ? t('5a21f3db.2f4891') : t('5a21f3db.3179ba') }}
              </button>
              <div class="flex items-center justify-center">
                <span class="mr-1 text-[12px] leading-4 text-[#4a5565]">{{
                  t('5a21f3db.c3b432')
                }}</span>
                <button
                  type="button"
                  class="text-[12px] leading-4 text-[#191a1d] underline transition-colors hover:text-gray-600"
                  @click="goToLogin"
                >
                  {{ t('5a21f3db.ed2ff8') }}
                </button>
              </div>
            </div>
          </form>

          <!-- 邮箱注册表单 -->
          <form
            v-if="registerMode === 'email'"
            class="flex w-full flex-col gap-8"
            autocomplete="off"
            @submit.prevent="handleEmailRegister"
          >
            <div class="border-b border-[#e5e7eb]">
              <input
                v-model="emailForm.email"
                type="email"
                autocomplete="new-password"
                :placeholder="t('5a21f3db.b457cd')"
                class="w-full bg-transparent py-4 text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
            </div>

            <div class="flex items-center justify-between border-b border-[#e5e7eb] pb-px">
              <input
                v-model="emailForm.captchaCode"
                type="text"
                autocomplete="new-password"
                :placeholder="t('5a21f3db.e70066')"
                class="min-w-0 flex-1 bg-transparent text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
              <button
                type="button"
                class="h-10 w-[101px] shrink-0 overflow-hidden bg-[#f8fafc] transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="captchaLoading"
                @click="handleRefreshCaptcha"
              >
                <img
                  v-if="captcha?.imageData"
                  :src="captcha?.imageData"
                  :alt="t('5a21f3db.e70066')"
                  class="h-full w-full object-cover"
                />
                <span
                  v-else
                  class="flex h-full w-full items-center justify-center px-2 text-[12px] text-[#4a5565]"
                >
                  {{ captchaLoading ? t('5a21f3db.ba1a3a') : t('5a21f3db.d369f4') }}
                </span>
              </button>
            </div>

            <div class="border-b border-[#e5e7eb] pb-[17px] pt-4">
              <input
                v-model="emailForm.password"
                type="password"
                autocomplete="new-password"
                :placeholder="t('5a21f3db.209f2b')"
                class="w-full bg-transparent text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
            </div>

            <div class="border-b border-[#e5e7eb] py-4">
              <input
                v-model="emailForm.confirmPassword"
                type="password"
                autocomplete="new-password"
                :placeholder="t('5a21f3db.8562a6')"
                class="w-full bg-transparent text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
            </div>

            <label class="flex w-full items-center gap-2 text-[12px] leading-4 text-[#4a5565]">
              <input
                v-model="agreedToTerms"
                type="checkbox"
                class="h-4 w-4 shrink-0 cursor-pointer appearance-none border border-[#191a1d] checked:border-[#191a1d] checked:bg-[#191a1d]"
              />
              <span>
                {{ t('5a21f3db.b840cb') }}
                <NuxtLink
                  :to="`${localePath('/protocol' as any)}?type=member_register`"
                  class="underline"
                  target="_blank"
                  >{{ t('5a21f3db.df410b') }}</NuxtLink
                >
                {{ t('5a21f3db.ab20cc') }}
                <NuxtLink
                  :to="`${localePath('/protocol' as any)}?type=privacy`"
                  class="underline"
                  target="_blank"
                  >{{ t('5a21f3db.be8324') }}</NuxtLink
                >
              </span>
            </label>

            <div v-if="error" class="border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {{ error }}
            </div>
            <div
              v-if="successMessage"
              class="border border-green-200 bg-green-50 p-3 text-sm text-green-600"
            >
              {{ successMessage }}
            </div>

            <div class="flex w-full flex-col gap-8">
              <button
                type="submit"
                class="w-full bg-[#0f0f10] py-4 text-center text-[14px] font-medium leading-5 text-white transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isLoading || !agreedToTerms"
              >
                {{ isLoading ? t('5a21f3db.2f4891') : t('5a21f3db.3179ba') }}
              </button>
              <div class="flex items-center justify-center">
                <span class="mr-1 text-[12px] leading-4 text-[#4a5565]">{{
                  t('5a21f3db.c3b432')
                }}</span>
                <button
                  type="button"
                  class="text-[12px] leading-4 text-[#191a1d] underline transition-colors hover:text-gray-600"
                  @click="goToLogin"
                >
                  {{ t('5a21f3db.ed2ff8') }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useSmsCode } from '~/composables/useSmsCode'
import { AuthTransformer } from '~/infrastructure/transformers'
import { authApiClient } from '~/infrastructure/http/clients'

// 设置页面元信息
definePageMeta({
  layout: 'auth',
})

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const { loginBackgroundUrl } = await useMallGlobalSetting()
const {
  captcha,
  captchaLoading,
  getCaptcha,
  refreshCaptcha,
  error: captchaError,
  clearError: clearCaptchaError,
} = useAuth()

// 使用 Composables
const {
  countdown,
  isSending,
  canSend,
  sendCode: sendSmsCode,
  error: smsError,
  clearError: clearSmsError,
} = useSmsCode()

const registerMode = ref<'phone' | 'email'>('phone')

// 手机注册表单
const phoneForm = reactive({
  phone: '',
  captchaCode: '',
  code: '',
  password: '',
  confirmPassword: '',
})

const emailForm = reactive({
  email: '',
  captchaCode: '',
  password: '',
  confirmPassword: '',
})

// 状态管理
const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')
const agreedToTerms = ref(false)

/**
 * 清除错误信息
 */
function clearError() {
  error.value = ''
  clearSmsError()
  clearCaptchaError()
}

function switchRegisterMode(mode: 'phone' | 'email') {
  registerMode.value = mode
  clearError()
  if (mode === 'phone') {
    phoneForm.captchaCode = ''
    void getCaptcha('sign', 'member')
  }
  if (mode === 'email') {
    emailForm.captchaCode = ''
    void getCaptcha('sign', 'member')
  }
}

function isImageCaptchaError(message: string) {
  return message.includes('图片验证码错误') || message.includes('图形验证码错误')
}

/**
 * 发送验证码
 */
async function handleSendCode() {
  clearError()

  // 验证手机号
  if (!phoneForm.phone) {
    error.value = t('5a21f3db.ff95a4')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    error.value = t('5a21f3db.18d771')
    return
  }

  if (!captcha.value) {
    const captchaSuccess = await getCaptcha('sign', 'member')
    if (!captchaSuccess) {
      error.value = captchaError.value || t('5a21f3db.81340f')
      return
    }
  }

  if (!phoneForm.captchaCode) {
    error.value = t('5a21f3db.e70066')
    return
  }

  // 调用发送验证码 API
  const success = await sendSmsCode(
    phoneForm.phone,
    phoneForm.captchaCode,
    captcha.value?.imageToken || '',
    'sign'
  )

  if (success) {
    // 提示发送成功
    console.log('验证码已发送')
  } else {
    // 显示发送错误
    error.value = smsError.value || t('5a21f3db.227b10')
    if (isImageCaptchaError(error.value)) {
      await handleRefreshCaptcha()
    }
  }
}

async function handleRefreshCaptcha() {
  phoneForm.captchaCode = ''
  emailForm.captchaCode = ''
  await refreshCaptcha('sign', 'member')
  if (captchaError.value) {
    error.value = captchaError.value
  }
}

function validatePasswordFields(password: string, confirmPassword: string) {
  if (!password) {
    error.value = t('5a21f3db.e39ffe')
    return false
  }

  if (password.length < 6) {
    error.value = t('5a21f3db.72ace4')
    return false
  }

  if (!confirmPassword) {
    error.value = t('5a21f3db.a0fcd6')
    return false
  }

  if (password !== confirmPassword) {
    error.value = t('5a21f3db.6046d6')
    return false
  }

  return true
}

function validateAgreement() {
  if (!agreedToTerms.value) {
    error.value = t('5a21f3db.cd83ea')
    return false
  }

  return true
}

async function completeRegister(params: { mobile?: string; password: string; vcode: string }) {
  try {
    isLoading.value = true

    await authApiClient.registerMember({
      mobile: params.mobile,
      password: params.password,
      vcode: params.vcode,
    })

    successMessage.value = t('5a21f3db.d3f909')

    // 延迟跳转到登录页
    setTimeout(() => {
      router.push(localePath('/account/login'))
    }, 1500)
  } catch (err: any) {
    error.value = err.message || t('5a21f3db.bd5372')
    await handleRefreshCaptcha()
    console.error('Register error:', err)
  } finally {
    isLoading.value = false
  }
}

async function completeEmailRegister(params: {
  email: string
  password: string
  passwordConfirmation: string
  token: string
  yzm: string
}) {
  try {
    isLoading.value = true

    await authApiClient.registerEmailMember(params)

    successMessage.value = t('5a21f3db.d3f909')

    // 延迟跳转到登录页
    setTimeout(() => {
      router.push(localePath('/account/login'))
    }, 1500)
  } catch (err: any) {
    error.value = err.message || t('5a21f3db.bd5372')
    if (isImageCaptchaError(error.value)) {
      await handleRefreshCaptcha()
    }
    console.error('Register error:', err)
  } finally {
    isLoading.value = false
  }
}

/**
 * 手机注册
 */
async function handlePhoneRegister() {
  clearError()
  successMessage.value = ''

  // 表单验证
  if (!phoneForm.phone) {
    error.value = t('5a21f3db.ff95a4')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    error.value = t('5a21f3db.18d771')
    return
  }

  if (!phoneForm.code) {
    error.value = t('5a21f3db.d0c06a')
    return
  }

  if (!validatePasswordFields(phoneForm.password, phoneForm.confirmPassword)) return
  if (!validateAgreement()) return

  await completeRegister({
    mobile: phoneForm.phone,
    password: phoneForm.password,
    vcode: phoneForm.code,
  })
}

async function handleEmailRegister() {
  clearError()
  successMessage.value = ''

  if (!emailForm.email) {
    error.value = t('5a21f3db.b457cd')
    return
  }

  if (!AuthTransformer.validateEmail(emailForm.email)) {
    error.value = t('5a21f3db.04154b')
    return
  }

  if (!captcha.value) {
    const captchaSuccess = await getCaptcha('sign', 'member')
    if (!captchaSuccess) {
      error.value = captchaError.value || t('5a21f3db.81340f')
      return
    }
  }

  if (!emailForm.captchaCode) {
    error.value = t('5a21f3db.e70066')
    return
  }

  if (!captcha.value?.imageToken) {
    error.value = t('5a21f3db.81340f')
    return
  }

  if (!validatePasswordFields(emailForm.password, emailForm.confirmPassword)) return
  if (!validateAgreement()) return

  await completeEmailRegister({
    email: emailForm.email,
    password: emailForm.password,
    passwordConfirmation: emailForm.confirmPassword,
    token: captcha.value.imageToken,
    yzm: emailForm.captchaCode,
  })
}

/**
 * 前往登录页面
 */
function goToLogin() {
  router.push(localePath('/account/login'))
}

/**
 * 关闭注册页面
 */
function handleClose() {
  // 返回上一页或首页
  router.back()
}

onMounted(() => {
  if (registerMode.value === 'phone' && !captcha.value) {
    void getCaptcha('sign', 'member')
  }
})
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
