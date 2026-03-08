// === よみかた練習モード ===
let readingScore = 0;
let readingDifficulty = 1;   // 1=2桁, 2=3桁, 3=4桁
let readingStreak = 0;
let readingCards = [];       // [{ id, text, used }]
let readingAnswer = [];      // card ids in placed order
let readingCorrect = [];     // 正解のひらがな配列
let readingTargetNum = 0;

const READING_DIGITS = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];
const READING_ALL_DIGITS = ['いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];
const READING_ALL_UNITS  = ['じゅう', 'ひゃく', 'せん'];

// 数をひらがなカードの配列に分解
// 例: 2343 → ['に','せん','さん','ひゃく','よん','じゅう','さん']
function decomposeReading(n) {
  const parts = [];
  if (n >= 1000) {
    const s = Math.floor(n / 1000);
    if (s !== 1) parts.push(READING_DIGITS[s]);
    parts.push('せん');
    n %= 1000;
  }
  if (n >= 100) {
    const h = Math.floor(n / 100);
    if (h !== 1) parts.push(READING_DIGITS[h]);
    parts.push('ひゃく');
    n %= 100;
  }
  if (n >= 10) {
    const j = Math.floor(n / 10);
    if (j !== 1) parts.push(READING_DIGITS[j]);
    parts.push('じゅう');
    n %= 10;
  }
  if (n > 0) parts.push(READING_DIGITS[n]);
  return parts;
}

// 難易度に応じてランダムな金額を生成
function generateReadingNumber(difficulty) {
  if (difficulty === 1) {
    // 2桁: 10〜99（ただし11〜99を優先）
    return 11 + Math.floor(Math.random() * 89);
  } else if (difficulty === 2) {
    // 3桁: 101〜999（ゼロの桁を避けるため端数あり）
    const base = 100 + Math.floor(Math.random() * 900);
    return base;
  } else {
    // 4桁: 1001〜9999
    return 1001 + Math.floor(Math.random() * 8999);
  }
}

// 正解カード + ダミーカードをシャッフルしてパレット用配列を作成
function buildReadingPalette(correct) {
  // 正解カードの出現頻度を数える
  const correctCounts = {};
  correct.forEach(c => { correctCounts[c] = (correctCounts[c] || 0) + 1; });

  // 正解に含まれない数字・単位からダミーを 2〜3 枚追加
  const unusedDigits = READING_ALL_DIGITS.filter(d => !correctCounts[d]);
  const unusedUnits  = READING_ALL_UNITS.filter(u => !correctCounts[u]);

  const distractors = [
    ...shuffleArray(unusedDigits).slice(0, 2),
    ...shuffleArray(unusedUnits).slice(0, 1),
  ];

  const all = [...correct, ...distractors];
  return shuffleArray(all).map((text, i) => ({ id: `rc_${i}`, text, used: false }));
}

// ===== 画面表示 =====
function startReadingMode() {
  readingScore = 0;
  readingStreak = 0;
  readingDifficulty = 1;
  document.getElementById('reading-score').textContent = '0';
  showScreen('reading-screen');
  nextReadingQuestion();
}

// 履歴から復習: 指定した数を強制出題
function startReadingReview(targetNum) {
  readingScore = 0;
  readingStreak = 0;
  readingDifficulty = 1;
  document.getElementById('reading-score').textContent = '0';
  document.getElementById('reading-result-overlay').classList.remove('active');
  showScreen('reading-screen');

  readingTargetNum = targetNum;
  readingCorrect   = decomposeReading(readingTargetNum);
  readingCards     = buildReadingPalette(readingCorrect);
  readingAnswer    = [];

  document.getElementById('reading-number').textContent = formatYen(readingTargetNum) + 'えん';
  renderReadingUI();
}

function nextReadingQuestion() {
  document.getElementById('reading-result-overlay').classList.remove('active');

  readingTargetNum = generateReadingNumber(readingDifficulty);
  readingCorrect   = decomposeReading(readingTargetNum);
  readingCards     = buildReadingPalette(readingCorrect);
  readingAnswer    = [];

  document.getElementById('reading-number').textContent = formatYen(readingTargetNum) + 'えん';
  renderReadingUI();
}

function renderReadingUI() {
  renderReadingPalette();
  renderReadingAnswer();
}

function renderReadingPalette() {
  const palette = document.getElementById('reading-palette');
  palette.innerHTML = '';
  readingCards.filter(c => !c.used).forEach(card => {
    const btn = document.createElement('button');
    btn.classList.add('reading-card', 'reading-card-palette');
    btn.textContent = card.text;
    btn.onclick = () => placeReadingCard(card.id);
    palette.appendChild(btn);
  });
}

function renderReadingAnswer() {
  const area = document.getElementById('reading-answer-area');
  area.innerHTML = '';

  readingAnswer.forEach(id => {
    const card = readingCards.find(c => c.id === id);
    if (!card) return;
    const btn = document.createElement('button');
    btn.classList.add('reading-card', 'reading-card-answer');
    btn.textContent = card.text;
    btn.onclick = () => removeReadingCard(id);
    area.appendChild(btn);
  });

  const suffix = document.createElement('span');
  suffix.classList.add('reading-suffix');
  suffix.textContent = 'えん';
  area.appendChild(suffix);
}

function placeReadingCard(id) {
  const card = readingCards.find(c => c.id === id);
  if (!card || card.used) return;
  card.used = true;
  readingAnswer.push(id);
  renderReadingUI();
}

function removeReadingCard(id) {
  const idx = readingAnswer.indexOf(id);
  if (idx === -1) return;
  readingAnswer.splice(idx, 1);
  const card = readingCards.find(c => c.id === id);
  if (card) card.used = false;
  renderReadingUI();
}

function clearReadingAnswer() {
  readingAnswer.forEach(id => {
    const card = readingCards.find(c => c.id === id);
    if (card) card.used = false;
  });
  readingAnswer = [];
  renderReadingUI();
}

function checkReadingAnswer() {
  const placedTexts = readingAnswer.map(id => {
    const c = readingCards.find(x => x.id === id);
    return c ? c.text : '';
  });

  const isCorrect =
    placedTexts.length === readingCorrect.length &&
    placedTexts.every((t, i) => t === readingCorrect[i]);

  const overlay = document.getElementById('reading-result-overlay');
  const card    = document.getElementById('reading-result-card');
  const emoji   = document.getElementById('reading-result-emoji');
  const message = document.getElementById('reading-result-message');
  const detail  = document.getElementById('reading-result-detail');

  overlay.classList.add('active');

  recordResult(readingTargetNum, isCorrect, { mode: 'reading' });

  if (isCorrect) {
    mascotPlay('attack');
    card.className = 'result-card correct';
    const reactions = ['🎉', '⭐', '🌟', '🏆', '✨'];
    emoji.textContent   = reactions[Math.floor(Math.random() * reactions.length)];
    message.textContent = 'せいかい！すごい！';
    detail.textContent  = readingCorrect.join('') + ' えん！';

    readingScore += 10;
    readingStreak++;
    document.getElementById('reading-score').textContent = readingScore;

    // 3問連続正解で難易度アップ（最大3）
    if (readingStreak >= 3 && readingDifficulty < 3) {
      readingDifficulty++;
      readingStreak = 0;
    }

    launchConfetti();
  } else {
    mascotPlay('damage');
    card.className = 'result-card wrong';
    emoji.textContent   = '🤔';
    message.textContent = 'ちがうよ！';
    readingStreak = 0;

    // 正解カードを強調表示
    const correctText = readingCorrect.join('') + ' えん';
    detail.textContent = 'こたえは「' + correctText + '」だよ！';

    // 答えエリアに正解を表示
    showCorrectReadingCards();
  }
}

// 不正解時に答えエリアへ正解カードを表示（読み取り専用）
function showCorrectReadingCards() {
  const area = document.getElementById('reading-answer-area');
  area.innerHTML = '';
  readingCorrect.forEach(text => {
    const chip = document.createElement('span');
    chip.classList.add('reading-card', 'reading-card-correct');
    chip.textContent = text;
    area.appendChild(chip);
  });
  const suffix = document.createElement('span');
  suffix.classList.add('reading-suffix');
  suffix.textContent = 'えん';
  area.appendChild(suffix);
}
