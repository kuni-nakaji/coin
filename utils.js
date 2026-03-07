// === 画面切替 ===
const MASCOT_SCREENS = new Set(['game-screen', 'quiz-screen', 'reading-screen']);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  const mascot = document.getElementById('mascot');
  if (MASCOT_SCREENS.has(id)) {
    mascot.className = 'mascot mascot-visible';
  } else {
    mascot.className = 'mascot';
  }
}

function goHome() {
  showScreen('title-screen');
}

// === マスコット初期化（白背景を透明化）===
async function initMascot() {
  const img = new Image();
  img.src = 'sprite.png';
  await new Promise(r => { img.onload = r; img.onerror = r; });
  if (!img.naturalWidth) return;

  const W = img.naturalWidth, H = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, W, H);
  const px = imgData.data;
  const visited = new Uint8Array(W * H);
  // キューは最大ピクセル数分確保
  const queue = new Int32Array(W * H);
  let head = 0, tail = 0;

  // コーナーピクセルの色を背景色として自動検出（±40の許容範囲）
  const bgR = px[0], bgG = px[1], bgB = px[2];
  const tryEnqueue = (x, y) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const i = y * W + x;
    if (visited[i]) return;
    const p = i << 2;
    if (Math.abs(px[p] - bgR) > 40 || Math.abs(px[p + 1] - bgG) > 40 || Math.abs(px[p + 2] - bgB) > 40) return;
    visited[i] = 1;
    queue[tail++] = i;
  };

  // 四辺のエッジからシード
  for (let x = 0; x < W; x++) { tryEnqueue(x, 0); tryEnqueue(x, H - 1); }
  for (let y = 1; y < H - 1; y++) { tryEnqueue(0, y); tryEnqueue(W - 1, y); }

  // BFS で連続する白領域を透明化
  while (head < tail) {
    const i = queue[head++];
    px[(i << 2) + 3] = 0; // alpha = 0
    const x = i % W, y = (i / W) | 0;
    tryEnqueue(x - 1, y); tryEnqueue(x + 1, y);
    tryEnqueue(x, y - 1); tryEnqueue(x, y + 1);
  }

  ctx.putImageData(imgData, 0, 0);
  const dataUrl = canvas.toDataURL('image/png');
  document.getElementById('mascot').style.backgroundImage = `url(${dataUrl})`;
}

// === マスコットアニメーション ===
let _mascotTimer = null;
function mascotPlay(state) {
  const el = document.getElementById('mascot');
  if (!el) return;
  clearTimeout(_mascotTimer);
  el.className = 'mascot mascot-visible mascot-' + state;
  const dur = state === 'attack' ? 640 : 800;
  _mascotTimer = setTimeout(() => {
    el.className = 'mascot mascot-visible';
  }, dur);
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

// === 汎用ユーティリティ ===
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

// === 共通: 貨幣ボタン生成（learn / game で共用）===
function createMoneyButton(money, onClick) {
  const btn = document.createElement('button');
  btn.classList.add('money-btn');
  if (money.type === 'bill') btn.classList.add('money-btn-bill');

  const svgEl = document.createElement('div');
  svgEl.classList.add('money-btn-svg');
  svgEl.innerHTML = money.svg;

  const labelEl = document.createElement('div');
  labelEl.classList.add('money-btn-label');
  labelEl.textContent = money.label;

  btn.append(svgEl, labelEl);
  btn.onclick = onClick;
  return btn;
}

// === 共通: 選択済み貨幣をスタック表示（learn / game で共用）===
// opts: { maxVisual, coinW, coinH, billW, billH, stackV, stackH,
//         groupClass, stackClass, emptyText, onRemove }
function renderMoneyStack(containerEl, selected, opts = {}) {
  containerEl.innerHTML = '';

  const {
    maxVisual  = 4,
    coinW = '40px', coinH = '40px',
    billW = '72px', billH = '36px',
    stackV = 3,     stackH = 2,
    groupClass = 'tray-group',
    stackClass = 'tray-stack',
    emptyText  = null,
    onRemove   = null,
  } = opts;

  const items = Object.entries(selected)
    .filter(([, c]) => c > 0)
    .map(([v, c]) => ({ value: Number(v), count: c }))
    .sort((a, b) => b.value - a.value);

  if (items.length === 0) {
    if (emptyText) containerEl.innerHTML = `<div class="tray-empty">${emptyText}</div>`;
    return;
  }

  items.forEach(({ value, count }) => {
    const money = MONEY_DATA.find(m => m.value === value);
    if (!money) return;

    const group = document.createElement('div');
    group.classList.add(groupClass);

    const stack = document.createElement('div');
    stack.classList.add(stackClass);

    for (let i = 0; i < Math.min(count, maxVisual); i++) {
      const el = document.createElement('div');
      el.classList.add('stacked-coin');
      el.style.width  = money.type === 'coin' ? coinW : billW;
      el.style.height = money.type === 'coin' ? coinH : billH;
      el.style.bottom = (i * stackV) + 'px';
      el.style.left   = (i * stackH) + 'px';
      el.innerHTML = money.svg;
      stack.appendChild(el);
    }

    const badge = document.createElement('div');
    badge.classList.add('count-badge');
    badge.textContent = '×' + count;

    group.append(stack, badge);

    if (onRemove) {
      const removeBtn = document.createElement('button');
      removeBtn.classList.add('remove-btn');
      removeBtn.textContent = '−';
      removeBtn.onclick = () => onRemove(value);
      group.appendChild(removeBtn);
    }

    containerEl.appendChild(group);
  });
}

// === 共通: 選択済み貨幣の合計計算 ===
function calcSelectedTotal(selected) {
  let total = 0;
  for (const [v, c] of Object.entries(selected)) total += Number(v) * c;
  return total;
}
