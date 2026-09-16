<template>
  <!-- PC 端：弹窗 -->
  <ECModal
    v-if="isDesktop"
    v-model="visible"
    :title="isEdit ? t('78c41987.c2fff4') : t('78c41987.4a1065')"
    :width="598"
    :show-footer="false"
    @close="handleClose"
  >
    <div data-testid="address-modal">
      <AddressForm
        :form-data="formData"
        :errors="errors"
        :loading="loading"
        :provinces="provinces"
        :cities="cities"
        :districts="districts"
        @update:form-data="formData = $event"
        @province-change="handleProvinceChange"
        @city-change="handleCityChange"
        @submit="handleSubmit"
      />
    </div>
  </ECModal>

  <!-- H5 端：全屏页面 -->
  <Teleport v-if="!isDesktop" to="body">
    <Transition name="slide-right">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex flex-col bg-white"
        data-testid="address-modal-h5"
      >
        <!-- H5 头部：返回 -->
        <div class="flex items-center px-[16px] py-[24px] shrink-0">
          <button type="button" class="flex items-center gap-[8px] shrink-0" @click="handleClose">
            <UIcon name="i-heroicons-chevron-left" class="size-[16px] text-[#191a1d]" />
            <span class="text-[14px] font-normal leading-[20px] text-[#191a1d]">{{
              t('eab46cc2.5f4112')
            }}</span>
          </button>
        </div>

        <!-- H5 表单内容 -->
        <div class="flex-1 overflow-auto px-[16px]">
          <AddressForm
            :form-data="formData"
            :errors="errors"
            :loading="loading"
            :provinces="provinces"
            :cities="cities"
            :districts="districts"
            variant="h5"
            @update:form-data="formData = $event"
            @province-change="handleProvinceChange"
            @city-change="handleCityChange"
            @submit="handleSubmit"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ECModal } from '~/components/ECModal'
import type { ISelectOption } from '~/components/ECSelect'
import type { IRegionItem } from './regionData'
import { useRegion } from '~/composables/useRegion'
import { useAddress } from '~/composables/useAddress'
import type { IAddressFormData } from '~/composables/useAddress'
import AddressForm from './AddressForm.vue'

defineOptions({
  name: 'AddressModal',
})

interface Props {
  /** 是否显示 */
  modelValue?: boolean
  /** 地址 ID（编辑时传入） */
  addressId?: string
  /** 初始数据 */
  initialData?: IAddressFormData
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  addressId: undefined,
  initialData: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: [data: IAddressFormData]
  close: []
}>()
const { t } = useI18n()

// 响应式断点：lg = 1024px
const LG_BREAKPOINT = 1024
const windowWidth = ref(import.meta.client ? window.innerWidth : LG_BREAKPOINT)
const isDesktop = computed(() => windowWidth.value >= LG_BREAKPOINT)

if (import.meta.client) {
  const onResize = () => {
    windowWidth.value = window.innerWidth
  }
  onMounted(() => window.addEventListener('resize', onResize))
  onUnmounted(() => window.removeEventListener('resize', onResize))
}

// 内部状态
const visible = ref(props.modelValue)
const loading = ref(false)
const errors = ref<Partial<Record<keyof IAddressFormData, string>>>({})

// 使用 composables
const { regionData, loadRegionData, loading: loadingRegions } = useRegion()
const { saveAddress } = useAddress()

// 表单数据
const formData = ref<IAddressFormData>({
  name: '',
  phone: '',
  countryCode: '+86',
  province: '',
  city: '',
  district: '',
  tmp_code: [],
  detail: '',
  isDefault: false,
})

// 是否编辑模式
const isEdit = computed(() => !!props.addressId)

// 国家区号选项
const countryCodeOptions = computed<ISelectOption[]>(() => [
  { value: '+86', label: t('78c41987.8179c6') },
  { value: '+852', label: t('78c41987.fac4fe') },
  { value: '+853', label: t('78c41987.38bc56') },
  { value: '+886', label: t('78c41987.89ae5e') },
])

// 省份列表
const provinces = computed<ISelectOption[]>(() => {
  return regionData.value.map((item) => ({
    value: item.id,
    label: item.label,
  }))
})

// 城市列表
const cities = computed<ISelectOption[]>(() => {
  if (!formData.value.province) return []
  const province = regionData.value.find((item) => item.id === formData.value.province)
  return (
    province?.children?.map((item) => ({
      value: item.id,
      label: item.label,
    })) || []
  )
})

// 区县列表
const districts = computed<ISelectOption[]>(() => {
  if (!formData.value.city) return []
  const province = regionData.value.find((item) => item.id === formData.value.province)
  const city = province?.children?.find((item) => item.id === formData.value.city)
  return (
    city?.children?.map((item) => ({
      value: item.id,
      label: item.label,
    })) || []
  )
})

/**
 * 根据名称反查区域 ID，使编辑时下拉框能正确选中。
 * API 存储的是名称（如"北京市"），ECSelect 选项值是区域 id。
 */
function resolveRegionIds(data: IAddressFormData, regions: IRegionItem[]): IAddressFormData {
  const resolved = { ...data }

  const provinceItem = regions.find((p) => p.label === data.province || p.id === data.province)
  if (provinceItem) {
    resolved.province = provinceItem.id

    const cityItem = provinceItem.children?.find((c) => c.label === data.city || c.id === data.city)
    if (cityItem) {
      resolved.city = cityItem.id

      const districtItem = cityItem.children?.find(
        (d) => d.label === data.district || d.id === data.district
      )
      if (districtItem) {
        resolved.district = districtItem.id
      }
    }

    resolved.tmp_code = [resolved.province, resolved.city, resolved.district].filter(Boolean)
  }

  return resolved
}

// 监听外部变化
watch(
  () => props.modelValue,
  async (val) => {
    visible.value = val
    if (val) {
      const regions = await loadRegionData()

      if (props.initialData) {
        const resolved = resolveRegionIds(props.initialData, regions || regionData.value)
        formData.value = resolved
      }
    }
  }
)

// 监听内部变化
watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    resetForm()
  }
})

/**
 * 处理省份变化
 */
function handleProvinceChange() {
  formData.value.city = ''
  formData.value.district = ''
}

/**
 * 处理城市变化
 */
function handleCityChange() {
  formData.value.district = ''
}

/**
 * 验证表单
 */
function validateForm(): boolean {
  errors.value = {}
  let isValid = true

  if (!formData.value.name.trim()) {
    errors.value.name = t('78c41987.1521d9')
    isValid = false
  }

  if (!formData.value.phone.trim()) {
    errors.value.phone = t('78c41987.ff95a4')
    isValid = false
  } else if (!/^1[3-9]\d{9}$/.test(formData.value.phone)) {
    errors.value.phone = t('bbf44084.18d771')
    isValid = false
  }

  if (!formData.value.province) {
    errors.value.province = t('78c41987.5f5412')
    isValid = false
  }

  if (!formData.value.city) {
    errors.value.city = t('78c41987.7e75a9')
    isValid = false
  }

  if (!formData.value.district) {
    errors.value.district = t('78c41987.95470d')
    isValid = false
  }

  if (!formData.value.detail.trim()) {
    errors.value.detail = t('78c41987.80d685')
    isValid = false
  }

  return isValid
}

/**
 * 将表单中的区域 ID 转为 API 所需的名称，同时构造 tmp_code。
 */
function buildSaveData(data: IAddressFormData): IAddressFormData {
  const regions = regionData.value
  const result = { ...data }
  const codes: string[] = []

  const provinceItem = regions.find((p) => p.id === data.province)
  if (provinceItem) {
    codes.push(provinceItem.id)
    result.province = provinceItem.label

    const cityItem = provinceItem.children?.find((c) => c.id === data.city)
    if (cityItem) {
      codes.push(cityItem.id)
      result.city = cityItem.label

      const districtItem = cityItem.children?.find((d) => d.id === data.district)
      if (districtItem) {
        codes.push(districtItem.id)
        result.district = districtItem.label
      }
    }
  }

  result.tmp_code = codes
  return result
}

/**
 * 处理提交
 */
async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  loading.value = true
  try {
    const saveData = buildSaveData(formData.value)
    const result = await saveAddress(saveData, props.addressId)

    if (result.success) {
      emit('success', { ...formData.value })
      visible.value = false
    } else {
      console.error('[AddressModal] 保存失败:', result.error)
      alert(result.error || t('78c41987.d7f82f'))
    }
  } catch (e: any) {
    console.error('[AddressModal] 保存异常:', e)
    alert(e?.message || t('78c41987.d7f82f'))
  } finally {
    loading.value = false
  }
}

/**
 * 处理关闭
 */
function handleClose() {
  visible.value = false
  emit('close')
}

/**
 * 重置表单
 */
function resetForm() {
  formData.value = {
    name: '',
    phone: '',
    countryCode: '+86',
    province: '',
    city: '',
    district: '',
    tmp_code: [],
    detail: '',
    isDefault: false,
  }
  errors.value = {}
}

// 组件挂载时预加载省市区数据
onMounted(() => {
  loadRegionData()
})
</script>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s ease;
}
.slide-right-enter-from {
  transform: translateX(100%);
}
.slide-right-leave-to {
  transform: translateX(100%);
}
</style>
