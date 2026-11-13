import { useUserStore } from '~/stores/user'

function isRenderableAvatar(url: string | undefined): boolean {
  const value = url?.trim()
  if (!value) return false

  return (
    /^(https?:)?\/\//i.test(value) ||
    value.startsWith('/') ||
    value.startsWith('data:')
  )
}

export function useHeaderUser(accountPath: string = '/account') {
  const router = useRouter()
  const route = useRoute()
  const localePath = useLocalePath()
  const userStore = useUserStore()

  const isLoggedIn = computed(() => userStore.isLoggedIn)
  const isProfileReady = computed(() => Boolean(userStore.userInfo))

  const loginDisplayLabel = computed(() => {
    const info = userStore.userInfo
    if (!info) return ''

    const mobile = info.mobile?.trim()
    if (mobile) return mobile

    const email = info.email?.trim()
    if (email) return email

    return info.username?.trim() || ''
  })

  const userAvatarUrl = computed(() => userStore.userInfo?.avatar?.trim() || '')
  const showUserAvatarImage = computed(() => isRenderableAvatar(userAvatarUrl.value))

  async function redirectToLogin() {
    await router.push({
      path: localePath('/account/login'),
      query: { redirect: route.fullPath },
    })
  }

  async function openUserCenter() {
    if (!userStore.token) {
      await redirectToLogin()
      return
    }

    const result = await userStore.fetchUserInfo()
    if (!result.success) {
      await redirectToLogin()
      return
    }

    await router.push(localePath(accountPath as any))
  }

  return {
    isLoggedIn,
    isProfileReady,
    loginDisplayLabel,
    userAvatarUrl,
    showUserAvatarImage,
    openUserCenter,
    redirectToLogin,
  }
}
