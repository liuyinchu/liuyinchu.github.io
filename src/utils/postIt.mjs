const SUMMARY_LIMIT = 160

function frontmatterError(id, message) {
  return new Error('说说 ' + id + ' 的 frontmatter 无效：' + message)
}

function validDate(value) {
  if (typeof value !== 'string') return false
  const parts = value.match(/^(\d{4}-\d{2}-\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2}))?$/)
  if (!parts || Number.isNaN(Date.parse(value))) return false
  const calendarDate = new Date(parts[1] + 'T00:00:00Z')
  if (calendarDate.toISOString().slice(0, 10) !== parts[1]) return false
  return parts[2] === undefined
    || (Number(parts[2]) <= 23 && Number(parts[3]) <= 59
      && (parts[4] === undefined || Number(parts[4]) <= 59))
}

// This small frontmatter subset supports scalar metadata without a YAML dependency.
function parseScalar(value, id, field) {
  if (value.startsWith('"')) {
    const quoted = value.match(/^("(?:[^"\\]|\\.)*")(?:[ \t]+#.*)?$/)
    try {
      if (!quoted) throw new Error()
      return JSON.parse(quoted[1])
    } catch {
      throw frontmatterError(id, field + ' 的双引号字符串无效')
    }
  }
  if (value.startsWith("'")) {
    const quoted = value.match(/^'((?:[^']|'')*)'(?:[ \t]+#.*)?$/)
    if (!quoted) throw frontmatterError(id, field + ' 的单引号字符串无效')
    return quoted[1].replace(/''/g, "'")
  }
  const plain = value.replace(/(?:^|[ \t]+)#.*$/, '').trim()
  if (!plain || /^(?:null|~)$/i.test(plain)) return null
  if (/^(?:true|false)$/i.test(plain)) return plain.toLowerCase() === 'true'
  if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(plain)) return Number(plain)
  if (/^[\[\]{}|>&*!]/.test(plain) || /:\s/.test(plain)) {
    throw frontmatterError(id, field + ' 仅支持单行标量')
  }
  return plain
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
    if (!line.trim() || /^\s*#/.test(line)) continue
    const field = line.match(/^([A-Za-z_][\w-]*):[ \t]*(.*?)\s*$/)
    if (!field) throw frontmatterError(id, 'metadata 须为单行 key: value')
    if (Object.hasOwn(metadata, field[1])) throw frontmatterError(id, '重复字段 ' + field[1])
    metadata[field[1]] = parseScalar(field[2], id, field[1])
  }

  if (typeof metadata.title !== 'string' || !metadata.title.trim()) {
    throw frontmatterError(id, 'title 必须为非空字符串')
  }
  if (!validDate(metadata.date)) {
    throw frontmatterError(id, 'date 必须为有效的 YYYY-MM-DD 或含明确时区的 ISO 日期时间')
  }

  const content = source.slice(frontmatter[0].length)
  return {
    id,
    title: metadata.title,
    date: metadata.date,
    content,
    summary: extractPostItSummary(content),
    href: '/talk#post-' + encodeURIComponent(id),
  }
}

function postItTimestamp(date) {
  // Date-only metadata means midnight in the site's fixed Asia/Shanghai timezone.
  return Date.parse(date.length === 10 ? date + 'T00:00:00+08:00' : date)
}

// Sources are keyed by their path relative to public/post-it; dates determine order.
export function createPostItEntries(modules, { onInvalid = message => console.warn(message) } = {}) {
  const entries = []
  for (const [sourcePath, source] of Object.entries(modules)) {
    const id = sourcePath.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\.md$/i, '')
    try {
      entries.push(parsePostIt(source, id))
    } catch (error) {
      onInvalid('跳过说说 ' + sourcePath + '：' + error.message)
    }
  }
  return entries.sort((left, right) => {
    const difference = postItTimestamp(right.date) - postItTimestamp(left.date)
    return difference || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
  })
}
