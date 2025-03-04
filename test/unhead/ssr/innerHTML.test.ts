import { describe, it } from 'vitest'
import { createHead } from 'unhead'
import { renderSSRHead } from '@unhead/ssr'

describe('ssr innerHTML', () => {
  it('json', async () => {
    const head = createHead()
    head.push({
      script: [
        {
          innerHTML: {
            test: 'test',
            something: {
              else: 123,
            },
          },
        },
      ],
    })
    const ctx = await renderSSRHead(head)
    expect(ctx).toMatchInlineSnapshot(`
      {
        "bodyAttrs": "",
        "bodyTags": "",
        "bodyTagsOpen": "",
        "headTags": "<script type=\\"application/json\\">{\\"test\\":\\"test\\",\\"something\\":{\\"else\\":123}}</script>",
        "htmlAttrs": "",
      }
    `)
  })

  it('json escaping', async () => {
    const head = createHead()
    head.push({
      script: [
        {
          type: 'application/json',
          innerHTML: {
            escape: '</script>',
          },
        },
      ],
    })
    const ctx = await renderSSRHead(head)
    expect(ctx).toMatchInlineSnapshot(`
      {
        "bodyAttrs": "",
        "bodyTags": "",
        "bodyTagsOpen": "",
        "headTags": "<script type=\\"application/json\\">{\\"escape\\":\\"\\\\u003C/script>\\"}</script>",
        "htmlAttrs": "",
      }
    `)
  })

  it('noscript', async () => {
    const head = createHead()
    head.push({
      noscript: [
        {
          children: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
        },
      ],
    })
    const ctx = await renderSSRHead(head)
    expect(ctx).toMatchInlineSnapshot(`
      {
        "bodyAttrs": "",
        "bodyTags": "",
        "bodyTagsOpen": "",
        "headTags": "<noscript><iframe src=\\"https://www.googletagmanager.com/ns.html?id=GTM-XXXXXX\\"
          height=\\"0\\" width=\\"0\\" style=\\"display:none;visibility:hidden\\"></iframe></noscript>",
        "htmlAttrs": "",
      }
    `)
  })

  it('bug #228', async () => {
    const head = createHead()
    head.push({
      script: [{
        innerHTML: `/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck

(() => {
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches
  const setting = localStorage.getItem('vueuse-color-scheme') || 'auto'
  if (setting === 'dark' || (prefersDark && setting !== 'light'))
    document.documentElement.classList.toggle('dark', true)
})()`,
        // @ts-expect-error untyped
        once: true,
      }],
    })

    const ctx = await renderSSRHead(head)
    expect(ctx).toMatchInlineSnapshot(`
      {
        "bodyAttrs": "",
        "bodyTags": "",
        "bodyTagsOpen": "",
        "headTags": "<script once>/* eslint-disable */
      /* prettier-ignore */
      // @ts-nocheck

      (() => {
        const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches
        const setting = localStorage.getItem('vueuse-color-scheme') || 'auto'
        if (setting === 'dark' || (prefersDark && setting !== 'light'))
          document.documentElement.classList.toggle('dark', true)
      })()</script>",
        "htmlAttrs": "",
      }
    `)
  })

  it('empty innerHTML', async () => {
    const head = createHead()
    head.push({
      script: [
        {
          innerHTML: '',
        },
      ],
    })
    expect(await head.resolveTags()).toMatchInlineSnapshot('[]')

    head.push({
      script: [
        {
          children: '',
        },
      ],
    })
    expect(await head.resolveTags()).toMatchInlineSnapshot('[]')
  })
})
