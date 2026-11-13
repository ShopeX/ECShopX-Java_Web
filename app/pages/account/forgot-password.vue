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

    <!-- 右侧：找回密码表单面板 -->
    <div class="flex min-h-screen w-full flex-col bg-white lg:w-[560px] lg:shadow-2xl">
      <div class="flex h-full flex-col px-4 pt-8 lg:p-8">
        <!-- 标题栏 -->
        <div class="flex w-full items-center justify-between py-4">
          <h2 class="text-[20px] font-medium leading-5 text-[#191a1d]">
            {{ t('a3f7c9d1.title') }}
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
            {{ t('a3f7c9d1.desc') }}
          </p>

          <!-- 找回密码表单 -->
          <form
            class="flex w-full flex-col gap-8"
            autocomplete="off"
            @submit.prevent="handleSubmit"
          >
            <!-- 手机号 -->
            <div class="border-b border-[#e5e7eb]">
              <input
                v-model="form.phone"
                type="tel"
                autocomplete="new-password"
                autocorrect="off"
                autocapitalize="off"
                :placeholder="t('a3f7c9d1.phonePlaceholder')"
                class="w-full bg-transparent py-4 text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
            </div>

            <!-- 图片验证码 -->
            <div class="flex items-center justify-between border-b border-[#e5e7eb] pb-px">
              <input
                v-model="form.captchaCode"
                type="text"
                autocomplete="new-password"
                :placeholder="t('a3f7c9d1.captchaPlaceholder')"
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
                  :alt="t('a3f7c9d1.captchaPlaceholder')"
                  class="h-full w-full object-contain"
                />
                <span
                  v-else
                  class="flex h-full w-full items-center justify-center px-2 text-[12px] text-[#4a5565]"
                >
                  {{ captchaLoading ? t('a3f7c9d1.sending') : t('a3f7c9d1.getCode') }}
                </span>
              </button>
            </div>

            <!-- 短信验证码 -->
            <div class="flex items-center justify-between border-b border-[#e5e7eb] pb-[17px] pt-4">
              <input
                v-model="form.smsCode"
                type="text"
                autocomplete="new-password"
                :placeholder="t('a3f7c9d1.smsPlaceholder')"
                class="min-w-0 flex-1 bg-transparent text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
              <button
                type="button"
                class="ml-4 whitespace-nowrap text-[14px] font-medium leading-5 text-[#191a1d] disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="!canSend || isSending"
                @click="handleSendCode"
              >
                <template v-if="isSending">{{ t('a3f7c9d1.sending') }}</template>
                <template v-else-if="countdown > 0">
                  {{ t('a3f7c9d1.countdown', { count: countdown }) }}
                </template>
                <template v-else>{{ t('a3f7c9d1.getCode') }}</template>
              </button>
            </div>

            <!-- 新密码 -->
            <div class="border-b border-[#e5e7eb] pb-[17px] pt-4">
              <input
                v-model="form.password"
                type="password"
                autocomplete="new-password"
                :placeholder="t('a3f7c9d1.newPwd')"
                class="w-full bg-transparent text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
            </div>

            <!-- 确认密码 -->
            <div class="border-b border-[#e5e7eb] py-4">
              <input
                v-model="form.confirmPassword"
                type="password"
                autocomplete="new-password"
                :placeholder="t('a3f7c9d1.confirmPwd')"
                class="w-full bg-transparent text-[14px] font-normal leading-5 text-[#4a5565] outline-none placeholder-[#4a5565]"
              />
            </div>

            <!-- 错误提示 -->
            <div v-if="error" class="border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {{ error }}
            </div>
            <!-- 成功提示 -->
            <div
              v-if="successMessage"
              class="border border-green-200 bg-green-50 p-3 text-sm text-green-600"
            >
              {{ successMessage }}
            </div>

            <!-- 提交按钮 -->
            <div class="flex w-full flex-col gap-8">
              <button
                type="submit"
                class="w-full bg-[#0f0f10] py-4 text-center text-[14px] font-medium leading-5 text-white transition-all hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isLoading"
              >
                {{ isLoading ? t('a3f7c9d1.submitting') : t('a3f7c9d1.submit') }}
              </button>
              <div class="flex items-center justify-center">
                <button
                  type="button"
                  class="text-[12px] leading-4 text-[#191a1d] underline transition-colors hover:text-gray-600"
                  @click="goToLogin"
                >
                  {{ t('a3f7c9d1.backToLogin') }}
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
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useSmsCode } from '~/composables/useSmsCode'
import { authApiClient } from '~/infrastructure/http/clients'

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
const {
  captcha,
  captchaLoading,
  getCaptcha,
  refreshCaptcha,
  error: captchaError,
  clearError: clearCaptchaError,
} = useAuth()

const {
  countdown,
  isSending,
  canSend,
  sendCode: sendSmsCode,
  error: smsError,
  clearError: clearSmsError,
} = useSmsCode()

const form = reactive({
  phone: '',
  captchaCode: '',
  smsCode: '',
  password: '',
  confirmPassword: '',
})

const isLoading = ref(false)
const error = ref('')
const successMessage = ref('')

function clearError() {
  error.value = ''
  clearSmsError()
  clearCaptchaError()
}

function isImageCaptchaError(message: string) {
  return message.includes('图片验证码错误') || message.includes('图形验证码错误')
}

async function handleRefreshCaptcha() {
  form.captchaCode = ''
  await refreshCaptcha('forgot_password', 'member')
  if (captchaError.value) {
    error.value = captchaError.value
  }
}

async function handleSendCode() {
  clearError()

  if (!form.phone) {
    error.value = t('a3f7c9d1.phonePlaceholder')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    error.value = t('a3f7c9d1.phoneError')
    return
  }

  if (!captcha.value) {
    const captchaSuccess = await getCaptcha('forgot_password', 'member')
    if (!captchaSuccess) {
      error.value = captchaError.value || t('a3f7c9d1.getCaptchaFail')
      return
    }
  }

  if (!form.captchaCode) {
    error.value = t('a3f7c9d1.inputCaptcha')
    return
  }

  const success = await sendSmsCode(
    form.phone,
    form.captchaCode,
    captcha.value?.imageToken || '',
    'forgot_password'
  )

  if (!success) {
    error.value = smsError.value || t('a3f7c9d1.sendSmsFail')
    if (isImageCaptchaError(error.value)) {
      await handleRefreshCaptcha()
    }
  }
}

async function handleSubmit() {
  clearError()
  successMessage.value = ''

  if (!form.phone) {
    error.value = t('a3f7c9d1.phonePlaceholder')
    return
  }

  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    error.value = t('a3f7c9d1.phoneError')
    return
  }

  if (!form.smsCode) {
    error.value = t('a3f7c9d1.inputSms')
    return
  }

  if (!form.password) {
    error.value = t('a3f7c9d1.inputPwd')
    return
  }

  if (form.password.length < 6) {
    error.value = t('a3f7c9d1.pwdLength')
    return
  }

  if (!form.confirmPassword) {
    error.value = t('a3f7c9d1.inputConfirmPwd')
    return
  }

  if (form.password !== form.confirmPassword) {
    error.value = t('a3f7c9d1.pwdMismatch')
    return
  }

  try {
    isLoading.value = true

    await authApiClient.forgotPassword({
      mobile: form.phone,
      password: form.password,
      vcode: form.smsCode,
    })

    successMessage.value = t('a3f7c9d1.success')

    setTimeout(() => {
      router.push(toLocalePath('/account/login'))
    }, 1500)
  } catch (err: any) {
    error.value = err.message || t('a3f7c9d1.fail')
    console.error('Forgot password error:', err)
  } finally {
    isLoading.value = false
  }
}

function goToLogin() {
  router.push(toLocalePath('/account/login'))
}

function handleClose() {
  router.back()
}

onMounted(() => {
  void getCaptcha('forgot_password', 'member')
})
</script>
