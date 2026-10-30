import { templateApiClient } from '~/infrastructure/http/clients'
import type { IMallGlobalSetting } from '~/types/api/template'
import defaultLoginBackgroundUrl from '~/assets/images/login-bg.png'

const DEFAULT_LOGO_URL = '/images/logo/logo.png'

/** 相对站点根路径补上 Nuxt baseURL（宝塔为 /web/）；绝对 URL 原样返回 */
function withAppBase(path: string): string {
  if (!path || /^(https?:)?\/\//i.test(path) || path.startsWith('data:')) {
    return path
  }
  const base = useRuntimeConfig().app.baseURL || '/'
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  if (!normalizedBase || normalizedPath === normalizedBase || normalizedPath.startsWith(`${normalizedBase}/`)) {
    return normalizedPath
  }
  return `${normalizedBase}${normalizedPath}`
}

export async function useMallGlobalSetting() {
  const settingCache = useCookie<IMallGlobalSetting>('mall-global-setting-cache', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })
  const setting = useState<IMallGlobalSetting>(
    'mall-global-setting',
    () => settingCache.value || {}
  )

  const { data, pending, error, refresh } = await useAsyncData(
    'mall-global-setting',
    async () => {
      return (await templateApiClient.getLoginPageSetting()) || {}
    },
    {
      // Fetch on the client so company_id resolves from window.location.hostname.
      default: () => setting.value,
      server: false,
    }
  )

  watch(
    data,
    (val) => {
      if (val) {
        setting.value = val
        settingCache.value = val
      }
    },
    { immediate: true }
  )

  const mallLogoLightUrl = computed(() =>
    withAppBase(setting.value.logo_light || setting.value.logo || DEFAULT_LOGO_URL)
  )
  const mallLogoDarkUrl = computed(() =>
    withAppBase(setting.value.logo_dark || setting.value.logo || mallLogoLightUrl.value)
  )
  // 默认背景用 import，Vite 会带上 baseURL；接口返回的相对路径再补 base
  const loginBackgroundUrl = computed(() =>
    setting.value.background
      ? withAppBase(setting.value.background)
      : defaultLoginBackgroundUrl
  )

  return {
    setting,
    mallLogoLightUrl,
    mallLogoDarkUrl,
    loginBackgroundUrl,
    pending,
    error,
    refresh,
  }
}
