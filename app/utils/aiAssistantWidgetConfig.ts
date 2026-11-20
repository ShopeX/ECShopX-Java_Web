interface AiAssistantAvatarConfig {
  code?: unknown
  id?: unknown
  display_name?: unknown
  displayName?: unknown
  has_icon?: unknown
  hasIcon?: unknown
}

interface AiAssistantWidgetConfig {
  data?: unknown
  default_avatar?: unknown
  defaultAvatar?: unknown
  assistant_name?: unknown
  assistantName?: unknown
  builtin_avatars?: unknown
  builtinAvatars?: unknown
  custom_avatars?: unknown
  customAvatars?: unknown
}

export interface AiAssistantFabDisplay {
  iconUrl: string
  text: string
}

const DEFAULT_FAB_TEXT = 'AI'

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function unwrapWidgetConfig(value: unknown): AiAssistantWidgetConfig | null {
  const root = asRecord(value)
  if (!root) return null
  const data = asRecord(root.data)
  return (data || root) as AiAssistantWidgetConfig
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const text = String(value || '').trim()
    if (text) return text
  }
  return ''
}

function normalizeAvatars(value: unknown): AiAssistantAvatarConfig[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is AiAssistantAvatarConfig => Boolean(asRecord(item)))
}

function findSelectedAvatar(
  avatars: AiAssistantAvatarConfig[],
  avatar: string
): AiAssistantAvatarConfig | null {
  return (
    avatars.find((item) => {
      const code = firstText(item.code)
      const id = firstText(item.id)
      return code === avatar || id === avatar
    }) || null
  )
}

function isExternalAvatarUrl(avatar: string): boolean {
  return /^(https?:|data:|\/)/i.test(avatar)
}

export function resolveAiAssistantFabDisplay(
  value: unknown,
  buildAvatarAssetUrl: (avatar: string) => string
): AiAssistantFabDisplay {
  const config = unwrapWidgetConfig(value)
  if (!config) {
    return { iconUrl: '', text: DEFAULT_FAB_TEXT }
  }

  const avatar = firstText(config.default_avatar, config.defaultAvatar)
  const assistantName = firstText(config.assistant_name, config.assistantName)
  const avatars = [
    ...normalizeAvatars(config.custom_avatars || config.customAvatars),
    ...normalizeAvatars(config.builtin_avatars || config.builtinAvatars),
  ]
  const selectedAvatar = avatar ? findSelectedAvatar(avatars, avatar) : null
  const selectedAvatarName = firstText(
    selectedAvatar?.display_name,
    selectedAvatar?.displayName,
    avatar
  )

  if (!avatar) {
    return { iconUrl: '', text: assistantName || DEFAULT_FAB_TEXT }
  }

  const shouldUseIcon =
    isExternalAvatarUrl(avatar) ||
    selectedAvatar?.has_icon === true ||
    selectedAvatar?.hasIcon === true

  if (shouldUseIcon) {
    return {
      iconUrl: isExternalAvatarUrl(avatar) ? avatar : buildAvatarAssetUrl(avatar),
      text: DEFAULT_FAB_TEXT,
    }
  }

  return {
    iconUrl: '',
    text: selectedAvatarName || assistantName || DEFAULT_FAB_TEXT,
  }
}
