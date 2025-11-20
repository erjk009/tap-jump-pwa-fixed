// Finalized Tap Jump game with graphics integration
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const menu = document.getElementById('menu');
  const startBtn = document.getElementById('start');
  const scoreEl = document.getElementById('score');
  const muteBtn = document.getElementById('mute');
  const highEl = document.getElementById('highscore');
  const gameoverEl = document.getElementById('gameover');
  const finalScoreEl = document.getElementById('finalscore');
  const retryBtn = document.getElementById('retry');
  const homeBtn = document.getElementById('home');

  let W = 480, H = 820;
  function resize(){
    const ratio = window.devicePixelRatio || 1;
    const w = Math.min(window.innerWidth,480);
    const h = Math.min(window.innerHeight-20,820);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    W = w; H = h;
  }
  window.addEventListener('resize', resize);
  resize();

  // Load images
  const bg = new Image();
  const playerImg = new Image();
  bg.src = 'assets/bg-720x1280.png';
  playerImg.src = 'assets/player.png';

  // Audio
  let audioCtx = null;
  try{ audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }catch(e){ audioCtx = null; }
  let muted = false;
  function beep(freq=440,dur=0.06){
    if(muted || !audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.value = 0.06;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    setTimeout(()=>o.stop(), dur*1000);
  }

  // Game state
  let running = false;
  let frame = 0;
  let score = 0;
  let high = parseInt(localStorage.getItem('tapjump_high')||'0',10);
  highEl.textContent = high;

  // Player
  const player = { x:80, y:0, w:48, h:48, vy:0, jump:-14, grounded:false };

  // Obstacles
  let obstacles = [];
  let speed = 4;

  function spawnObstacle(){
    const hgt = 30 + Math.random()*70;
    obstacles.push({ x: W + 20, y: H - 120 - hgt, w: 28 + Math.random()*40, h: hgt });
  }

  function reset(){
    obstacles = [];
    frame = 0;
    score = 0;
    speed = 4;
    player.y = H - 120 - player.h;
    player.vy = 0;
    running = true;
    menu.style.display = 'none';
    gameoverEl.style.display = 'none';
    beep(880,0.06);
  }

  function gameOver(){
    running = false;
    finalScoreEl.textContent = Math.floor(score);
    document.getElementById('finalscore').textContent = Math.floor(score);
    gameoverEl.style.display = 'flex';
    if(Math.floor(score) > high){
      high = Math.floor(score);
      localStorage.setItem('tapjump_high', high);
      highEl.textContent = high;
    }
    beep(120,0.18);
  }

  function update(){
    if(!running) return;
    frame++;
    if(frame % Math.max(40, 90 - Math.floor(speed*4)) === 0) spawnObstacle();
    if(frame % 600 === 0) speed += 0.5;

    // update obstacles
    for(let i=obstacles.length-1;i>=0;i--){
      obstacles[i].x -= speed;
      if(obstacles[i].x + obstacles[i].w < -20) { obstacles.splice(i,1); score++; }
    }

    // physics
    player.vy += 0.9;
    player.y += player.vy;
    if(player.y + player.h >= H - 120){
      player.y = H - 120 - player.h;
      player.vy = 0;
      player.grounded = true;
    } else {
      player.grounded = false;
    }

    // collision
    for(const ob of obstacles){
      if(rectIntersect(player, ob)) gameOver();
    }

    score += 0.05 * (1 + speed/6);
    scoreEl.textContent = Math.floor(score);
  }

  function rectIntersect(a,b){
    return !(a.x + a.w < b.x || a.x > b.x + b.w || a.y + a.h < b.y || a.y > b.y + b.h);
  }

  // Draw
  function draw(){
    // background: tile center of bg image to fill area
    ctx.fillStyle = '#8fd1ff';
    ctx.fillRect(0,0,W,H);
    if(bg.complete){
      const scale = Math.max(W / bg.width, (H) / bg.height);
      const bw = bg.width * scale;
      const bh = bg.height * scale;
      ctx.drawImage(bg, (W - bw)/2, H - bh, bw, bh);
    }

    // ground
    ctx.fillStyle = '#6bb06f';
    ctx.fillRect(0, H - 120, W, 120);

    // obstacles
    ctx.fillStyle = '#2c3e50';
    for(const ob of obstacles){
      roundRect(ctx, ob.x, ob.y, ob.w, ob.h, 6);
    }

    // player (image)
    if(playerImg.complete){
      const bob = Math.sin(frame/6) * 3;
      ctx.drawImage(playerImg, player.x, player.y + bob, player.w, player.h);
    } else {
      ctx.fillStyle = '#ffdd57';
      roundRect(ctx, player.x, player.y, player.w, player.h, 6);
    }
  }

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
    ctx.fill();
  }

  function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
  }
  loop();

  // Input
  function jump(){
    if(!running){ reset(); return; }
    if(player.grounded || player.vy === 0){
      player.vy = player.jump;
      player.grounded = false;
      beep(520,0.04);
    } else if(player.vy > 0){
      player.vy = -8;
      beep(380,0.03);
    }
  }
  window.addEventListener('touchstart', (e)=>{ e.preventDefault(); jump(); }, {passive:false});
  window.addEventListener('mousedown', (e)=>{ jump(); });
  window.addEventListener('keydown', (e)=>{ if(e.code === 'Space') jump(); });

  // UI events
  startBtn.addEventListener('click', ()=>{ reset(); });
  retryBtn.addEventListener('click', ()=>{ reset(); });
  homeBtn.addEventListener('click', ()=>{ menu.style.display = 'flex'; gameoverEl.style.display = 'none'; });

  muteBtn.addEventListener('click', ()=>{
    muted = !muted;
    muteBtn.textContent = muted ? '🔇' : '🔊';
  });

  // persistent highscore display
  document.getElementById('highscore').textContent = high;

  // service worker registration handled in index
})();
