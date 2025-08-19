const gameArea = document.getElementById('gameArea');
const sword = document.getElementById('sword');
const scoreDisplay = document.getElementById('score');
const sliceSound = document.getElementById('sliceSound');
const bombSound = document.getElementById('bombSound');

const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const soundToggle = document.getElementById('soundToggle');
const difficultySelect = document.getElementById('difficultySelect');
const backBtn = document.getElementById('backBtn');

let score = 0;
let gameOver = false;
let paused = false;
let spawnInterval;
let difficulty = "easy";
let missedFruits = 0; // Track uncut fruits

// --- Sword Setup ---
sword.style.width = "10vw"; 
sword.style.height = "10vw"; 
sword.style.backgroundImage = "url('assets/images/sword.png')";
sword.style.backgroundSize = "contain";
sword.style.backgroundRepeat = "no-repeat";
sword.style.position = "absolute";
sword.style.pointerEvents = "none"; 
document.body.style.cursor = "none"; // Hide normal cursor

// Sword follows mouse
document.addEventListener('mousemove', e => {
  sword.style.left = e.pageX - sword.offsetWidth/2 + 'px';
  sword.style.top = e.pageY - sword.offsetHeight/2 + 'px';
});

// Sword follows touch for mobile
document.addEventListener('touchmove', e => {
  if (e.touches.length > 0) {
    let touch = e.touches[0];
    sword.style.left = touch.pageX - sword.offsetWidth/2 + 'px';
    sword.style.top = touch.pageY - sword.offsetHeight/2 + 'px';
  }
});

// Fruit and bomb images
const fruits = [
  'assets/fruits/apple.png',
  'assets/fruits/banana.png',
  'assets/fruits/orange.png',
  'assets/fruits/watermelon.png'
];
const bombs = ['assets/bombs/bomb.png'];

// Difficulty settings
const difficultySettings = {
  easy: { bombChance: 0.1, speedMin: 2, speedMax: 4, gravity: 0.1, interval: 1200 },
  medium: { bombChance: 0.3, speedMin: 3, speedMax: 5, gravity: 0.15, interval: 900 },
  hard: { bombChance: 0.5, speedMin: 4, speedMax: 7, gravity: 0.2, interval: 600 }
};

// Start game
startBtn.addEventListener('click', () => {
  difficulty = difficultySelect.value;
  startScreen.classList.add('hidden');
  gameArea.classList.remove('hidden');
  backBtn.classList.remove('hidden');
  startGame();
});

pauseBtn.addEventListener('click', () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "▶️ Resume" : "⏸️ Pause";
});

backBtn.addEventListener('click', () => {
  endGame(true);
});

// Game logic
function startGame() {
  score = 0;
  gameOver = false;
  paused = false;
  missedFruits = 0; // Reset missed fruits
  scoreDisplay.textContent = "Score: " + score;

  // clear any old fruits/bombs left behind
  document.querySelectorAll('.fruit, .bomb').forEach(obj => obj.remove());

  const settings = difficultySettings[difficulty];
  spawnInterval = setInterval(createObject, settings.interval);
}

function createObject() {
  if (gameOver) return;

  const settings = difficultySettings[difficulty];
  let isBomb = Math.random() < settings.bombChance;

  const obj = document.createElement('div');
  obj.classList.add(isBomb ? 'bomb' : 'fruit');
  obj.style.backgroundImage = `url(${isBomb ? bombs[0] : fruits[Math.floor(Math.random() * fruits.length)]})`;
  obj.style.backgroundSize = "contain";
  obj.style.backgroundRepeat = "no-repeat";
  obj.style.width = "7vw";
  obj.style.height = "7vw";
  obj.style.position = "absolute";

  let startX = Math.random() * (window.innerWidth - obj.offsetWidth);
  let startY = -obj.offsetHeight; // Start from top
  let velocityX = (Math.random() - 0.5) * 6;
  let velocityY = settings.speedMin + Math.random() * (settings.speedMax - settings.speedMin);
  let gravity = settings.gravity;

  obj.style.left = startX + 'px';
  obj.style.top = startY + 'px';
  gameArea.appendChild(obj);

  function move() {
    if (!obj.parentElement || gameOver) return;

    // If paused, wait but keep loop alive
    if (paused) {
      requestAnimationFrame(move);
      return;
    }

    velocityY += gravity;
    startX += velocityX;
    startY += velocityY;

    obj.style.left = startX + 'px';
    obj.style.top = startY + 'px';

    // Collision detection
    let swordRect = sword.getBoundingClientRect();
    let objRect = obj.getBoundingClientRect();

    if (
      swordRect.left < objRect.right &&
      swordRect.right > objRect.left &&
      swordRect.top < objRect.bottom &&
      swordRect.bottom > objRect.top
    ) {
      if (isBomb) {
        if (soundToggle.checked) bombSound.play();
        setTimeout(() => {
          endGame();
        }, 800);
        obj.remove();
        return;
      } else {
        if (soundToggle.checked) sliceSound.play();
        score++;
        scoreDisplay.textContent = "Score: " + score;
        obj.remove();
        return;
      }
    }

    // Remove if out of screen
    if (
      startY > window.innerHeight + obj.offsetHeight ||
      startX < -obj.offsetWidth ||
      startX > window.innerWidth + obj.offsetWidth
    ) {
      if (!isBomb) {
        missedFruits++; // Count missed fruits
        if (missedFruits > 8) {
          endGame();
          return;
        }
      }
      obj.remove();
      return;
    }

    requestAnimationFrame(move);
  }

  requestAnimationFrame(move);
}

function endGame(backToMenu = false) {
  gameOver = true;
  clearInterval(spawnInterval);

  // Remove all fruits and bombs still on screen
  document.querySelectorAll('.fruit, .bomb').forEach(obj => obj.remove());

  if (!backToMenu) {
    alert("💥 Game Over! Final Score: " + score);
  }

  // Reset to start screen
  gameArea.classList.add('hidden');
  backBtn.classList.add('hidden');
  startScreen.classList.remove('hidden');
}
