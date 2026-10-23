import decorationSchema from '../schema/decoration-schema.json'

type FieldSpec = {
  type: string
  default: unknown
  values?: unknown[]
  aliases?: string[]
}

type FieldMap = Record<string, FieldSpec>

const schema = decorationSchema as {
  sections: Record<string, FieldMap>
  blocks: Record<string, FieldMap>
  aliases?: {
    sections?: Record<string, string>
    blocks?: Record<string, string>
  }
}

function cloneValue<T>(value: T): T {
  if (value === undefined) return value
  return JSON.parse(JSON.stringify(value)) as T
}

function resolveType(type: string, aliases: Record<string, string> | undefined): string {
  return aliases?.[type] || type
}

export function resolveSettingsByFields(
  fields: FieldMap | undefined,
  rawSettings: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!fields) return cloneValue(rawSettings || {})

  const raw = rawSettings || {}
  return Object.entries(fields).reduce<Record<string, unknown>>((settings, [name, spec]) => {
    let value = raw[name]
    if (value === undefined && Array.isArray(spec.aliases)) {
      for (const alias of spec.aliases) {
        if (raw[alias] !== undefined) {
          value = raw[alias]
          break
        }
      }
    }
    settings[name] = value === undefined ? cloneValue(spec.default) : cloneValue(value)
    return settings
  }, {})
}

export function resolveSectionSettings(
  type: string,
  rawSettings: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const canonicalType = resolveType(type, schema.aliases?.sections)
  return resolveSettingsByFields(schema.sections[canonicalType], rawSettings)
}

export function resolveBlockSettings(
  type: string,
  rawSettings: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const canonicalType = resolveType(type, schema.aliases?.blocks)
  return resolveSettingsByFields(schema.blocks[canonicalType], rawSettings)
}

export function getDecorationSchema() {
  return schema
}
