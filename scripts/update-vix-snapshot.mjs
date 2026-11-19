import { readFile, writeFile } from 'node:fs/promises'
import { CBOE_HISTORY_URL, fetchIndexCloses, mergeIndexCloses, VIX_SYMBOLS } from '../src/utils/vix-quotes.mjs'

const file = new URL('../public/data/vix-latest.json', import.meta.url)
const snapshot = JSON.parse(await readFile(file, 'utf8'))
const updates = await fetchIndexCloses(CBOE_HISTORY_URL, AbortSignal.timeout(15000))
if (!Object.keys(updates).length) throw new Error('Cboe history is unavailable')
snapshot.quotes = mergeIndexCloses(snapshot.quotes, updates)
if (!snapshot.quotes.VIX.range52w && updates.VIX?.range52w) {
  snapshot.quotes.VIX.range52w = updates.VIX.range52w
}
await writeFile(file, JSON.stringify(snapshot, null, 2) + '\n')
for (const symbol of VIX_SYMBOLS) {
  const { date, value } = snapshot.quotes[symbol]
  console.log(symbol, date, value)
}
