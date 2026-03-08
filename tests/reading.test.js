'use strict';
/**
 * reading.js のテスト
 *   - decomposeReading      : 数値をひらがなカードの配列に分解
 *   - generateReadingNumber : 難易度に応じたランダムな数値を生成
 *   - buildReadingPalette   : 正解カード + ダミーカードのパレットを生成
 */

// ── decomposeReading ─────────────────────────────────────────────
describe('decomposeReading', () => {
  // 1桁
  test('1  → [いち]', () => {
    expect(decomposeReading(1)).toEqual(['いち']);
  });
  test('5  → [ご]', () => {
    expect(decomposeReading(5)).toEqual(['ご']);
  });
  test('9  → [きゅう]', () => {
    expect(decomposeReading(9)).toEqual(['きゅう']);
  });

  // 2桁
  test('10 → [じゅう]', () => {
    expect(decomposeReading(10)).toEqual(['じゅう']);
  });
  test('11 → [じゅう, いち]', () => {
    expect(decomposeReading(11)).toEqual(['じゅう', 'いち']);
  });
  test('15 → [じゅう, ご]', () => {
    expect(decomposeReading(15)).toEqual(['じゅう', 'ご']);
  });
  test('20 → [に, じゅう]', () => {
    expect(decomposeReading(20)).toEqual(['に', 'じゅう']);
  });
  test('35 → [さん, じゅう, ご]', () => {
    expect(decomposeReading(35)).toEqual(['さん', 'じゅう', 'ご']);
  });
  test('99 → [きゅう, じゅう, きゅう]', () => {
    expect(decomposeReading(99)).toEqual(['きゅう', 'じゅう', 'きゅう']);
  });

  // 3桁（100の桁が1のとき数字省略）
  test('100 → [ひゃく]', () => {
    expect(decomposeReading(100)).toEqual(['ひゃく']);
  });
  test('200 → [に, ひゃく]', () => {
    expect(decomposeReading(200)).toEqual(['に', 'ひゃく']);
  });
  test('110 → [ひゃく, じゅう]', () => {
    expect(decomposeReading(110)).toEqual(['ひゃく', 'じゅう']);
  });
  test('123 → [ひゃく, に, じゅう, さん]', () => {
    expect(decomposeReading(123)).toEqual(['ひゃく', 'に', 'じゅう', 'さん']);
  });
  test('350 → [さん, ひゃく, ご, じゅう]', () => {
    expect(decomposeReading(350)).toEqual(['さん', 'ひゃく', 'ご', 'じゅう']);
  });
  test('999 → [きゅう, ひゃく, きゅう, じゅう, きゅう]', () => {
    expect(decomposeReading(999)).toEqual(['きゅう', 'ひゃく', 'きゅう', 'じゅう', 'きゅう']);
  });

  // 4桁（1000の桁が1のとき数字省略）
  test('1000 → [せん]', () => {
    expect(decomposeReading(1000)).toEqual(['せん']);
  });
  test('2000 → [に, せん]', () => {
    expect(decomposeReading(2000)).toEqual(['に', 'せん']);
  });
  test('1100 → [せん, ひゃく]', () => {
    expect(decomposeReading(1100)).toEqual(['せん', 'ひゃく']);
  });
  test('1234 → [せん, に, ひゃく, さん, じゅう, よん]', () => {
    expect(decomposeReading(1234)).toEqual(['せん', 'に', 'ひゃく', 'さん', 'じゅう', 'よん']);
  });
  test('2343 → [に, せん, さん, ひゃく, よん, じゅう, さん]', () => {
    expect(decomposeReading(2343)).toEqual(['に', 'せん', 'さん', 'ひゃく', 'よん', 'じゅう', 'さん']);
  });
  test('9999 → [きゅう, せん, きゅう, ひゃく, きゅう, じゅう, きゅう]', () => {
    expect(decomposeReading(9999)).toEqual(['きゅう', 'せん', 'きゅう', 'ひゃく', 'きゅう', 'じゅう', 'きゅう']);
  });

  // 端数（下位桁のみ）
  test('1001 → [せん, いち]', () => {
    expect(decomposeReading(1001)).toEqual(['せん', 'いち']);
  });
  test('1010 → [せん, じゅう]', () => {
    expect(decomposeReading(1010)).toEqual(['せん', 'じゅう']);
  });
});

// ── generateReadingNumber ────────────────────────────────────────
describe('generateReadingNumber', () => {
  const RUNS = 60;

  test('難易度1: 11〜99 の整数', () => {
    for (let i = 0; i < RUNS; i++) {
      const n = generateReadingNumber(1);
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(11);
      expect(n).toBeLessThanOrEqual(99);
    }
  });

  test('難易度2: 100〜999 の整数', () => {
    for (let i = 0; i < RUNS; i++) {
      const n = generateReadingNumber(2);
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(100);
      expect(n).toBeLessThanOrEqual(999);
    }
  });

  test('難易度3: 1001〜9999 の整数', () => {
    for (let i = 0; i < RUNS; i++) {
      const n = generateReadingNumber(3);
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(1001);
      expect(n).toBeLessThanOrEqual(9999);
    }
  });

  test('60回実行してバリエーションがある（固定値でない）', () => {
    const values = new Set();
    for (let i = 0; i < 60; i++) values.add(generateReadingNumber(1));
    expect(values.size).toBeGreaterThan(1);
  });
});

// ── buildReadingPalette ──────────────────────────────────────────
describe('buildReadingPalette', () => {
  test('正解カードをすべて含む', () => {
    const correct = ['に', 'せん', 'さん', 'ひゃく'];
    const palette = buildReadingPalette(correct);
    const texts = palette.map(c => c.text);
    correct.forEach(c => expect(texts).toContain(c));
  });

  test('パレット枚数は correct より多い（ダミー追加）', () => {
    const correct = ['じゅう', 'いち'];
    const palette = buildReadingPalette(correct);
    expect(palette.length).toBeGreaterThan(correct.length);
  });

  test('各カードに id / text / used プロパティがある', () => {
    const palette = buildReadingPalette(['に', 'じゅう']);
    palette.forEach(card => {
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('text');
      expect(card).toHaveProperty('used', false);
    });
  });

  test('すべての id がユニーク', () => {
    const palette = buildReadingPalette(['さん', 'ひゃく', 'ご', 'じゅう']);
    const ids = palette.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('ダミーには正解と重複しないカードが含まれる', () => {
    const correct = ['いち'];   // ダミーとして別の数字・単位が追加される
    const palette = buildReadingPalette(correct);
    expect(palette.length).toBeGreaterThan(1);
    // 正解は 1 枚だが、パレットには複数枚ある
    expect(palette.filter(c => c.text === 'いち')).toHaveLength(1);
  });

  test('正解が重複する場合（例:「じゅう」が2回）でも正しく生成される', () => {
    // 20 → ['に', 'じゅう'] : 単純ケース
    // 110 → ['ひゃく', 'じゅう'] のような重複はないが、
    // correct 配列に重複要素があっても動作確認
    const correct = ['じゅう', 'に', 'じゅう'];  // 意図的に重複
    const palette = buildReadingPalette(correct);
    const texts = palette.map(c => c.text);
    // 正解に含まれるカードがパレットに存在する
    expect(texts.filter(t => t === 'じゅう').length).toBeGreaterThanOrEqual(2);
    expect(texts).toContain('に');
  });

  test('id の形式は "rc_数字"', () => {
    const palette = buildReadingPalette(['いち', 'じゅう']);
    palette.forEach(card => {
      expect(card.id).toMatch(/^rc_\d+$/);
    });
  });
});
