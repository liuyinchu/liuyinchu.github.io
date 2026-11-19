import { readFileSync, writeFileSync } from 'node:fs'
import {
  CBOE_HISTORY_URL, fetchIndexCloses, mergeIndexCloses, parseClosingSnapshot, VIX_SYMBOLS,
} from '../src/utils/vix-quotes.mjs'

const file = new URL('../public/data/vix-latest.json', import.meta.url)
const seed = parseClosingSnapshot(JSON.parse(readFileSync(file, 'utf8')))
const published = process.argv.includes('--previous-stdin')
  ? parseClosingSnapshot(JSON.parse(readFileSync(0, 'utf8')))
  : seed

const baseline = mergeIndexCloses(seed.quotes, published.quotes)
const updates = await fetchIndexCloses(CBOE_HISTORY_URL, AbortSignal.timeout(15000))
const quotes = mergeIndexCloses(baseline, updates)

for (const symbol of VIX_SYMBOLS) {
  if (!updates[symbol] || updates[symbol].date < baseline[symbol].date) {
    console.warn(symbol + ' history has no current data; keeping the last published close.')
  }
  console.log(symbol, quotes[symbol].date, quotes[symbol].value)
}

writeFileSync(file, JSON.stringify({ kind: 'close', quotes }, null, 2) + '\n')
