import { expect, test } from '@playwright/test'
import {
  expectKnownRouteShell,
  expectNoHorizontalOverflow,
  gotoRoute,
} from './test-helpers.js'

const projects = [
  { label: '音乐机关盒', href: '/music-box' },
  { label: '星间 · Stellar Field', href: '/stellar-field' },
  { label: 'AI Frontier', href: '/ai-frontier' },
  { label: 'precision-physkit', href: '/precision-physkit' },
  { label: 'TZBox', href: '/tzbox' },
]

async function openFooterProjects(page) {
  await gotoRoute(page, '/')
  await expectKnownRouteShell(page, '/')

  const footer = page.locator('.site-footer')
  const group = footer.locator('.footer-section').filter({
    has: page.getByRole('link', { name: '代码与项目', exact: true }),
  })
  await expect(group).toBeVisible()
  await expect(group.locator('.footer-links a')).toHaveCount(projects.length)
  return { footer, group }
}

test('footer shows the five curated projects and removes the former selections', async ({ page }) => {
  const { footer, group } = await openFooterProjects(page)
  const links = group.locator('.footer-links a')

  await expect(links).toHaveText(projects.map(({ label }) => label))
  expect(await links.evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href'))))
    .toEqual(projects.map(({ href }) => href))
  await expect(footer.getByRole('link', {
    name: /^(生命树|实验报告|Brisk Nexus|Data Analysis Helper|Cyber Match)$/,
  })).toHaveCount(0)
})

test('footer projects fit the configured desktop or mobile viewport', async ({ page }) => {
  const { footer, group } = await openFooterProjects(page)
  await group.scrollIntoViewIfNeeded()
  await expectNoHorizontalOverflow(page)

  const bounds = await footer.boundingBox()
  expect(bounds).not.toBeNull()
  expect(bounds.x).toBeGreaterThanOrEqual(-1)
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(page.viewportSize().width + 1)

  const linksFitGroup = await group.evaluate((section) => {
    const groupBounds = section.getBoundingClientRect()
    return [...section.querySelectorAll('.footer-links a')].every((link) => {
      const linkBounds = link.getBoundingClientRect()
      return linkBounds.left >= groupBounds.left - 1 && linkBounds.right <= groupBounds.right + 1
    })
  })
  expect(linksFitGroup, 'project names should fit within their footer column').toBe(true)
})

test('AI Frontier footer link opens the selected project', async ({ page }) => {
  const { group } = await openFooterProjects(page)
  await group.getByRole('link', { name: 'AI Frontier', exact: true }).click()

  await expect(page).toHaveURL(/\/ai-frontier$/)
  await expectKnownRouteShell(page, '/ai-frontier')
})
