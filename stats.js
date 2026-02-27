// === きろく画面 ===
function startStatsMode() {
  showScreen('stats-screen');
  renderStatsScreen();
}

function getLevelInfo(accuracy) {
  if (accuracy === null)  return { cls: 'level-new',      stars: '❓',       label: 'まだ' };
  if (accuracy >= 0.7)    return { cls: 'level-great',    stars: '⭐⭐⭐',   label: 'よくわかる' };
  if (accuracy >= 0.5)    return { cls: 'level-good',     stars: '⭐⭐',     label: 'わかってきた' };
  return                         { cls: 'level-practice', stars: '⭐',       label: 'れんしゅうしよう' };
}

function renderStatsScreen() {
  const data = loadStats();
  const grid = document.getElementById('stats-grid');
  grid.innerHTML = '';

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
      const stat     = data.questionStats[q.target];
      const attempts = stat ? stat.attempts : 0;
      const correct  = stat ? stat.correct  : 0;
      const acc      = attempts > 0 ? correct / attempts : null;
      const level    = getLevelInfo(acc);

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

      card.append(amount, stars, lbl, cnt);
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

    item.append(icon, text, time);
    historyEl.appendChild(item);
  });
}

function formatTime(ts) {
  const diffMin = Math.floor((Date.now() - ts) / 60000);
  if (diffMin < 1)  return 'さっき';
  if (diffMin < 60) return diffMin + 'ふんまえ';
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24)   return diffH + 'じかんまえ';
  return Math.floor(diffH / 24) + 'にちまえ';
}
