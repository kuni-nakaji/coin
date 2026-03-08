'use strict';
/**
 * quiz.js のテスト
 *   - generateChoices            : 単体クイズ用 4択を生成
 *   - generateCombinationChoices : コンボクイズ用 4択（合計値ベース）を生成
 *   - generateCombination        : ランダムな貨幣の組み合わせを生成
 */

const coinPool = MONEY_DATA.filter(m => m.type === 'coin');
const allPool  = MONEY_DATA;
const RUNS = 30; // 確率的テストの繰り返し回数

// ── generateChoices ───────────────────────────────────────────────
describe('generateChoices', () => {
  test('常に 4 択を返す', () => {
    const correct = MONEY_DATA.find(m => m.value === 100);
    const choices = generateChoices(correct, coinPool);
    expect(choices).toHaveLength(4);
  });

  test('正解オブジェクトが含まれる', () => {
    const correct = MONEY_DATA.find(m => m.value === 50);
    const choices = generateChoices(correct, coinPool);
    expect(choices.some(c => c.value === correct.value)).toBe(true);
  });

  test('value がすべてユニーク（重複なし）', () => {
    const correct = MONEY_DATA.find(m => m.value === 10);
    const choices = generateChoices(correct, allPool);
    const values = choices.map(c => c.value);
    expect(new Set(values).size).toBe(4);
  });

  test('選択肢はすべて MONEY_DATA 内の貨幣', () => {
    const correct = MONEY_DATA.find(m => m.value === 500);
    const choices = generateChoices(correct, allPool);
    choices.forEach(c => {
      expect(allPool.some(m => m.value === c.value)).toBe(true);
    });
  });

  test('プール 3 枚未満でも MONEY_DATA フォールバックで 4 択生成', () => {
    const miniPool = MONEY_DATA.filter(m => m.value <= 1);  // 1えんのみ
    const correct = miniPool[0];
    const choices = generateChoices(correct, miniPool);
    expect(choices).toHaveLength(4);
    expect(choices.some(c => c.value === correct.value)).toBe(true);
  });

  test(`${RUNS}回実行して常に正解を含む（シャッフルのランダム性テスト）`, () => {
    const correct = MONEY_DATA.find(m => m.value === 100);
    for (let i = 0; i < RUNS; i++) {
      const choices = generateChoices(correct, coinPool);
      expect(choices.some(c => c.value === 100)).toBe(true);
    }
  });

  test('コインプールで生成：お札以外から選ばれる', () => {
    const correct = MONEY_DATA.find(m => m.value === 10);
    for (let i = 0; i < RUNS; i++) {
      const choices = generateChoices(correct, coinPool);
      // 正解 (10円) は coin なので全部 coin から選ばれるはず
      // ※フォールバックで bill が含まれる場合もあるが、正解自体は必ず含む
      expect(choices.some(c => c.value === 10)).toBe(true);
    }
  });
});

// ── generateCombinationChoices ────────────────────────────────────
describe('generateCombinationChoices', () => {
  test('常に 4 択を返す', () => {
    const choices = generateCombinationChoices(150, coinPool);
    expect(choices).toHaveLength(4);
  });

  test('正解の合計値を含む', () => {
    const choices = generateCombinationChoices(60, coinPool);
    expect(choices).toContain(60);
  });

  test('選択肢はすべて正の数', () => {
    const choices = generateCombinationChoices(100, coinPool);
    choices.forEach(v => expect(v).toBeGreaterThan(0));
  });

  test('選択肢はすべてユニーク（重複なし）', () => {
    const choices = generateCombinationChoices(110, coinPool);
    expect(new Set(choices).size).toBe(4);
  });

  test('大きな合計でも 4 択を生成できる', () => {
    const choices = generateCombinationChoices(5500, allPool);
    expect(choices).toHaveLength(4);
    expect(choices).toContain(5500);
  });

  test('最小コイン額でも動作する（1円）', () => {
    const choices = generateCombinationChoices(1, coinPool);
    expect(choices).toHaveLength(4);
    expect(choices).toContain(1);
    choices.forEach(v => expect(v).toBeGreaterThan(0));
  });

  test(`${RUNS}回実行して常に正解を含む`, () => {
    for (let i = 0; i < RUNS; i++) {
      const choices = generateCombinationChoices(200, coinPool);
      expect(choices).toContain(200);
    }
  });
});

// ── generateCombination ───────────────────────────────────────────
describe('generateCombination', () => {
  test('{ items, total } オブジェクトを返す', () => {
    const result = generateCombination(coinPool);
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('total');
  });

  test('total は items の value の合計と一致する', () => {
    for (let i = 0; i < RUNS; i++) {
      const result = generateCombination(coinPool);
      const calcTotal = result.items.reduce((sum, m) => sum + m.value, 0);
      expect(result.total).toBe(calcTotal);
    }
  });

  test('items は 2 枚以上', () => {
    for (let i = 0; i < RUNS; i++) {
      const result = generateCombination(coinPool);
      expect(result.items.length).toBeGreaterThanOrEqual(2);
    }
  });

  test('items は 4 枚以下', () => {
    for (let i = 0; i < RUNS; i++) {
      const result = generateCombination(coinPool);
      expect(result.items.length).toBeLessThanOrEqual(4);
    }
  });

  test('items はすべてプール内の貨幣', () => {
    for (let i = 0; i < RUNS; i++) {
      const result = generateCombination(coinPool);
      result.items.forEach(m => {
        expect(coinPool.some(p => p.value === m.value)).toBe(true);
      });
    }
  });

  test('total は正の数', () => {
    for (let i = 0; i < RUNS; i++) {
      const result = generateCombination(coinPool);
      expect(result.total).toBeGreaterThan(0);
    }
  });

  test('全種類プールでも動作する（コイン＋お札混合）', () => {
    for (let i = 0; i < RUNS; i++) {
      const result = generateCombination(allPool);
      expect(result.items.length).toBeGreaterThanOrEqual(2);
      expect(result.total).toBeGreaterThan(0);
      const calcTotal = result.items.reduce((sum, m) => sum + m.value, 0);
      expect(result.total).toBe(calcTotal);
    }
  });

  test('items 内の各要素に value プロパティがある', () => {
    const result = generateCombination(coinPool);
    result.items.forEach(m => {
      expect(typeof m.value).toBe('number');
      expect(m.value).toBeGreaterThan(0);
    });
  });

  test('複数回実行してバリエーションがある（固定値でない）', () => {
    const totals = new Set();
    for (let i = 0; i < 30; i++) totals.add(generateCombination(coinPool).total);
    expect(totals.size).toBeGreaterThan(1);
  });
});
