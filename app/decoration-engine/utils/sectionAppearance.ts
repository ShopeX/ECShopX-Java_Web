export type SectionPaddingToken = 'none' | 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl'
export type SectionColorSchemeToken = 'scheme-1' | 'scheme-2' | 'scheme-3' | 'scheme-4' | 'scheme-5'

export function resolveSectionPaddingClass(value: unknown, direction: 'top' | 'bottom') {
  const token = String(value || 'm') as SectionPaddingToken
  const classMap: Record<SectionPaddingToken, string> = {
    none: direction === 'top' ? 'pt-0' : 'pb-0',
    xxs: direction === 'top' ? 'pt-4 md:pt-6' : 'pb-4 md:pb-6',
    xs: direction === 'top' ? 'pt-6 md:pt-8' : 'pb-6 md:pb-8',
    s: direction === 'top' ? 'pt-10 md:pt-12' : 'pb-10 md:pb-12',
    m: direction === 'top' ? 'pt-16 md:pt-20' : 'pb-16 md:pb-20',
    l: direction === 'top' ? 'pt-20 md:pt-24' : 'pb-20 md:pb-24',
    xl: direction === 'top' ? 'pt-24 md:pt-32' : 'pb-24 md:pb-32',
  }
  return classMap[token] || classMap.m
}

export function resolveSectionColorScheme(value: unknown) {
  const token = String(value || 'scheme-1') as SectionColorSchemeToken
  const schemes: Record<SectionColorSchemeToken, {
    background: string
    foreground: string
    mutedForeground: string
    softBackground: string
    activeBackground: string
    activeForeground: string
  }> = {
    'scheme-1': {
      background: '#ffffff',
      foreground: '#191A1D',
      mutedForeground: '#5F646D',
      softBackground: '#F4F5F7',
      activeBackground: '#191A1D',
      activeForeground: '#ffffff',
    },
    'scheme-2': {
      background: '#f5f7fb',
      foreground: '#191A1D',
      mutedForeground: '#5F646D',
      softBackground: '#ffffff',
      activeBackground: '#191A1D',
      activeForeground: '#ffffff',
    },
    'scheme-3': {
      background: '#111214',
      foreground: '#ffffff',
      mutedForeground: 'rgba(255,255,255,0.72)',
      softBackground: 'rgba(255,255,255,0.12)',
      activeBackground: '#ffffff',
      activeForeground: '#111214',
    },
    'scheme-4': {
      background: '#7c3aed',
      foreground: '#ffffff',
      mutedForeground: 'rgba(255,255,255,0.74)',
      softBackground: 'rgba(255,255,255,0.16)',
      activeBackground: '#ffffff',
      activeForeground: '#4c1d95',
    },
    'scheme-5': {
      background: '#eef2ff',
      foreground: '#191A1D',
      mutedForeground: '#5F646D',
      softBackground: '#ffffff',
      activeBackground: '#4338ca',
      activeForeground: '#ffffff',
    },
  }
  return schemes[token] || schemes['scheme-1']
}
