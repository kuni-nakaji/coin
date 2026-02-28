// === クイズモード ===
let quizScore = 0;
let quizStreak = 0;
let quizDifficulty = 1;        // 1=コインのみ, 2=全種類
let currentQuizMoney = null;
let currentQuizCorrectAnswer = null; // 正解金額（単体・組み合わせ共通）
let currentQuizIsCombo = false;      // true=複数枚出題モード
let quizEarnings = 0;                // 正解時に累積する獲得金額

function getQuizMoneyPool(difficulty) {
  return difficulty === 1 ? MONEY_DATA.filter(m => m.type === 'coin') : MONEY_DATA;
}

// 単体クイズ用: 正解以外から3つ選んで4択を作る
function generateChoices(correctMoney, pool) {
  const others = pool.filter(m => m.value !== correctMoney.value);
  const source = others.length >= 3 ? others : MONEY_DATA.filter(m => m.value !== correctMoney.value);
  return shuffleArray([correctMoney, ...shuffleArray(source).slice(0, 3)]);
}

// コンボ用: 合計金額を ±1枚ずらした誤答を3つ生成
function generateCombinationChoices(correctTotal, pool) {
  const denoms = pool.map(m => m.value);
  const wrongSet = new Set();

  for (let attempt = 0; attempt < 60 && wrongSet.size < 3; attempt++) {
    const denom = denoms[Math.floor(Math.random() * denoms.length)];
    const sign  = Math.random() < 0.5 ? 1 : -1;
    const wrong = correctTotal + sign * denom;
    if (wrong > 0 && wrong !== correctTotal) wrongSet.add(wrong);
  }

  // フォールバック: 必ず3つ確保
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

// 組み合わせを生成: 1〜3種、同一種は最大3枚、合計4枚まで
// 戻り値: { items: [money, ...], total }  ※同じ種が複数の場合は繰り返して格納
function generateCombination(pool) {
  const maxTotal = quizDifficulty === 1 ? 300 : 3000;
  const maxItems = 4; // 個別表示するので最大4枚
  const numGroups = 1 + Math.floor(Math.random() * 3); // 1, 2, or 3 denominations

  const groups = [];
  const usedValues = new Set();
  let total = 0;
  let totalCount = 0;

  for (let attempt = 0; attempt < 100 && groups.length < numGroups && totalCount < maxItems; attempt++) {
    const money = pool[Math.floor(Math.random() * pool.length)];
    if (usedValues.has(money.value)) continue;

    const remaining = maxItems - totalCount;
    const maxCount = Math.min(3, remaining, Math.floor((maxTotal - total) / money.value));
    // 1グループだけになる場合は必ず2枚以上にする
    const minCount = (numGroups === 1 && groups.length === 0) ? 2 : 1;
    if (maxCount < minCount) continue;

    const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));
    groups.push({ money, count });
    usedValues.add(money.value);
    total += money.value * count;
    totalCount += count;
  }

  // フォールバック: 合計2枚以上を保証
  if (groups.length === 0 || totalCount < 2) {
    const sorted = [...pool].sort((a, b) => a.value - b.value);
    const m = sorted[0];
    return { items: [m, m], total: m.value * 2 };
  }

  // groups を個別 items に展開
  const items = groups.flatMap(g => Array(g.count).fill(g.money));
  return { items, total };
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

function startQuizMode() {
  quizScore = 0;
  quizStreak = 0;
  quizDifficulty = 1;
  quizEarnings = 0;
  document.getElementById('quiz-score').textContent = '0';
  document.getElementById('quiz-earnings').textContent = '0';
  showScreen('quiz-screen');
  nextQuizQuestion();
}

function nextQuizQuestion() {
  document.getElementById('quiz-result-overlay').classList.remove('active');

  const pool = getQuizMoneyPool(quizDifficulty);

  // 最初の1問は必ず単体、以降50%でコンボ
  if (quizScore > 0 && Math.random() < 0.5) {
    showCombinationQuiz(pool);
  } else {
    showSingleMoneyQuiz(pool);
  }
}

// 単体コイン／お札を出題
function showSingleMoneyQuiz(pool) {
  currentQuizIsCombo = false;
  currentQuizMoney = weightedSelect(pool, m => m.value);
  currentQuizCorrectAnswer = currentQuizMoney.value;

  const displayEl = document.getElementById('quiz-coin-display');
  displayEl.innerHTML = '';
  displayEl.className = 'quiz-coin-display';

  const svgWrapper = document.createElement('div');
  svgWrapper.classList.add('quiz-coin-svg');
  if (currentQuizMoney.type === 'bill') svgWrapper.classList.add('quiz-bill-svg');
  svgWrapper.innerHTML = currentQuizMoney.svg;
  displayEl.appendChild(svgWrapper);

  renderQuizChoices(generateChoices(currentQuizMoney, pool).map(m => m.value));
}

// 複数枚の組み合わせを出題（1枚ずつ個別表示）
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
    svgWrapper.classList.add(money.type === 'bill' ? 'quiz-combo-bill' : 'quiz-combo-coin');
    svgWrapper.innerHTML = money.svg;
    displayEl.appendChild(svgWrapper);
  });

  renderQuizChoices(generateCombinationChoices(combo.total, pool));
}

function selectQuizAnswer(selectedValue) {
  const isCorrect = selectedValue === currentQuizCorrectAnswer;

  // 単体コインのみ stats を記録
  if (!currentQuizIsCombo && currentQuizMoney) {
    recordResult(currentQuizMoney.value, isCorrect);
  }

  // ボタンを無効化・正誤ハイライト
  const btns = document.querySelectorAll('.quiz-choice-btn');
  btns.forEach(btn => {
    btn.disabled = true;
    const v = Number(btn.dataset.value);
    if (v === currentQuizCorrectAnswer)  btn.classList.add('correct-answer');
    else if (v === selectedValue)        btn.classList.add('wrong');
    else                                 btn.classList.add('dimmed');
  });

  // スコア・連続正解・難易度・獲得金額
  const milestoneEl = document.getElementById('quiz-milestone');
  milestoneEl.className = 'quiz-milestone';
  milestoneEl.textContent = '';

  if (isCorrect) {
    quizStreak++;
    quizScore += 10;
    document.getElementById('quiz-score').textContent = quizScore;
    if (quizStreak >= 3 && quizDifficulty < 2) quizDifficulty = 2;

    // 獲得金額を累積
    const prevMilestone = Math.floor(quizEarnings / 10000);
    quizEarnings += currentQuizCorrectAnswer;
    const newMilestone = Math.floor(quizEarnings / 10000);
    animatePop(document.getElementById('quiz-earnings'));
    document.getElementById('quiz-earnings').textContent = formatYen(quizEarnings);

    launchConfetti();

    // 1万円ごとにお祝い
    if (newMilestone > prevMilestone) {
      milestoneEl.textContent = '🎊 ' + formatYen(newMilestone * 10000) + 'えん たまったよ！';
      milestoneEl.classList.add('active');
      setTimeout(launchConfetti, 300);
      setTimeout(launchConfetti, 700);
    }
  } else {
    quizStreak = 0;
  }

  // 結果オーバーレイ
  const overlay = document.getElementById('quiz-result-overlay');
  const card    = document.getElementById('quiz-result-card');
  const emoji   = document.getElementById('quiz-result-emoji');
  const message = document.getElementById('quiz-result-message');
  const detail  = document.getElementById('quiz-result-detail');

  overlay.classList.add('active');

  if (isCorrect) {
    card.className = 'result-card correct';
    const reactions = ['🎉', '⭐', '🌟', '🏆', '✨'];
    emoji.textContent   = reactions[Math.floor(Math.random() * reactions.length)];
    message.textContent = 'せいかい！すごい！';
    detail.textContent  = '+' + formatYen(currentQuizCorrectAnswer) + ' えん かくとく！';
  } else {
    card.className = 'result-card wrong';
    emoji.textContent   = '🤔';
    message.textContent = 'ちがうよ！';
    detail.textContent  = 'ぜんぶで ' + formatYen(currentQuizCorrectAnswer) + ' えんだよ';
  }
}
