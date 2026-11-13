export interface ITemplateBlock {
  type: string
  settings?: Record<string, any>
  [key: string]: any
}

export interface ITemplateSection {
  type: string
  title?: string
  description?: string
  settings?: Record<string, any>
  blocks?: Record<string, ITemplateBlock>
  block_order?: string[]
  items?: any[] // Specifically for featured-product or similar sections
  [key: string]: any
}

export interface ITemplateConfig {
  sections: Record<string, ITemplateSection>
  order: string[]
}

export interface IMallGlobalSetting {
  logo?: string
  logo_light?: string
  logo_dark?: string
  background?: string
}
