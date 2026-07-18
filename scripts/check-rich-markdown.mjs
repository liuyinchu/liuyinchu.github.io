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

const nested = render(`::blur
:::quote{icon="tabler:files"}
**嵌套内容**
:::
::`)
assert.match(nested, /md-blur-block/)
assert.match(nested, /md-quote/)
assert.match(nested, /<strong>嵌套内容<\/strong>/)
assert.match(nested, /<svg/)

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

const unclosed = render(`::alert
没有闭合

## 后续标题`)
assert.doesNotMatch(unclosed, /class="md-alert /)
assert.match(unclosed, /后续标题/)

console.log('rich markdown checks passed')
