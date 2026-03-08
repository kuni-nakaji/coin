'use strict';
/**
 * stats.js のテスト
 *   - getLevelInfo       : 正解率からレベル情報を返す
 *   - formatTime         : タイムスタンプを相対表現に変換
 *   - reviewFromHistory  : 履歴アイテムのモードに応じて適切な画面に遷移する
 */

// ── getLevelInfo ─────────────────────────────────────────────────
describe('getLevelInfo', () => {
  test('null（未挑戦）→ cls=level-new, stars=❓, label=まだ', () => {
    const info = getLevelInfo(null);
    expect(info.cls).toBe('level-new');
    expect(info.stars).toBe('❓');
    expect(info.label).toBe('まだ');
  });

  test('accuracy = 0.7 → level-great（境界値）', () => {
    const info = getLevelInfo(0.7);
    expect(info.cls).toBe('level-great');
    expect(info.label).toBe('よくわかる');
    expect(info.stars).toBe('⭐⭐⭐');
  });

  test('accuracy = 1.0 → level-great', () => {
    expect(getLevelInfo(1.0).cls).toBe('level-great');
    expect(getLevelInfo(1.0).label).toBe('よくわかる');
  });

  test('accuracy = 0.8 → level-great', () => {
    expect(getLevelInfo(0.8).cls).toBe('level-great');
  });

  test('accuracy = 0.699 → level-good（0.7未満）', () => {
    const info = getLevelInfo(0.699);
    expect(info.cls).toBe('level-good');
    expect(info.label).toBe('わかってきた');
    expect(info.stars).toBe('⭐⭐');
  });

  test('accuracy = 0.5 → level-good（境界値）', () => {
    const info = getLevelInfo(0.5);
    expect(info.cls).toBe('level-good');
    expect(info.label).toBe('わかってきた');
  });

  test('accuracy = 0.6 → level-good', () => {
    expect(getLevelInfo(0.6).cls).toBe('level-good');
  });

  test('accuracy = 0.499 → level-practice（0.5未満）', () => {
    const info = getLevelInfo(0.499);
    expect(info.cls).toBe('level-practice');
    expect(info.label).toBe('れんしゅうしよう');
    expect(info.stars).toBe('⭐');
  });

  test('accuracy = 0.0 → level-practice', () => {
    expect(getLevelInfo(0.0).cls).toBe('level-practice');
  });

  test('accuracy = 0.1 → level-practice', () => {
    expect(getLevelInfo(0.1).cls).toBe('level-practice');
  });
});

// ── formatTime ───────────────────────────────────────────────────
describe('formatTime', () => {
  const now = Date.now();

  test('30秒前 → さっき（1分未満）', () => {
    expect(formatTime(now - 30_000)).toBe('さっき');
  });

  test('59秒前 → さっき', () => {
    expect(formatTime(now - 59_000)).toBe('さっき');
  });

  test('ちょうど1分前 → 1ふんまえ', () => {
    // 60秒 + 少し余裕
    expect(formatTime(now - 61_000)).toBe('1ふんまえ');
  });

  test('30分前 → 30ふんまえ', () => {
    expect(formatTime(now - 30 * 60_000 - 1_000)).toBe('30ふんまえ');
  });

  test('59分前 → 59ふんまえ', () => {
    expect(formatTime(now - 59 * 60_000 - 1_000)).toBe('59ふんまえ');
  });

  test('ちょうど1時間前 → 1じかんまえ', () => {
    expect(formatTime(now - 60 * 60_000 - 1_000)).toBe('1じかんまえ');
  });

  test('6時間前 → 6じかんまえ', () => {
    expect(formatTime(now - 6 * 60 * 60_000 - 1_000)).toBe('6じかんまえ');
  });

  test('23時間前 → 23じかんまえ', () => {
    expect(formatTime(now - 23 * 60 * 60_000 - 1_000)).toBe('23じかんまえ');
  });

  test('ちょうど1日前 → 1にちまえ', () => {
    expect(formatTime(now - 24 * 60 * 60_000 - 1_000)).toBe('1にちまえ');
  });

  test('3日前 → 3にちまえ', () => {
    expect(formatTime(now - 3 * 24 * 60 * 60_000 - 1_000)).toBe('3にちまえ');
  });
});

// ── reviewFromHistory ルーティング ───────────────────────────────
describe('reviewFromHistory: ルーティング', () => {
  // テスト前後で遷移関数をモック化・復元する
  let originals = {};

  const MOCK_FUNS = [
    'showForcedCoinQuiz',
    'showForcedComboQuiz',
    'startReadingReview',
    '_startQuizReview',
    '_startGameReview',
    // _startQuizReview が内部で呼ぶ依存
    'showScreen',
    'initQuizEarnings',
  ];

  beforeEach(() => {
    // 各関数の現在値を保存してから jest.fn() で置き換える
    MOCK_FUNS.forEach(fn => {
      originals[fn] = global[fn];
      global[fn] = jest.fn();
    });

    // document.getElementById モック（_startGameReview 等が呼ぶ場合に備える）
    originals['document'] = global.document;
    global.document = {
      getElementById: jest.fn(() => ({
        classList: { remove: jest.fn(), add: jest.fn() },
        style: {},
        textContent: '',
        innerHTML:   '',
      })),
    };
  });

  afterEach(() => {
    // 元の関数に戻す
    MOCK_FUNS.forEach(fn => { global[fn] = originals[fn]; });
    global.document = originals['document'];
  });

  // ── 正常ルーティング ──────────────────────────────────────────
  test('mode=quiz → _startQuizReview と showForcedCoinQuiz が呼ばれる', () => {
    const h = { target: 100, mode: 'quiz', correct: true, timestamp: Date.now() };
    reviewFromHistory(h);
    expect(global._startQuizReview).toHaveBeenCalledTimes(1);
    expect(global.showForcedCoinQuiz).toHaveBeenCalledTimes(1);
    // showForcedCoinQuiz の引数は MONEY_DATA[value=100] のオブジェクト
    const calledWith = global.showForcedCoinQuiz.mock.calls[0][0];
    expect(calledWith.value).toBe(100);
  });

  test('mode=game → _startGameReview(target) が呼ばれる', () => {
    const h = { target: 10, mode: 'game', correct: false, timestamp: Date.now() };
    reviewFromHistory(h);
    expect(global._startGameReview).toHaveBeenCalledWith(10);
  });

  test('mode=reading → startReadingReview(target) が呼ばれる', () => {
    // target は MONEY_DATA に存在しない任意の数（よみかたは任意の数を扱う）
    const h = { target: 543, mode: 'reading', correct: false, timestamp: Date.now() };
    reviewFromHistory(h);
    expect(global.startReadingReview).toHaveBeenCalledWith(543);
    // 他の遷移関数は呼ばれない
    expect(global._startQuizReview).not.toHaveBeenCalled();
    expect(global._startGameReview).not.toHaveBeenCalled();
  });

  // ── コンボ（isCombo=true が優先される）──────────────────────
  test('isCombo=true → showForcedComboQuiz(comboItems, target) が呼ばれる', () => {
    const h = {
      target: 60, mode: 'quiz', isCombo: true, comboItems: [10, 50],
      correct: false, timestamp: Date.now(),
    };
    reviewFromHistory(h);
    expect(global._startQuizReview).toHaveBeenCalled();
    expect(global.showForcedComboQuiz).toHaveBeenCalledWith([10, 50], 60);
    // 単体クイズ用の関数は呼ばれない
    expect(global.showForcedCoinQuiz).not.toHaveBeenCalled();
  });

  // ── mode 未設定（後方互換: 旧データ）────────────────────────
  test('mode 未設定 + MONEY_DATA に存在する値 → quiz に遷移', () => {
    // 100円は MONEY_DATA スタブに存在する
    const h = { target: 100, correct: true, timestamp: Date.now() };
    reviewFromHistory(h);
    expect(global._startQuizReview).toHaveBeenCalled();
    expect(global.showForcedCoinQuiz).toHaveBeenCalled();
  });

  test('mode 未設定 + MONEY_DATA に存在しない値 → game に遷移', () => {
    // 15円は MONEY_DATA スタブに存在しない（QUESTIONS には存在するゲーム問題）
    const h = { target: 15, correct: false, timestamp: Date.now() };
    reviewFromHistory(h);
    expect(global._startGameReview).toHaveBeenCalledWith(15);
    expect(global._startQuizReview).not.toHaveBeenCalled();
  });

  // ── 不正な入力はクラッシュせず何もしない ───────────────────
  test('null を渡しても例外を投げない', () => {
    expect(() => reviewFromHistory(null)).not.toThrow();
    expect(global._startQuizReview).not.toHaveBeenCalled();
    expect(global._startGameReview).not.toHaveBeenCalled();
  });

  test('undefined を渡しても例外を投げない', () => {
    expect(() => reviewFromHistory(undefined)).not.toThrow();
  });

  test('プリミティブ値を渡しても例外を投げない', () => {
    expect(() => reviewFromHistory(42)).not.toThrow();
    expect(() => reviewFromHistory('quiz')).not.toThrow();
  });

  // ── 排他性（1つのモードにつき1回だけ遷移）──────────────────
  test('mode=quiz でも showForcedComboQuiz は呼ばれない', () => {
    const h = { target: 100, mode: 'quiz', correct: true, timestamp: Date.now() };
    reviewFromHistory(h);
    expect(global.showForcedComboQuiz).not.toHaveBeenCalled();
    expect(global.startReadingReview).not.toHaveBeenCalled();
  });

  test('mode=game でも quiz/reading 遷移は呼ばれない', () => {
    const h = { target: 10, mode: 'game', correct: false, timestamp: Date.now() };
    reviewFromHistory(h);
    expect(global._startQuizReview).not.toHaveBeenCalled();
    expect(global.showForcedCoinQuiz).not.toHaveBeenCalled();
    expect(global.startReadingReview).not.toHaveBeenCalled();
  });

  test('mode=reading でも quiz/game 遷移は呼ばれない', () => {
    const h = { target: 543, mode: 'reading', correct: false, timestamp: Date.now() };
    reviewFromHistory(h);
    expect(global._startQuizReview).not.toHaveBeenCalled();
    expect(global.showForcedCoinQuiz).not.toHaveBeenCalled();
    expect(global._startGameReview).not.toHaveBeenCalled();
  });
});
