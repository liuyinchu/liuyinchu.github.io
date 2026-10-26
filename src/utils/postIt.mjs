const SUMMARY_LIMIT = 160

function frontmatterError(id, message) {
  return new Error('说说 ' + id + ' 的 frontmatter 无效：' + message)
}

function validDate(value) {
  if (value === null) return true
  if (typeof value !== 'string') return false
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  const calendarDate = value.slice(0, 10)
  return new Date(calendarDate).toISOString().slice(0, 10) === calendarDate
}

function cleanInlineText(value) {
  return value
    .replace(/:progress\[[^\]\n]*\](?:\{[^}\n]*\})?/gi, '')
    .replace(/:(?:alert|blur|tip|badge|mark)\[([^\]\n]*)\](?:\{[^}\n]*\})?/gi, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[\^[^\]]+\]/g, '')
    .replace(/^\s*(?:>\s*|[-*+]\s+|\d+[.)]\s+)/, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/[\x60*_~]/g, '')
    .replace(/\\([\\\x60*{}\[\]()#+\-.!_>])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function shortenSummary(text) {
  const characters = Array.from(text)
  return characters.length > SUMMARY_LIMIT
    ? characters.slice(0, SUMMARY_LIMIT - 1).join('') + '…'
    : text
}

// Pick the first readable paragraph while leaving the full Markdown untouched.
export function extractPostItSummary(markdown) {
  let fence = null
  let paragraph = []
  const commitParagraph = () => shortenSummary(cleanInlineText(paragraph.join(' ')))

  for (const line of markdown.split(/\r?\n/)) {
    const fenceMatch = line.match(/^ {0,3}(\x60{3,}|~{3,})(.*)$/)
    if (fenceMatch) {
      if (paragraph.length) return commitParagraph()
      if (!fence) {
        fence = { marker: fenceMatch[1][0], length: fenceMatch[1].length }
      } else if (fenceMatch[1][0] === fence.marker
        && fenceMatch[1].length >= fence.length && !fenceMatch[2].trim()) {
        fence = null
      }
      continue
    }
    if (fence) continue

    if (!line.trim()) {
      if (paragraph.length) return commitParagraph()
      continue
    }

    // Component declarations, chat metadata, headings, tables and note definitions
    // describe structure rather than the paragraph announced by the ticker.
    if (/^\s*(?:#{1,6}\s+|:{1,6}[\w-]*(?:\{[^}]*\})?\s*$|\[\^[^\]]+\]:|\|)/.test(line)
      || /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)
      || /^\s*\{(?:[.:][^{}]*)\}\s*$/.test(line)
      || /^(?: {4}|\t)/.test(line)) {
      if (paragraph.length) return commitParagraph()
      continue
    }

    // A steps label is readable text; the surrounding braces are component syntax.
    const text = cleanInlineText(line.replace(/^\s*\{([^{}]+)\}\s*$/, '$1'))
    if (!text) {
      if (paragraph.length) return commitParagraph()
      continue
    }
    if (/^\s*(?:[-*+]\s+|\d+[.)]\s+)/.test(line)) {
      return paragraph.length ? commitParagraph() : shortenSummary(text)
    }
    paragraph.push(text)
  }

  return commitParagraph()
}

export function parsePostIt(source, id) {
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)
  if (!frontmatter) throw frontmatterError(id, '文件必须以 --- 包围的 title 和 date 开头')

  const metadata = {}
  for (const line of frontmatter[1].split(/\r?\n/)) {
    if (!line.trim()) continue
    const field = line.match(/^(title|date):\s*(.+)$/)
    if (!field) throw frontmatterError(id, '仅支持 title 和 date，值须为 JSON 双引号字符串或 null')
    if (Object.hasOwn(metadata, field[1])) throw frontmatterError(id, '重复字段 ' + field[1])
    try {
      metadata[field[1]] = JSON.parse(field[2])
    } catch {
      throw frontmatterError(id, field[1] + ' 不是合法的 JSON 值')
    }
  }

  if (typeof metadata.title !== 'string' || !metadata.title.trim()) {
    throw frontmatterError(id, 'title 必须为非空双引号字符串')
  }
  if (!Object.hasOwn(metadata, 'date') || !validDate(metadata.date)) {
    throw frontmatterError(id, 'date 必须为有效的 YYYY-MM-DD、ISO 日期时间字符串或 null')
  }

  const content = source.slice(frontmatter[0].length)
  return {
    id,
    title: metadata.title,
    date: metadata.date,
    content,
    summary: extractPostItSummary(content),
    href: '/talk#post-' + id,
  }
}

// Numeric filename prefixes preserve the curated order and stable anchor IDs.
export function createPostItEntries(modules) {
  return Object.keys(modules).sort().map(path => {
    const id = path.split('/').pop().replace(/\.md$/, '')
    return parsePostIt(modules[path], id)
  })
}
