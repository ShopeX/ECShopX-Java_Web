/**
 * useRegion Composable
 *
 * 职责：
 * - 管理省市区数据的获取和缓存
 * - 提供省市区数据的响应式访问
 * - 处理数据加载状态和错误
 */

import { ref } from 'vue'
import { addressApiClient } from '~/infrastructure/http/clients'
import type { IRegionItem } from '~/components/BCAddressModal/regionData'

// 全局缓存（单例模式）
const regionDataCache = ref<IRegionItem[]>([])
const loadingCache = ref(false)
const loadedCache = ref(false)

export function useRegion() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const { t } = useI18n()

  /**
   * 获取省市区数据
   */
  const loadRegionData = async (force = false) => {
    // 如果已加载且不强制刷新，直接返回缓存
    if (loadedCache.value && !force) {
      return regionDataCache.value
    }

    // 如果正在加载，等待完成
    if (loadingCache.value) {
      return new Promise<IRegionItem[]>((resolve) => {
        const checkLoading = setInterval(() => {
          if (!loadingCache.value) {
            clearInterval(checkLoading)
            resolve(regionDataCache.value)
          }
        }, 100)
      })
    }

    try {
      loading.value = true
      loadingCache.value = true
      error.value = null

      const response = await addressApiClient.getRegionList()

      if (response && Array.isArray(response)) {
        regionDataCache.value = response as IRegionItem[]
        loadedCache.value = true
        return regionDataCache.value
      }

      return []
    } catch (err: any) {
      error.value = err.message || t('ad65e9c3.25facd')
      console.error('加载省市区数据失败:', err)
      throw err
    } finally {
      loading.value = false
      loadingCache.value = false
    }
  }

  /**
   * 获取省份列表
   */
  const getProvinces = () => {
    return regionDataCache.value.map((item) => ({
      value: item.id,
      label: item.label,
    }))
  }

  /**
   * 获取城市列表
   */
  const getCities = (provinceCode: string) => {
    const province = regionDataCache.value.find((item) => item.id === provinceCode)
    return (
      province?.children?.map((item) => ({
        value: item.id,
        label: item.label,
      })) || []
    )
  }

  /**
   * 获取区县列表
   */
  const getDistricts = (provinceCode: string, cityCode: string) => {
    const province = regionDataCache.value.find((item) => item.id === provinceCode)
    const city = province?.children?.find((item) => item.id === cityCode)
    return (
      city?.children?.map((item) => ({
        value: item.id,
        label: item.label,
      })) || []
    )
  }

  /**
   * 清除缓存
   */
  const clearCache = () => {
    regionDataCache.value = []
    loadedCache.value = false
  }

  return {
    // 状态
    loading,
    error,
    regionData: regionDataCache,
    loaded: loadedCache,

    // 方法
    loadRegionData,
    getProvinces,
    getCities,
    getDistricts,
    clearCache,
  }
}
