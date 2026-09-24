<template>
  <span class="inline-flex min-w-0 items-center gap-1.5">
    <span
      class="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full"
      :class="avatarShellClass"
    >
      <img
        v-if="showUserAvatarImage"
        :src="userAvatarUrl"
        alt=""
        class="h-full w-full object-cover"
      />
      <UIcon v-else name="i-heroicons-user" class="h-4 w-4" :class="iconClass" />
    </span>
    <span
      v-if="loginDisplayLabel"
      class="truncate font-medium"
      :class="labelClass"
      data-testid="header-user-login-label"
    >
      {{ loginDisplayLabel }}
    </span>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  loginDisplayLabel: string
  userAvatarUrl: string
  showUserAvatarImage: boolean
  avatarShellClass?: string
  labelClass?: string
  iconClass?: string
}>()
</script>
