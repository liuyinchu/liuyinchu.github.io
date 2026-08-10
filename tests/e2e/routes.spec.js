import { test } from '@playwright/test'
import { STATIC_ROUTES } from './route-manifest.js'
import {
  auditPage,
  expectKnownRouteShell,
  expectNoHorizontalOverflow,
  gotoRoute,
} from './test-helpers.js'

test.describe('known routes', () => {
  for (const route of STATIC_ROUTES) {
    test(route + ' renders without route-level failures', async ({ page }) => {
      const audit = auditPage(page)

      await gotoRoute(page, route)
      await expectKnownRouteShell(page, route)
      await audit.settle()
      await expectNoHorizontalOverflow(page)
      audit.expectClean()
    })
  }
})
