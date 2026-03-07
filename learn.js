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
    container.appendChild(createMoneyButton(money, () => addLearnMoney(money.value)));
  });
}

function addLearnMoney(value) {
  learnSelected[value] = (learnSelected[value] || 0) + 1;
  updateLearnTotal();
  renderLearnSelected();
  animatePop(document.getElementById('learn-total'));
}

function updateLearnTotal() {
  document.getElementById('learn-total').textContent = formatYen(calcSelectedTotal(learnSelected));
}

function renderLearnSelected() {
  renderMoneyStack(document.getElementById('learn-selected'), learnSelected, {
    maxVisual:  5,
    coinW: '44px', coinH: '44px',
    billW: '80px', billH: '40px',
    stackV: 4,
    groupClass: 'selected-group',
    stackClass: 'selected-stack',
    onRemove:   removeLearnMoney,
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
