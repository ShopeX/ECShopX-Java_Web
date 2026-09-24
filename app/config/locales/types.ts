export interface ILocaleConfig {
  code: string
  name: string
  direction: 'ltr' | 'rtl'
  currencySymbol: string
}

export interface IMessages {
  [key: string]: any
}
