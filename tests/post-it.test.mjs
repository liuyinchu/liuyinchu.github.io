import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import {
  existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync,
  realpathSync, rmSync, unlinkSync, writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createPostItEntries,
  extractPostItSummary,
  parsePostIt,
} from '../src/utils/postIt.mjs'
import { POST_IT_MODULE_ID, postItPlugin, readPostItEntries } from '../scripts/vite-post-it.mjs'

const sourceFor = (title, date, content = '\n正文。\n') => (
  '---\ntitle: ' + JSON.stringify(title)
  + '\ndate: ' + JSON.stringify(date) + '\n---\n' + content
)

// All disk fixtures live in a marked, task-owned directory under the repository tmp/.
function fixtureDirectory(t) {
  const root = fileURLToPath(new URL('../', import.meta.url))
  const temporaryRoot = path.resolve(root, 'tmp')
  const parent = path.resolve(process.env.POST_IT_TEST_TMP_DIR || temporaryRoot)
  assert.ok(parent === temporaryRoot || parent.startsWith(temporaryRoot + path.sep))
  mkdirSync(parent, { recursive: true })
  const directory = mkdtempSync(path.join(parent, Date.now() + '-post-it-test-'))
  const known = new Set(['.codex-tmp'])
  writeFileSync(path.join(directory, '.codex-tmp'), 'Created by tests/post-it.test.mjs\n')
  const write = (relativePath, content) => {
    const segments = relativePath.split('/')
    for (let index = 1; index < segments.length; index++) {
      known.add(segments.slice(0, index).join('/'))
    }
    known.add(relativePath)
    const destination = path.join(directory, relativePath)
    mkdirSync(path.dirname(destination), { recursive: true })
    writeFileSync(destination, content)
    return destination
  }
  t.after(() => {
    const resolved = realpathSync(directory)
    assert.ok(resolved.startsWith(realpathSync(temporaryRoot) + path.sep))
    assert.equal(lstatSync(directory).isSymbolicLink(), false)
    assert.ok(existsSync(path.join(directory, '.codex-tmp')))
    const inspect = (current, prefix = '') => {
      for (const entry of readdirSync(current, { withFileTypes: true })) {
        const relativePath = prefix + entry.name
        assert.ok(known.has(relativePath), 'Unknown fixture content: ' + relativePath)
        assert.equal(entry.isSymbolicLink(), false)
        if (entry.isDirectory()) inspect(path.join(current, entry.name), relativePath + '/')
      }
    }
    inspect(directory)
    rmSync(directory, { recursive: true })
  })
  return { directory, write }
}

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

test('a single invalid post throws an actionable metadata error', () => {
  for (const source of [
    '没有 frontmatter',
    '---\ntitle: "缺日期"\n---\n正文',
    '---\ntitle: "未闭合\ndate: "2026-01-01"\n---\n',
    sourceFor('错误日期', '2026-02-30'),
    sourceFor('错误闰日', '2025-02-29'),
    sourceFor('错误月份', '2026-13-01'),
    sourceFor('无时区', '2026-01-01T12:00:00'),
    sourceFor('错误小时', '2026-01-01T24:00:00Z'),
    sourceFor('错误分钟', '2026-01-01T12:60:00Z'),
    sourceFor('错误时差', '2026-01-01T12:00:00+24:00'),
    sourceFor('错误类型', 20260101),
    sourceFor('未知日期', null),
    sourceFor('', '2026-01-01'),
    '---\ntitle: # 只有注释\ndate: 2026-01-01\n---\n正文',
    '---\ntitle: "一"\ntitle: "二"\ndate: "2026-01-01"\n---\n',
  ]) {
    assert.throws(
      () => parsePostIt(source, 'invalid'),
      error => error.message.includes('invalid') && error.message.includes('frontmatter'),
    )
  }
})

test('plain, single-quoted and double-quoted scalar metadata accept dates with explicit timezones', () => {
  const plain = parsePostIt('---\ntitle: 未编号的新说说\ndate: 2026-09-03\ncategory: 随笔\n---\n原文', 'new-note')
  assert.equal(plain.title, '未编号的新说说')
  assert.equal(plain.date, '2026-09-03')
  const single = parsePostIt("---\n# 注释\ntitle: 'It''s a note' # 行内注释\ndate: '2026-09-03T21:54:26+08:00'\n---\n正文", 'single')
  assert.equal(single.title, "It's a note")
  assert.equal(single.date, '2026-09-03T21:54:26+08:00')
  assert.equal(parsePostIt(sourceFor('闰日', '2024-02-29'), 'leap').date, '2024-02-29')
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

test('collection uses real date order and stable IDs for equal instants while skipping invalid files', () => {
  const messages = []
  const entries = createPostItEntries({
    'z-old.md': sourceFor('旧条目', '2025-12-27'),
    'b-offset.md': sourceFor('同一时刻东八区', '2026-01-01T08:00:00+08:00'),
    'new-note.md': sourceFor('最新未编号', '2026-10-01'),
    'a-utc.md': sourceFor('同一时刻UTC', '2026-01-01T00:00:00Z'),
    'c-date-only.md': sourceFor('日期按本站午夜', '2026-01-01'),
    'readme.md': '普通说明文件',
    'missing-date.md': '---\ntitle: 没日期\n---\n正文',
    'unknown-date.md': sourceFor('未知日期', null),
    'broken-date.md': sourceFor('错误日期', '2026-02-30'),
  }, { onInvalid: message => messages.push(message) })
  assert.deepEqual(entries.map(entry => entry.id), [
    'new-note', 'a-utc', 'b-offset', 'c-date-only', 'z-old',
  ])
  assert.equal(messages.length, 4)
  for (const name of ['readme.md', 'missing-date.md', 'unknown-date.md', 'broken-date.md']) {
    assert.ok(messages.some(message => message.includes(name)))
  }
})

test('date-only metadata uses fixed Shanghai midnight rather than the host timezone', () => {
  const entries = createPostItEntries({
    'calendar-day.md': sourceFor('仅日期', '2026-10-26'),
    'morning.md': sourceFor('当天00:30新发', '2026-10-26T00:30:00+08:00'),
    'midnight-equivalent.md': sourceFor('同一午夜UTC', '2026-10-25T16:00:00Z'),
    'previous-night.md': sourceFor('前一日晚间', '2026-10-25T23:59:59+08:00'),
  })
  assert.deepEqual(entries.map(entry => entry.id), [
    'morning', 'calendar-day', 'midnight-equivalent', 'previous-night',
  ])
})

test('relative paths and arbitrary filenames keep stable, round-trippable permalinks', () => {
  const entries = createPostItEntries({
    '随笔/新 说说%完成.MD': sourceFor('特殊名称', '2026-10-01'),
    'plain-note.md': sourceFor('普通名称', '2026-01-01'),
  })
  assert.equal(entries[0].id, '随笔/新 说说%完成')
  for (const entry of entries) {
    assert.equal(decodeURIComponent(entry.href.split('#')[1]), 'post-' + entry.id)
  }
})

test('filesystem collection discovers nested and non-numbered Markdown without an index', t => {
  const { directory, write } = fixtureDirectory(t)
  write('my-new-note.md', sourceFor('任意文件名', '2026-09-03'))
  write('随笔/新 说说%完成.MD', sourceFor('递归大写扩展名', '2026-10-01'))
  write('notes.txt', sourceFor('应忽略非MD', '2027-01-01'))
  write('readme.md', '无 metadata 的说明')
  const messages = []
  const entries = readPostItEntries(directory, { onInvalid: message => messages.push(message) })
  assert.deepEqual(entries.map(entry => entry.id), ['随笔/新 说说%完成', 'my-new-note'])
  assert.equal(messages.length, 1)
  assert.match(messages[0], /readme\.md/)
})

test('the Vite virtual module rescans Markdown additions, edits and deletions and refreshes dev consumers', async t => {
  const { directory, write } = fixtureDirectory(t)
  const original = write('starter.md', sourceFor('第一篇', '2026-01-01'))
  const plugin = postItPlugin({ directory })
  plugin.configResolved({ root: fileURLToPath(new URL('../', import.meta.url)) })
  const resolvedId = plugin.resolveId(POST_IT_MODULE_ID)
  assert.equal(resolvedId, '\0virtual:post-it')
  assert.equal(plugin.resolveId('unrelated-module'), undefined)
  const warnings = []
  const load = async () => {
    const source = plugin.load.call({ warn: message => warnings.push(message) }, resolvedId)
    const exports = await import('data:text/javascript,' + encodeURIComponent(source))
    assert.deepEqual(exports.default, exports.postItEntries)
    return exports.postItEntries
  }
  const watcher = new EventEmitter()
  let watchedDirectory
  watcher.add = directory => { watchedDirectory = directory }
  const invalidations = []
  const reloads = []
  const module = { id: resolvedId }
  const httpServer = new EventEmitter()
  plugin.configureServer({
    watcher,
    moduleGraph: {
      getModuleById: id => id === resolvedId ? module : undefined,
      invalidateModule: module => invalidations.push(module),
    },
    ws: { send: message => reloads.push(message) },
    httpServer,
  })
  assert.equal(watchedDirectory, directory)
  assert.deepEqual((await load()).map(entry => entry.id), ['starter'])

  const added = write('without-number.MD', sourceFor('仅新增MD', '2026-10-01'))
  watcher.emit('all', 'add', added)
  assert.deepEqual((await load()).map(entry => entry.id), ['without-number', 'starter'])

  write('starter.md', sourceFor('只改日期和正文', '2026-11-01', '改后的完整正文。  \n'))
  watcher.emit('all', 'change', original)
  const edited = await load()
  assert.deepEqual(edited.map(entry => entry.id), ['starter', 'without-number'])
  assert.equal(edited[0].content, '改后的完整正文。  \n')

  unlinkSync(added)
  watcher.emit('all', 'unlink', added)
  assert.deepEqual((await load()).map(entry => entry.id), ['starter'])
  assert.equal(invalidations.length, 3)
  assert.deepEqual(reloads, Array.from({ length: 3 }, () => ({ type: 'full-reload', path: '*' })))

  watcher.emit('all', 'change', path.join(directory, 'ignored.txt'))
  watcher.emit('all', 'change', path.join(directory, '..', 'outside.md'))
  assert.equal(reloads.length, 3)
  assert.deepEqual(warnings, [])
  httpServer.emit('close')
  assert.equal(watcher.listenerCount('all'), 0)
})

const contentDirectory = new URL('../public/post-it/', import.meta.url)
const entries = readPostItEntries(fileURLToPath(contentDirectory))

test('every migrated post conforms to the shared card and ticker schema', () => {
  assert.ok(entries.length >= 27)
  assert.equal(new Set(entries.map(entry => entry.id)).size, entries.length)
  for (const entry of entries) {
    assert.deepEqual(Object.keys(entry).sort(), ['content', 'date', 'href', 'id', 'summary', 'title'])
    assert.ok(entry.title.trim())
    assert.ok(entry.content.trim())
    assert.ok(Array.from(entry.summary).length <= 160)
    assert.equal(entry.href, '/talk#post-' + encodeURIComponent(entry.id))
    const candidate = path.join(fileURLToPath(contentDirectory), entry.id)
    const file = readdirSync(path.dirname(candidate)).find(name => (
      /\.md$/i.test(name) && name.replace(/\.md$/i, '') === path.basename(candidate)
    ))
    const source = readFileSync(path.join(path.dirname(candidate), file), 'utf8')
    assert.equal(entry.content, source.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, ''))
  }
  for (let index = 1; index < entries.length; index++) {
    const timestamp = date => Date.parse(date.length === 10 ? date + 'T00:00:00+08:00' : date)
    assert.ok(timestamp(entries[index - 1].date) >= timestamp(entries[index].date))
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
