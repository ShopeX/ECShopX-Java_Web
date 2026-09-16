<template>
  <button
    v-if="!isLoggedIn"
    type="button"
    class="flex h-5 w-5 items-center justify-center transition-opacity hover:opacity-70"
    :class="guestButtonClass"
    :aria-label="guestAriaLabel"
    @click="emit('click')"
  >
    <UIcon name="i-heroicons-user" class="h-5 w-5" :class="iconClass" />
  </button>
  <button
    v-else
    type="button"
    class="flex h-5 items-center gap-1.5 transition-opacity hover:opacity-70"
    :class="loggedInButtonClass"
    :aria-label="loginDisplayLabel || guestAriaLabel"
    :title="loginDisplayLabel || undefined"
    data-testid="header-user-login-entry"
    @click="emit('click')"
  >
    <HeaderUserIdentity
      :login-display-label="isProfileReady ? loginDisplayLabel : ''"
      :user-avatar-url="userAvatarUrl"
      :show-user-avatar-image="showUserAvatarImage && isProfileReady"
      :avatar-shell-class="avatarShellClass"
      :label-class="labelClass"
      :icon-class="iconClass"
    />
  </button>
</template>

<script setup lang="ts">
import HeaderUserIdentity from '~/components/BCHeaderBar/HeaderUserIdentity.vue'

const props = withDefaults(
  defineProps<{
    guestAriaLabel: string
    variant?: 'bar' | 'decoration' | 'simple'
  }>(),
  {
    variant: 'bar',
  }
)

const emit = defineEmits<{
  click: []
}>()

const { isLoggedIn, isProfileReady, loginDisplayLabel, userAvatarUrl, showUserAvatarImage } =
  useHeaderUser()

const variantClass = computed(() => {
  switch (props.variant) {
    case 'decoration':
      return {
        guestButtonClass: 'text-current',
        loggedInButtonClass: 'max-w-[120px] text-current lg:max-w-[200px]',
        avatarShellClass: '',
        labelClass: 'text-xs lg:text-sm',
        iconClass: '',
      }
    case 'simple':
      return {
        guestButtonClass: 'hover:text-gray-600',
        loggedInButtonClass: 'max-w-[140px] hover:text-gray-900',
        avatarShellClass: 'bg-gray-100',
        labelClass: 'text-sm text-gray-700',
        iconClass: '',
      }
    default:
      return {
        guestButtonClass: '',
        loggedInButtonClass: 'max-w-[120px] lg:max-w-[200px]',
        avatarShellClass: 'bg-[#f3f4f6]',
        labelClass: 'text-xs text-[#191a1d] lg:text-sm',
        iconClass: 'text-[#191a1d]',
      }
  }
})

const guestButtonClass = computed(() => variantClass.value.guestButtonClass)
const loggedInButtonClass = computed(() => variantClass.value.loggedInButtonClass)
const avatarShellClass = computed(() => variantClass.value.avatarShellClass)
const labelClass = computed(() => variantClass.value.labelClass)
const iconClass = computed(() => variantClass.value.iconClass)
</script>
