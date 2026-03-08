'use strict';
/**
 * storage.js のテスト
 *   - loadStats / saveStats : localStorage への統計データ読み書き
 *   - recordResult          : 正誤を記録し、questionStats と history を更新
 *   - getAccuracy           : 特定ターゲットの正解率を返す
 *   - weightedSelect        : 正解率が低いほど選ばれやすい重み付き選択
 *   - loadEarnings / saveEarnings / clearEarnings : 獲得金額の永続化
 */

// 各テスト前にストレージをリセット
beforeEach(() => {
  localStorage.clear();
});

// ── loadStats ────────────────────────────────────────────────────
describe('loadStats', () => {
  test('データなしの場合はデフォルトを返す', () => {
    expect(loadStats()).toEqual({ questionStats: {}, history: [] });
  });

  test('保存済みデータを正しく復元する', () => {
    const sample = {
      questionStats: { 100: { attempts: 3, correct: 2 } },
      history: [{ target: 100, correct: true, timestamp: 1000 }],
    };
    localStorage.setItem('coinGameData', JSON.stringify(sample));
    expect(loadStats()).toEqual(sample);
  });

  test('壊れた JSON の場合はデフォルトを返す', () => {
    localStorage.setItem('coinGameData', 'INVALID_JSON{{');
    expect(loadStats()).toEqual({ questionStats: {}, history: [] });
  });

  test('空文字列の場合はデフォルトを返す', () => {
    localStorage.setItem('coinGameData', '');
    expect(loadStats()).toEqual({ questionStats: {}, history: [] });
  });
});

// ── recordResult ─────────────────────────────────────────────────
describe('recordResult', () => {
  test('初回記録（不正解）: attempts=1, correct=0', () => {
    recordResult(100, false, { mode: 'game' });
    const { questionStats } = loadStats();
    expect(questionStats[100]).toEqual({ attempts: 1, correct: 0 });
  });

  test('初回記録（正解）: attempts=1, correct=1', () => {
    recordResult(50, true, { mode: 'quiz' });
    const { questionStats } = loadStats();
    expect(questionStats[50]).toEqual({ attempts: 1, correct: 1 });
  });

  test('2回目以降は attempts が累積される', () => {
    recordResult(10, true,  {});
    recordResult(10, false, {});
    recordResult(10, true,  {});
    const { questionStats } = loadStats();
    expect(questionStats[10]).toEqual({ attempts: 3, correct: 2 });
  });

  test('複数ターゲットは独立して記録される', () => {
    recordResult(100, true,  { mode: 'game' });
    recordResult(50,  false, { mode: 'quiz' });
    const { questionStats } = loadStats();
    expect(questionStats[100]).toEqual({ attempts: 1, correct: 1 });
    expect(questionStats[50]).toEqual({ attempts: 1, correct: 0 });
  });

  test('履歴に追加される（最新が先頭）', () => {
    recordResult(100, true,  { mode: 'game' });
    recordResult(50,  false, { mode: 'quiz' });
    const { history } = loadStats();
    expect(history[0].target).toBe(50);
    expect(history[1].target).toBe(100);
  });

  test('extra フィールドが履歴に保存される', () => {
    recordResult(60, true, { mode: 'quiz', isCombo: true, comboItems: [10, 50] });
    const { history } = loadStats();
    expect(history[0].mode).toBe('quiz');
    expect(history[0].isCombo).toBe(true);
    expect(history[0].comboItems).toEqual([10, 50]);
  });

  test('履歴に target / correct / timestamp が含まれる', () => {
    const before = Date.now();
    recordResult(100, true, {});
    const after  = Date.now();
    const { history } = loadStats();
    expect(history[0].target).toBe(100);
    expect(history[0].correct).toBe(true);
    expect(history[0].timestamp).toBeGreaterThanOrEqual(before);
    expect(history[0].timestamp).toBeLessThanOrEqual(after);
  });

  test('履歴は最大 20 件に制限される', () => {
    for (let i = 1; i <= 25; i++) {
      recordResult(i, true, {});
    }
    const { history } = loadStats();
    expect(history).toHaveLength(20);
  });

  test('20件超えた場合、最古データが削除される', () => {
    for (let i = 1; i <= 25; i++) {
      recordResult(i, true, {});
    }
    const { history } = loadStats();
    // 最新 (target=25) が先頭、最古 (target=1〜5) は消えている
    expect(history[0].target).toBe(25);
    const targets = history.map(h => h.target);
    expect(targets).not.toContain(1);
    expect(targets).not.toContain(5);
  });
});

// ── getAccuracy ──────────────────────────────────────────────────
describe('getAccuracy', () => {
  test('データなしの場合は null を返す', () => {
    expect(getAccuracy(999)).toBeNull();
  });

  test('attempts=0 の場合は null を返す', () => {
    localStorage.setItem('coinGameData', JSON.stringify({
      questionStats: { 100: { attempts: 0, correct: 0 } },
      history: [],
    }));
    expect(getAccuracy(100)).toBeNull();
  });

  test('全問正解は 1.0', () => {
    recordResult(100, true, {});
    recordResult(100, true, {});
    expect(getAccuracy(100)).toBe(1.0);
  });

  test('全問不正解は 0.0', () => {
    recordResult(50, false, {});
    recordResult(50, false, {});
    expect(getAccuracy(50)).toBe(0.0);
  });

  test('正解率を正しく計算する（2/3 ≈ 0.667）', () => {
    recordResult(10, true,  {});
    recordResult(10, true,  {});
    recordResult(10, false, {});
    expect(getAccuracy(10)).toBeCloseTo(2 / 3, 5);
  });
});

// ── weightedSelect ───────────────────────────────────────────────
describe('weightedSelect', () => {
  const coinPool = MONEY_DATA.filter(m => m.type === 'coin');

  test('プール内の要素を返す', () => {
    const result = weightedSelect(coinPool, m => m.value);
    expect(coinPool).toContainEqual(result);
  });

  test('複数回実行しても常にプール内の要素を返す', () => {
    for (let i = 0; i < 20; i++) {
      const result = weightedSelect(coinPool, m => m.value);
      expect(coinPool.some(m => m.value === result.value)).toBe(true);
    }
  });

  test('1要素プールはその要素を返す', () => {
    const single = [MONEY_DATA.find(m => m.value === 1)];
    expect(weightedSelect(single, m => m.value)).toBe(single[0]);
  });

  test('未挑戦アイテムが選ばれる（weight=3 なのでゼロにならない）', () => {
    // localStorage は空 → 全員 weight=3 → どれかが返る
    const result = weightedSelect(coinPool, m => m.value);
    expect(result).toBeTruthy();
  });

  test('苦手アイテムが高確率で選ばれる（統計的検証）', () => {
    // 1円のみ正解率 0（苦手 weight=6）、他は全正解（得意 weight=1）
    const pool = MONEY_DATA.filter(m => m.type === 'coin');
    // 1円を苦手にする
    for (let i = 0; i < 5; i++) recordResult(1, false, {});
    // 他を全正解にする
    [5, 10, 50, 100, 500].forEach(v => {
      for (let i = 0; i < 5; i++) recordResult(v, true, {});
    });
    let countOne = 0;
    for (let i = 0; i < 60; i++) {
      if (weightedSelect(pool, m => m.value).value === 1) countOne++;
    }
    // 1円の weight=6、他5種の合計 weight=5 → 期待値: 6/11 * 60 ≈ 32.7
    // 確率的テストなので 15 回以上を確認（緩めの閾値）
    expect(countOne).toBeGreaterThan(15);
  });
});

// ── loadEarnings / saveEarnings / clearEarnings ──────────────────
describe('loadEarnings / saveEarnings / clearEarnings', () => {
  test('データなしはデフォルト { earnings:0, lastUpdate:0 }', () => {
    expect(loadEarnings()).toEqual({ earnings: 0, lastUpdate: 0 });
  });

  test('saveEarnings で保存、loadEarnings で復元できる', () => {
    const before = Date.now();
    saveEarnings(5000);
    const result = loadEarnings();
    const after  = Date.now();
    expect(result.earnings).toBe(5000);
    expect(result.lastUpdate).toBeGreaterThanOrEqual(before);
    expect(result.lastUpdate).toBeLessThanOrEqual(after);
  });

  test('clearEarnings でデータが削除される', () => {
    saveEarnings(1000);
    clearEarnings();
    expect(loadEarnings()).toEqual({ earnings: 0, lastUpdate: 0 });
  });

  test('壊れたデータはデフォルトを返す', () => {
    localStorage.setItem('coinQuizEarnings', 'BAD_JSON');
    expect(loadEarnings()).toEqual({ earnings: 0, lastUpdate: 0 });
  });
});
