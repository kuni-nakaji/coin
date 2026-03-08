/**
 * Jest セットアップファイル
 *
 * テスト実行前に以下を行う:
 *   1. localStorage モックを global に設定
 *   2. テスト用スタブ（MONEY_DATA / QUESTIONS）を global に設定
 *   3. ソースファイルを間接 eval でグローバルスコープに展開
 *
 * 注: vm.runInThisContext は Node.js メイン V8 コンテキストで実行されるが
 *     Jest は各テストファイルを独立した VM コンテキストで実行するため、
 *     (0, eval)(code) という間接 eval を使って Jest のグローバルに展開する。
 */

const fs   = require('fs');
const path = require('path');

// ── 1. localStorage モック ───────────────────────────────────────
//   Node 環境には localStorage がないため提供する
const _store = {};
global.localStorage = {
  getItem:    (k)    => Object.prototype.hasOwnProperty.call(_store, k) ? _store[k] : null,
  setItem:    (k, v) => { _store[String(k)] = String(v); },
  removeItem: (k)    => { delete _store[String(k)]; },
  clear:      ()     => { Object.keys(_store).forEach(k => delete _store[k]); },
};

// ── 2. MONEY_DATA スタブ（SVG は空タグで代用）────────────────────
global.MONEY_DATA = [
  { value: 1,     type: 'coin', label: '1えん',     svg: '<svg/>', size: 60 },
  { value: 5,     type: 'coin', label: '5えん',     svg: '<svg/>', size: 65 },
  { value: 10,    type: 'coin', label: '10えん',    svg: '<svg/>', size: 68 },
  { value: 50,    type: 'coin', label: '50えん',    svg: '<svg/>', size: 72 },
  { value: 100,   type: 'coin', label: '100えん',   svg: '<svg/>', size: 75 },
  { value: 500,   type: 'coin', label: '500えん',   svg: '<svg/>', size: 80 },
  { value: 1000,  type: 'bill', label: '1000えん',  svg: '<svg/>', width: 160, height: 70 },
  { value: 5000,  type: 'bill', label: '5000えん',  svg: '<svg/>', width: 160, height: 70 },
  { value: 10000, type: 'bill', label: '10000えん', svg: '<svg/>', width: 160, height: 70 },
];

// ── 3. QUESTIONS スタブ ─────────────────────────────────────────
global.QUESTIONS = [
  { target: 1,    difficulty: 1, hint: '1えん1まい' },
  { target: 5,    difficulty: 1, hint: '5えん1まい' },
  { target: 10,   difficulty: 1, hint: '10えん1まい' },
  { target: 11,   difficulty: 1, hint: '10えんと1えん' },
  { target: 15,   difficulty: 1, hint: '10えんと5えん' },
  { target: 100,  difficulty: 2, hint: '100えん1まい' },
  { target: 500,  difficulty: 3, hint: '500えん1まい' },
  { target: 1000, difficulty: 4, hint: '1000えん1まい' },
];

// ── 4. ソースファイルをグローバルスコープに展開 ──────────────────
//   (0, eval)(code) = 間接 eval → Jest サンドボックスのグローバルスコープで実行
//   function 宣言が global.xxx として登録される
const srcDir = path.resolve(__dirname, '..');
[
  'utils.js',
  'storage.js',
  'reading.js',
  'quiz.js',
  'stats.js',
].forEach(file => {
  const code = fs.readFileSync(path.join(srcDir, file), 'utf8');
  // eslint-disable-next-line no-eval
  (0, eval)(code);
});
