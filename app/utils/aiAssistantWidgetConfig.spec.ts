import { describe, expect, it } from 'vitest'
import { resolveAiAssistantFabDisplay } from './aiAssistantWidgetConfig'

describe('aiAssistantWidgetConfig', () => {
  const buildAvatarAssetUrl = (avatar: string) => `/avatar/${avatar}`

  it('uses the selected built-in avatar display name when the avatar has no icon', () => {
    expect(
      resolveAiAssistantFabDisplay(
        {
          data: {
            default_avatar: 'fox',
            assistant_name: 'AI Assistant Helper',
            builtin_avatars: [
              {
                code: 'fox',
                display_name: 'Fox',
                has_icon: false,
              },
            ],
          },
        },
        buildAvatarAssetUrl
      )
    ).toEqual({
      iconUrl: '',
      text: 'Fox',
    })
  })

  it('uses an avatar asset when the selected avatar has an icon', () => {
    expect(
      resolveAiAssistantFabDisplay(
        {
          data: {
            default_avatar: 'shopex',
            assistant_name: 'AI Assistant Helper',
            builtin_avatars: [
              {
                code: 'shopex',
                display_name: 'shopex',
                has_icon: true,
              },
            ],
          },
        },
        buildAvatarAssetUrl
      )
    ).toEqual({
      iconUrl: '/avatar/shopex',
      text: 'AI',
    })
  })

  it('uses the assistant name when no avatar is configured', () => {
    expect(
      resolveAiAssistantFabDisplay(
        {
          data: {
            assistant_name: 'Shopping Guide',
          },
        },
        buildAvatarAssetUrl
      )
    ).toEqual({
      iconUrl: '',
      text: 'Shopping Guide',
    })
  })
})
