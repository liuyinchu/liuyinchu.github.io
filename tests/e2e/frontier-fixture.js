export const NOTES_SOURCE = 'https://raw.githubusercontent.com/liuyinchu/deepsight-ai-today/main/index.md'

export const NOTES_FIXTURE = [
  '# AI 前沿札记',
  '',
  '用于页面验证的固定内容。',
  '',
  ...['模型与工具', '研究与实践', '仍待回答的问题'].flatMap(title => [
    '## ' + title,
    '',
    ...Array.from({ length: 4 }, () => '从一个具体问题开始：发生了什么变化，它与谁的工作有关，又有哪些证据可供核验？保留来源与背景，也记录观察的边界。\n'),
  ]),
].join('\n')

export async function mockFrontierNotes(page) {
  await page.route(NOTES_SOURCE, route => route.fulfill({
    status: 200,
    contentType: 'text/markdown; charset=utf-8',
    body: NOTES_FIXTURE,
  }))
}
