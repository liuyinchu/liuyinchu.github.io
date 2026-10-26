import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { createPostItEntries } from '../src/utils/postIt.mjs'

export const POST_IT_MODULE_ID = 'virtual:post-it'
const RESOLVED_MODULE_ID = '\0' + POST_IT_MODULE_ID

export function readPostItEntries(directory, options) {
  const sources = {}
  const visit = (current, prefix = '') => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const relativePath = prefix + entry.name
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) visit(fullPath, relativePath + '/')
      else if (entry.isFile() && /\.md$/i.test(entry.name)) {
        sources[relativePath] = readFileSync(fullPath, 'utf8')
      }
    }
  }
  if (existsSync(directory)) visit(directory)
  return createPostItEntries(sources, options)
}

export function postItPlugin({ directory = 'public/post-it' } = {}) {
  let contentDirectory
  return {
    name: 'post-it-content',
    configResolved(config) {
      contentDirectory = path.resolve(config.root, directory)
    },
    resolveId(id) {
      if (id === POST_IT_MODULE_ID) return RESOLVED_MODULE_ID
    },
    load(id) {
      if (id !== RESOLVED_MODULE_ID) return
      const entries = readPostItEntries(contentDirectory, { onInvalid: message => this.warn(message) })
      return 'export const postItEntries = ' + JSON.stringify(entries)
        + ';\nexport default postItEntries;\n'
    },
    configureServer(server) {
      server.watcher.add(contentDirectory)
      const refresh = (event, file) => {
        if (!['add', 'change', 'unlink'].includes(event)) return
        const relativePath = path.relative(contentDirectory, path.resolve(file))
        if (relativePath === '..' || relativePath.startsWith('..' + path.sep)
          || path.isAbsolute(relativePath) || !/\.md$/i.test(relativePath)) return
        const module = server.moduleGraph.getModuleById(RESOLVED_MODULE_ID)
        if (module) server.moduleGraph.invalidateModule(module)
        server.ws.send({ type: 'full-reload', path: '*' })
      }
      server.watcher.on('all', refresh)
      server.httpServer?.once('close', () => server.watcher.off('all', refresh))
    },
  }
}
