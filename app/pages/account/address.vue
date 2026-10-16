<template>
  <div class="bg-white min-h-screen" data-testid="address-page">
    <div class="lg:hidden sticky top-0 z-10 shrink-0">
      <AccountH5FilterBar
        v-model="showMobileMenu"
        :title="t('ee3264ed.748ea9')"
        :show-back="true"
        :active-key="activeMenu"
        :menu-items="menuItems"
        @back="router.back()"
      />
    </div>

    <div class="w-full px-4 pb-8 pt-4 lg:px-[128px] lg:py-[32px]">
      <div class="flex w-full items-start lg:gap-[64px]">
        <div
          class="hidden lg:block w-64 shrink-0 lg:self-start lg:sticky lg:top-[var(--layout-header-height,68px)]"
        >
          <AccountMenu v-model="activeMenu" @logout="handleLogout" />
        </div>

        <div class="flex min-w-0 flex-1 flex-col">
          <div class="w-full lg:max-w-[864px]">
            <div class="flex h-[34px] items-center justify-between">
              <h2 class="text-[16px] font-medium leading-5 text-[#191a1d]">
                {{ t('ee3264ed.748ea9') }}
              </h2>
              <button
                type="button"
                class="flex h-[34px] min-w-[97px] items-center justify-center border border-[#e5e7eb] bg-white px-[17px] text-[12px] font-medium leading-4 text-[#191a1d] transition-colors hover:bg-gray-50"
                data-testid="address-add-btn"
                @click="openAddModal"
              >
                {{ t('ee3264ed.dd4bb4') }}
              </button>
            </div>

            <div
              v-if="loading"
              class="grid w-full grid-cols-1 gap-[16px] pt-[16px] lg:grid-cols-2"
              data-testid="address-skeleton"
            >
              <div v-for="i in 4" :key="i" class="border border-[#e5e7eb] p-[16px] animate-pulse">
                <div class="h-[20px] w-[80px] rounded bg-[#e5e7eb]" />
                <div class="mt-[12px] h-[16px] w-[120px] rounded bg-[#e5e7eb]" />
                <div class="mt-[8px] h-[16px] w-full max-w-[260px] rounded bg-[#e5e7eb]" />
                <div class="mt-[16px] flex items-center gap-[16px]">
                  <div class="h-[16px] w-[60px] rounded bg-[#e5e7eb]" />
                  <div class="h-[16px] w-[40px] rounded bg-[#e5e7eb]" />
                  <div class="h-[16px] w-[60px] rounded bg-[#e5e7eb]" />
                </div>
              </div>
            </div>

            <div
              v-else-if="addressList.length > 0"
              class="grid w-full grid-cols-1 gap-[16px] pt-[16px] lg:grid-cols-2"
              data-testid="address-list"
            >
              <AddressCard
                v-for="item in addressList"
                :key="item.id"
                :address="{
                  id: item.id,
                  name: item.name,
                  phone: item.phone,
                  fullAddress: item.fullAddress,
                }"
                :is-default="item.isDefault"
                @edit="handleEdit"
                @delete="handleDelete"
                @set-default="handleSetDefault"
              />
            </div>

            <div
              v-else
              class="w-full py-16 text-center text-[14px] text-[#4a5565]"
              data-testid="address-empty"
            >
              {{ t('7993a4bb.c6c436') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <BCAddressModal
      v-model="modalVisible"
      :address-id="editingAddressId"
      :initial-data="modalInitialData"
      @success="onModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { IAddressItem } from '~/composables/useAddress'
import AccountMenu from './components/AccountMenu.vue'
import AccountH5FilterBar from './components/AccountH5FilterBar.vue'
import AddressCard from './components/AddressCard.vue'
import { getBusinessMode } from '~/composables/useTemplate'

definePageMeta({
  layout: 'default',
})

const router = useRouter()
const localePath = useLocalePath()
const { t } = useI18n()
const { confirm } = useModal()
const toast = useToastMessage()
const { getAddressList, getAddressDetail, deleteAddress, saveAddress, transformFromApiFormat } =
  useAddress()

const activeMenu = ref('address')
const showMobileMenu = ref(false)
const loading = ref(true)
const isBBC = computed(() => getBusinessMode() === 'bbc')
const addressList = ref<
  Array<{
    id: string
    name: string
    phone: string
    fullAddress: string
    isDefault: boolean
  }>
>([])

const modalVisible = ref(false)
const editingAddressId = ref<string | undefined>(undefined)
const modalInitialData = ref<ReturnType<typeof transformFromApiFormat> | undefined>(undefined)
const settingDefaultId = ref<string | null>(null)
const rawAddressMap = ref<Map<string, IAddressItem>>(new Map())

const menuItems = computed(() => {
  const items = [
    { key: 'profile', label: t('96a0d248.4f7a2a'), path: localePath('/account') },
    { key: 'orders', label: t('de8076e6.a73872'), path: localePath('/account/orders') },
    {
      key: 'aftersales',
      label: t('110ad121.056891'),
      path: localePath('/account/aftersales'),
    },
    { key: 'coupons', label: t('ee3264ed.2f3635'), path: localePath('/account/coupons') },
    { key: 'favorites', label: t('8b2de97c.975ff6'), path: localePath('/account/favorites') },
  ]

  if (isBBC.value) {
    items.push({
      key: 'followStores',
      label: t('1d80cba8.a6c36f'),
      path: localePath('/account/follow-stores'),
    })
  }

  items.push(
    { key: 'address', label: t('ee3264ed.748ea9'), path: localePath('/account/address') },
    {
      key: 'activityBooking',
      label: t('registration.activityBooking'),
      path: localePath('/account/activity-booking'),
    },
    {
      key: 'registrations',
      label: t('registration.myRegistrations'),
      path: localePath('/account/registrations'),
    },
    { key: 'reviews', label: t('8b2de97c.b3bf09'), path: localePath('/account/reviews') }
  )

  return items
})

function toDefaultFlag(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value === '1' || value.toLowerCase() === 'true'
  return Number(value || 0) === 1
}

function mapAddressItem(item: IAddressItem) {
  const defaultFlag =
    (item as { is_def?: unknown; is_default?: unknown }).is_def ??
    (item as { is_def?: unknown; is_default?: unknown }).is_default
  return {
    id: item.address_id,
    name: item.username,
    phone: item.telephone,
    fullAddress: [item.province, item.city, item.county, item.adrdetail].filter(Boolean).join(' '),
    isDefault: toDefaultFlag(defaultFlag),
  }
}

function normalizeList(data: unknown): IAddressItem[] {
  if (Array.isArray(data)) return data as IAddressItem[]
  if (data && typeof data === 'object' && 'data' in (data as object)) {
    const d = (data as { data: unknown }).data
    return Array.isArray(d) ? (d as IAddressItem[]) : []
  }
  if (data && typeof data === 'object' && 'list' in (data as object)) {
    const list = (data as { list: unknown }).list
    return Array.isArray(list) ? (list as IAddressItem[]) : []
  }
  return []
}

function markDefaultAddress(addressId: string) {
  addressList.value = addressList.value.map((item) => ({
    ...item,
    isDefault: item.id === addressId,
  }))
}

async function fetchList() {
  loading.value = true
  try {
    const res = await getAddressList()
    if (res.success && res.data != null) {
      const raw = normalizeList(res.data)
      rawAddressMap.value = new Map(raw.map((item) => [item.address_id, item]))
      addressList.value = raw.map(mapAddressItem)
    } else {
      rawAddressMap.value = new Map()
      addressList.value = []
    }
  } catch {
    addressList.value = []
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  editingAddressId.value = undefined
  modalInitialData.value = undefined
  modalVisible.value = true
}

async function handleEdit(addressId: string | number) {
  const id = String(addressId)
  const res = await getAddressDetail(id)
  if (res.success && res.data) {
    editingAddressId.value = id
    modalInitialData.value = res.data
    modalVisible.value = true
  }
}

async function handleDelete(addressId: string | number) {
  const id = String(addressId)
  confirm({
    title: t('41c7a0f8.2f4aad'),
    content: t('a3f584d1.9b0d37'),
    onConfirm: async () => {
      const res = await deleteAddress(id)
      if (res.success) {
        await fetchList()
      }
    },
  })
}

async function handleSetDefault(addressId: string | number) {
  const id = String(addressId)
  if (settingDefaultId.value) return

  const previousList = addressList.value.map((item) => ({ ...item }))
  if (!previousList.some((item) => item.id === id)) return

  markDefaultAddress(id)
  settingDefaultId.value = id

  try {
    const cachedRaw = rawAddressMap.value.get(id)
    let formData
    if (cachedRaw) {
      formData = transformFromApiFormat(cachedRaw)
    } else {
      const detailRes = await getAddressDetail(id)
      if (!detailRes.success || !detailRes.data) {
        throw new Error(detailRes.error || t('fa9beefa.b5c976'))
      }
      formData = detailRes.data
    }

    const saveRes = await saveAddress({ ...formData, isDefault: true }, id)
    if (!saveRes.success) {
      throw new Error(saveRes.error || t('fa9beefa.edae2b'))
    }

    markDefaultAddress(id)
  } catch (error) {
    addressList.value = previousList
    const fallbackMessage = t('fa9beefa.edae2b')
    const errorMessage = error instanceof Error && error.message ? error.message : fallbackMessage
    toast.show(errorMessage)
  } finally {
    settingDefaultId.value = null
  }
}

function onModalSuccess() {
  modalVisible.value = false
  editingAddressId.value = undefined
  modalInitialData.value = undefined
  fetchList()
}

function handleLogout() {
  console.log('用户已退出登录')
}

onMounted(() => {
  fetchList()
})
</script>
