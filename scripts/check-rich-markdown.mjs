import assert from 'node:assert/strict'
import MarkdownIt from 'markdown-it'
import {
  installMarkdownComponentRules,
  renderMarkdownWithComponents,
} from '../src/utils/markdownComponents.js'

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

const md = new MarkdownIt({ html: true })
installMarkdownComponentRules(md, escapeHtml)

const render = (source) => renderMarkdownWithComponents(source, md, escapeHtml)

const plainMarkdown = `## 普通 Markdown

正文包含 **粗体**、[链接](/space1) 与 \`inline code\`。

> 这是原生引用。

- 列表一
- 列表二
`
assert.equal(render(plainMarkdown), md.render(plainMarkdown))

const nested = render(`::blur
> **嵌套内容**
::`)
assert.match(nested, /md-blur-block/)
assert.match(nested, /<blockquote>/)
assert.match(nested, /<strong>嵌套内容<\/strong>/)
assert.doesNotMatch(nested, /md-quote/)

const alerts = [...['note', 'info', 'tip', 'success', 'question', 'warning', 'danger']]
  .map((type) => render(`::alert{type="${type}"}\n${type}\n::`))
  .join('')
assert.equal((alerts.match(/class="md-alert /g) || []).length, 7)
assert.equal((alerts.match(/class="md-alert-symbol"/g) || []).length, 7)
assert.doesNotMatch(alerts, /<circle/)

const removedQuote = render(':quote[保持为普通文本]')
assert.doesNotMatch(removedQuote, /md-(?:inline-)?quote/)

const footnotes = render(`一次[^same]，再次[^same]。

[^same]: 支持 **Markdown**。`)
assert.equal((footnotes.match(/md-footnote-ref/g) || []).length, 2)
assert.match(footnotes, /fnref-same-2/)
assert.match(footnotes, /<strong>Markdown<\/strong>/)

const chat = render(`::chat
{:系统消息}
{.}
自己
{纸鹿}
对方
::`)
assert.match(chat, /md-chat-system/)
assert.match(chat, /is-self/)
assert.match(chat, /is-peer/)

const fenced = render(`\`\`\`markdown
::alert{type="danger"}
不会被解析
::
\`\`\``)
assert.doesNotMatch(fenced, /class="md-alert /)

const unsafeLink = render(`::link-card{href="javascript:alert(1)" title="安全回退"}
内容
::`)
assert.match(unsafeLink, /href="#"/)
assert.doesNotMatch(unsafeLink, /javascript:/)
assert.match(unsafeLink, /md-link-card-icon/)
assert.match(unsafeLink, /<svg/)

const unclosed = render(`::alert
没有闭合

## 后续标题`)
assert.doesNotMatch(unclosed, /class="md-alert /)
assert.match(unclosed, /后续标题/)

console.log('rich markdown checks passed')
