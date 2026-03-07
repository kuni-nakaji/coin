// === localStorage / 統計 ===
const STORAGE_KEY = 'coinGameData';

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { questionStats: {}, history: [] };
    return JSON.parse(raw);
  } catch (e) {
    return { questionStats: {}, history: [] };
  }
}

function saveStats(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { /* quota exceeded など無視 */ }
}

function recordResult(target, correct, extra = {}) {
  const data = loadStats();

  if (!data.questionStats[target]) {
    data.questionStats[target] = { attempts: 0, correct: 0 };
  }
  data.questionStats[target].attempts++;
  if (correct) data.questionStats[target].correct++;

  data.history.unshift({ target, correct, timestamp: Date.now(), ...extra });
  if (data.history.length > 20) data.history.length = 20;

  saveStats(data);
}

// === クイズ獲得金額の永続化（1時間TTL）===
const EARNINGS_KEY = 'coinQuizEarnings';

function loadEarnings() {
  try {
    const raw = localStorage.getItem(EARNINGS_KEY);
    if (!raw) return { earnings: 0, lastUpdate: 0 };
    return JSON.parse(raw);
  } catch (e) { return { earnings: 0, lastUpdate: 0 }; }
}

function saveEarnings(earnings) {
  try {
    localStorage.setItem(EARNINGS_KEY, JSON.stringify({ earnings, lastUpdate: Date.now() }));
  } catch (e) { /* quota exceeded など無視 */ }
}

function clearEarnings() {
  try { localStorage.removeItem(EARNINGS_KEY); } catch (e) {}
}

function getAccuracy(target) {
  const data = loadStats();
  const stat = data.questionStats[target];
  if (!stat || stat.attempts === 0) return null;
  return stat.correct / stat.attempts;
}

// 重みつきランダム選択（正解率が低いほど選ばれやすい）
// items  : 選択候補の配列
// keyFn  : アイテムから統計キー（数値）を取り出す関数
//   例) 問題: q => q.target  / 貨幣: m => m.value
function weightedSelect(items, keyFn) {
  const data = loadStats();

  const weights = items.map(item => {
    const stat = data.questionStats[keyFn(item)];
    if (!stat || stat.attempts === 0) return 3; // 未挑戦: 中
    const acc = stat.correct / stat.attempts;
    if (acc < 0.4) return 6; // 苦手: 高
    if (acc < 0.8) return 3; // 普通: 中
    return 1;                // 得意: 低
  });

  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return items[i];
  }
  return items[items.length - 1];
}
