// ===== INIT =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
resizeCanvas();

const scoreDisplay = document.getElementById("score");
let score = 0;

// ===== AUDIO =====
const jumpSound = new Audio("jump.wav");
const pointSound = new Audio("point.wav");
const jingle = new Audio("jingle.mp3");
jingle.loop = true;
jingle.volume = 0.5;

// ===== CHARACTER =====
let selectedCharacter = null;
const characterImages = [
  new Image(), new Image(), new Image(), new Image()
];
characterImages[0].src = "char1.png";
characterImages[1].src = "char2.png";
characterImages[2].src = "char3.png";
characterImages[3].src = "char4.png";

// ===== PLAYER =====
const player = { x:50, y:200, width:32, height:32, velocity:0 };
const gravity = 0.5;
const jumpForce = -8;

// ===== PIPES =====
let pipes = [];
const pipeWidth = 50;
const pipeGap = 120;
const pipeSpeed = 2;
const spawnInterval = 150;
let frameCount = 0;

// ===== EVENTS =====
document.getElementById("playButton").addEventListener("click", ()=>{
  showCharacterSelect();
  jingle.play().catch(e=>console.log("Autoplay dibatasi browser"));
});

document.querySelectorAll(".characters img").forEach(img=>{
  img.addEventListener("click", ()=>{
    selectedCharacter = parseInt(img.dataset.id);
    document.querySelectorAll(".characters img").forEach(i=>i.classList.remove("selected"));
    img.classList.add("selected");
  });
});

document.getElementById("startGameBtn").addEventListener("click", startGame);
document.getElementById("restartBtn").addEventListener("click", restartGame);
document.getElementById("menuBtn").addEventListener("click", goToMenu);

// ===== SHOW / HIDE =====
function showCharacterSelect(){
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("characterSelect").classList.remove("hidden");
}

function startGame(){
  if(selectedCharacter===null){
    alert("Pilih karakter dulu!");
    return;
  }
  document.getElementById("characterSelect").classList.add("hidden");
  canvas.classList.remove("hidden");
  document.getElementById("scoreBoard").classList.remove("hidden");
  score=0;
  player.y=canvas.height/2; player.velocity=0;
  pipes=[]; frameCount=0;
  requestAnimationFrame(gameLoop);
}

function restartGame(){
  document.getElementById("gameOverScreen").classList.add("hidden");
  startGame();
}

function goToMenu(){
  document.getElementById("gameOverScreen").classList.add("hidden");
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("scoreBoard").classList.add("hidden");
}

// ===== GAME LOOP =====
function gameLoop(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // GRAVITY
  player.velocity+=gravity;
  player.y+=player.velocity;

  // SPAWN PIPES
  frameCount++;
  if(frameCount%spawnInterval===0) spawnPipe();

  // UPDATE & DRAW PIPES
  for(let i=0;i<pipes.length;i++){
    pipes[i].x-=pipeSpeed;
    ctx.fillStyle="green";
    ctx.fillRect(pipes[i].x,0,pipeWidth,pipes[i].top);
    ctx.fillRect(pipes[i].x,pipes[i].bottom,pipeWidth,canvas.height-pipes[i].bottom);

    if(player.x<pipes[i].x+pipeWidth &&
       player.x+player.width>pipes[i].x &&
       (player.y<pipes[i].top || player.y+player.height>pipes[i].bottom)){
      gameOver();
      return;
    }

    if(!pipes[i].passed && player.x>pipes[i].x+pipeWidth){
      score++; pipes[i].passed=true;
      scoreDisplay.textContent=score;
      pointSound.play();
    }
  }

  pipes=pipes.filter(p=>p.x+pipeWidth>0);

  // DRAW PLAYER
  ctx.drawImage(characterImages[selectedCharacter],player.x,player.y,player.width,player.height);

  // CEK FLOOR & ATAS
  if(player.y+player.height>=canvas.height || player.y<0){
    gameOver();
    return;
  }

  requestAnimationFrame(gameLoop);
}

function spawnPipe(){
  const topHeight=Math.random()*(canvas.height-pipeGap-50)+20;
  const bottomY=topHeight+pipeGap;
  pipes.push({x:canvas.width,top:topHeight,bottom:bottomY,passed:false});
}

// ===== CONTROL =====
function jump(){
  player.velocity=jumpForce;
  jumpSound.play();
}

document.addEventListener("click", jump);
document.addEventListener("touchstart",(e)=>{
  e.preventDefault();
  jump();
},{passive:false});

// ===== GAME OVER =====
function gameOver(){
  jingle.pause();
  document.getElementById("gameOverScreen").classList.remove("hidden");
  document.getElementById("finalScore").textContent=score;
  canvas.classList.add("hidden");
}

// ===== RESPONSIVE CANVAS =====
function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
