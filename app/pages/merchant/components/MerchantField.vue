<template>
  <div class="flex w-full flex-col gap-2">
    <div v-if="label" class="flex items-center gap-[3px] text-[14px] leading-5">
      <span v-if="required" class="shrink-0 text-[#d0112f]">*</span>
      <span class="truncate text-[#4a5565]">{{ label }}</span>
    </div>

    <div v-if="kind === 'select'" class="relative w-full">
      <select
        :value="modelValue ?? ''"
        class="h-[42px] w-full appearance-none border bg-white px-[14px] pr-9 text-[14px] leading-5 outline-none focus:border-[#191a1d]"
        :class="[borderClass, modelValue ? 'text-[#191a1d]' : 'text-[#8f99aa]']"
        @change="onSelect"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <UIcon
        name="i-heroicons-chevron-down"
        class="pointer-events-none absolute right-[14px] top-1/2 size-4 -translate-y-1/2 text-[#8f99aa]"
      />
    </div>

    <input
      v-else
      :value="modelValue ?? ''"
      :type="type"
      :maxlength="maxlength"
      :placeholder="placeholder"
      class="h-[42px] w-full border bg-white px-[14px] text-[14px] leading-5 text-[#191a1d] outline-none placeholder:text-[#8f99aa] focus:border-[#191a1d]"
      :class="borderClass"
      @input="onInput"
    />
  </div>
</template>

<script setup lang="ts">
interface ISelectOption {
  value: string | number
  label: string
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    label?: string
    required?: boolean
    kind?: 'input' | 'select'
    type?: 'text' | 'tel' | 'number'
    placeholder?: string
    maxlength?: number
    options?: ISelectOption[]
    /** default: #8f99aa 边框（表单输入）；muted: #e5e5e5 边框（下拉） */
    tone?: 'default' | 'muted'
  }>(),
  {
    modelValue: '',
    kind: 'input',
    type: 'text',
    tone: 'default',
    options: () => [],
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const borderClass = computed(() =>
  props.tone === 'muted' ? 'border-[#e5e5e5]' : 'border-[#8f99aa]'
)

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onSelect(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>
