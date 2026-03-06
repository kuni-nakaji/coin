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

  // ほぼ白(R,G,B > 230)ならキューに追加
  const tryEnqueue = (x, y) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return;
    const i = y * W + x;
    if (visited[i]) return;
    const p = i << 2;
    if (px[p] < 230 || px[p + 1] < 230 || px[p + 2] < 230) return;
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
