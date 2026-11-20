import type { ILocaleConfig, IMessages } from './types'
import zhCN from '../../locales/zh-CN.json'
import zhTW from '../../locales/zh-TW.json'
import enUS from '../../locales/en-US.json'
import ar from '../../locales/ar.json'
import jaJP from '../../locales/ja-JP.json'
import ruRU from '../../locales/ru-RU.json'

export const availableLocales: ILocaleConfig[] = [
  {
    code: 'zh-CN',
    name: '简体中文',
    direction: 'ltr',
    currencySymbol: '¥',
  },
  {
    code: 'zh-TW',
    name: '繁體中文',
    direction: 'ltr',
    currencySymbol: '¥',
  },
  {
    code: 'en-US',
    name: 'English',
    direction: 'ltr',
    currencySymbol: '$',
  },
  {
    code: 'ar',
    name: 'العربية',
    direction: 'rtl',
    currencySymbol: '﷼',
  },
  {
    code: 'ja-JP',
    name: '日本語',
    direction: 'ltr',
    currencySymbol: '¥',
  },
  {
    code: 'ru-RU',
    name: 'Русский',
    direction: 'ltr',
    currencySymbol: '₽',
  },
]

export const defaultLocale = availableLocales[0]!

const messagesMap: Record<string, IMessages> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  ar: ar,
  'ja-JP': jaJP,
  'ru-RU': ruRU,
}

export function getLocale(code: string): ILocaleConfig {
  return availableLocales.find((l) => l.code === code) || defaultLocale
}

export function getMessages(code: string): IMessages {
  return messagesMap[code] || zhCN
}
