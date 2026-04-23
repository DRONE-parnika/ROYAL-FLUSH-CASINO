/* ══════════════════════════════════════════
   ROYAL FLUSH CASINO — script.js
   Games: Slots · Fortune Wheel · Blackjack
   ══════════════════════════════════════════ */

'use strict';

// ─── GLOBAL STATE ────────────────────────────────────────
let coins = parseInt(localStorage.getItem('rfCoins') || '1000');
let anyBusy = false;

function saveCoins() { localStorage.setItem('rfCoins', coins); }
function fmtCoins(n) { return n.toLocaleString(); }

function updateAllCoins() {
  saveCoins();
  document.getElementById('lobbyCoins').textContent  = fmtCoins(coins);
  document.getElementById('slotsCoins').textContent  = fmtCoins(coins);
  document.getElementById('wheelCoins').textContent  = fmtCoins(coins);
  document.getElementById('bjCoins').textContent     = fmtCoins(coins);
}

function adjBet(game, delta) {
  const id = game === 'slots' ? 'slotsBet' : game === 'wheel' ? 'wheelBet' : 'bjBet';
  const inp = document.getElementById(id);
  let v = (parseInt(inp.value) || 10) + delta;
  v = Math.max(10, Math.min(500, Math.round(v / 10) * 10));
  inp.value = v;
}
function setBetVal(game, v) {
  const id = game === 'slots' ? 'slotsBet' : game === 'wheel' ? 'wheelBet' : 'bjBet';
  document.getElementById(id).value = v;
}
function getBet(game) {
  const id = game === 'slots' ? 'slotsBet' : game === 'wheel' ? 'wheelBet' : 'bjBet';
  let v = parseInt(document.getElementById(id).value) || 10;
  v = Math.max(10, Math.min(500, Math.round(v / 10) * 10));
  document.getElementById(id).value = v;
  return v;
}

// ─── SCREEN ROUTING ──────────────────────────────────────
function goLobby() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('lobby').classList.add('active');
  renderBoard();
  updateAllCoins();
}
function goGame(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(name + 'Screen').classList.add('active');
  updateAllCoins();
  if (name === 'slots') initSlotsCanvas();
}

// ─── LEADERBOARD ─────────────────────────────────────────
function getBoard() { return JSON.parse(localStorage.getItem('rfBoard') || '[]'); }
function saveBoard() {
  let b = getBoard();
  b.push(coins);
  b.sort((a, b) => b - a);
  b = b.slice(0, 5);
  localStorage.setItem('rfBoard', JSON.stringify(b));
}
function renderBoard() {
  const medals = ['🥇','🥈','🥉','④','⑤'];
  const ul = document.getElementById('lobbyBoard');
  const b = getBoard();
  ul.innerHTML = '';
  if (!b.length) { ul.innerHTML = '<li style="opacity:.4;font-size:.7rem">NO SCORES YET</li>'; return; }
  b.forEach((s, i) => {
    ul.innerHTML += `<li><span class="lb-rank">${medals[i]||i+1}</span><span class="lb-score">${fmtCoins(s)} CR</span></li>`;
  });
}

// ─── WIN OVERLAY & CONFETTI ──────────────────────────────
let confettiParts = [];
function showWinOverlay(msg) {
  const ov = document.getElementById('winOverlay');
  document.getElementById('winOverlayText').textContent = msg;
  ov.classList.add('show');
  launchConfetti();
  setTimeout(() => { ov.classList.remove('show'); }, 2600);
}

function launchConfetti() {
  const cv = document.getElementById('confettiCanvas');
  cv.width  = window.innerWidth;
  cv.height = window.innerHeight;
  const ctx = cv.getContext('2d');
  const colors = ['#D4AF37','#FFD700','#fff','#C0392B','#2980B9','#27AE60','#8E44AD','#F5D76E'];
  confettiParts = Array.from({length:160}, () => ({
    x: Math.random() * cv.width,
    y: -20 - Math.random() * 100,
    w: 8 + Math.random() * 10,
    h: 4 + Math.random() * 6,
    r: Math.random() * Math.PI * 2,
    vx: (Math.random()-0.5)*4,
    vy: 4 + Math.random() * 5,
    vr: (Math.random()-0.5)*0.2,
    color: colors[Math.floor(Math.random()*colors.length)]
  }));
  let frame = 0;
  function drawConf() {
    ctx.clearRect(0,0,cv.width,cv.height);
    confettiParts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.r += p.vr;
      p.vy += 0.1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - frame/90);
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });
    frame++;
    if (frame < 100) requestAnimationFrame(drawConf);
    else ctx.clearRect(0,0,cv.width,cv.height);
  }
  drawConf();
}

// ─── BG PARTICLE SYSTEM ──────────────────────────────────
(function bgParticles() {
  const cv = document.getElementById('bgCanvas');
  const ctx = cv.getContext('2d');
  let W, H, pts;
  function resize() { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; }
  function mkPt() { return { x:Math.random()*W, y:Math.random()*H, r:Math.random()*1.2+0.3, vx:(Math.random()-.5)*.25, vy:(Math.random()-.5)*.25, a:Math.random()*.6+.1, c: Math.random()<0.3?'212,175,55':'255,255,220' }; }
  function init() { resize(); pts = Array.from({length:140}, mkPt); }
  function draw() {
    ctx.clearRect(0,0,W,H);
    pts.forEach(p => {
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0)p.x=W; if(p.x>W)p.x=0; if(p.y<0)p.y=H; if(p.y>H)p.y=0;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${p.c},${p.a})`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  init(); draw();
  window.addEventListener('resize', init);
})();

// ─── MARQUEE BULBS ───────────────────────────────────────
(function initBulbs() {
  const colors = ['#FFD700','#FF4444','#44AAFF','#44FF88','#FF88FF'];
  ['marqTop','marqBot'].forEach(id => {
    const el = document.getElementById(id);
    for (let i=0;i<40;i++) {
      const b = document.createElement('div');
      b.className = 'bulb';
      const c = colors[i%colors.length];
      b.style.cssText = `background:${c};box-shadow:0 0 6px ${c},0 0 14px ${c};animation-delay:${(i%5)*0.24}s;`;
      el.appendChild(b);
    }
  });
})();

// ─── CABINET LIGHTS ──────────────────────────────────────
(function initCabLight() {
  const colors = ['#FFD700','#FF4444','#44AAFF','#44FF88'];
  const el = document.getElementById('cabinetLights');
  if (!el) return;
  for (let i=0;i<8;i++) {
    const b = document.createElement('div');
    b.className='cl';
    const c=colors[i%colors.length];
    b.style.cssText=`background:${c};box-shadow:0 0 6px ${c};animation-delay:${i*0.15}s;`;
    el.appendChild(b);
  }
})();

// ─── GAME CARD PREVIEWS ──────────────────────────────────
function drawPreviews() {
  // Slots preview
  const sp = document.getElementById('prevSlots');
  if (sp) {
    const c = sp.getContext('2d');
    c.fillStyle = '#04020a'; c.fillRect(0,0,260,140);
    const syms = ['7','♦','★','🍒','🍋'];
    c.font = 'bold 38px serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const cols = ['#FFD700','#00bfff','#ff4488','#ff6b35','#a8e063'];
    for (let i=0;i<3;i++) {
      const x = 43 + i*87;
      c.strokeStyle='rgba(212,175,55,0.4)'; c.lineWidth=2;
      c.strokeRect(x-35, 30, 70, 80);
      c.fillStyle = cols[i]; c.fillText(syms[i], x, 70);
    }
    c.fillStyle='rgba(212,175,55,0.6)'; c.fillRect(8,66,244,8);
  }
  // Wheel preview
  const wp = document.getElementById('prevWheel');
  if (wp) {
    const c = wp.getContext('2d');
    c.fillStyle='#04020a'; c.fillRect(0,0,260,140);
    const segs=['#FFD700','#C0392B','#2980B9','#27AE60','#8E44AD','#E67E22'];
    const cx=130,cy=70,r=60;
    for(let i=0;i<6;i++){
      c.beginPath(); c.moveTo(cx,cy);
      c.arc(cx,cy,r,i*Math.PI/3,(i+1)*Math.PI/3); c.closePath();
      c.fillStyle=segs[i]; c.fill();
      c.strokeStyle='#000'; c.lineWidth=2; c.stroke();
    }
    c.beginPath(); c.arc(cx,cy,12,0,Math.PI*2);
    c.fillStyle='#1a1520'; c.fill();
    c.strokeStyle='#D4AF37'; c.lineWidth=3; c.stroke();
  }
  // Blackjack preview
  const bp = document.getElementById('prevBJ');
  if (bp) {
    const c = bp.getContext('2d');
    const g = c.createRadialGradient(130,70,0,130,70,120);
    g.addColorStop(0,'#0d4d26'); g.addColorStop(1,'#071a0d');
    c.fillStyle=g; c.fillRect(0,0,260,140);
    function drawMiniCard(x,y,rank,suit,red) {
      c.fillStyle='#fff'; c.strokeStyle='#ccc'; c.lineWidth=1;
      roundRect(c,x,y,45,63,5); c.fill(); c.stroke();
      c.fillStyle=red?'#c0392b':'#1a1a2e';
      c.font='bold 13px serif'; c.textAlign='left'; c.textBaseline='top';
      c.fillText(rank,x+4,y+4);
      c.font='16px serif'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(suit,x+22,y+31);
    }
    function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();}
    drawMiniCard(50,38,'A','♠',false);
    drawMiniCard(100,38,'K','♥',true);
    drawMiniCard(165,38,'?','',false);
  }
}

function roundRectPath(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();}

// ═══════════════════════════════════════════════
//                   SLOTS
// ═══════════════════════════════════════════════
const SLOT_SYMS = [
  { sym:'7️⃣', label:'7',    color:'#FFD700', weight:1 },
  { sym:'💎', label:'♦',    color:'#00cfff', weight:2 },
  { sym:'⭐', label:'★',    color:'#fff176', weight:3 },
  { sym:'🍀', label:'♣',    color:'#57e89e', weight:4 },
  { sym:'🍒', label:'♥',    color:'#ff6b6b', weight:5 },
  { sym:'🍋', label:'✦',    color:'#ffc857', weight:6 },
];

function randSym() {
  const total = SLOT_SYMS.reduce((a,s)=>a+s.weight,0);
  let r = Math.random()*total;
  for (const s of SLOT_SYMS) { r-=s.weight; if(r<=0) return s; }
  return SLOT_SYMS[SLOT_SYMS.length-1];
}

let slotsCtx, slotsAnimId;
let reels = [{syms:[]},{syms:[]},{syms:[]}];
let slotsSpinning = false;
const REEL_W = 140, REEL_H = 200, REEL_GAP = 10;
const TOTAL_W = REEL_W*3 + REEL_GAP*2;

function initSlotsCanvas() {
  const cv = document.getElementById('slotsCanvas');
  if (!cv) return;
  cv.width = TOTAL_W; cv.height = REEL_H;
  slotsCtx = cv.getContext('2d');
  reels.forEach(r => { r.syms = [randSym(),randSym(),randSym()]; r.offset = 0; r.speed = 0; r.stopping = false; r.done = true; });
  drawStaticReels();
}

function drawStaticReels() {
  const ctx = slotsCtx;
  if (!ctx) return;
  ctx.clearRect(0,0,TOTAL_W,REEL_H);
  reels.forEach((r,i) => {
    const x = i*(REEL_W+REEL_GAP);
    drawReel(ctx, r, x);
  });
  drawPayline(ctx);
}

function drawReel(ctx, r, x) {
  ctx.save();
  ctx.beginPath(); ctx.rect(x, 0, REEL_W, REEL_H); ctx.clip();

  // Background
  const bg = ctx.createLinearGradient(x,0,x,REEL_H);
  bg.addColorStop(0,'#0a0018'); bg.addColorStop(0.5,'#120024'); bg.addColorStop(1,'#0a0018');
  ctx.fillStyle=bg; ctx.fillRect(x,0,REEL_W,REEL_H);

  // Border
  ctx.strokeStyle='rgba(212,175,55,0.35)'; ctx.lineWidth=2;
  ctx.strokeRect(x+1,1,REEL_W-2,REEL_H-2);

  // Symbols — show 3 positions
  const symH = REEL_H / 3;
  const baseOffset = r.offset % symH;
  for (let row=-1; row<=3; row++) {
    const idx = ((Math.floor(r.offset/symH) + row + r.syms.length*10) % r.syms.length + r.syms.length) % r.syms.length;
    const sym = r.syms[idx];
    const yPos = row * symH - baseOffset + symH/2;
    if (yPos < -symH || yPos > REEL_H + symH) continue;

    // Cell background
    const mid = REEL_H/2;
    const dist = Math.abs(yPos - mid) / REEL_H;
    ctx.globalAlpha = 1 - dist*0.8;

    ctx.fillStyle = `rgba(${hexToRgb(sym.color)},0.08)`;
    ctx.fillRect(x+4, yPos-symH/2+2, REEL_W-8, symH-4);

    // Emoji / symbol
    ctx.font = `bold ${Math.round(symH*0.55)}px serif`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillStyle = sym.color;
    ctx.shadowColor = sym.color; ctx.shadowBlur = 12;
    ctx.fillText(sym.sym, x + REEL_W/2, yPos);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // Top/bottom fade
  const fadeTop = ctx.createLinearGradient(x,0,x,REEL_H*0.28);
  fadeTop.addColorStop(0,'rgba(8,0,18,1)'); fadeTop.addColorStop(1,'rgba(8,0,18,0)');
  ctx.fillStyle=fadeTop; ctx.fillRect(x,0,REEL_W,REEL_H*0.28);

  const fadeBot = ctx.createLinearGradient(x,REEL_H*0.72,x,REEL_H);
  fadeBot.addColorStop(0,'rgba(8,0,18,0)'); fadeBot.addColorStop(1,'rgba(8,0,18,1)');
  ctx.fillStyle=fadeBot; ctx.fillRect(x,REEL_H*0.72,REEL_W,REEL_H*0.28);

  ctx.restore();
}

function drawPayline(ctx) {
  const y = REEL_H/2;
  ctx.strokeStyle='rgba(212,175,55,0.5)'; ctx.lineWidth=2;
  ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.moveTo(4,y); ctx.lineTo(TOTAL_W-4,y); ctx.stroke();
  ctx.setLineDash([]);
}

function hexToRgb(hex) {
  if(hex.startsWith('#')){
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  }
  return '212,175,55';
}

function spinSlots() {
  if (slotsSpinning || anyBusy) return;
  const bet = getBet('slots');
  if (bet > coins) { setResult('slotsResult','NOT ENOUGH CREDITS','lose'); flashCoins(); return; }

  coins -= bet; updateAllCoins();
  slotsSpinning = true; anyBusy = true;
  document.getElementById('slotsSpinBtn').disabled = true;
  setResult('slotsResult','SPINNING...','');

  // Setup spin
  reels.forEach((r,i) => {
    r.done = false;
    r.speed = 28 + Math.random()*8;
    r.stopping = false;
    r.stopAt = 1200 + i*400 + Math.random()*200;
    r.elapsed = 0;
    // Pick target symbol
    r.target = randSym();
  });

  let last = performance.now();
  function animate(now) {
    const dt = now - last; last = now;
    const ctx = slotsCtx;
    ctx.clearRect(0,0,TOTAL_W,REEL_H);

    let allDone = true;
    reels.forEach((r,i) => {
      if (!r.done) {
        r.elapsed += dt;
        if (r.elapsed >= r.stopAt) {
          // Snap to center
          r.speed = Math.max(0, r.speed - 1.2);
          if (r.speed === 0) {
            r.done = true;
            // Snap offset to a clean position
            const symH = REEL_H/3;
            r.offset = Math.round(r.offset/symH)*symH;
            r.syms[Math.round(r.offset/symH)%r.syms.length] = r.target;
          }
        }
        r.offset += r.speed;
        allDone = false;
      }
      drawReel(ctx, r, i*(REEL_W+REEL_GAP));
    });
    drawPayline(ctx);

    if (!allDone) {
      slotsAnimId = requestAnimationFrame(animate);
    } else {
      finishSlots(bet);
    }
  }
  slotsAnimId = requestAnimationFrame(animate);
}

function getMiddleSyms() {
  return reels.map(r => r.target || r.syms[0]);
}

function finishSlots(bet) {
  const syms = getMiddleSyms();
  const labels = syms.map(s=>s.label);
  let mult = 0, msg = '';

  const allSame = labels.every(l=>l===labels[0]);
  const twos = labels.filter((l,i)=>labels.indexOf(l)===i).length <= 2;

  if (allSame) {
    const s = syms[0];
    if(s.label==='7')      { mult=10; msg='💰 JACKPOT! TRIPLE 7s!'; }
    else if(s.label==='♦') { mult=7;  msg='💎 DIAMONDS! x7!'; }
    else if(s.label==='★') { mult=5;  msg='⭐ TRIPLE STARS! x5!'; }
    else if(s.label==='♣') { mult=4;  msg='🍀 LUCKY CLOVER! x4!'; }
    else if(s.label==='♥') { mult=3;  msg='🍒 TRIPLE CHERRY! x3!'; }
    else                   { mult=2;  msg='✨ TRIPLE MATCH! x2!'; }
  } else if (twos) {
    mult=2; msg='✨ DOUBLE MATCH! x2!';
  } else {
    msg='😢 NO MATCH — TRY AGAIN'; 
  }

  const payout = bet * mult;
  coins += payout; updateAllCoins();
  setResult('slotsResult', msg, mult>0?'win':'lose');

  if (mult >= 7) showWinOverlay('💎 JACKPOT!');
  else if (mult >= 3) showWinOverlay('🎉 WIN!');

  saveBoard();
  slotsSpinning = false; anyBusy = false;
  document.getElementById('slotsSpinBtn').disabled = false;
}

// ═══════════════════════════════════════════════
//               FORTUNE WHEEL
// ═══════════════════════════════════════════════
const WHEEL_SEGS = [
  { label:'MEGA JACKPOT', mult:15, color:'#FFD700', textColor:'#000' },
  { label:'LOSE',         mult:0,  color:'#C0392B', textColor:'#fff' },
  { label:'BIG WIN x5',  mult:5,  color:'#2980B9', textColor:'#fff' },
  { label:'LOSE',         mult:0,  color:'#8B0000', textColor:'#ff8888' },
  { label:'WIN x2',       mult:2,  color:'#27AE60', textColor:'#fff' },
  { label:'LOSE',         mult:0,  color:'#C0392B', textColor:'#fff' },
  { label:'BONUS x3',     mult:3,  color:'#8E44AD', textColor:'#fff' },
  { label:'LOSE',         mult:0,  color:'#922B21', textColor:'#ff8888' },
  { label:'BIG WIN x5',  mult:5,  color:'#1A5276', textColor:'#fff' },
  { label:'LOSE',         mult:0,  color:'#C0392B', textColor:'#fff' },
  { label:'WIN x2',       mult:2,  color:'#1E8449', textColor:'#fff' },
  { label:'LOSE',         mult:0,  color:'#7B241C', textColor:'#ff8888' },
];

let wheelAngle = 0, wheelSpinning = false, wheelCtx;

function initWheel() {
  const cv = document.getElementById('wheelCanvas');
  if (!cv || wheelCtx) return;
  wheelCtx = cv.getContext('2d');
  drawWheelFrame(wheelAngle);
}

function drawWheelFrame(angle) {
  const cv = document.getElementById('wheelCanvas');
  if (!cv) return;
  const ctx = wheelCtx || cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const CX = W/2, CY = H/2, R = Math.min(CX,CY)-6;
  ctx.clearRect(0,0,W,H);

  const N = WHEEL_SEGS.length;
  const arc = (2*Math.PI)/N;

  WHEEL_SEGS.forEach((seg,i) => {
    const start = angle + i*arc;
    const end   = start + arc;

    // Segment
    ctx.beginPath(); ctx.moveTo(CX,CY);
    ctx.arc(CX,CY,R,start,end); ctx.closePath();
    ctx.fillStyle = seg.color; ctx.fill();

    // Outer glow strip
    ctx.beginPath();
    ctx.arc(CX,CY,R-3,start+0.05,end-0.05);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth=4; ctx.stroke();

    // Divider
    ctx.beginPath(); ctx.moveTo(CX,CY);
    ctx.arc(CX,CY,R,start,start); ctx.lineTo(CX,CY);
    ctx.strokeStyle='rgba(0,0,0,0.5)'; ctx.lineWidth=2; ctx.stroke();

    // Label
    ctx.save();
    ctx.translate(CX,CY);
    ctx.rotate(start + arc/2);
    ctx.textAlign='right'; ctx.textBaseline='middle';
    ctx.font = `bold ${W<350?9:11}px Rajdhani,sans-serif`;
    ctx.fillStyle = seg.textColor;
    ctx.shadowColor='rgba(0,0,0,0.8)'; ctx.shadowBlur=4;
    ctx.fillText(seg.label, R-8, 0);
    ctx.shadowBlur=0;
    ctx.restore();
  });

  // Inner hub
  const hub = ctx.createRadialGradient(CX,CY,0,CX,CY,30);
  hub.addColorStop(0,'#3a2e00'); hub.addColorStop(1,'#1a1500');
  ctx.beginPath(); ctx.arc(CX,CY,30,0,Math.PI*2);
  ctx.fillStyle=hub; ctx.fill();
  ctx.strokeStyle='#D4AF37'; ctx.lineWidth=3; ctx.stroke();

  // Center star
  ctx.font='22px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillStyle='#D4AF37'; ctx.shadowColor='#D4AF37'; ctx.shadowBlur=8;
  ctx.fillText('★',CX,CY); ctx.shadowBlur=0;
}

function spinWheel() {
  initWheel();
  if (wheelSpinning || anyBusy) return;
  const bet = getBet('wheel');
  if (bet > coins) { setResult('wheelResult','NOT ENOUGH CREDITS','lose'); flashCoins(); return; }

  coins -= bet; updateAllCoins();
  wheelSpinning = true; anyBusy = true;
  document.getElementById('wheelSpinBtn').disabled = true;
  setResult('wheelResult','SPINNING...','');

  const N = WHEEL_SEGS.length;
  const arc = (2*Math.PI)/N;
  const targetIdx = Math.floor(Math.random()*N);
  const seg = WHEEL_SEGS[targetIdx];

  const spins = (5 + Math.floor(Math.random()*5))*Math.PI*2;
  const targetAngle = -Math.PI/2 - (targetIdx*arc + arc/2);
  const totalSpin = spins + ((targetAngle - wheelAngle) % (2*Math.PI));
  const duration = 4500 + Math.random()*1500;
  const t0 = performance.now();
  const a0 = wheelAngle;

  function easeOut(t) { return 1 - Math.pow(1-t,4); }

  function frame(now) {
    const t = Math.min((now-t0)/duration, 1);
    wheelAngle = a0 + totalSpin * easeOut(t);
    drawWheelFrame(wheelAngle);
    if (t < 1) requestAnimationFrame(frame);
    else resolveWheel(seg, bet);
  }
  requestAnimationFrame(frame);
}

function resolveWheel(seg, bet) {
  wheelSpinning = false; anyBusy = false;
  document.getElementById('wheelSpinBtn').disabled = false;
  const payout = bet * seg.mult;
  coins += payout; updateAllCoins();
  if (seg.mult === 0) {
    setResult('wheelResult','😢 LOSE — HOUSE WINS!','lose');
  } else if (seg.mult >= 15) {
    setResult('wheelResult',`💰 MEGA JACKPOT! +${fmtCoins(payout)} CR`,'win');
    showWinOverlay('MEGA JACKPOT!');
  } else {
    setResult('wheelResult',`🎉 ${seg.label.replace(/x\d+/,'')}WIN! +${fmtCoins(payout)} CR`,'win');
    if (seg.mult >= 5) showWinOverlay('BIG WIN!');
  }
  saveBoard();
}

// ═══════════════════════════════════════════════
//                  BLACKJACK
// ═══════════════════════════════════════════════
const SUITS = ['♠','♥','♦','♣'];
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

let deck = [], playerHand = [], dealerHand = [], bjActive = false, bjBetAmt = 0;

function buildDeck() {
  deck = [];
  for (let d=0;d<6;d++) SUITS.forEach(s=>RANKS.forEach(r=>deck.push({rank:r,suit:s})));
  for (let i=deck.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [deck[i],deck[j]]=[deck[j],deck[i]];
  }
}

function drawCard() {
  if (deck.length < 20) buildDeck();
  return deck.pop();
}

function cardValue(card) {
  if (['J','Q','K'].includes(card.rank)) return 10;
  if (card.rank==='A') return 11;
  return parseInt(card.rank);
}

function handTotal(hand) {
  let total = hand.reduce((a,c)=>a+cardValue(c),0);
  let aces = hand.filter(c=>c.rank==='A').length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function isRed(card) { return card.suit==='♥'||card.suit==='♦'; }

function renderCard(card, faceDown=false) {
  const el = document.createElement('div');
  el.className = 'playing-card deal-anim';
  if (faceDown) { el.classList.add('face-down'); return el; }
  el.classList.add(isRed(card)?'red-card':'black-card');
  el.innerHTML = `
    <div class="card-corner-top">
      <span class="card-rank">${card.rank}</span>
      <span class="card-suit">${card.suit}</span>
    </div>
    <span class="card-suit-center">${card.suit}</span>
    <div class="card-corner-bot">
      <span class="card-rank">${card.rank}</span>
      <span class="card-suit">${card.suit}</span>
    </div>`;
  return el;
}

function renderHands(hideDealer=false) {
  const ph = document.getElementById('playerHand');
  const dh = document.getElementById('dealerHand');
  ph.innerHTML=''; dh.innerHTML='';
  playerHand.forEach((c,i) => {
    setTimeout(()=>ph.appendChild(renderCard(c)), i*120);
  });
  dealerHand.forEach((c,i) => {
    const fd = hideDealer && i===1;
    setTimeout(()=>dh.appendChild(renderCard(c,fd)), i*120+60);
  });
  document.getElementById('playerCount').textContent = handTotal(playerHand);
  document.getElementById('dealerCount').textContent = hideDealer ? '?' : handTotal(dealerHand);
}

function bjDeal() {
  if (anyBusy) return;
  const bet = getBet('bj');
  if (bet > coins) { setResult('bjResult','NOT ENOUGH CREDITS','lose'); flashCoins(); return; }

  bjBetAmt = bet; coins -= bet; updateAllCoins();
  bjActive = true;

  if (!deck.length) buildDeck();
  playerHand = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];

  document.getElementById('bjBetArea').style.display='none';
  document.getElementById('bjNewArea').style.display='none';
  document.getElementById('bjActionArea').style.display='flex';
  document.getElementById('bjDoubleBtn').disabled = coins < bjBetAmt;

  renderHands(true);
  setResult('bjResult','','');

  // Check natural blackjack
  setTimeout(()=>{
    if (handTotal(playerHand)===21) {
      bjRevealAndEnd('player_bj');
    }
  }, 600);
}

function bjHit() {
  if (!bjActive) return;
  playerHand.push(drawCard());
  renderHands(true);
  const t = handTotal(playerHand);
  if (t > 21) { setTimeout(()=>bjRevealAndEnd('bust'), 300); }
  else if (t === 21) { setTimeout(()=>bjStand(), 300); }
  document.getElementById('bjDoubleBtn').disabled = true;
}

function bjStand() {
  if (!bjActive) return;
  document.getElementById('bjActionArea').style.display='none';
  // Dealer reveals and plays
  renderHands(false);
  document.getElementById('dealerCount').textContent = handTotal(dealerHand);
  setTimeout(()=>dealerPlay(), 600);
}

function dealerPlay() {
  if (handTotal(dealerHand) < 17) {
    dealerHand.push(drawCard());
    renderHands(false);
    setTimeout(()=>dealerPlay(), 700);
  } else {
    bjRevealAndEnd('dealer_done');
  }
}

function bjDouble() {
  if (!bjActive || coins < bjBetAmt) return;
  coins -= bjBetAmt; bjBetAmt *= 2; updateAllCoins();
  playerHand.push(drawCard());
  renderHands(true);
  document.getElementById('bjActionArea').style.display='none';
  setTimeout(()=>{
    if (handTotal(playerHand)>21) bjRevealAndEnd('bust');
    else bjStand();
  }, 400);
}

function bjRevealAndEnd(reason) {
  bjActive = false;
  document.getElementById('bjActionArea').style.display='none';
  renderHands(false);

  const pt = handTotal(playerHand);
  const dt = handTotal(dealerHand);
  let msg='', payout=0;

  if (reason==='bust') { msg='💥 BUST! DEALER WINS'; }
  else if (reason==='player_bj') { payout=Math.floor(bjBetAmt*2.5); msg=`🃏 BLACKJACK! +${fmtCoins(payout)} CR`; }
  else if (dt>21) { payout=bjBetAmt*2; msg=`🎉 DEALER BUSTS! YOU WIN +${fmtCoins(payout)} CR`; }
  else if (pt>dt) { payout=bjBetAmt*2; msg=`✅ YOU WIN! +${fmtCoins(payout)} CR`; }
  else if (pt===dt) { payout=bjBetAmt; msg=`🤝 PUSH — BET RETURNED`; }
  else { msg=`😢 DEALER WINS (${dt} vs ${pt})`; }

  coins += payout; updateAllCoins();
  setResult('bjResult', msg, payout>0?'win':'lose');

  if (payout >= bjBetAmt*2) { showWinOverlay(reason==='player_bj'?'BLACKJACK! 3:2':'BIG WIN!'); }
  saveBoard();

  setTimeout(()=>{
    document.getElementById('bjNewArea').style.display='block';
  }, 500);
}

function bjNewRound() {
  document.getElementById('bjBetArea').style.display='flex';
  document.getElementById('bjNewArea').style.display='none';
  document.getElementById('bjActionArea').style.display='none';
  document.getElementById('playerHand').innerHTML='';
  document.getElementById('dealerHand').innerHTML='';
  document.getElementById('playerCount').textContent='—';
  document.getElementById('dealerCount').textContent='—';
  setResult('bjResult','PLACE YOUR BET TO BEGIN','');
}

// ─── HELPERS ─────────────────────────────────────────────
function setResult(id, msg, cls) {
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = msg;
  el.className = '';
  if(cls==='win') el.classList.add('result-win');
  if(cls==='lose') el.classList.add('result-lose');
}

function flashCoins() {
  ['lobbyCoins','slotsCoins','wheelCoins','bjCoins'].forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.style.color='#ff4444';
    setTimeout(()=>{el.style.color='';}, 500);
  });
}

// ─── INIT ────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', ()=>{
  updateAllCoins();
  renderBoard();
  drawPreviews();
  buildDeck();
  // Lazy init wheel when screen shown
  document.getElementById('wheelSpinBtn') && document.getElementById('wheelSpinBtn').addEventListener('click', ()=>{ initWheel(); });
});