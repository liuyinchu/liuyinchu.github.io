import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import {
  createPostItEntries,
  extractPostItSummary,
  parsePostIt,
} from '../src/utils/postIt.mjs'

const sourceFor = (title, date, content = '\n正文。\n') => (
  '---\ntitle: ' + JSON.stringify(title)
  + '\ndate: ' + JSON.stringify(date) + '\n---\n' + content
)

test('frontmatter supplies metadata without trimming or rewriting the Markdown body', () => {
  const content = '\r\n### 小标题\r\n\r\n保留两个空格。  \r\n'
    + '~~~md\r\n## 围栏内的二级标题\r\n~~~\r\n'
    + '\r\n::gallery{columns="2"}\r\n![原图](/fig/example.png)\r\n::\r\n'
    + '\r\n引用[^local]。\r\n\r\n[^local]: 本条自己的脚注。\r\n'
  const source = '---\r\ntitle: "保留 \\"引号\\""\r\ndate: "2026-09-03"\r\n---\r\n' + content
  const entry = parsePostIt(source, '001-preserved')
  assert.equal(entry.title, '保留 "引号"')
  assert.equal(entry.date, '2026-09-03')
  assert.equal(entry.id, '001-preserved')
  assert.equal(entry.href, '/talk#post-001-preserved')
  assert.equal(entry.content, content)
})

test('invalid metadata reports the affected post rather than silently losing it', () => {
  for (const source of [
    '没有 frontmatter',
    '---\ntitle: "缺日期"\n---\n正文',
    '---\ntitle: 不合法的未加引号标题\ndate: "2026-01-01"\n---\n',
    sourceFor('错误日期', '2026-02-30'),
    sourceFor('错误类型', 20260101),
    sourceFor('', '2026-01-01'),
    '---\ntitle: "一"\ntitle: "二"\ndate: "2026-01-01"\n---\n',
  ]) {
    assert.throws(
      () => parsePostIt(source, '002-invalid'),
      error => error.message.includes('002-invalid') && error.message.includes('frontmatter'),
    )
  }
})

test('ISO dates and deliberately unknown collection dates are supported', () => {
  assert.equal(
    parsePostIt(sourceFor('有时区', '2026-09-03T21:54:26+08:00'), '003-iso').date,
    '2026-09-03T21:54:26+08:00',
  )
  assert.equal(parsePostIt(sourceFor('未知', null), '004-unknown').date, null)
})

test('summaries skip fenced code, rich component declarations, images and footnote definitions', () => {
  const markdown = [
    '~~~~js', 'const leaked = "不要读出代码";', '~~~', '## 仍在长围栏内', '~~~~', '',
    '::link-card{title="不要读出属性" href="/secret"}',
    '<img src="/fig/example.png" alt="图片属性">', '::', '',
    ':progress[100]{label="不要读出进度属性"}', '',
    '[^note]: 不要把脚注定义作为摘要', '',
    '::alert{type="tip" title="组件配置"}',
    '这是 **正文**，有[链接](https://example.com)和 :mark[重点]。[^note]', '',
    '下一段不应整篇读出。', '::',
  ].join('\n')
  assert.equal(extractPostItSummary(markdown), '这是 正文，有链接和 重点。')
  assert.equal(
    extractPostItSummary('::steps\n{快速按一下音量加键，松开}\n\n{下一步}\n::'),
    '快速按一下音量加键，松开',
  )
  assert.equal(extractPostItSummary('![图片](/only-image.png)\n'), '')
  assert.equal(extractPostItSummary('| 版本 | 速度 |\n| --- | --- |\n| USB | 1 |'), '')
})

test('summaries announce one paragraph within 160 Unicode characters', () => {
  const summary = extractPostItSummary('😀'.repeat(180) + '\n\n下一段。')
  assert.equal(Array.from(summary).length, 160)
  assert.ok(summary.endsWith('…'))
  assert.ok(!summary.includes('\uFFFD'))
})

test('new content is automatically collected in stable filename order, independent of dates', () => {
  const modules = {
    '../content/post-it/020-second.md': sourceFor('第二条', '2026-10-01'),
    '../content/post-it/010-first.md': sourceFor('第一条', '2025-12-27'),
    '../content/post-it/030-added-later.md': sourceFor('新增条目', '2026-01-01'),
  }
  const entries = createPostItEntries(modules)
  assert.deepEqual(entries.map(entry => entry.id), ['010-first', '020-second', '030-added-later'])
  assert.deepEqual(entries.map(entry => entry.title), ['第一条', '第二条', '新增条目'])
  assert.equal(entries[0].href, '/talk#post-010-first')
  assert.throws(() => createPostItEntries({ '040-broken.md': '无元数据' }), /040-broken/)
})

const contentDirectory = new URL('../src/content/post-it/', import.meta.url)
const sources = Object.fromEntries(
  readdirSync(contentDirectory)
    .filter(file => file.endsWith('.md'))
    .map(file => [file, readFileSync(new URL(file, contentDirectory), 'utf8')]),
)
const entries = createPostItEntries(sources)

test('every actual post conforms to the shared card and ticker schema', () => {
  assert.ok(entries.length >= 27)
  assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length)
  for (const entry of entries) {
    assert.deepEqual(Object.keys(entry).sort(), ['content', 'date', 'href', 'id', 'summary', 'title'])
    assert.match(entry.id, /^\d{3,}-[a-z0-9]+(?:-[a-z0-9]+)*$/)
    assert.ok(entry.title.trim())
    assert.ok(entry.content.trim())
    assert.ok(Array.from(entry.summary).length <= 160)
    assert.equal(entry.href, '/talk#post-' + entry.id)
  }
  const naming = entries.find(entry => entry.id === '010-paper-naming')
  assert.ok(naming.content.includes('[PurposePrefix]_[FirstAuthorLastName][Year]'))
  const books = entries.find(entry => entry.id === '020-book-recommendations')
  assert.ok(books.content.includes('### 教材清单'))
  assert.ok(books.content.includes('### 专业书籍'))
  const specs = entries.find(entry => entry.id === '026-usb-thunderbolt-specs')
  assert.ok(specs.content.includes('| USB 版本 | 最大传输速度'))
})

test('all actual footnote references resolve inside their own independent post', () => {
  let referencesChecked = 0
  for (const entry of entries) {
    const definitions = new Set(
      [...entry.content.matchAll(/^\[\^([^\]]+)\]:/gm)].map(match => match[1]),
    )
    const references = new Set(
      [...entry.content.matchAll(/\[\^([^\]]+)\](?!:)/g)].map(match => match[1]),
    )
    for (const reference of references) {
      assert.ok(definitions.has(reference), entry.id + ' 缺少脚注 ' + reference)
      referencesChecked += 1
    }
    for (const definition of definitions) {
      assert.ok(references.has(definition), entry.id + ' 含不属于本条的脚注 ' + definition)
    }
  }
  assert.ok(referencesChecked >= 2)
})
