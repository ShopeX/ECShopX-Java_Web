<template>
  <div class="w-full bg-white">
    <!-- 内容容器 -->
    <div class="w-full max-w-[1440px] mx-auto px-4 lg:px-32 py-4 lg:py-16">
      <!-- 标题 -->
      <div
        class="flex flex-col font-medium justify-center leading-none w-full text-2xl text-[#191a1d] mb-2 lg:mb-8"
        data-testid="filter-title"
      >
        <h2 class="block leading-[48px]">{{ t('9e569ba6.794a4e') }}</h2>
      </div>

      <!-- 筛选栏：排序和筛选按钮 -->
      <div class="flex h-[42px] items-center justify-between w-full lg:mb-8">
        <!-- 左侧：排序选择器 -->
        <div class="relative flex items-center gap-2">
          <span class="text-sm text-[#99a1af] font-normal leading-5">
            {{ t('9e569ba6.899c0c') }}
          </span>
          <button
            class="flex items-center gap-2 text-sm font-medium leading-5 text-[#191a1d] hover:opacity-80 transition-opacity"
            data-testid="filter-sort-button"
            @click="toggleSortDropdown"
          >
            <span>{{ currentSortLabel }}</span>
            <UIcon
              name="i-heroicons-chevron-down"
              class="size-3 transition-transform"
              :class="{ 'rotate-180': showSortDropdown }"
            />
          </button>

          <!-- 排序下拉菜单 - PC 端（定位在按钮下方） -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="showSortDropdown"
              class="hidden lg:block absolute left-0 top-full mt-2 z-10 bg-white border border-[#e5e7eb] shadow-lg min-w-[160px] rounded-lg"
              data-testid="filter-sort-dropdown"
            >
              <div
                v-for="option in sortOptions"
                :key="option.value"
                class="flex items-center p-4 text-sm font-medium leading-5 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                :class="{
                  'bg-[#f3f4f6] text-[#191a1d]': localValue.sort === option.value,
                  'bg-white text-[#191a1d] hover:bg-gray-50': localValue.sort !== option.value,
                }"
                :data-testid="`filter-sort-option-${option.value}`"
                @click="handleSortChange(option.value)"
              >
                {{ option.label }}
              </div>
            </div>
          </Transition>
        </div>

        <!-- 右侧：筛选按钮（MVP 暂时隐藏）
        <button
          class="flex items-center gap-2 text-sm font-medium leading-5 text-[#191a1d] hover:opacity-80 transition-opacity"
          data-testid="filter-toggle-button"
          @click="toggleFilterPanel"
        >
          <span>{{ t('9e569ba6.c2fe62') }}</span>
          <UIcon name="i-heroicons-funnel" class="size-4" />
        </button>
        -->
      </div>

      <!-- H5 端排序下拉菜单 - 全宽显示在筛选栏下方 -->
      <div
        v-if="showSortDropdown"
        class="lg:hidden bg-white"
        data-testid="filter-sort-dropdown-mobile"
      >
        <div
          v-for="(option, index) in sortOptions"
          :key="option.value"
          class="flex items-center p-4 text-sm font-medium leading-5 cursor-pointer transition-colors"
          :class="[
            localValue.sort === option.value
              ? 'bg-[#f3f4f6] text-[#191a1d]'
              : 'bg-white text-[#191a1d]',
            index < sortOptions.length - 1 ? 'border-b border-[#e5e7eb]' : '',
          ]"
          :data-testid="`filter-sort-option-mobile-${option.value}`"
          @click="handleSortChange(option.value)"
        >
          {{ option.label }}
        </div>
      </div>

      <!-- 筛选面板 - PC 端横向排列 -->
      <div
        v-if="showFilterPanel"
        class="hidden lg:flex items-start justify-between w-full gap-8 py-4"
        data-testid="filter-panel"
      >
        <!-- 渲染每个筛选组 -->
        <div v-for="group in filterGroups" :key="group.key" class="flex flex-col gap-4 items-start">
          <!-- 筛选组标题 -->
          <div class="flex items-center justify-center">
            <p class="text-sm font-medium leading-5 text-[#99a1af] whitespace-nowrap">
              {{ group.label }}
            </p>
          </div>

          <!-- 筛选选项列表 -->
          <div class="flex flex-col gap-4 items-start">
            <!-- "全部" 选项 -->
            <div
              class="flex gap-2.5 items-center cursor-pointer"
              @click="handleSelectAll(group.key)"
            >
              <div
                class="flex flex-col items-start size-5"
                :class="
                  isAllSelected(group.key)
                    ? 'bg-black pb-0 pt-0.5 px-0.5'
                    : 'bg-white border border-[#191a1d] shadow-sm'
                "
              >
                <Icon
                  v-if="isAllSelected(group.key)"
                  name="i-heroicons-check"
                  class="size-4 text-white"
                />
              </div>
              <p
                class="text-sm font-medium leading-5 text-right whitespace-nowrap"
                :class="isAllSelected(group.key) ? 'text-[#191a1d]' : 'text-[#99a1af]'"
              >
                {{ t('9e569ba6.a8b0c2') }}
              </p>
            </div>

            <!-- 其他选项 -->
            <div
              v-for="option in group.options"
              :key="option.id"
              class="flex gap-2.5 items-center cursor-pointer"
              @click="handleOptionToggle(group.key, option.value)"
            >
              <div
                class="size-4 border border-[#191a1d] shadow-sm flex items-center justify-center"
                :class="isOptionSelected(group.key, option.value) ? 'bg-black' : 'bg-white'"
              >
                <Icon
                  v-if="isOptionSelected(group.key, option.value)"
                  name="i-heroicons-check"
                  class="size-3 text-white"
                />
              </div>
              <p class="text-sm font-medium leading-5 text-[#191a1d] text-right whitespace-nowrap">
                {{ option.label }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选面板 - H5 端手风琴样式 -->
      <div
        v-if="showFilterPanel"
        class="flex lg:hidden flex-col border-t border-[#e5e7eb] bg-white"
        data-testid="filter-panel-mobile"
      >
        <!-- 渲染每个筛选组为手风琴项 -->
        <div
          v-for="group in filterGroups"
          :key="group.key"
          class="border-b border-[#e5e7eb] last:border-b-0"
        >
          <!-- 手风琴标题行 -->
          <button
            class="flex items-center justify-between w-full p-4 text-sm font-medium leading-5 text-[#191a1d] hover:bg-gray-50 transition-colors"
            :data-testid="`filter-accordion-${group.key}`"
            @click="toggleAccordion(group.key)"
          >
            <span>{{ group.label }}</span>
            <UIcon
              name="i-heroicons-plus"
              class="size-4 transition-transform"
              :class="{ 'rotate-45': expandedGroups.includes(group.key) }"
            />
          </button>

          <!-- 手风琴内容 -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-[500px] opacity-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="max-h-[500px] opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div v-if="expandedGroups.includes(group.key)" class="overflow-hidden bg-[#f9fafb]">
              <div class="flex flex-col p-4 gap-3">
                <!-- "全部" 选项 -->
                <div
                  class="flex gap-2.5 items-center cursor-pointer"
                  @click="handleSelectAll(group.key)"
                >
                  <div
                    class="size-5 border border-[#191a1d] flex items-center justify-center"
                    :class="isAllSelected(group.key) ? 'bg-black' : 'bg-white'"
                  >
                    <Icon
                      v-if="isAllSelected(group.key)"
                      name="i-heroicons-check"
                      class="size-4 text-white"
                    />
                  </div>
                  <p
                    class="text-sm font-medium leading-5"
                    :class="isAllSelected(group.key) ? 'text-[#191a1d]' : 'text-[#99a1af]'"
                  >
                    {{ t('9e569ba6.a8b0c2') }}
                  </p>
                </div>

                <!-- 其他选项 -->
                <div
                  v-for="option in group.options"
                  :key="option.id"
                  class="flex gap-2.5 items-center cursor-pointer"
                  @click="handleOptionToggle(group.key, option.value)"
                >
                  <div
                    class="size-5 border border-[#191a1d] flex items-center justify-center"
                    :class="isOptionSelected(group.key, option.value) ? 'bg-black' : 'bg-white'"
                  >
                    <Icon
                      v-if="isOptionSelected(group.key, option.value)"
                      name="i-heroicons-check"
                      class="size-4 text-white"
                    />
                  </div>
                  <p class="text-sm font-medium leading-5 text-[#191a1d]">
                    {{ option.label }}
                  </p>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IProductFilterProps, IProductFilterEmits, IProductFilterValue } from './types'
import { ESortOption } from './types'

/**
 * 商品筛选组件
 *
 * 提供商品筛选功能，包括排序和多维度筛选
 */

// Props
const props = withDefaults(defineProps<IProductFilterProps>(), {
  showFilterPanel: false,
})

// Emits
const emit = defineEmits<IProductFilterEmits>()

// 本地筛选值
const localValue = ref<IProductFilterValue>({ ...props.modelValue })

// 显示排序下拉菜单
const showSortDropdown = ref(false)

// 排序下拉菜单引用
const sortDropdownRef = ref<HTMLElement | null>(null)

// H5 端手风琴展开的筛选组
const expandedGroups = ref<string[]>([])

// i18n
const { t } = useI18n()

// 排序选项（按 Figma 设计调整顺序和名称）
const sortOptions = computed(() => [
  { value: ESortOption.SALES, label: t('9e569ba6.44e7eb') },
  { value: ESortOption.NEW, label: t('9e569ba6.314ef5') },
  { value: ESortOption.PRICE_DESC, label: t('9e569ba6.166f85') },
  { value: ESortOption.PRICE_ASC, label: t('9e569ba6.2d1887') },
])

// 当前排序标签
const currentSortLabel = computed(() => {
  const option = sortOptions.value.find((opt) => opt.value === localValue.value.sort)
  return option?.label || t('9e569ba6.88e7de')
})

/**
 * 切换排序下拉菜单
 */
function toggleSortDropdown() {
  // H5 端互斥：打开排序时关闭筛选面板
  if (!showSortDropdown.value && props.showFilterPanel) {
    emit('update:showFilterPanel', false)
  }
  showSortDropdown.value = !showSortDropdown.value
}

/**
 * 切换筛选面板
 */
function toggleFilterPanel() {
  // H5 端互斥：打开筛选时关闭排序下拉
  if (!props.showFilterPanel && showSortDropdown.value) {
    showSortDropdown.value = false
  }
  emit('update:showFilterPanel', !props.showFilterPanel)
}

/**
 * 切换手风琴展开状态（H5 端）
 */
function toggleAccordion(groupKey: string) {
  const index = expandedGroups.value.indexOf(groupKey)
  if (index > -1) {
    expandedGroups.value.splice(index, 1)
  } else {
    expandedGroups.value.push(groupKey)
  }
}

/**
 * 处理排序变化
 */
function handleSortChange(sort: ESortOption) {
  localValue.value.sort = sort
  showSortDropdown.value = false
  emitChange()
}

/**
 * 判断选项是否被选中
 */
function isOptionSelected(groupKey: string, value: string | number): boolean {
  const groupValue = localValue.value[groupKey as keyof IProductFilterValue]

  if (Array.isArray(groupValue)) {
    return groupValue.includes(value)
  }
  return groupValue === value
}

/**
 * 判断是否选中"全部"
 */
function isAllSelected(groupKey: string): boolean {
  const groupValue = localValue.value[groupKey as keyof IProductFilterValue]

  if (Array.isArray(groupValue)) {
    return groupValue.length === 0
  }
  return !groupValue
}

/**
 * 处理选择"全部"
 */
function handleSelectAll(groupKey: string) {
  const key = groupKey as keyof IProductFilterValue
  const groupValue = localValue.value[key]

  if (Array.isArray(groupValue)) {
    localValue.value[key] = [] as any
  } else {
    localValue.value[key] = undefined as any
  }

  emitChange()
}

/**
 * 处理选项切换
 */
function handleOptionToggle(groupKey: string, value: string | number) {
  const key = groupKey as keyof IProductFilterValue
  const groupValue = localValue.value[key]

  // 查找对应的筛选组
  const group = props.filterGroups.find((g) => g.key === groupKey)
  const isMultiple = group?.multiple !== false

  if (isMultiple) {
    // 多选
    const currentValues = (groupValue as (string | number)[]) || []
    const index = currentValues.indexOf(value)

    if (index > -1) {
      // 已选中，取消选择
      currentValues.splice(index, 1)
    } else {
      // 未选中，添加选择
      currentValues.push(value)
    }

    localValue.value[key] = [...currentValues] as any
  } else {
    // 单选
    if (groupValue === value) {
      // 已选中，取消选择
      localValue.value[key] = undefined as any
    } else {
      // 选中新选项
      localValue.value[key] = value as any
    }
  }

  emitChange()
}

/**
 * 发送变化事件
 */
function emitChange() {
  emit('update:modelValue', { ...localValue.value })
  emit('change')
}

/**
 * 监听 modelValue 变化
 */
watch(
  () => props.modelValue,
  (newValue) => {
    localValue.value = { ...newValue }
  },
  { deep: true }
)

/**
 * 点击外部关闭排序下拉菜单
 */
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (showSortDropdown.value && !target.closest('.relative')) {
      showSortDropdown.value = false
    }
  }

  document.addEventListener('click', handleClickOutside)

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>
