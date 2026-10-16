<template>
  <div class="relative w-full bg-white">
    <div
      class="relative flex w-full items-center justify-between bg-white p-4"
      data-name="FilterBar"
      data-node-id="2896:3722"
    >
      <button
        v-if="showBack"
        type="button"
        class="absolute left-4 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-[#191a1d]"
        aria-label="back"
        @click="$emit('back')"
      >
        <Icon name="ph:caret-left" class="h-5 w-5" />
      </button>

      <div
        class="relative flex shrink-0 items-center justify-start"
        data-name="Container"
        data-node-id="2896:3723"
      >
        <button
          type="button"
          class="flex items-center gap-2"
          data-name="Button"
          data-node-id="2896:3724"
          @click="handleToggle"
        >
          <span
            class="font-['Noto_Sans_SC',sans-serif] text-[16px] font-medium leading-5 text-[#191a1d]"
            data-node-id="2896:3726"
          >
            {{ title }}
          </span>
          <span
            class="flex h-4 w-4 items-center justify-center overflow-hidden"
            data-name="箭头"
            data-node-id="2896:3727"
          >
            <Icon
              name="ph:caret-down"
              class="h-4 w-4 text-[#191a1d] transition-transform"
              :class="isExpanded ? 'rotate-180' : ''"
            />
          </span>
        </button>
      </div>
    </div>

    <div
      v-if="resolvedMenuItems.length > 0 && isExpanded"
      class="absolute left-0 right-0 top-full z-40 flex min-h-[calc(100vh-52px)] w-full flex-col items-start bg-white px-4"
      data-name="CartSheet"
      data-node-id="2905:6290"
    >
      <div class="w-full">
        <div class="flex w-full flex-col items-start">
          <button
            v-for="item in resolvedMenuItems"
            :key="item.key"
            type="button"
            class="flex w-full items-center justify-start border-b border-[#e5e7eb] py-4 text-left"
            :data-node-id="item.nodeId"
            @click="handleSelect(item)"
          >
            <span
              class="block w-full font-['Noto_Sans_SC',sans-serif] text-[16px] font-medium leading-5"
              :class="item.key === resolvedActiveKey ? 'text-[#191a1d]' : 'text-[#4a5565]'"
            >
              {{ item.label }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useModal } from '~/composables/useModal'
import { getBusinessMode } from '~/composables/useTemplate'

interface FilterMenuItem {
  key: string
  label: string
  path?: string
  nodeId?: string
  action?: 'logout'
}

const props = withDefaults(
  defineProps<{
    title: string
    showBack?: boolean
    modelValue?: boolean
    activeKey?: string
    menuItems?: FilterMenuItem[]
  }>(),
  {
    showBack: false,
    modelValue: false,
    activeKey: '',
    menuItems: () => [],
  }
)

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const localePath = useLocalePath()
const { logout } = useAuth()
const { confirm } = useModal()
const innerExpanded = ref(props.modelValue)
const isBBC = computed(() => getBusinessMode() === 'bbc')

const defaultMenuItems = computed<FilterMenuItem[]>(() => {
  const items: FilterMenuItem[] = [
    {
      key: 'profile',
      label: t('96a0d248.4f7a2a'),
      path: localePath('/account'),
      nodeId: '2905:6314',
    },
    {
      key: 'orders',
      label: t('de8076e6.a73872'),
      path: localePath('/account/orders'),
      nodeId: '2910:6315',
    },
    {
      key: 'aftersales',
      label: t('110ad121.056891'),
      path: localePath('/account/aftersales'),
      nodeId: '2910:6315-aftersales',
    },
    {
      key: 'coupons',
      label: t('ee3264ed.2f3635'),
      path: localePath('/account/coupons'),
      nodeId: '2910:6318',
    },
    {
      key: 'favorites',
      label: t('d53094c8.975ff6'),
      path: localePath('/account/favorites'),
      nodeId: '2910:6321',
    },
  ]

  if (isBBC.value) {
    items.push({
      key: 'followStores',
      label: t('1d80cba8.a6c36f'),
      path: localePath('/account/follow-stores'),
      nodeId: '2910:6321-follow-stores',
    })
  }

  items.push(
    {
      key: 'address',
      label: t('ee3264ed.748ea9'),
      path: localePath('/account/address'),
      nodeId: '2910:6324',
    },
    {
      key: 'activityBooking',
      label: t('registration.activityBooking'),
      path: localePath('/account/activity-booking'),
      nodeId: '3954:5064',
    },
    {
      key: 'registrations',
      label: t('registration.myRegistrations'),
      path: localePath('/account/registrations'),
      nodeId: '4054:7090',
    },
    {
      key: 'reviews',
      label: t('d53094c8.b3bf09'),
      path: localePath('/account/reviews'),
      nodeId: '2910:6327',
    },
    { key: 'logout', label: t('d53094c8.44efd1'), action: 'logout', nodeId: '2910:6330' }
  )

  return items
})

const emit = defineEmits<{
  back: []
  click: []
  select: [item: FilterMenuItem]
  'update:modelValue': [value: boolean]
}>()

watch(
  () => props.modelValue,
  (value) => {
    innerExpanded.value = value
  }
)

const resolvedMenuItems = computed(() =>
  props.menuItems.length > 0 ? props.menuItems : defaultMenuItems.value
)

const activeRouteKey = computed(() => {
  const match = resolvedMenuItems.value.find((item) => item.path && route.path === item.path)
  return match?.key ?? 'profile'
})

const resolvedActiveKey = computed(() => props.activeKey || activeRouteKey.value)

const isExpanded = computed(() => innerExpanded.value)

function handleToggle() {
  emit('click')
  innerExpanded.value = !innerExpanded.value
  emit('update:modelValue', innerExpanded.value)
}

async function handleSelect(item: FilterMenuItem) {
  emit('select', item)
  innerExpanded.value = false
  emit('update:modelValue', false)

  if (item.action === 'logout') {
    confirm({
      title: t('d53094c8.44efd1'),
      content: t('d53094c8.75c78d'),
      onConfirm: async () => {
        await logout()
        router.push(localePath('/'))
      },
    })
    return
  }

  if (item.path && route.path !== item.path) {
    await router.push(item.path)
  }
}
</script>
