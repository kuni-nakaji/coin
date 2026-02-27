// === アプリ状態 ===
let learnSelected = {};
let gameSelected = {};
let currentQuestion = null;
let score = 0;
let questionIndex = 0;
let shuffledQuestions = [];
let currentDifficulty = 1;
let correctStreak = 0;
let weakModeOnly = false;

// === クイズモード状態 ===
let quizScore = 0;
let quizStreak = 0;
let quizDifficulty = 1; // 1=コインのみ, 2=全種類
let currentQuizMoney = null;
let currentQuizCorrectAnswer = null; // 正解金額（単体・組み合わせ共通）
let currentQuizIsCombo = false;      // true=複数枚出題モード

// === localStorage ===
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

function recordResult(target, correct) {
  const data = loadStats();

  // 問題別統計
  if (!data.questionStats[target]) {
    data.questionStats[target] = { attempts: 0, correct: 0 };
  }
  data.questionStats[target].attempts++;
  if (correct) data.questionStats[target].correct++;

  // 最新履歴（20件まで）
  data.history.unshift({ target, correct, timestamp: Date.now() });
  if (data.history.length > 20) data.history.length = 20;

  saveStats(data);
}

function getAccuracy(target) {
  const data = loadStats();
  const stat = data.questionStats[target];
  if (!stat || stat.attempts === 0) return null; // 未挑戦
  return stat.correct / stat.attempts;
}

// === 問題の重みつき選択 ===
function weightedSelectQuestion(questions) {
  const data = loadStats();

  const weights = questions.map(q => {
    const stat = data.questionStats[q.target];
    if (!stat || stat.attempts === 0) return 3; // 未挑戦: 中
    const acc = stat.correct / stat.attempts;
    if (acc < 0.4) return 6;  // 苦手: 高
    if (acc < 0.8) return 3;  // 普通: 中
    return 1;                  // 得意: 低
  });

  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < questions.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return questions[i];
  }
  return questions[questions.length - 1];
}

// === 画面切替 ===
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function goHome() {
  showScreen('title-screen');
}

// === タイトル画面 フローティングコイン ===
function initFloatingCoins() {
  const container = document.querySelector('.floating-coins');
  const coinValues = [1, 5, 10, 50, 100, 500];
  const coinMoney = MONEY_DATA.filter(m => coinValues.includes(m.value));

  for (let i = 0; i < 12; i++) {
    const coin = coinMoney[Math.floor(Math.random() * coinMoney.length)];
    const el = document.createElement('div');
    el.classList.add('floating-coin');
    el.style.left = Math.random() * 100 + '%';
    el.style.top = Math.random() * 100 + '%';
    el.style.animationDelay = (Math.random() * 4) + 's';
    el.style.animationDuration = (3 + Math.random() * 4) + 's';
    el.style.width = (30 + Math.random() * 20) + 'px';
    el.style.height = el.style.width;
    el.innerHTML = coin.svg;
    container.appendChild(el);
  }
}

// === 学習モード ===
function startLearnMode() {
  showScreen('learn-screen');
  renderLearnGallery();
  renderLearnSelector();
  updateLearnTotal();
}

function renderLearnGallery() {
  const coinGallery = document.getElementById('coin-gallery');
  const billGallery = document.getElementById('bill-gallery');
  coinGallery.innerHTML = '';
  billGallery.innerHTML = '';

  MONEY_DATA.forEach(money => {
    const card = document.createElement('div');
    card.classList.add('money-card');
    card.classList.add(money.type === 'coin' ? 'coin-card' : 'bill-card');

    const svgContainer = document.createElement('div');
    svgContainer.classList.add('money-svg');
    if (money.type === 'coin') {
      svgContainer.style.width = money.size + 'px';
      svgContainer.style.height = money.size + 'px';
    } else {
      svgContainer.style.width = money.width + 'px';
      svgContainer.style.height = money.height + 'px';
    }
    svgContainer.innerHTML = money.svg;

    const label = document.createElement('div');
    label.classList.add('money-label');
    label.textContent = money.label;

    const desc = document.createElement('div');
    desc.classList.add('money-desc');
    desc.textContent = formatYen(money.value) + 'えん';

    card.appendChild(svgContainer);
    card.appendChild(label);
    card.appendChild(desc);

    if (money.type === 'coin') {
      coinGallery.appendChild(card);
    } else {
      billGallery.appendChild(card);
    }
  });
}

function renderLearnSelector() {
  const container = document.getElementById('learn-selector');
  container.innerHTML = '';

  MONEY_DATA.forEach(money => {
    const btn = document.createElement('button');
    btn.classList.add('money-btn');
    if (money.type === 'bill') btn.classList.add('money-btn-bill');

    const svgEl = document.createElement('div');
    svgEl.classList.add('money-btn-svg');
    svgEl.innerHTML = money.svg;

    const labelEl = document.createElement('div');
    labelEl.classList.add('money-btn-label');
    labelEl.textContent = money.label;

    btn.appendChild(svgEl);
    btn.appendChild(labelEl);
    btn.onclick = () => addLearnMoney(money.value);
    container.appendChild(btn);
  });
}

function addLearnMoney(value) {
  learnSelected[value] = (learnSelected[value] || 0) + 1;
  updateLearnTotal();
  renderLearnSelected();
  animatePop(document.getElementById('learn-total'));
}

function updateLearnTotal() {
  let total = 0;
  for (const [v, c] of Object.entries(learnSelected)) {
    total += Number(v) * c;
  }
  document.getElementById('learn-total').textContent = formatYen(total);
}

function renderLearnSelected() {
  const container = document.getElementById('learn-selected');
  container.innerHTML = '';

  let items = [];
  for (const [v, c] of Object.entries(learnSelected)) {
    if (c > 0) items.push({ value: Number(v), count: c });
  }
  items.sort((a, b) => b.value - a.value);

  items.forEach(item => {
    const money = MONEY_DATA.find(m => m.value === item.value);
    if (!money) return;

    const group = document.createElement('div');
    group.classList.add('selected-group');

    const stack = document.createElement('div');
    stack.classList.add('selected-stack');

    const visualCount = Math.min(item.count, 5);
    for (let i = 0; i < visualCount; i++) {
      const coinEl = document.createElement('div');
      coinEl.classList.add('stacked-coin');
      if (money.type === 'coin') {
        coinEl.style.width = '44px';
        coinEl.style.height = '44px';
      } else {
        coinEl.style.width = '80px';
        coinEl.style.height = '40px';
      }
      coinEl.style.bottom = (i * 4) + 'px';
      coinEl.style.left = (i * 2) + 'px';
      coinEl.innerHTML = money.svg;
      stack.appendChild(coinEl);
    }

    const countBadge = document.createElement('div');
    countBadge.classList.add('count-badge');
    countBadge.textContent = '×' + item.count;

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('remove-btn');
    removeBtn.textContent = '−';
    removeBtn.onclick = () => removeLearnMoney(item.value);

    group.appendChild(stack);
    group.appendChild(countBadge);
    group.appendChild(removeBtn);
    container.appendChild(group);
  });
}

function removeLearnMoney(value) {
  if (learnSelected[value] > 1) {
    learnSelected[value]--;
  } else {
    delete learnSelected[value];
  }
  updateLearnTotal();
  renderLearnSelected();
}

function resetLearn() {
  learnSelected = {};
  updateLearnTotal();
  renderLearnSelected();
}

// === ゲームモード ===
function startGameMode(weakOnly) {
  weakModeOnly = !!weakOnly;
  score = 0;
  correctStreak = 0;
  currentDifficulty = 1;
  document.getElementById('score').textContent = '0';
  document.getElementById('weak-badge').style.display = weakModeOnly ? 'inline-block' : 'none';
  gameSelected = {};
  shuffledQuestions = shuffleArray([...QUESTIONS]);
  questionIndex = 0;
  showScreen('game-screen');
  renderGameSelector();
  nextQuestion();
}

function renderGameSelector() {
  const container = document.getElementById('game-selector');
  container.innerHTML = '';

  const availableMoney = getAvailableMoney();

  availableMoney.forEach(money => {
    const btn = document.createElement('button');
    btn.classList.add('money-btn');
    if (money.type === 'bill') btn.classList.add('money-btn-bill');

    const svgEl = document.createElement('div');
    svgEl.classList.add('money-btn-svg');
    svgEl.innerHTML = money.svg;

    const labelEl = document.createElement('div');
    labelEl.classList.add('money-btn-label');
    labelEl.textContent = money.label;

    btn.appendChild(svgEl);
    btn.appendChild(labelEl);
    btn.onclick = () => addGameMoney(money.value);
    container.appendChild(btn);
  });
}

function getAvailableMoney() {
  if (currentDifficulty === 1) {
    return MONEY_DATA.filter(m => m.value <= 10);
  } else if (currentDifficulty === 2) {
    return MONEY_DATA.filter(m => m.value <= 100);
  } else if (currentDifficulty === 3) {
    return MONEY_DATA.filter(m => m.value <= 500);
  } else {
    return MONEY_DATA;
  }
}

function nextQuestion() {
  document.getElementById('result-overlay').classList.remove('active');
  gameSelected = {};
  renderTray();
  updateTrayTotal();

  // 苦手モードの場合は正解率 <60% または未挑戦の問題のみ
  let pool = QUESTIONS.filter(q => q.difficulty === currentDifficulty);

  if (weakModeOnly) {
    const data = loadStats();
    const weak = pool.filter(q => {
      const stat = data.questionStats[q.target];
      if (!stat || stat.attempts === 0) return true; // 未挑戦
      return (stat.correct / stat.attempts) < 0.6;
    });
    // 苦手問題がなければ全問題にフォールバック
    if (weak.length > 0) pool = weak;
  }

  if (pool.length === 0) pool = QUESTIONS;

  // 重みつきランダム選択
  currentQuestion = weightedSelectQuestion(pool);

  document.getElementById('question-text').textContent = 'ぴったり　つくってみよう！';
  document.getElementById('target-amount').innerHTML = formatYen(currentQuestion.target) + '<span>えん</span>';

  renderGameSelector();
}

function addGameMoney(value) {
  gameSelected[value] = (gameSelected[value] || 0) + 1;
  renderTray();
  updateTrayTotal();
}

function renderTray() {
  const container = document.getElementById('tray-content');
  container.innerHTML = '';

  let items = [];
  for (const [v, c] of Object.entries(gameSelected)) {
    if (c > 0) items.push({ value: Number(v), count: c });
  }
  items.sort((a, b) => b.value - a.value);

  if (items.length === 0) {
    container.innerHTML = '<div class="tray-empty">おかねをえらんでね</div>';
    return;
  }

  items.forEach(item => {
    const money = MONEY_DATA.find(m => m.value === item.value);
    if (!money) return;

    const group = document.createElement('div');
    group.classList.add('tray-group');

    const stackWrap = document.createElement('div');
    stackWrap.classList.add('tray-stack');

    const visualCount = Math.min(item.count, 4);
    for (let i = 0; i < visualCount; i++) {
      const el = document.createElement('div');
      el.classList.add('stacked-coin');
      if (money.type === 'coin') {
        el.style.width = '40px';
        el.style.height = '40px';
      } else {
        el.style.width = '72px';
        el.style.height = '36px';
      }
      el.style.bottom = (i * 3) + 'px';
      el.style.left = (i * 2) + 'px';
      el.innerHTML = money.svg;
      stackWrap.appendChild(el);
    }

    const badge = document.createElement('div');
    badge.classList.add('count-badge');
    badge.textContent = '×' + item.count;

    const removeBtn = document.createElement('button');
    removeBtn.classList.add('remove-btn');
    removeBtn.textContent = '−';
    removeBtn.onclick = () => removeGameMoney(item.value);

    group.appendChild(stackWrap);
    group.appendChild(badge);
    group.appendChild(removeBtn);
    container.appendChild(group);
  });
}

function removeGameMoney(value) {
  if (gameSelected[value] > 1) {
    gameSelected[value]--;
  } else {
    delete gameSelected[value];
  }
  renderTray();
  updateTrayTotal();
}

function updateTrayTotal() {
  let total = 0;
  for (const [v, c] of Object.entries(gameSelected)) {
    total += Number(v) * c;
  }
  return total;
}

function resetGame() {
  gameSelected = {};
  renderTray();
  updateTrayTotal();
}

function checkAnswer() {
  const total = updateTrayTotal();
  const target = currentQuestion.target;
  const isCorrect = total === target;

  // 結果を記録
  recordResult(target, isCorrect);

  const overlay = document.getElementById('result-overlay');
  const card = document.getElementById('result-card');
  const emoji = document.getElementById('result-emoji');
  const message = document.getElementById('result-message');
  const detail = document.getElementById('result-detail');

  overlay.classList.add('active');

  if (isCorrect) {
    correctStreak++;
    score += 10 * currentDifficulty;
    document.getElementById('score').textContent = score;

    if (correctStreak >= 3) {
      currentDifficulty = Math.min(currentDifficulty + 1, 4);
      correctStreak = 0;
    }

    card.className = 'result-card correct';
    const reactions = ['🎉', '⭐', '🌟', '🏆', '✨'];
    emoji.textContent = reactions[Math.floor(Math.random() * reactions.length)];
    message.textContent = 'せいかい！すごい！';
    detail.textContent = formatYen(target) + 'えん、ぴったり！';
    launchConfetti();
  } else {
    correctStreak = 0;
    card.className = 'result-card wrong';
    emoji.textContent = '🤔';

    if (total < target) {
      message.textContent = 'もうすこし！';
      detail.textContent = `あと ${formatYen(target - total)} えん たりないよ`;
    } else {
      message.textContent = 'おおすぎたよ！';
      detail.textContent = `${formatYen(total - target)} えん おおすぎたよ`;
    }
  }
}

// === クイズモード ===
function getQuizMoneyPool(difficulty) {
  return difficulty === 1
    ? MONEY_DATA.filter(m => m.type === 'coin')
    : MONEY_DATA;
}

function weightedSelectMoney(pool) {
  const data = loadStats();
  const weights = pool.map(m => {
    const stat = data.questionStats[m.value];
    if (!stat || stat.attempts === 0) return 3; // 未挑戦: 中
    const acc = stat.correct / stat.attempts;
    if (acc < 0.4) return 6;  // 苦手: 高
    if (acc < 0.8) return 3;  // 普通: 中
    return 1;                  // 得意: 低
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function generateChoices(correctMoney, pool) {
  const others = pool.filter(m => m.value !== correctMoney.value);
  // poolが3枚未満の場合は全MONEY_DATAから補充
  const fallback = MONEY_DATA.filter(m => m.value !== correctMoney.value);
  const source = others.length >= 3 ? others : fallback;
  const wrong = shuffleArray(source).slice(0, 3);
  return shuffleArray([correctMoney, ...wrong]);
}

function startQuizMode() {
  quizScore = 0;
  quizStreak = 0;
  quizDifficulty = 1;
  document.getElementById('quiz-score').textContent = '0';
  showScreen('quiz-screen');
  nextQuizQuestion();
}

function nextQuizQuestion() {
  document.getElementById('quiz-result-overlay').classList.remove('active');

  const pool = getQuizMoneyPool(quizDifficulty);

  // 50% の確率でコンボ出題（最初の1問は必ず単体）
  if (quizScore > 0 && Math.random() < 0.5) {
    showCombinationQuiz(pool);
  } else {
    showSingleMoneyQuiz(pool);
  }
}

// 単体コイン／お札を出題
function showSingleMoneyQuiz(pool) {
  currentQuizIsCombo = false;
  currentQuizMoney = weightedSelectMoney(pool);
  currentQuizCorrectAnswer = currentQuizMoney.value;

  const displayEl = document.getElementById('quiz-coin-display');
  displayEl.innerHTML = '';
  displayEl.className = 'quiz-coin-display'; // combo クラスをリセット

  const svgWrapper = document.createElement('div');
  svgWrapper.classList.add('quiz-coin-svg');
  if (currentQuizMoney.type === 'bill') svgWrapper.classList.add('quiz-bill-svg');
  svgWrapper.innerHTML = currentQuizMoney.svg;
  displayEl.appendChild(svgWrapper);

  const choices = generateChoices(currentQuizMoney, pool);
  renderQuizChoices(choices.map(m => m.value));
}

// 複数枚の組み合わせを出題
function showCombinationQuiz(pool) {
  currentQuizIsCombo = true;
  currentQuizMoney = null;

  const combo = generateCombination(pool);
  currentQuizCorrectAnswer = combo.total;

  const displayEl = document.getElementById('quiz-coin-display');
  displayEl.innerHTML = '';
  displayEl.className = 'quiz-coin-display quiz-combo-mode';

  combo.items.forEach((money, i) => {
    if (i > 0) {
      const plus = document.createElement('div');
      plus.classList.add('quiz-combo-plus');
      plus.textContent = '+';
      displayEl.appendChild(plus);
    }
    const svgWrapper = document.createElement('div');
    svgWrapper.classList.add('quiz-combo-coin');
    if (money.type === 'bill') svgWrapper.classList.add('quiz-combo-bill');
    svgWrapper.innerHTML = money.svg;
    displayEl.appendChild(svgWrapper);
  });

  const choiceValues = generateCombinationChoices(combo.total, pool);
  renderQuizChoices(choiceValues);
}

// 組み合わせを生成（2〜3枚、合計が maxTotal 以下）
function generateCombination(pool) {
  const maxTotal = quizDifficulty === 1 ? 300 : 3000;
  const numPicks = 2 + Math.floor(Math.random() * 2); // 2 or 3
  const shuffled = shuffleArray([...pool]);

  const items = [];
  let total = 0;
  for (let i = 0; i < shuffled.length && items.length < numPicks; i++) {
    const money = shuffled[i];
    if (total + money.value <= maxTotal) {
      items.push(money);
      total += money.value;
    }
  }

  // フォールバック: 最低2枚保証
  if (items.length < 2) {
    const sorted = [...pool].sort((a, b) => a.value - b.value);
    const a = sorted[0];
    const b = sorted[Math.min(1, sorted.length - 1)];
    return { items: [a, b], total: a.value + b.value };
  }
  return { items, total };
}

// コンボ用 4択（合計金額を ±1 枚ずらした値を生成）
function generateCombinationChoices(correctTotal, pool) {
  const denoms = pool.map(m => m.value);
  const wrongSet = new Set();

  for (let attempt = 0; attempt < 60 && wrongSet.size < 3; attempt++) {
    const denom = denoms[Math.floor(Math.random() * denoms.length)];
    const sign = Math.random() < 0.5 ? 1 : -1;
    const wrong = correctTotal + sign * denom;
    if (wrong > 0 && wrong !== correctTotal) wrongSet.add(wrong);
  }

  // フォールバック
  let mult = 1;
  const base = denoms[0];
  while (wrongSet.size < 3) {
    const a = correctTotal + mult * base;
    const b = correctTotal - mult * base;
    if (a !== correctTotal) wrongSet.add(a);
    if (wrongSet.size < 3 && b > 0 && b !== correctTotal) wrongSet.add(b);
    mult++;
  }

  return shuffleArray([correctTotal, ...[...wrongSet].slice(0, 3)]);
}

// 4択ボタンを描画
function renderQuizChoices(choiceValues) {
  const choicesEl = document.getElementById('quiz-choices');
  choicesEl.innerHTML = '';
  choiceValues.forEach(value => {
    const btn = document.createElement('button');
    btn.classList.add('quiz-choice-btn');
    btn.textContent = formatYen(value) + ' えん';
    btn.dataset.value = String(value);
    btn.onclick = () => selectQuizAnswer(value);
    choicesEl.appendChild(btn);
  });
}

function selectQuizAnswer(selectedValue) {
  const isCorrect = selectedValue === currentQuizCorrectAnswer;

  // 単体コインのみ stats 記録
  if (!currentQuizIsCombo && currentQuizMoney) {
    recordResult(currentQuizMoney.value, isCorrect);
  }

  // ボタンを無効化・正誤ハイライト
  const choicesEl = document.getElementById('quiz-choices');
  const btns = choicesEl.querySelectorAll('.quiz-choice-btn');
  btns.forEach(btn => {
    btn.disabled = true;
    const btnValue = Number(btn.dataset.value);
    if (btnValue === currentQuizCorrectAnswer) {
      btn.classList.add('correct-answer');
    } else if (btnValue === selectedValue) {
      btn.classList.add('wrong');
    } else {
      btn.classList.add('dimmed');
    }
  });

  // スコア・連続正解・難易度
  if (isCorrect) {
    quizStreak++;
    quizScore += 10;
    document.getElementById('quiz-score').textContent = quizScore;
    if (quizStreak >= 3 && quizDifficulty < 2) {
      quizDifficulty = 2; // お札も追加
    }
    launchConfetti();
  } else {
    quizStreak = 0;
  }

  // 結果オーバーレイ表示
  const overlay = document.getElementById('quiz-result-overlay');
  const card = document.getElementById('quiz-result-card');
  const emoji = document.getElementById('quiz-result-emoji');
  const message = document.getElementById('quiz-result-message');
  const detail = document.getElementById('quiz-result-detail');

  overlay.classList.add('active');

  if (isCorrect) {
    card.className = 'result-card correct';
    const reactions = ['🎉', '⭐', '🌟', '🏆', '✨'];
    emoji.textContent = reactions[Math.floor(Math.random() * reactions.length)];
    message.textContent = 'せいかい！すごい！';
    detail.textContent = 'ぜんぶで ' + formatYen(currentQuizCorrectAnswer) + ' えん！';
  } else {
    card.className = 'result-card wrong';
    emoji.textContent = '🤔';
    message.textContent = currentQuizIsCombo ? 'ちがうよ！' : 'ちがうよ！';
    detail.textContent = 'ぜんぶで ' + formatYen(currentQuizCorrectAnswer) + ' えんだよ';
  }
}

// === きろく画面 ===
function startStatsMode() {
  showScreen('stats-screen');
  renderStatsScreen();
}

function getLevelInfo(accuracy) {
  if (accuracy === null) return { cls: 'level-new', stars: '❓', label: 'まだ' };
  if (accuracy >= 0.7) return { cls: 'level-great', stars: '⭐⭐⭐', label: 'よくわかる' };
  if (accuracy >= 0.5) return { cls: 'level-good', stars: '⭐⭐', label: 'わかってきた' };
  return { cls: 'level-practice', stars: '⭐', label: 'れんしゅうしよう' };
}

function renderStatsScreen() {
  const data = loadStats();
  const grid = document.getElementById('stats-grid');
  grid.innerHTML = '';

  // 難易度ごとに区切り表示
  const diffLabels = { 1: 'かんたん', 2: 'ふつう', 3: 'むずかしい', 4: 'チャレンジ' };

  [1, 2, 3, 4].forEach(diff => {
    const questions = QUESTIONS.filter(q => q.difficulty === diff);

    const group = document.createElement('div');
    group.classList.add('stats-diff-group');

    const label = document.createElement('div');
    label.classList.add('stats-diff-label');
    label.textContent = diffLabels[diff];
    group.appendChild(label);

    const row = document.createElement('div');
    row.classList.add('stats-row');

    questions.forEach(q => {
      const stat = data.questionStats[q.target];
      const attempts = stat ? stat.attempts : 0;
      const correct = stat ? stat.correct : 0;
      const acc = attempts > 0 ? correct / attempts : null;
      const level = getLevelInfo(acc);

      const card = document.createElement('div');
      card.classList.add('stat-card', level.cls);

      const amount = document.createElement('div');
      amount.classList.add('stat-amount');
      amount.textContent = formatYen(q.target) + 'えん';

      const stars = document.createElement('div');
      stars.classList.add('stat-stars');
      stars.textContent = level.stars;

      const lbl = document.createElement('div');
      lbl.classList.add('stat-label');
      lbl.textContent = level.label;

      const cnt = document.createElement('div');
      cnt.classList.add('stat-count');
      cnt.textContent = attempts > 0 ? `${correct}/${attempts}` : '';

      card.appendChild(amount);
      card.appendChild(stars);
      card.appendChild(lbl);
      card.appendChild(cnt);
      row.appendChild(card);
    });

    group.appendChild(row);
    grid.appendChild(group);
  });

  // 最近の履歴
  const historyEl = document.getElementById('history-list');
  historyEl.innerHTML = '';

  if (data.history.length === 0) {
    historyEl.innerHTML = '<div class="history-empty">まだきろくがないよ。ゲームをやってみよう！</div>';
    return;
  }

  data.history.forEach(h => {
    const item = document.createElement('div');
    item.classList.add('history-item', h.correct ? 'history-correct' : 'history-wrong');

    const icon = document.createElement('span');
    icon.classList.add('history-icon');
    icon.textContent = h.correct ? '⭕' : '❌';

    const text = document.createElement('span');
    text.classList.add('history-text');
    text.textContent = formatYen(h.target) + 'えん';

    const time = document.createElement('span');
    time.classList.add('history-time');
    time.textContent = formatTime(h.timestamp);

    item.appendChild(icon);
    item.appendChild(text);
    item.appendChild(time);
    historyEl.appendChild(item);
  });
}

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffMin = Math.floor((now - d) / 60000);
  if (diffMin < 1) return 'さっき';
  if (diffMin < 60) return diffMin + 'ふんまえ';
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return diffH + 'じかんまえ';
  return Math.floor(diffH / 24) + 'にちまえ';
}

// === 紙吹雪 ===
function launchConfetti() {
  const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff922b', '#cc5de8'];
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.classList.add('confetti-piece');
      el.style.left = Math.random() * 100 + 'vw';
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.animationDuration = (1 + Math.random() * 2) + 's';
      el.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, Math.random() * 500);
  }
}

// === ユーティリティ ===
function formatYen(value) {
  return value.toLocaleString('ja-JP');
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function animatePop(el) {
  if (!el) return;
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
}

// === 初期化 ===
document.addEventListener('DOMContentLoaded', () => {
  initFloatingCoins();
});
