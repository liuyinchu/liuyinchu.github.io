import { expect, test } from '@playwright/test'
import { SPECIAL_ROUTES } from './route-manifest.js'
import {
  auditPage,
  BASE_URL,
  expectKnownRouteShell,
  expectNoHorizontalOverflow,
  gotoRoute,
} from './test-helpers.js'

async function finishAudit(page, audit) {
  await audit.settle()
  await expectNoHorizontalOverflow(page)
  audit.expectClean()
}

test('the legacy post-it route redirects to Talk', async ({ page }) => {
  const audit = auditPage(page)

  await gotoRoute(page, SPECIAL_ROUTES.redirect.from)
  await expect(page).toHaveURL(BASE_URL + SPECIAL_ROUTES.redirect.to)
  await expectKnownRouteShell(page, SPECIAL_ROUTES.redirect.to)
  await finishAudit(page, audit)
})

test('a known article reaches the ready state', async ({ page }) => {
  const audit = auditPage(page)

  await gotoRoute(page, SPECIAL_ROUTES.knownArticle)
  await expect(
    page.locator(
      '[data-page="article"][data-article-id="hinf_robust_control_tutorial"][data-state="ready"]',
    ),
  ).toBeVisible()
  await expect(page.locator('[data-article-content]')).toBeVisible()
  await expect(page.locator('[data-page="not-found"]')).toHaveCount(0)
  await finishAudit(page, audit)
})

test('a missing article uses the article-level recovery state', async ({
  page,
}) => {
  const audit = auditPage(page)

  await gotoRoute(page, SPECIAL_ROUTES.missingArticle)
  await expect(
    page.locator('[data-page="article"][data-state="not-found"]'),
  ).toBeVisible()
  await expect(page.locator('[data-article-not-found]')).toBeVisible()
  await expect(page.locator('.article-state-path code')).toHaveText(
    SPECIAL_ROUTES.missingArticle,
  )
  await expect(page.locator('[data-page="not-found"]')).toHaveCount(0)
  await expect(page.locator('#article-not-found-title')).toBeFocused()
  await finishAudit(page, audit)
})

for (const route of [
  SPECIAL_ROUTES.nestedMissingArticle,
  SPECIAL_ROUTES.globalMissing,
]) {
  test(route + ' uses the global NotFound page', async ({ page }) => {
    const audit = auditPage(page)

    await gotoRoute(page, route)
    await expect(page.locator('[data-page="not-found"]')).toBeVisible()
    await expect(page.locator('.not-found__path code')).toHaveText(route)
    await expect(page.locator('#not-found-title')).toBeFocused()
    await finishAudit(page, audit)
  })
}

test('NotFound recovery preserves browser history', async ({ page }) => {
  const audit = auditPage(page)

  await gotoRoute(page, SPECIAL_ROUTES.globalMissing)
  const notFound = page.locator('[data-page="not-found"]')
  await expect(notFound).toBeVisible()

  await notFound.locator('a[href="/"]').click()
  await expect(page).toHaveURL(BASE_URL + '/')
  await expect(notFound).toHaveCount(0)

  await page.goBack()
  await expect(page).toHaveURL(BASE_URL + SPECIAL_ROUTES.globalMissing)
  await expect(page.locator('[data-page="not-found"]')).toBeVisible()
  await finishAudit(page, audit)
})

test('Portal owns the app shell and loads its local data', async ({ page }) => {
  const audit = auditPage(page)
  const musicData = page.waitForResponse(
    (response) => response.url().endsWith('/data/portal-music.json'),
  )
  const dockData = page.waitForResponse(
    (response) => response.url().endsWith('/data/portal-dock.json'),
  )

  await gotoRoute(page, '/portal')
  const [musicResponse, dockResponse] = await Promise.all([musicData, dockData])

  expect(musicResponse.ok()).toBe(true)
  expect(dockResponse.ok()).toBe(true)
  await expectKnownRouteShell(page, '/portal')
  await expect(page.locator('[aria-label="Portal menu bar"]')).toBeVisible()
  await expect(page.locator('[aria-label="Portal Dock"]')).toBeVisible()
  await finishAudit(page, audit)
})
