import { expect, test } from '@playwright/test'
import { readdir, readFile } from 'node:fs/promises'
import {
  auditPage,
  BASE_URL,
  expectKnownRouteShell,
  expectNoHorizontalOverflow,
  gotoRoute,
} from './test-helpers.js'

const contentDirectory = new URL('../../src/content/post-it/', import.meta.url)
const sources = await Promise.all(
  (await readdir(contentDirectory))
    .filter(name => name.endsWith('.md'))
    .sort()
    .map(async name => {
      const raw = await readFile(new URL(name, contentDirectory), 'utf8')
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
      if (!match) throw new Error(name + ' must have title/date frontmatter')
      const metadata = Object.fromEntries(
        match[1].split(/\r?\n/).map(line => {
          const separator = line.indexOf(':')
          const value = line.slice(separator + 1).trim()
          return [line.slice(0, separator), value.startsWith('"') ? JSON.parse(value) : value]
        }),
      )
      return {
        id: name.slice(0, -3),
        title: metadata.title,
        date: metadata.date,
        body: match[2],
      }
    }),
)

const cards = page => page.locator('article.talk-card')
const cardFor = (page, entry) => page.locator('#post-' + entry.id)

async function expectCardLayout(page, columns) {
  await expect.poll(() => cards(page).evaluateAll(elements => {
    const rects = elements.map(element => {
      const rect = element.getBoundingClientRect()
      return { id: element.id, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
    })
    const overlaps = []
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i]
        const b = rects[j]
        if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1
          && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) {
          overlaps.push([a.id, b.id])
        }
      }
    }
    return {
      columns: new Set(rects.map(rect => Math.round(rect.left))).size,
      outside: rects.filter(rect => rect.left < -1 || rect.right > document.documentElement.clientWidth + 1).map(rect => rect.id),
      overlaps,
    }
  }), { message: 'visible cards should form distinct columns without clipping or overlap' })
    .toEqual({ columns, outside: [], overlaps: [] })
  await expectNoHorizontalOverflow(page)
}

async function finishAudit(page, audit) {
  await audit.settle()
  await expectNoHorizontalOverflow(page)
  audit.expectClean()
}

function matchesSearch(term) {
  const query = term.trim().toLocaleLowerCase()
  return sources.filter(entry => (entry.title + '\n' + entry.body).toLocaleLowerCase().includes(query))
}

test('Talk renders the independent Markdown entries in a responsive masonry grid', async ({ page, isMobile }) => {
  const audit = auditPage(page)
  expect(sources.length).toBeGreaterThan(1)
  await gotoRoute(page, '/talk')
  await expectKnownRouteShell(page, '/talk')
  await expect(cards(page)).toHaveCount(sources.length)
  await expect(cards(page).locator('.talk-card__title')).toHaveText(sources.map(entry => entry.title))
  await expect(cardFor(page, sources[0]).locator('.markdown-body')).toContainText('从前，一匹小马和妈妈住在一起。')
  for (const entry of sources) {
    await expect(cardFor(page, entry).locator('time')).toHaveAttribute('datetime', entry.date)
    await expect(cardFor(page, entry)).not.toContainText(/(?:^|\n)(?:title|date):/)
  }
  await audit.settle()
  await expectCardLayout(page, isMobile ? 1 : 3)
  if (!isMobile) {
    await page.setViewportSize({ width: 820, height: 900 })
    await expectCardLayout(page, 2)
  }
  await finishAudit(page, audit)
})

test('Talk searches titles and full text, reports no matches, and clears the filter', async ({ page, isMobile }) => {
  const audit = auditPage(page)
  await gotoRoute(page, '/talk')
  const search = page.getByRole('searchbox', { name: '搜索说说' })
  for (const term of [sources[0].title, '从前，一匹小马和妈妈住在一起。']) {
    await search.fill(term)
    const expected = matchesSearch(term)
    expect(expected.length).toBeGreaterThan(0)
    await expect(cards(page)).toHaveCount(expected.length)
    await expect(cards(page).locator('.talk-card__title')).toHaveText(expected.map(entry => entry.title))
  }
  await search.fill('__talk_no_matching_entry__')
  await expect(cards(page)).toHaveCount(0)
  await expect(page.getByTestId('talk-empty')).toBeVisible()
  await page.getByRole('button', { name: '清除搜索', exact: true }).click()
  await expect(search).toHaveValue('')
  await expect(page.getByTestId('talk-empty')).toHaveCount(0)
  await expect(cards(page)).toHaveCount(sources.length)
  await expectCardLayout(page, isMobile ? 1 : 3)
  await finishAudit(page, audit)
})

test('long Markdown stays inside cards and repeated headings and footnotes keep local targets', async ({ page, isMobile }) => {
  const audit = auditPage(page)
  const fixtureEntries = sources.slice(0, 2)
  const longToken = 'long_markdown_value_'.repeat(80)
  // Vite serves raw Markdown imports as JS modules; replace two only in this page.
  await page.route('**/src/content/post-it/**', async route => {
    const pathname = new URL(route.request().url()).pathname
    const entry = fixtureEntries.find(item => pathname.endsWith('/' + item.id + '.md'))
    if (!entry) return route.continue()
    const content = [
      '---',
      'title: ' + JSON.stringify(entry.title),
      'date: ' + JSON.stringify(entry.date),
      '---',
      '## 相同的小标题',
      '',
      '独立脚注内容[^same]。',
      '',
      '| 字段 | 值 |',
      '| --- | --- |',
      '| long | ' + longToken + ' |',
      '',
      '```text',
      longToken,
      '```',
      '',
      '[^same]: 每张卡片自己的脚注。',
      '',
    ].join('\n')
    await route.fulfill({
      contentType: 'text/javascript',
      body: 'export default ' + JSON.stringify(content),
    })
  })
  await gotoRoute(page, '/talk')
  for (const entry of fixtureEntries) {
    const card = cardFor(page, entry)
    await expect(card.getByRole('heading', { name: /相同的小标题$/, level: 2 })).toBeVisible()
    for (const selector of ['table', 'pre code']) {
      const scroller = card.locator('.markdown-body ' + selector).first()
      await expect.poll(() => scroller.evaluate(element => {
        element.scrollLeft = 80
        const overflow = getComputedStyle(element).overflowX
        return element.scrollWidth > element.clientWidth
          && element.scrollLeft > 0
          && ['auto', 'scroll'].includes(overflow)
      }), { message: selector + ' should scroll inside the card' }).toBe(true)
    }
    const localLinks = card.locator('.markdown-body a[href^="#"]')
    await expect(card.locator('.md-footnote-ref a, a.md-footnote-back')).toHaveCount(2)
    const unresolved = await localLinks.evaluateAll(links => links.filter(link => {
      const fragment = link.getAttribute('href').slice(1)
      const card = link.closest('article')
      return !card.querySelector('#' + CSS.escape(fragment))
        && !card.querySelector('#' + CSS.escape(decodeURIComponent(fragment)))
    }).map(link => link.getAttribute('href')))
    expect(unresolved, 'footnote forward/back links must resolve in their own card').toEqual([])
  }
  const duplicateIds = await cards(page).evaluateAll(elements => {
    const ids = elements.flatMap(element => [element.id, ...Array.from(element.querySelectorAll('[id]'), item => item.id)])
    return ids.filter((id, index) => ids.indexOf(id) !== index)
  })
  expect(duplicateIds, 'Markdown IDs must be unique across cards').toEqual([])
  await audit.settle()
  await expectCardLayout(page, isMobile ? 1 : 3)
  await finishAudit(page, audit)
})

test('entry anchors work on direct visits and from the Space1 ticker', async ({ page }) => {
  const audit = auditPage(page)
  const destination = sources.at(-1)
  const directHref = '/talk#post-' + destination.id
  await gotoRoute(page, directHref)
  await expect(page).toHaveURL(BASE_URL + directHref)
  await expect(cardFor(page, destination)).toBeInViewport()
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(cardFor(page, destination)).toBeInViewport()

  await gotoRoute(page, '/space1')
  const tickerEntry = page.locator('.talk-ticker__entry').first()
  await expect(tickerEntry).toBeVisible()
  const href = await tickerEntry.getAttribute('href')
  expect(sources.map(entry => '/talk#post-' + entry.id)).toContain(href)
  await tickerEntry.click()
  await expect(page).toHaveURL(BASE_URL + href)
  await expect(page.locator(new URL(href, BASE_URL).hash)).toBeInViewport()
  await finishAudit(page, audit)
})
