/* Game logic (simple Tap Jump) */
(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let W = 400, H = 700;

  function resize(){ 
    const w = Math.min(window.innerWidth,480);
    const h = Math.min(window.innerHeight-20,820);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    W = w; H = h;
  }
  window.addEventListener('resize', resize);
  resize();

  let score = 0;
  let running = false;
  const player = { x:50, y:500, w:30, h:30, vy:0 };
  const gravity = 0.6;
  let obstacles = [];
  let frame = 0;

  function spawn(){ obstacles.push({ x:W, y:550, w:40, h:40 }); }
  function reset(){ score = 0; obstacles = []; player.y = 500; player.vy = 0; running = true; }

  function update(){
    if(!running) return;
    frame++;
    if(frame % 100 === 0) spawn();
    player.vy += gravity;
    player.y += player.vy;
    if(player.y + player.h > 550){ player.y = 550 - player.h; player.vy = 0; }
    for(let i=0;i<obstacles.length;i++){
      const o = obstacles[i];
      o.x -= 4;
      if(o.x < -50){ obstacles.splice(i,1); i--; score++; }
      if(player.x < o.x + o.w && player.x + player.w > o.x &&
         player.y < o.y + o.h && player.y + player.h > o.y){ running = false; }
    }
  }

  function draw(){
    ctx.fillStyle = "#8fd1ff";
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle = "#6bb06f";
    ctx.fillRect(0,550, W, 200);
    ctx.fillStyle = "yellow";
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = "#333";
    for(let o of obstacles) ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.fillStyle = "white";
    ctx.font = "22px Arial";
    ctx.fillText("Score: " + Math.floor(score), 10, 30);
    if(!running){ ctx.fillText("Tap to Start", W/2 - 60, H/2); }
  }

  function loop(){ update(); draw(); requestAnimationFrame(loop); }

  window.addEventListener("mousedown",()=>{
    if(!running){ reset(); return; }
    player.vy = -10;
  });

  loop();
})();
