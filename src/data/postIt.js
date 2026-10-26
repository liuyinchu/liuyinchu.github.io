import { createPostItEntries } from '../utils/postIt.mjs'

const sources = import.meta.glob('../content/post-it/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export const postItEntries = createPostItEntries(sources)
