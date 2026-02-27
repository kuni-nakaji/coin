// お金データ定義
const MONEY_DATA = [
  {
    value: 1,
    type: 'coin',
    label: '1えん',
    color: '#C0C0C0',
    bgColor: '#E8E8E8',
    textColor: '#555',
    size: 60,
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g1face" cx="35%" cy="30%">
          <stop offset="0%" stop-color="#f8f8f8"/>
          <stop offset="45%" stop-color="#dcdcdc"/>
          <stop offset="100%" stop-color="#b0b0b0"/>
        </radialGradient>
        <radialGradient id="g1rim" cx="30%" cy="25%">
          <stop offset="0%" stop-color="#e0e0e0"/>
          <stop offset="100%" stop-color="#787878"/>
        </radialGradient>
      </defs>
      <!-- 縁（rim） -->
      <circle cx="50" cy="50" r="49" fill="url(#g1rim)"/>
      <!-- コイン面 -->
      <circle cx="50" cy="50" r="43" fill="url(#g1face)"/>
      <!-- 内側装飾リング -->
      <circle cx="50" cy="50" r="40" fill="none" stroke="#c0c0c0" stroke-width="1"/>
      <!-- 数字 "1" -->
      <text x="50" y="46" text-anchor="middle" font-size="26" font-weight="bold" fill="#505050" font-family="serif">1</text>
      <!-- 単位 "円" -->
      <text x="50" y="64" text-anchor="middle" font-size="16" fill="#606060" font-family="serif">円</text>
    </svg>`
  },
  {
    value: 5,
    type: 'coin',
    label: '5えん',
    color: '#B8860B',
    bgColor: '#FFD700',
    textColor: '#5C3A00',
    size: 65,
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g5" cx="35%" cy="35%">
          <stop offset="0%" stop-color="#ffe566"/>
          <stop offset="60%" stop-color="#d4a017"/>
          <stop offset="100%" stop-color="#a07800"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#a07800"/>
      <circle cx="50" cy="50" r="44" fill="url(#g5)"/>
      <circle cx="50" cy="50" r="12" fill="none" stroke="#a07800" stroke-width="3"/>
      <circle cx="50" cy="50" r="8" fill="#a07800"/>
      <text x="50" y="42" text-anchor="middle" font-size="22" font-weight="bold" fill="#5C3A00" font-family="serif">5</text>
      <text x="50" y="72" text-anchor="middle" font-size="12" fill="#5C3A00" font-family="serif">円</text>
    </svg>`
  },
  {
    value: 10,
    type: 'coin',
    label: '10えん',
    color: '#B87333',
    bgColor: '#CD853F',
    textColor: '#3D1A00',
    size: 68,
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g10" cx="35%" cy="35%">
          <stop offset="0%" stop-color="#e8a060"/>
          <stop offset="60%" stop-color="#b87333"/>
          <stop offset="100%" stop-color="#8b5a2b"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#8b5a2b"/>
      <circle cx="50" cy="50" r="44" fill="url(#g10)"/>
      <text x="50" y="44" text-anchor="middle" font-size="24" font-weight="bold" fill="#3D1A00" font-family="serif">10</text>
      <text x="50" y="64" text-anchor="middle" font-size="13" fill="#3D1A00" font-family="serif">円</text>
    </svg>`
  },
  {
    value: 50,
    type: 'coin',
    label: '50えん',
    color: '#B0B0B0',
    bgColor: '#D8D8D8',
    textColor: '#333',
    size: 65,
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g50" cx="35%" cy="35%">
          <stop offset="0%" stop-color="#f0f0f0"/>
          <stop offset="60%" stop-color="#b8b8b8"/>
          <stop offset="100%" stop-color="#909090"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#808080"/>
      <circle cx="50" cy="50" r="44" fill="url(#g50)"/>
      <circle cx="50" cy="50" r="12" fill="none" stroke="#808080" stroke-width="3"/>
      <circle cx="50" cy="50" r="8" fill="#808080"/>
      <text x="50" y="40" text-anchor="middle" font-size="22" font-weight="bold" fill="#333" font-family="serif">50</text>
      <text x="50" y="72" text-anchor="middle" font-size="12" fill="#444" font-family="serif">円</text>
    </svg>`
  },
  {
    value: 100,
    type: 'coin',
    label: '100えん',
    color: '#B0B0B0',
    bgColor: '#E0E0E0',
    textColor: '#222',
    size: 72,
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g100" cx="35%" cy="35%">
          <stop offset="0%" stop-color="#f8f8f8"/>
          <stop offset="60%" stop-color="#d0d0d0"/>
          <stop offset="100%" stop-color="#a0a0a0"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#888"/>
      <circle cx="50" cy="50" r="44" fill="url(#g100)"/>
      <text x="50" y="44" text-anchor="middle" font-size="22" font-weight="bold" fill="#222" font-family="serif">100</text>
      <text x="50" y="64" text-anchor="middle" font-size="13" fill="#333" font-family="serif">円</text>
    </svg>`
  },
  {
    value: 500,
    type: 'coin',
    label: '500えん',
    color: '#D4AF37',
    bgColor: '#F5DEB3',
    textColor: '#4A3000',
    size: 78,
    svg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g500" cx="35%" cy="35%">
          <stop offset="0%" stop-color="#ffe080"/>
          <stop offset="40%" stop-color="#d4af37"/>
          <stop offset="70%" stop-color="#c0c0c0"/>
          <stop offset="100%" stop-color="#a0a0a0"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#888"/>
      <circle cx="50" cy="50" r="44" fill="url(#g500)"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
      <text x="50" y="44" text-anchor="middle" font-size="20" font-weight="bold" fill="#4A3000" font-family="serif">500</text>
      <text x="50" y="64" text-anchor="middle" font-size="13" fill="#4A3000" font-family="serif">円</text>
    </svg>`
  },
  {
    value: 1000,
    type: 'bill',
    label: '1000えん',
    color: '#4A7C59',
    bgColor: '#E8F5E9',
    textColor: '#1B5E20',
    width: 140,
    height: 70,
    svg: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="b1000" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#a8d5b5"/>
          <stop offset="50%" stop-color="#7cb899"/>
          <stop offset="100%" stop-color="#5a9e7a"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="196" height="96" rx="6" fill="#3a6e4a" opacity="0.3"/>
      <rect x="0" y="0" width="196" height="96" rx="6" fill="url(#b1000)"/>
      <rect x="4" y="4" width="188" height="88" rx="4" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
      <circle cx="38" cy="48" r="28" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      <text x="38" y="42" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.8)" font-family="serif">野口</text>
      <text x="38" y="56" text-anchor="middle" font-size="8" fill="rgba(255,255,255,0.7)" font-family="serif">英世</text>
      <text x="130" y="38" text-anchor="middle" font-size="28" font-weight="bold" fill="white" font-family="serif">1000</text>
      <text x="130" y="62" text-anchor="middle" font-size="14" fill="rgba(255,255,255,0.9)" font-family="serif">円</text>
      <text x="130" y="80" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.6)" font-family="sans-serif">NIPPON GINKO</text>
    </svg>`
  },
  {
    value: 5000,
    type: 'bill',
    label: '5000えん',
    color: '#8B4B8B',
    bgColor: '#F3E5F5',
    textColor: '#4A148C',
    width: 140,
    height: 70,
    svg: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="b5000" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ce93d8"/>
          <stop offset="50%" stop-color="#ab47bc"/>
          <stop offset="100%" stop-color="#8e24aa"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="196" height="96" rx="6" fill="#6a1b9a" opacity="0.3"/>
      <rect x="0" y="0" width="196" height="96" rx="6" fill="url(#b5000)"/>
      <rect x="4" y="4" width="188" height="88" rx="4" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="1.5"/>
      <circle cx="38" cy="48" r="28" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
      <text x="38" y="42" text-anchor="middle" font-size="10" fill="rgba(255,255,255,0.8)" font-family="serif">樋口</text>
      <text x="38" y="56" text-anchor="middle" font-size="8" fill="rgba(255,255,255,0.7)" font-family="serif">一葉</text>
      <text x="130" y="38" text-anchor="middle" font-size="26" font-weight="bold" fill="white" font-family="serif">5000</text>
      <text x="130" y="62" text-anchor="middle" font-size="14" fill="rgba(255,255,255,0.9)" font-family="serif">円</text>
      <text x="130" y="80" text-anchor="middle" font-size="9" fill="rgba(255,255,255,0.6)" font-family="sans-serif">NIPPON GINKO</text>
    </svg>`
  },
  {
    value: 10000,
    type: 'bill',
    label: '10000えん',
    color: '#8B6914',
    bgColor: '#FFF8E1',
    textColor: '#3E2723',
    width: 140,
    height: 70,
    svg: `<svg viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="b10000" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffe082"/>
          <stop offset="50%" stop-color="#ffca28"/>
          <stop offset="100%" stop-color="#f9a825"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="196" height="96" rx="6" fill="#e65100" opacity="0.2"/>
      <rect x="0" y="0" width="196" height="96" rx="6" fill="url(#b10000)"/>
      <rect x="4" y="4" width="188" height="88" rx="4" fill="none" stroke="rgba(100,50,0,0.4)" stroke-width="1.5"/>
      <circle cx="38" cy="48" r="28" fill="rgba(255,255,255,0.3)" stroke="rgba(100,50,0,0.3)" stroke-width="1"/>
      <text x="38" y="42" text-anchor="middle" font-size="9" fill="rgba(60,30,0,0.8)" font-family="serif">福沢</text>
      <text x="38" y="56" text-anchor="middle" font-size="8" fill="rgba(60,30,0,0.7)" font-family="serif">諭吉</text>
      <text x="128" y="36" text-anchor="middle" font-size="22" font-weight="bold" fill="#3E2723" font-family="serif">10000</text>
      <text x="130" y="60" text-anchor="middle" font-size="14" fill="#4E342E" font-family="serif">円</text>
      <text x="130" y="80" text-anchor="middle" font-size="9" fill="rgba(60,30,0,0.5)" font-family="sans-serif">NIPPON GINKO</text>
    </svg>`
  }
];

// 問題セット（難易度別）
const QUESTIONS = [
  // かんたん（コインのみ、10円以下）
  { target: 1, hint: '1えんコインを1まい', difficulty: 1 },
  { target: 5, hint: '5えんコインを1まい', difficulty: 1 },
  { target: 10, hint: '10えんコインを1まい', difficulty: 1 },
  { target: 2, hint: '1えんコインを2まい', difficulty: 1 },
  { target: 6, hint: '1えんと5えん', difficulty: 1 },
  { target: 11, hint: '10えんと1えん', difficulty: 1 },
  { target: 15, hint: '10えんと5えん', difficulty: 1 },
  { target: 16, hint: '10えんと5えんと1えん', difficulty: 1 },
  // ふつう（100円まで）
  { target: 50, hint: '50えんコインを1まい', difficulty: 2 },
  { target: 60, hint: '50えんと10えん', difficulty: 2 },
  { target: 100, hint: '100えんコインを1まい', difficulty: 2 },
  { target: 55, hint: '50えんと5えん', difficulty: 2 },
  { target: 105, hint: '100えんと5えん', difficulty: 2 },
  { target: 110, hint: '100えんと10えん', difficulty: 2 },
  { target: 150, hint: '100えんと50えん', difficulty: 2 },
  { target: 120, hint: '100えんと10えんと10えん', difficulty: 2 },
  // むずかしい（500円まで）
  { target: 500, hint: '500えんコインを1まい', difficulty: 3 },
  { target: 510, hint: '500えんと10えん', difficulty: 3 },
  { target: 550, hint: '500えんと50えん', difficulty: 3 },
  { target: 600, hint: '500えんと100えん', difficulty: 3 },
  { target: 300, hint: '100えんを3まい', difficulty: 3 },
  { target: 250, hint: '100えんが2まいと50えん', difficulty: 3 },
  // チャレンジ（1000円まで）
  { target: 1000, hint: '1000えんさつを1まい', difficulty: 4 },
  { target: 1100, hint: '1000えんと100えん', difficulty: 4 },
  { target: 1500, hint: '1000えんと500えん', difficulty: 4 },
  { target: 2000, hint: '1000えんさつを2まい', difficulty: 4 },
];

function getMoneySVG(moneyItem) {
  return moneyItem.svg;
}
