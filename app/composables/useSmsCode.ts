import { ref, computed } from 'vue'
import { authApiClient } from '~/infrastructure/http/clients'
import { AuthTransformer } from '~/infrastructure/transformers'
import type { ISmsCodeRequest } from '~/types/api/auth'

/**
 * 短信验证码组合式函数
 *
 * 职责：
 * - 发送短信验证码
 * - 管理倒计时状态
 * - 管理发送状态和错误
 *
 * @example
 * ```vue
 * <script setup>
 * const { sendCode, countdown, isSending, canSend, error } = useSmsCode()
 *
 * // 发送验证码
 * await sendCode({ phone: '13800138000', captcha: '1234', captchaKey: 'xxx' })
 * </script>
 * ```
 */
export function useSmsCode() {
  const { t } = useI18n()
  // 状态管理
  const isSending = ref(false)
  const error = ref<string>('')
  const countdown = ref(0) // 倒计时秒数

  // 倒计时定时器
  let countdownTimer: NodeJS.Timeout | null = null

  // 计算属性
  const canSend = computed(() => {
    return !isSending.value && countdown.value === 0
  })

  /**
   * 开始倒计时
   */
  function startCountdown(seconds: number = 60) {
    countdown.value = seconds

    // 清除之前的定时器
    if (countdownTimer) {
      clearInterval(countdownTimer)
    }

    // 开始倒计时
    countdownTimer = setInterval(() => {
      countdown.value--

      if (countdown.value <= 0) {
        stopCountdown()
      }
    }, 1000)
  }

  /**
   * 停止倒计时
   */
  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
    countdown.value = 0
  }

  /**
   * 发送短信验证码
   * @param phone - 手机号
   * @param captcha - 图形验证码
   * @param captchaToken - 图形验证码 token
   */
  async function sendCode(
    phone: string,
    captcha: string,
    captchaToken: string,
    type: string = 'login'
  ): Promise<boolean> {
    // 验证是否可以发送
    if (!canSend.value) {
      error.value = t('2d006c42.e60fa7')
      return false
    }

    // 验证手机号格式
    if (!AuthTransformer.validatePhone(phone)) {
      error.value = t('2d006c42.19c896')
      return false
    }

    try {
      isSending.value = true
      error.value = ''

      // 调用发送短信验证码 API
      // company_id 由 HTTP 插件自动添加
      const response = await authApiClient.sendSmsCode({
        type,
        mobile: phone,
        yzm: captcha,
        token: captchaToken,
      })
      const result = AuthTransformer.toSmsCodeModel(response)

      if (!result.success) {
        error.value = result.message || t('2d006c42.9ca6a3')
        return false
      }

      // 开始倒计时（使用服务器返回的时间或默认 60 秒）
      startCountdown(result.expiresIn || 60)

      return true
    } catch (err: any) {
      error.value = err.message || t('2d006c42.69d1f0')
      console.error('Send SMS code error:', err)
      return false
    } finally {
      isSending.value = false
    }
  }

  /**
   * 清除错误信息
   */
  function clearError() {
    error.value = ''
  }

  /**
   * 重置状态
   */
  function reset() {
    stopCountdown()
    isSending.value = false
    error.value = ''
  }

  // 组件卸载时清理定时器
  if (import.meta.client) {
    onBeforeUnmount(() => {
      stopCountdown()
    })
  }

  return {
    // 状态
    isSending,
    error,
    countdown,
    canSend,

    // 方法
    sendCode,
    clearError,
    reset,
    startCountdown,
    stopCountdown,
  }
}
