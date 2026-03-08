'use strict';
/**
 * utils.js のテスト
 *   - formatYen      : 数値を日本語ロケールでカンマ区切り文字列に変換
 *   - shuffleArray   : 配列をシャッフル（破壊的変更なし）
 *   - calcSelectedTotal : { [value]: count } オブジェクトから合計金額を計算
 */

// ── formatYen ─────────────────────────────────────────────────────
describe('formatYen', () => {
  test('1 → "1"', () => {
    expect(formatYen(1)).toBe('1');
  });

  test('10 → "10"', () => {
    expect(formatYen(10)).toBe('10');
  });

  test('500 → "500"', () => {
    expect(formatYen(500)).toBe('500');
  });

  test('1000 → "1,000"', () => {
    expect(formatYen(1000)).toBe('1,000');
  });

  test('5000 → "5,000"', () => {
    expect(formatYen(5000)).toBe('5,000');
  });

  test('10000 → "10,000"', () => {
    expect(formatYen(10000)).toBe('10,000');
  });

  test('0 → "0"', () => {
    expect(formatYen(0)).toBe('0');
  });
});

// ── shuffleArray ─────────────────────────────────────────────────
describe('shuffleArray', () => {
  test('元の配列を変更しない（破壊的変更なし）', () => {
    const original = [1, 5, 10, 50, 100, 500];
    const copy = [...original];
    shuffleArray(original);
    expect(original).toEqual(copy);
  });

  test('同じ要素がすべて含まれる', () => {
    const arr = [1, 5, 10, 50, 100, 500];
    const result = shuffleArray(arr);
    expect(result.sort((a, b) => a - b)).toEqual([...arr].sort((a, b) => a - b));
  });

  test('同じ長さを返す', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect(shuffleArray(arr)).toHaveLength(arr.length);
  });

  test('空配列は空配列を返す', () => {
    expect(shuffleArray([])).toEqual([]);
  });

  test('1要素配列はそのまま返す', () => {
    expect(shuffleArray([42])).toEqual([42]);
  });

  test('新しい配列を返す（同一参照でない）', () => {
    const arr = [1, 2, 3];
    const result = shuffleArray(arr);
    expect(result).not.toBe(arr);
  });

  test('50回実行して少なくとも一度は順序が変わる（確率的検証）', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const original = arr.join(',');
    let differentCount = 0;
    for (let i = 0; i < 50; i++) {
      if (shuffleArray(arr).join(',') !== original) differentCount++;
    }
    // 10要素を50回シャッフルして一度も変わらない確率は (1/10!)^50 ≈ 0
    expect(differentCount).toBeGreaterThan(0);
  });
});

// ── calcSelectedTotal ────────────────────────────────────────────
describe('calcSelectedTotal', () => {
  test('空のオブジェクトは 0', () => {
    expect(calcSelectedTotal({})).toBe(0);
  });

  test('単一コイン × 1', () => {
    expect(calcSelectedTotal({ 100: 1 })).toBe(100);
  });

  test('単一コイン × 複数', () => {
    expect(calcSelectedTotal({ 10: 5 })).toBe(50);
  });

  test('複数種類の合計', () => {
    expect(calcSelectedTotal({ 1: 3, 5: 2, 10: 1 })).toBe(23); // 3+10+10
  });

  test('コインとお札の混合', () => {
    expect(calcSelectedTotal({ 1000: 2, 500: 1 })).toBe(2500);
  });

  test('大きな金額', () => {
    expect(calcSelectedTotal({ 10000: 1, 5000: 1, 1000: 3 })).toBe(18000);
  });

  test('count が 0 のエントリは合計に影響しない', () => {
    expect(calcSelectedTotal({ 100: 0, 50: 2 })).toBe(100);
  });

  test('文字列キーも数値として計算される', () => {
    // JavaScript のオブジェクトキーは文字列として保存される
    const selected = {};
    selected[500] = 3;
    expect(calcSelectedTotal(selected)).toBe(1500);
  });
});
