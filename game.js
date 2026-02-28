// === ゲームモード ===
let gameSelected = {};
let currentQuestion = null;
let score = 0;
let currentDifficulty = 1;
let correctStreak = 0;
let weakModeOnly = false;

function startGameMode(weakOnly) {
  weakModeOnly = !!weakOnly;
  score = 0;
  correctStreak = 0;
  currentDifficulty = 1;
  document.getElementById('score').textContent = '0';
  document.getElementById('weak-badge').style.display = weakModeOnly ? 'inline-block' : 'none';
  gameSelected = {};
  showScreen('game-screen');
  renderGameSelector();
  nextQuestion();
}

function getAvailableMoney() {
  if (currentDifficulty === 1) return MONEY_DATA.filter(m => m.value <= 10);
  if (currentDifficulty === 2) return MONEY_DATA.filter(m => m.value <= 100);
  if (currentDifficulty === 3) return MONEY_DATA.filter(m => m.value <= 500);
  return MONEY_DATA;
}

function renderGameSelector() {
  const container = document.getElementById('game-selector');
  container.innerHTML = '';

  getAvailableMoney().forEach(money => {
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

function nextQuestion() {
  document.getElementById('result-overlay').classList.remove('active');
  gameSelected = {};
  renderTray();

  let pool = QUESTIONS.filter(q => q.difficulty === currentDifficulty);

  if (weakModeOnly) {
    const data = loadStats();
    const weak = pool.filter(q => {
      const stat = data.questionStats[q.target];
      return !stat || stat.attempts === 0 || (stat.correct / stat.attempts) < 0.6;
    });
    if (weak.length > 0) pool = weak;
  }

  if (pool.length === 0) pool = QUESTIONS;

  currentQuestion = weightedSelect(pool, q => q.target);

  document.getElementById('question-text').textContent = 'ぴったり　つくってみよう！';
  document.getElementById('target-amount').innerHTML =
    formatYen(currentQuestion.target) + '<span>えん</span>';

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

  const items = Object.entries(gameSelected)
    .filter(([, c]) => c > 0)
    .map(([v, c]) => ({ value: Number(v), count: c }))
    .sort((a, b) => b.value - a.value);

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
      el.style.width  = money.type === 'coin' ? '40px' : '72px';
      el.style.height = money.type === 'coin' ? '40px' : '36px';
      el.style.bottom = (i * 3) + 'px';
      el.style.left   = (i * 2) + 'px';
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

  recordResult(target, isCorrect);

  const overlay  = document.getElementById('result-overlay');
  const card     = document.getElementById('result-card');
  const emoji    = document.getElementById('result-emoji');
  const message  = document.getElementById('result-message');
  const detail   = document.getElementById('result-detail');

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
