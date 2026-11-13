import { captureMemberTaskShareFromQuery } from '~/utils/memberTaskShare'

/**
 * 分享落地链接的 query 在任意页面都可能出现。
 * 两个参数同时存在时写入缓存，后续浏览和下单都不清掉，退出登录时清除。
 */
export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  const captureCurrent = () => {
    captureMemberTaskShareFromQuery(router.currentRoute.value.query)
  }

  captureCurrent()
  router.afterEach((to) => {
    captureMemberTaskShareFromQuery(to.query)
  })
  nuxtApp.hook('app:mounted', captureCurrent)
})
