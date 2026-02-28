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
let learnSelected = {};

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
    card.classList.add('money-card', money.type === 'coin' ? 'coin-card' : 'bill-card');

    const svgContainer = document.createElement('div');
    svgContainer.classList.add('money-svg');
    svgContainer.style.width  = money.type === 'coin' ? money.size + 'px' : money.width + 'px';
    svgContainer.style.height = money.type === 'coin' ? money.size + 'px' : money.height + 'px';
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

    (money.type === 'coin' ? coinGallery : billGallery).appendChild(card);
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

  const items = Object.entries(learnSelected)
    .filter(([, c]) => c > 0)
    .map(([v, c]) => ({ value: Number(v), count: c }))
    .sort((a, b) => b.value - a.value);

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
      coinEl.style.width  = money.type === 'coin' ? '44px' : '80px';
      coinEl.style.height = money.type === 'coin' ? '44px' : '40px';
      coinEl.style.bottom = (i * 4) + 'px';
      coinEl.style.left   = (i * 2) + 'px';
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
