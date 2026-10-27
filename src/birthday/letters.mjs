export const BIRTHDAY_MONTH = 10;
export const BIRTHDAY_DAY = 28;
export const FIRST_YEAR = 2026;

const DAY_MS = 24 * 60 * 60 * 1000;
const shanghaiFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function shanghaiDay(now) {
  const parts = {};
  for (const part of shanghaiFormatter.formatToParts(now)) {
    if (part.type !== 'literal') parts[part.type] = Number(part.value);
  }
  const { year, month, day } = parts;
  return {
    year,
    key: String(year).padStart(4, '0') + '-' +
      String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0'),
    utcDay: Date.UTC(year, month - 1, day),
  };
}

function birthdayDate(year) {
  return String(year).padStart(4, '0') + '-10-28';
}

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + 'T00:00:00.000Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function birthdayState(now = new Date()) {
  const today = shanghaiDay(now);
  const birthday = birthdayDate(today.year);
  const nextYear = today.key <= birthday ? today.year : today.year + 1;
  return {
    year: today.year,
    isBirthday: today.key === birthday,
    anniversary: Math.max(1, today.year - FIRST_YEAR + (today.key >= birthday ? 1 : 0)),
    nextBirthday: birthdayDate(nextYear),
    daysUntil: (Date.UTC(nextYear, BIRTHDAY_MONTH - 1, BIRTHDAY_DAY) - today.utcDay) / DAY_MS,
  };
}

export function letterOpeningDate(now = new Date()) {
  const today = shanghaiDay(now);
  return birthdayDate(today.key < birthdayDate(today.year) ? today.year : today.year + 1);
}

export function normalizeLetters(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(letter =>
    letter !== null &&
    typeof letter === 'object' &&
    !Array.isArray(letter) &&
    Number.isInteger(letter.year) &&
    letter.year >= FIRST_YEAR &&
    letter.year <= 9999 &&
    typeof letter.text === 'string' &&
    letter.text.trim().length > 0 &&
    letter.text.length <= 5000 &&
    validDate(letter.opensOn)
  );
}

export function saveLetter(letters, text, now = new Date()) {
  if (typeof text !== 'string' || text.trim().length === 0 || text.trim().length > 5000) {
    throw new Error('信件内容需为 1 至 5000 个字符。');
  }

  const result = normalizeLetters(letters);
  const year = FIRST_YEAR + birthdayState(now).anniversary - 1;
  const index = result.findIndex(letter => letter.year === year);
  const existing = index >= 0 ? result[index] : null;
  const letter = {
    year,
    text: text.trim(),
    createdAt: existing ? existing.createdAt : now.toISOString(),
    opensOn: existing ? existing.opensOn : letterOpeningDate(now),
  };

  if (index >= 0) result[index] = letter;
  else result.push(letter);
  return result;
}

export function isLetterOpen(letter, now = new Date()) {
  return Boolean(letter && validDate(letter.opensOn) && shanghaiDay(now).key >= letter.opensOn);
}
