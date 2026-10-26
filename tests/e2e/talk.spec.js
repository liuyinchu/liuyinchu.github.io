import { expect, test } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import { readPostItEntries } from '../../scripts/vite-post-it.mjs'
import {
  auditPage,
  BASE_URL,
  expectKnownRouteShell,
  expectNoHorizontalOverflow,
  gotoRoute,
} from './test-helpers.js'

const sources = readPostItEntries(fileURLToPath(new URL('../../public/post-it/', import.meta.url)))
const dateTimestamp = value => Date.parse(value.length === 10 ? value + 'T00:00:00+08:00' : value)
const byNewest = entries => [...entries].sort((a, b) => (
  dateTimestamp(b.date) - dateTimestamp(a.date) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
))
const cards = page => page.locator('article.talk-card')
const cardFor = (page, entry) => page.locator('[id=' + JSON.stringify('post-' + entry.id) + ']')

function makeEntry(id, title, date, content) {
  return { id, title, date, content, summary: content.slice(0, 80), href: '/talk#post-' + encodeURIComponent(id) }
}

async function serveEntries(page, entries) {
  // The Vite plugin is the content boundary; fixtures never modify public Markdown.
  await page.route(url => url.pathname === '/@id/__x00__virtual:post-it', route => route.fulfill({
    contentType: 'text/javascript',
    body: 'const postItEntries = ' + JSON.stringify(entries)
      + '; export { postItEntries }; export default postItEntries;',
  }))
}

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

function matchesSearch(entries, term) {
  const query = term.trim().toLocaleLowerCase()
  return entries.filter(entry => (entry.title + '\n' + entry.content).toLocaleLowerCase().includes(query))
}

test('Talk renders public Markdown entries by actual date in a responsive masonry grid', async ({ page, isMobile }) => {
  const audit = auditPage(page)
  const expected = byNewest(sources)
  expect(sources.length).toBeGreaterThan(1)
  expect(sources.map(entry => entry.id)).toEqual(expected.map(entry => entry.id))
  await gotoRoute(page, '/talk')
  await expectKnownRouteShell(page, '/talk')
  await expect(cards(page)).toHaveCount(expected.length)
  await expect(cards(page).locator('.talk-card__title')).toHaveText(expected.map(entry => entry.title))
  for (const entry of expected) {
    const card = cardFor(page, entry)
    // Image-only Markdown is valid even though it has no text content.
    await expect(card.locator('.markdown-body > *').first()).toBeAttached()
    await expect(card.locator('time')).toHaveAttribute('datetime', entry.date)
    await expect(card).not.toContainText(/(?:^|\n)(?:title|date):/)
    await expect(card.locator('.talk-card__title-link')).toHaveAttribute('href', entry.href)
  }
  await audit.settle()
  await expectCardLayout(page, isMobile ? 1 : 3)
  if (!isMobile) {
    await page.setViewportSize({ width: 820, height: 900 })
    await expectCardLayout(page, 2)
  }
  await finishAudit(page, audit)
})

test('Talk displays newly discovered IDs and searches titles and full Markdown text', async ({ page }) => {
  const audit = auditPage(page)
  const entries = byNewest([
    makeEntry('z-older-note', '旧一些的说说', '2030-10-25T20:00:00Z', '旧正文。'),
    makeEntry('fresh-note', '无需编号的新说说', '2030-10-26T07:30:00+08:00', '只有正文包含 nebula-body-query。'),
    makeEntry('a-same-time', '同一时刻的说说', '2030-10-25T23:30:00Z', '同一时间按稳定 ID 排序。'),
  ])
  await serveEntries(page, entries)
  await gotoRoute(page, '/talk')
  await expect(cards(page).locator('.talk-card__title')).toHaveText(entries.map(entry => entry.title))
  await expect(cardFor(page, entries.find(entry => entry.id === 'fresh-note'))).toBeVisible()
  const search = page.getByRole('searchbox', { name: '搜索说说' })
  for (const term of ['无需编号的新说说', 'nebula-body-query']) {
    await search.fill(term)
    const expected = matchesSearch(entries, term)
    await expect(cards(page)).toHaveCount(expected.length)
    await expect(cards(page).locator('.talk-card__title')).toHaveText(expected.map(entry => entry.title))
  }
  await search.fill('__talk_no_matching_entry__')
  await expect(cards(page)).toHaveCount(0)
  await expect(page.getByTestId('talk-empty')).toBeVisible()
  await page.getByRole('button', { name: '清除搜索', exact: true }).click()
  await expect(search).toHaveValue('')
  await expect(page.getByTestId('talk-empty')).toHaveCount(0)
  await expect(cards(page)).toHaveCount(entries.length)
  await finishAudit(page, audit)
})

test('Talk search keyboard shortcuts preserve typing and let Escape clear then leave search', async ({ page }) => {
  const audit = auditPage(page)
  await gotoRoute(page, '/talk')
  const search = page.getByRole('searchbox', { name: '搜索说说' })
  await expect(search).toBeVisible()
  await page.keyboard.press('/')
  await expect(search).toBeFocused()
  await expect(search).toHaveValue('')
  await search.fill(sources[0].title)
  await search.press('/')
  await expect(search).toHaveValue(sources[0].title + '/')
  await search.press('Escape')
  await expect(search).toHaveValue('')
  await expect(search).toBeFocused()
  await expect(cards(page)).toHaveCount(sources.length)
  await search.press('Escape')
  await expect(search).not.toBeFocused()
  await page.keyboard.press('/')
  await expect(search).toBeFocused()
  await finishAudit(page, audit)
})

test('long Markdown stays inside cards and repeated titles, headings and footnotes keep local targets', async ({ page, isMobile }) => {
  const audit = auditPage(page)
  const longToken = 'long_markdown_value_'.repeat(80)
  const content = [
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
  const fixtureEntries = ['fixture-one', 'fixture-two', 'fixture-three'].map((id, index) => (
    makeEntry(id, '相同的说说标题', '2030-10-' + (26 - index), content)
  ))
  await serveEntries(page, fixtureEntries)
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

test('clipboard denial exposes a selected manual permalink without losing the card', async ({ page }) => {
  const audit = auditPage(page)
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { throw new DOMException('Clipboard denied for this test', 'NotAllowedError') } },
    })
  })
  await gotoRoute(page, '/talk')
  const entry = sources[0]
  const card = cardFor(page, entry)
  await card.getByRole('button', { name: '复制「' + entry.title + '」的永久链接', exact: true }).click()
  const fallback = card.getByRole('textbox', { name: '手动复制永久链接' })
  const permalink = new URL(entry.href, BASE_URL).href
  await expect(fallback).toBeVisible()
  await expect(fallback).toHaveValue(permalink)
  await expect(fallback).toHaveAttribute('readonly')
  await expect(fallback).toBeFocused()
  await expect.poll(() => fallback.evaluate(element => (
    [element.selectionStart, element.selectionEnd]
  ))).toEqual([0, permalink.length])
  await expect(card.locator('.talk-card__title-link')).toHaveAttribute('href', entry.href)
  await finishAudit(page, audit)
})

test('entry anchors work on direct visits, titles and the Space1 ticker, with a return to list control', async ({ page }) => {
  const audit = auditPage(page)
  const destination = sources.at(-1)
  const directHref = destination.href
  await gotoRoute(page, directHref)
  await expect(page).toHaveURL(BASE_URL + directHref)
  await expect(cardFor(page, destination)).toBeInViewport()
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(cardFor(page, destination)).toBeInViewport()
  await cardFor(page, destination).locator('.talk-card__title-link').click()
  await expect(page).toHaveURL(BASE_URL + directHref)
  const backToList = page.getByRole('button', { name: '返回说说列表顶部', exact: true })
  await expect(backToList).toBeVisible()
  await backToList.click()
  const boardHeading = page.getByRole('heading', { name: '片刻之间', exact: true })
  await expect(boardHeading).toBeInViewport()
  await expect(boardHeading).toBeFocused()

  await gotoRoute(page, '/space1')
  const tickerEntry = page.locator('.talk-ticker__entry').first()
  await expect(tickerEntry).toBeVisible()
  const href = await tickerEntry.getAttribute('href')
  expect(sources.map(entry => entry.href)).toContain(href)
  await tickerEntry.click()
  await expect(page).toHaveURL(BASE_URL + href)
  await expect(page.locator(new URL(href, BASE_URL).hash)).toBeInViewport()
  await finishAudit(page, audit)
})
