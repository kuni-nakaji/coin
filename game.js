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
    container.appendChild(createMoneyButton(money, () => addGameMoney(money.value)));
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
}

function renderTray() {
  renderMoneyStack(document.getElementById('tray-content'), gameSelected, {
    emptyText: 'おかねをえらんでね',
    onRemove:  removeGameMoney,
  });
}

function removeGameMoney(value) {
  if (gameSelected[value] > 1) {
    gameSelected[value]--;
  } else {
    delete gameSelected[value];
  }
  renderTray();
}

function resetGame() {
  gameSelected = {};
  renderTray();
}

function checkAnswer() {
  const total = calcSelectedTotal(gameSelected);
  const target = currentQuestion.target;
  const isCorrect = total === target;

  recordResult(target, isCorrect, { mode: 'game' });

  const overlay  = document.getElementById('result-overlay');
  const card     = document.getElementById('result-card');
  const emoji    = document.getElementById('result-emoji');
  const message  = document.getElementById('result-message');
  const detail   = document.getElementById('result-detail');

  overlay.classList.add('active');

  if (isCorrect) {
    mascotPlay('attack');
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
    mascotPlay('damage');
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
