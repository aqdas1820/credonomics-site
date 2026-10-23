export function parseIndianMoney(raw) {
  if (!raw) return undefined
  const clean = raw.toLowerCase().replace(/,/g, '').replace(/₹|rs\.?|inr/g, '').trim()
  if (/^(nil|zero|free|0)$/.test(clean)) return 0
  const match = clean.match(/(\d+(?:\.\d+)?)\s*(?:(crore|cr|lakh|lac|k|thousand)\b)?/)
  if (!match) return undefined
  let value = Number(match[1])
  if (!Number.isFinite(value)) return undefined
  const unit = match[2]
  if (unit === 'crore' || unit === 'cr') value *= 10000000
  if (unit === 'lakh' || unit === 'lac') value *= 100000
  if (unit === 'k' || unit === 'thousand') value *= 1000
  return Math.round(value)
}

export function findMoneyAfterLabel(text, labels) {
  for (const label of labels) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const patterns = [
      new RegExp(`${escaped}\\s*[:\\-]?\\s*(?:₹|rs\\.?|inr)?\\s*([\\d,.]+\\s*(?:(?:lakh|lac|crore|cr|k|thousand)\\b)?|nil|free)`, 'i'),
      new RegExp(`${escaped}[\\s\\S]{0,55}?(?:₹|rs\\.?|inr)\\s*([\\d,.]+\\s*(?:(?:lakh|lac|crore|cr|k|thousand)\\b)?)`, 'i'),
    ]
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        const parsed = parseIndianMoney(match[1])
        if (parsed !== undefined) return parsed
      }
    }
  }
  return undefined
}

