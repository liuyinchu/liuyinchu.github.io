import { expect } from '@playwright/test'

export const BASE_URL = 'http://127.0.0.1:4174'

const TRACKED_RESOURCE_TYPES = new Set([
  'document',
  'script',
  'stylesheet',
  'xhr',
  'fetch',
])

function isLocalUrl(url) {
  try {
    return new URL(url).origin === new URL(BASE_URL).origin
  } catch {
    return false
  }
}

function describeRequest(request) {
  return request.method() + ' ' + request.url()
}

export function auditPage(page) {
  const pendingLocal = new Set()
  const problems = {
    page: [],
    console: [],
    response: [],
    request: [],
  }

  page.on('request', (request) => {
    if (
      isLocalUrl(request.url()) &&
      TRACKED_RESOURCE_TYPES.has(request.resourceType())
    ) {
      pendingLocal.add(request)
    }
  })

  page.on('requestfinished', (request) => {
    pendingLocal.delete(request)
  })

  page.on('requestfailed', (request) => {
    const wasTracked = pendingLocal.delete(request)
    if (wasTracked) {
      const failure = request.failure()?.errorText ?? 'request failed'
      problems.request.push(describeRequest(request) + ' — ' + failure)
    }
  })

  page.on('response', (response) => {
    if (isLocalUrl(response.url()) && response.status() >= 400) {
      problems.response.push(
        response.status() + ' ' + describeRequest(response.request()),
      )
    }
  })

  page.on('pageerror', (error) => {
    problems.page.push(error.stack || error.message)
  })

  page.on('console', (message) => {
    if (message.type() !== 'error') return

    const value = message.text()
    if (/^Failed to load resource(?::|$)/i.test(value)) return

    const location = message.location()
    if (
      location.url &&
      /^https?:/i.test(location.url) &&
      !isLocalUrl(location.url)
    ) {
      return
    }

    const source = location.url
      ? ' (' + location.url + ':' + location.lineNumber + ')'
      : ''
    problems.console.push(value + source)
  })

  return {
    async settle() {
      await expect
        .poll(() => pendingLocal.size, {
          message: 'local app requests should settle',
          timeout: 10_000,
        })
        .toBe(0)

      await page.evaluate(
        () =>
          new Promise((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          }),
      )
      await page.waitForTimeout(150)
    },

    expectClean() {
      expect(problems, JSON.stringify(problems, null, 2)).toEqual({
        page: [],
        console: [],
        response: [],
        request: [],
      })
    },
  }
}

export async function gotoRoute(page, route) {
  const response = await page.goto(route, { waitUntil: 'domcontentloaded' })
  expect(response, 'route should return a document response').not.toBeNull()
  expect(response.ok(), 'route should return a successful document response').toBe(
    true,
  )
}

export async function expectKnownRouteShell(page, route) {
  if (route === '/portal') {
    await expect(page.locator('#app > .portal-desktop')).toBeVisible()
    await expect(page.locator('#app > *')).toHaveCount(1)
  } else {
    await expect
      .poll(() => page.locator('#app > *').count(), {
        message: route + ' should render Header, route content, and Footer',
      })
      .toBeGreaterThanOrEqual(3)
  }

  await expect(page.locator('[data-page="not-found"]')).toHaveCount(0)
}

export async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement
    const bodyWidth = document.body?.scrollWidth ?? 0
    return Math.max(root.scrollWidth, bodyWidth) - root.clientWidth
  })

  expect(overflow, 'document should not overflow horizontally').toBeLessThanOrEqual(
    1,
  )
}
