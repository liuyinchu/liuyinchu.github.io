import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BIRTHDAY_MONTH,
  BIRTHDAY_DAY,
  FIRST_YEAR,
  birthdayState,
  letterOpeningDate,
  normalizeLetters,
  saveLetter,
  isLetterOpen,
  letterDaysRemaining,
  formatLetterDownload,
} from '../src/birthday/letters.mjs';

const at = value => new Date(value);
const originalTime = '2026-10-28T04:00:00.000Z';

test('birthday configuration starts on October 28, 2026', () => {
  assert.equal(BIRTHDAY_MONTH, 10);
  assert.equal(BIRTHDAY_DAY, 28);
  assert.equal(FIRST_YEAR, 2026);
});

test('Shanghai midnight starts the birthday before the UTC day changes', () => {
  assert.deepEqual(birthdayState(at('2026-10-27T15:59:59.999Z')), {
    year: 2026,
    isBirthday: false,
    anniversary: 1,
    nextBirthday: '2026-10-28',
    daysUntil: 1,
  });
  assert.deepEqual(birthdayState(at('2026-10-27T16:00:00.000Z')), {
    year: 2026,
    isBirthday: true,
    anniversary: 1,
    nextBirthday: '2026-10-28',
    daysUntil: 0,
  });
});

test('the whole Shanghai birthday counts as today, then advances at midnight', () => {
  assert.equal(birthdayState(at('2026-10-28T15:59:59.999Z')).daysUntil, 0);
  assert.deepEqual(birthdayState(at('2026-10-28T16:00:00.000Z')), {
    year: 2026,
    isBirthday: false,
    anniversary: 1,
    nextBirthday: '2027-10-28',
    daysUntil: 364,
  });
});

test('anniversaries advance only on birthdays and never fall below one', () => {
  for (const value of ['2025-01-01T00:00:00+08:00', '2026-01-01T00:00:00+08:00']) {
    assert.equal(birthdayState(at(value)).anniversary, 1);
  }
  assert.equal(birthdayState(at('2027-10-27T23:59:59+08:00')).anniversary, 1);
  assert.equal(birthdayState(at('2027-10-28T00:00:00+08:00')).anniversary, 2);
  assert.equal(birthdayState(at('2028-10-27T23:59:59+08:00')).anniversary, 2);
  assert.equal(birthdayState(at('2028-10-28T00:00:00+08:00')).anniversary, 3);
});

test('calendar year and countdown use Shanghai dates across New Year', () => {
  assert.equal(birthdayState(at('2026-12-31T15:59:59.999Z')).daysUntil, 301);
  const newYear = birthdayState(at('2026-12-31T16:00:00.000Z'));
  assert.equal(newYear.year, 2027);
  assert.equal(newYear.daysUntil, 300);
  assert.equal(newYear.anniversary, 1);
});

test('countdown handles leap years and the non-leap century year', () => {
  for (const [date, expected] of [
    ['2027-10-29', 365],
    ['2028-02-28', 243],
    ['2028-02-29', 242],
    ['2028-03-01', 241],
    ['2028-10-29', 364],
    ['2099-10-29', 364],
  ]) {
    assert.equal(birthdayState(at(date + 'T00:00:00+08:00')).daysUntil, expected, date);
  }
});

test('letters target the strictly next birthday, including on the birthday itself', () => {
  assert.equal(letterOpeningDate(at('2026-10-27T15:59:59.999Z')), '2026-10-28');
  assert.equal(letterOpeningDate(at('2026-10-27T16:00:00.000Z')), '2027-10-28');
  assert.equal(letterOpeningDate(at('2026-10-29T00:00:00+08:00')), '2027-10-28');
  assert.equal(letterOpeningDate(at('2027-10-27T23:59:59+08:00')), '2027-10-28');
  assert.equal(letterOpeningDate(at('2027-10-28T00:00:00+08:00')), '2028-10-28');
});

test('saving creates a trimmed letter without mutating its inputs', () => {
  const letters = [];
  const now = at(originalTime);
  const result = saveLetter(letters, '  愿来年的自己快乐。\n ', now);
  assert.deepEqual(result, [{
    year: 2026,
    text: '愿来年的自己快乐。',
    createdAt: originalTime,
    opensOn: '2027-10-28',
  }]);
  assert.deepEqual(letters, []);
  assert.equal(now.toISOString(), originalTime);
});

test('editing across New Year preserves the birthday cohort and original dates', () => {
  const original = saveLetter([], '第一版', at(originalTime));
  const edited = saveLetter(original, '第二版', at('2027-06-01T12:00:00+08:00'));
  assert.deepEqual(edited, [{
    year: 2026,
    text: '第二版',
    createdAt: originalTime,
    opensOn: '2027-10-28',
  }]);
  assert.notStrictEqual(edited, original);
  assert.equal(original[0].text, '第一版');
});

test('a new birthday adds a letter while preserving the previous year', () => {
  const original = saveLetter([], '去年的信', at(originalTime));
  const result = saveLetter(original, '今年的信', at('2027-10-28T00:00:00+08:00'));
  assert.equal(result.length, 2);
  assert.deepEqual(result[0], original[0]);
  assert.deepEqual(result[1], {
    year: 2027,
    text: '今年的信',
    createdAt: '2027-10-27T16:00:00.000Z',
    opensOn: '2028-10-28',
  });
  assert.equal(original.length, 1);
});

test('before the first birthday, letters belong to 2026 and retain their opening date when edited', () => {
  const original = saveLetter([], '第一封', at('2026-10-27T12:00:00+08:00'));
  assert.equal(original[0].year, 2026);
  assert.equal(original[0].opensOn, '2026-10-28');
  const edited = saveLetter(original, '生日修改', at(originalTime));
  assert.equal(edited[0].opensOn, '2026-10-28');
  assert.equal(edited[0].createdAt, original[0].createdAt);
});

test('saving enforces non-empty text and the 5000-character limit after trimming', () => {
  for (const value of ['', ' \n\t ', '字'.repeat(5001), null, 42]) {
    assert.throws(() => saveLetter([], value, at(originalTime)), /1 至 5000/);
  }
  assert.equal(saveLetter([], ' ' + '字'.repeat(5000) + ' ', at(originalTime))[0].text.length, 5000);
});

test('normalization retains valid records and filters malformed stored data', () => {
  const valid = { year: 2026, text: '愿望', createdAt: originalTime, opensOn: '2027-10-28' };
  const leapDate = { year: 2027, text: '闰日', opensOn: '2028-02-29' };
  const invalid = [
    null, undefined, true, 'letter', [], {},
    { ...valid, year: '2026' },
    { ...valid, year: 2025 },
    { ...valid, year: 10000 },
    { ...valid, year: 2026.5 },
    { ...valid, year: NaN },
    { ...valid, text: 7 },
    { ...valid, text: ' \n ' },
    { ...valid, text: '字'.repeat(5001) },
    { ...valid, opensOn: '2027-02-29' },
    { ...valid, opensOn: '2028-02-30' },
    { ...valid, opensOn: '2027-13-01' },
    { ...valid, opensOn: '2027-10-00' },
    { ...valid, opensOn: '2027-1-28' },
    { ...valid, opensOn: '2027-10-28T00:00:00Z' },
    { ...valid, opensOn: null },
  ];
  const input = [valid, ...invalid, leapDate];
  assert.deepEqual(normalizeLetters(input), [valid, leapDate]);
  assert.equal(input.length, invalid.length + 2);
  for (const value of [null, undefined, {}, '[]']) assert.deepEqual(normalizeLetters(value), []);
});

test('saving discards invalid stored records without losing a valid older letter', () => {
  const previous = { year: 2026, text: '旧信', createdAt: originalTime, opensOn: '2027-10-28' };
  const result = saveLetter([null, previous, { year: 2027 }], '新信', at('2027-10-28T00:00:00+08:00'));
  assert.equal(result.length, 2);
  assert.deepEqual(result[0], previous);
  assert.equal(result[1].year, 2027);
});

test('letters open exactly at Shanghai midnight and remain open afterward', () => {
  const letter = { opensOn: '2027-10-28' };
  assert.equal(isLetterOpen(letter, at('2027-10-27T15:59:59.999Z')), false);
  assert.equal(isLetterOpen(letter, at('2027-10-27T16:00:00.000Z')), true);
  assert.equal(isLetterOpen(letter, at('2028-01-01T00:00:00+08:00')), true);
  assert.equal(isLetterOpen({ opensOn: '2027-02-29' }, at(originalTime)), false);
  assert.equal(isLetterOpen(null, at(originalTime)), false);
});

test('letter waiting days change at Shanghai midnight', () => {
  const [letter] = normalizeLetters([{ year: 2026, text: '愿望', opensOn: '2027-10-28' }]);
  assert.equal(letterDaysRemaining(letter, at('2027-10-26T16:00:00.000Z')), 1);
  assert.equal(letterDaysRemaining(letter, at('2027-10-27T15:59:59.999Z')), 1);
  assert.equal(letterDaysRemaining(letter, at('2027-10-27T16:00:00.000Z')), 0);
});

test('letter waiting days stay zero throughout the birthday and after it', () => {
  const [letter] = normalizeLetters([{ year: 2026, text: '愿望', opensOn: '2027-10-28' }]);
  for (const date of [
    '2027-10-28T12:00:00+08:00',
    '2027-10-28T23:59:59.999+08:00',
    '2027-10-29T00:00:00+08:00',
    '2028-10-28T00:00:00+08:00',
  ]) {
    assert.equal(letterDaysRemaining(letter, at(date)), 0, date);
  }
});

test('letter waiting days include leap day when crossing a leap year', () => {
  const [letter] = normalizeLetters([{ year: 2027, text: '愿望', opensOn: '2028-10-28' }]);
  for (const [date, expected] of [
    ['2027-10-28', 366],
    ['2028-02-28', 243],
    ['2028-02-29', 242],
    ['2028-03-01', 241],
  ]) {
    assert.equal(letterDaysRemaining(letter, at(date + 'T00:00:00+08:00')), expected, date);
  }
});

test('plain-text downloads preserve Chinese text and body line breaks with matching dates', () => {
  const body = '  亲爱的自己：\n\n愿你平安、快乐。\n继续向前。  ';
  for (const [year, opensOn, expectedFilename, expectedHeading, expectedOpening] of [
    [2026, '2027-10-28', '生日星球-2026.txt', '2026 年留给自己的信', '开启日期：2027.10.28'],
    [2027, '2028-02-29', '生日星球-2027.txt', '2027 年留给自己的信', '开启日期：2028.02.29'],
  ]) {
    const [letter] = normalizeLetters([{ year, text: body, opensOn }]);
    assert.deepEqual(formatLetterDownload(letter), {
      filename: expectedFilename,
      content: '生日星球\n' + expectedHeading + '\n' + expectedOpening + '\n\n' + body + '\n',
    });
    assert.equal(letter.text, body);
  }
});
