const BLOCK_COMPONENTS = new Set([
  'alert',
  'blur',
  'chat',
  'folding',
  'timeline',
  'steps',
  'gallery',
  'columns',
  'link-card',
])

const INLINE_COMPONENTS = new Set(['alert', 'blur', 'tip', 'badge', 'mark', 'progress'])

const ALERT_TYPES = new Set(['note', 'info', 'tip', 'success', 'question', 'warning', 'danger'])

function alertIcon(paths) {
  return `<svg class="md-alert-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`
}

const ALERT_META = {
  note: {
    icon: alertIcon('<path d="M6.75 3.75h7.5L18 7.5v12.75H6.75z"/><path d="M14.25 3.75V7.5H18"/><path d="M9.5 11h5M9.5 14.5h5"/>'),
    label: 'Note',
  },
  info: {
    icon: alertIcon('<path d="M12 10.5v6"/><path d="M12 7.25h.01"/>'),
    label: 'Info',
  },
  tip: {
    icon: alertIcon('<path d="M9 18h6M10 21h4"/><path d="M8.5 15.4a6 6 0 1 1 7 0C14.5 16.1 14 17 14 18h-4c0-1-.5-1.9-1.5-2.6Z"/>'),
    label: 'Tip',
  },
  success: {
    icon: alertIcon('<path d="m5.5 12.5 4 4 9-9"/>'),
    label: 'Success',
  },
  question: {
    icon: alertIcon('<path d="M9.35 9a3 3 0 1 1 3.6 2.94c-.75.19-.95.81-.95 1.56"/><path d="M12 17.25h.01"/>'),
    label: 'Question',
  },
  warning: {
    icon: alertIcon('<path d="M12 4 3.75 19h16.5z"/><path d="M12 9.25v4.5M12 16.75h.01"/>'),
    label: 'Warning',
  },
  danger: {
    icon: alertIcon('<path d="m7.25 7.25 9.5 9.5M16.75 7.25l-9.5 9.5"/>'),
    label: 'Danger',
  },
}

const BADGE_TONES = new Set(['accent', 'info', 'success', 'warning', 'danger', 'muted'])

function parseAttributes(source = '') {
  const attributes = Object.create(null)
  const pattern = /([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'}]+)))?/g
  let match
  while ((match = pattern.exec(source))) {
    const key = match[1].toLowerCase()
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue
    attributes[key] = match[2] ?? match[3] ?? match[4] ?? true
  }
  return attributes
}

function safeSlug(value = '') {
  const slug = String(value)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_-]+/gu, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'note'
}

function safeHref(value = '') {
  const href = String(value).trim()
  if (/^(?:https?:\/\/|mailto:|\/(?!\/)|#)/i.test(href)) return href
  return '#'
}

function findClosingBracket(source, start) {
  let depth = 0
  let escaped = false
  for (let index = start; index < source.length; index += 1) {
    const character = source[index]
    if (escaped) {
      escaped = false
      continue
    }
    if (character === '\\') {
      escaped = true
      continue
    }
    if (character === '[') depth += 1
    if (character === ']') {
      depth -= 1
      if (depth === 0) return index
    }
  }
  return -1
}

function readAttributeBlock(source, start) {
  if (source[start] !== '{') return { attributes: {}, end: start }
  const end = source.indexOf('}', start + 1)
  if (end === -1) return { attributes: {}, end: start }
  return {
    attributes: parseAttributes(source.slice(start + 1, end)),
    end: end + 1,
  }
}

function renderInlineComponent(md, token, env, escapeHtml) {
  const { name, attributes } = token.meta
  const content = md.renderInline(token.content, env)

  if (name === 'blur') {
    return `<button type="button" class="md-blur-inline" data-md-blur-inline aria-pressed="false"><span>${content}</span></button>`
  }

  if (name === 'tip') {
    const tip = escapeHtml(attributes.tip || attributes.text || '提示')
    return `<span class="md-tip-inline" tabindex="0" data-tip="${tip}">${content}</span>`
  }

  if (name === 'badge') {
    const requestedTone = String(attributes.tone || attributes.type || 'accent').toLowerCase()
    const tone = BADGE_TONES.has(requestedTone) ? requestedTone : 'accent'
    return `<span class="md-badge md-badge--${tone}">${content}</span>`
  }

  if (name === 'mark') {
    return `<mark class="md-mark">${content}</mark>`
  }

  if (name === 'progress') {
    const rawValue = Number.parseFloat(token.content)
    const value = Number.isFinite(rawValue) ? Math.min(100, Math.max(0, rawValue)) : 0
    const label = escapeHtml(attributes.label || '进度')
    return `<span class="md-progress" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}"><span class="md-progress-label">${label}</span><span class="md-progress-track" aria-hidden="true"><span style="--md-progress:${value}%"></span></span><span class="md-progress-value">${value}%</span></span>`
  }

  const requestedType = String(attributes.type || 'note').toLowerCase()
  const type = ALERT_TYPES.has(requestedType) ? requestedType : 'note'
  const meta = ALERT_META[type]
  return `<span class="md-alert-inline md-alert--${type}"><span class="md-alert-inline-icon" aria-hidden="true">${meta.icon}</span>${content}</span>`
}

export function installMarkdownComponentRules(md, escapeHtml) {
  md.inline.ruler.before('emphasis', 'md_component_inline', (state, silent) => {
    const start = state.pos
    if (state.src[start] !== ':' || state.src[start + 1] === ':') return false

    const nameMatch = state.src.slice(start + 1).match(/^([a-z][\w-]*)\[/i)
    if (!nameMatch || !INLINE_COMPONENTS.has(nameMatch[1])) return false

    const name = nameMatch[1].toLowerCase()
    const bracketStart = start + 1 + name.length
    const bracketEnd = findClosingBracket(state.src, bracketStart)
    if (bracketEnd === -1) return false

    const attributeResult = readAttributeBlock(state.src, bracketEnd + 1)
    if (!silent) {
      const token = state.push('md_component_inline', '', 0)
      token.content = state.src.slice(bracketStart + 1, bracketEnd)
      token.meta = { name, attributes: attributeResult.attributes }
    }

    state.pos = attributeResult.end === bracketEnd + 1 ? bracketEnd + 1 : attributeResult.end
    return true
  })

  md.inline.ruler.before('emphasis', 'md_footnote_ref', (state, silent) => {
    const start = state.pos
    if (state.src[start] !== '[' || state.src[start + 1] !== '^') return false
    const end = state.src.indexOf(']', start + 2)
    if (end === -1) return false
    const id = state.src.slice(start + 2, end)
    if (!id || !state.env?.footnotes?.has(id)) return false

    if (!silent) {
      const token = state.push('md_footnote_ref', '', 0)
      token.meta = { id }
    }
    state.pos = end + 1
    return true
  })

  md.renderer.rules.md_component_inline = (tokens, index, options, env) => (
    renderInlineComponent(md, tokens[index], env, escapeHtml)
  )

  md.renderer.rules.md_footnote_ref = (tokens, index, options, env) => {
    const id = tokens[index].meta.id
    const slug = safeSlug(id)
    const count = (env.footnoteRefCounts.get(id) || 0) + 1
    env.footnoteRefCounts.set(id, count)
    const referenceId = `fnref-${slug}${count > 1 ? `-${count}` : ''}`
    const references = env.footnoteReferences.get(id) || []
    references.push(referenceId)
    env.footnoteReferences.set(id, references)
    return `<sup class="md-footnote-ref" id="${referenceId}"><a href="#fn-${slug}" aria-label="查看脚注 ${escapeHtml(id)}">${escapeHtml(id)}</a></sup>`
  }
}

function parseBlockOpening(line) {
  const match = line.match(/^(\s*)(:{1,6})(alert|blur|chat|folding|timeline|steps|gallery|columns|link-card)(?:\{([^}]*)\})?\s*$/i)
  const name = match?.[3]?.toLowerCase()
  if (!match || !BLOCK_COMPONENTS.has(name)) return null
  return {
    indent: match[1],
    marker: match[2],
    closeMarker: match[2].length === 1 ? '::' : match[2],
    name,
    attributes: parseAttributes(match[4] || ''),
  }
}

function findBlockEnd(lines, start, opening) {
  const stack = [opening.closeMarker]
  let fence = null

  for (let index = start; index < lines.length; index += 1) {
    const trimmed = lines[index].trim()
    const fenceMatch = trimmed.match(/^(```+|~~~+)/)
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1][0]
      else if (fence === fenceMatch[1][0]) fence = null
      continue
    }
    if (fence) continue

    const nested = parseBlockOpening(lines[index])
    if (nested) {
      stack.push(nested.closeMarker)
      continue
    }

    if (trimmed === stack[stack.length - 1]) {
      stack.pop()
      if (!stack.length) return index
    }
  }

  return -1
}

function collectFootnotes(source) {
  const lines = source.split('\n')
  const body = []
  const footnotes = new Map()
  let fence = null

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const trimmed = line.trim()
    const fenceMatch = trimmed.match(/^(```+|~~~+)/)
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1][0]
      else if (fence === fenceMatch[1][0]) fence = null
      body.push(line)
      continue
    }

    const definition = !fence && line.match(/^\[\^([^\]]+)\]:\s*(.*)$/)
    if (!definition) {
      body.push(line)
      continue
    }

    const content = [definition[2]]
    while (index + 1 < lines.length && (/^(?: {2,}|\t)/.test(lines[index + 1]) || lines[index + 1].trim() === '')) {
      index += 1
      content.push(lines[index].replace(/^(?: {2,}|\t)/, ''))
    }
    footnotes.set(definition[1], content.join('\n').trim())
  }

  return { body: body.join('\n'), footnotes }
}

function splitMarkerSections(source) {
  const sections = []
  let current = null

  source.split('\n').forEach((line) => {
    const marker = line.trim().match(/^\{([^{}]+)\}\s*$/)
    if (marker) {
      if (current) sections.push(current)
      current = { label: marker[1].trim(), lines: [] }
      return
    }
    if (!current) current = { label: '', lines: [] }
    current.lines.push(line)
  })

  if (current) sections.push(current)
  return sections.filter((section) => section.label || section.lines.some((line) => line.trim()))
}

function splitColumnSections(source) {
  const sections = []
  let current = []

  source.split('\n').forEach((line) => {
    if (/^#{1,6}\s+/.test(line.trim()) && current.some((item) => item.trim())) {
      sections.push(current.join('\n').trim())
      current = []
    }
    current.push(line)
  })

  if (current.some((item) => item.trim())) sections.push(current.join('\n').trim())
  return sections
}

function renderComponent(name, attributes, source, context) {
  const { md, env, escapeHtml } = context

  if (name === 'alert') {
    const requestedType = String(attributes.type || 'note').toLowerCase()
    const type = ALERT_TYPES.has(requestedType) ? requestedType : 'note'
    const meta = ALERT_META[type]
    const title = escapeHtml(attributes.title || meta.label)
    const body = renderFragment(source, context)
    return `<aside class="md-alert md-alert--${type}" role="note"><div class="md-alert-head"><span class="md-alert-icon" aria-hidden="true">${meta.icon}</span><strong>${title}</strong></div><div class="md-alert-body">${body}</div></aside>`
  }

  if (name === 'blur') {
    const label = escapeHtml(attributes.label || '隐藏内容')
    const body = renderFragment(source, context)
    return `<section class="md-blur-block" data-md-blur-block><div class="md-blur-block-head"><span>${label}</span><button type="button" data-md-blur-toggle aria-expanded="false">显示内容</button></div><div class="md-blur-block-content" inert aria-hidden="true">${body}</div></section>`
  }

  if (name === 'folding') {
    const summary = escapeHtml(attributes.title || attributes.summary || '展开内容')
    const open = attributes.open === true || attributes.open === 'true' ? ' open' : ''
    return `<details class="md-folding"${open}><summary>${summary}</summary><div class="md-folding-content">${renderFragment(source, context)}</div></details>`
  }

  if (name === 'chat') {
    const messages = splitMarkerSections(source)
    const items = messages.map((message) => {
      const isSystem = message.label.startsWith(':')
      const isSelf = message.label.startsWith('.')
      const speaker = isSystem ? '' : (isSelf ? message.label.slice(1) || '我' : message.label || '对方')
      const text = isSystem ? [message.label.slice(1), ...message.lines].filter(Boolean).join('\n') : message.lines.join('\n')
      if (isSystem) return `<li class="md-chat-system">${renderFragment(text, context)}</li>`
      return `<li class="md-chat-message ${isSelf ? 'is-self' : 'is-peer'}"><span class="md-chat-speaker">${escapeHtml(speaker)}</span><div class="md-chat-bubble">${renderFragment(text, context)}</div></li>`
    }).join('')
    return `<ol class="md-chat" aria-label="对话记录">${items}</ol>`
  }

  if (name === 'timeline' || name === 'steps') {
    const sections = splitMarkerSections(source)
    const items = sections.map((section, index) => `<li><div class="md-${name}-marker">${name === 'steps' ? index + 1 : ''}</div><div class="md-${name}-content"><strong>${escapeHtml(section.label || `步骤 ${index + 1}`)}</strong>${renderFragment(section.lines.join('\n'), context)}</div></li>`).join('')
    return `<ol class="md-${name}">${items}</ol>`
  }

  if (name === 'gallery') {
    const count = Math.min(4, Math.max(2, Number.parseInt(attributes.columns || attributes.cols || '2', 10)))
    return `<div class="md-gallery" style="--md-columns:${count}">${renderFragment(source, context)}</div>`
  }

  if (name === 'columns') {
    const sections = splitColumnSections(source)
    const requested = Number.parseInt(attributes.columns || attributes.cols || String(sections.length), 10)
    const count = Math.min(4, Math.max(2, Number.isFinite(requested) ? requested : 2))
    const columns = sections.map((section) => `<section class="md-column">${renderFragment(section, context)}</section>`).join('')
    return `<div class="md-columns" style="--md-columns:${count}">${columns}</div>`
  }

  const href = escapeHtml(safeHref(attributes.href || '#'))
  const title = escapeHtml(attributes.title || '继续阅读')
  const eyebrow = escapeHtml(attributes.eyebrow || 'RELATED')
  return `<a class="md-link-card" href="${href}"><span class="md-link-card-eyebrow">${eyebrow}</span><strong class="md-link-card-title">${title}</strong><div class="md-link-card-copy">${renderFragment(source, context)}</div><span class="md-link-card-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg></span></a>`
}

function renderFragment(source, context) {
  const lines = source.split('\n')
  const transformed = []
  const replacements = []
  let fence = null

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const trimmed = line.trim()
    const fenceMatch = trimmed.match(/^(```+|~~~+)/)
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1][0]
      else if (fence === fenceMatch[1][0]) fence = null
      transformed.push(line)
      continue
    }

    const opening = !fence ? parseBlockOpening(line) : null
    if (!opening) {
      transformed.push(line)
      continue
    }

    const end = findBlockEnd(lines, index + 1, opening)
    if (end === -1) {
      transformed.push(line)
      continue
    }

    const marker = `<!--md-component-${context.counter}-->`
    context.counter += 1
    const inner = lines.slice(index + 1, end).join('\n')
    replacements.push({ marker, html: renderComponent(opening.name, opening.attributes, inner, context) })
    transformed.push(marker)
    index = end
  }

  let html = context.md.render(transformed.join('\n'), context.env)
  replacements.forEach(({ marker, html: replacement }) => {
    html = html.replace(marker, replacement)
  })
  return html
}

function renderFootnotes(context) {
  if (!context.env.footnotes.size) return ''
  const usedNotes = [...context.env.footnotes.entries()].filter(([id]) => context.env.footnoteReferences.has(id))
  if (!usedNotes.length) return ''

  const notes = usedNotes.map(([id, source]) => {
    const slug = safeSlug(id)
    const backLinks = context.env.footnoteReferences.get(id).map((referenceId, index) => `<a class="md-footnote-back" href="#${referenceId}" aria-label="返回正文${index ? ` ${index + 1}` : ''}">↩</a>`).join(' ')
    return `<li id="fn-${slug}">${renderFragment(source, context)}${backLinks}</li>`
  }).join('')

  return `<section class="md-footnotes" aria-label="脚注"><h2>脚注</h2><ol>${notes}</ol></section>`
}

export function renderMarkdownWithComponents(source, md, escapeHtml) {
  const extracted = collectFootnotes(source)
  const env = {
    footnotes: extracted.footnotes,
    footnoteRefCounts: new Map(),
    footnoteReferences: new Map(),
  }
  const context = { md, env, escapeHtml, counter: 0 }
  return renderFragment(extracted.body, context) + renderFootnotes(context)
}

export function attachMarkdownComponentInteractions(container) {
  if (!container) return () => {}

  const onClick = (event) => {
    const inlineBlur = event.target.closest('[data-md-blur-inline]')
    if (inlineBlur && container.contains(inlineBlur)) {
      const revealed = inlineBlur.classList.toggle('is-revealed')
      inlineBlur.setAttribute('aria-pressed', String(revealed))
      return
    }

    const toggle = event.target.closest('[data-md-blur-toggle]')
    if (!toggle || !container.contains(toggle)) return
    const block = toggle.closest('[data-md-blur-block]')
    const revealed = block.classList.toggle('is-revealed')
    const content = block.querySelector('.md-blur-block-content')
    toggle.setAttribute('aria-expanded', String(revealed))
    toggle.textContent = revealed ? '隐藏内容' : '显示内容'
    content?.toggleAttribute('inert', !revealed)
    content?.setAttribute('aria-hidden', String(!revealed))
  }

  container.addEventListener('click', onClick)
  return () => container.removeEventListener('click', onClick)
}
