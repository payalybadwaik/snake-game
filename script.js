(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const scoreBoard = document.getElementById('scoreboard');
  const messageBox = document.getElementById('message');
  const startButton = document.getElementById('startButton');

  // Direction buttons
  const btnUp = document.getElementById('btn-up');
  const btnDown = document.getElementById('btn-down');
  const btnLeft = document.getElementById('btn-left');
  const btnRight = document.getElementById('btn-right');

  // Settings
  let tileCount = 20; // Number of tiles on one edge
  let tileSize; // dynamically calculated based on canvas size
  let speed = 7; // updates per second

  // Game variables
  let snake = [];
  let velocity = {x:0, y:0};
  let food = {x:0, y:0};
  let score = 0;
  let gameOver = false;
  let gameRunning = false;

  // Responsive canvas sizing
  function resizeCanvas() {
    const container = document.getElementById('game-container');
    const size = Math.min(container.clientWidth, container.clientHeight);
    canvas.width = size;
    canvas.height = size;
    tileSize = size / tileCount;
  }

  // Initialize snake in center with length 3
  function initSnake() {
    const startX = Math.floor(tileCount / 2);
    const startY = Math.floor(tileCount / 2);
    snake = [
      {x: startX, y: startY},
      {x: startX -1, y: startY},
      {x: startX -2, y: startY}
    ];
    velocity = {x: 1, y: 0}; // start moving right
  }

  // Place food randomly on empty tile
  function placeFood() {
    let valid = false;
    while(!valid) {
      food.x = Math.floor(Math.random()*tileCount);
      food.y = Math.floor(Math.random()*tileCount);
      // Make sure food is not on the snake
      valid = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
  }

  // Draw the grid lines
  function drawGrid() {
    ctx.strokeStyle = '#2e7d3244'; // subtle green with transparency
    ctx.lineWidth = 1;

    for(let i=0; i<=tileCount; i++) {
      // vertical lines
      ctx.beginPath();
      ctx.moveTo(i * tileSize, 0);
      ctx.lineTo(i * tileSize, canvas.height);
      ctx.stroke();

      // horizontal lines
      ctx.beginPath();
      ctx.moveTo(0, i * tileSize);
      ctx.lineTo(canvas.width, i * tileSize);
      ctx.stroke();
    }
  }

  // Draw rounded rectangle helper
  function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  // Draw the snake with head eyes and rounded tail
  function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Draw grid behind snake and food
    drawGrid();

    // Draw snake body except head and tail
    ctx.fillStyle = '#4caf50';
    ctx.shadowColor = '#2e7d32';
    ctx.shadowBlur = 10;

    for(let i=1; i < snake.length -1; i++) {
      const segment = snake[i];
      ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize - 1, tileSize - 1);
    }

    // Draw tail with rounded corners
    if(snake.length > 1) {
      const tail = snake[snake.length -1];
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#388e3c'; // a darker green for tail
      drawRoundedRect(tail.x * tileSize, tail.y * tileSize, tileSize - 1, tileSize - 1, tileSize/3);
    }

    // Draw head with eyes
    const head = snake[0];
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#81c784'; // lighter green for head
    ctx.fillRect(head.x * tileSize, head.y * tileSize, tileSize - 1, tileSize - 1);

    // Draw eyes on the head depending on direction
    const eyeRadius = tileSize / 8;
    const eyeOffsetX = tileSize / 4;
    const eyeOffsetY = tileSize / 4;

    ctx.fillStyle = '#fff'; // eye white
    // Calculate eye positions based on velocity direction
    let eye1X, eye2X, eye1Y, eye2Y;
    if(velocity.x === 1) { // moving right
      eye1X = head.x * tileSize + tileSize - eyeOffsetX;
      eye2X = eye1X;
      eye1Y = head.y * tileSize + eyeOffsetY;
      eye2Y = head.y * tileSize + tileSize - eyeOffsetY;
    } else if(velocity.x === -1) { // moving left
      eye1X = head.x * tileSize + eyeOffsetX;
      eye2X = eye1X;
      eye1Y = head.y * tileSize + eyeOffsetY;
      eye2Y = head.y * tileSize + tileSize - eyeOffsetY;
    } else if(velocity.y === 1) { // moving down
      eye1X = head.x * tileSize + eyeOffsetX;
      eye2X = head.x * tileSize + tileSize - eyeOffsetX;
      eye1Y = head.y * tileSize + tileSize - eyeOffsetY;
      eye2Y = eye1Y;
    } else { // moving up (velocity.y === -1)
      eye1X = head.x * tileSize + eyeOffsetX;
      eye2X = head.x * tileSize + tileSize - eyeOffsetX;
      eye1Y = head.y * tileSize + eyeOffsetY;
      eye2Y = eye1Y;
    }
    // Draw white eyes
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeRadius, 0, Math.PI * 2);
    ctx.arc(eye2X, eye2Y, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw black pupils slightly offset depending on direction
    const pupilRadius = eyeRadius / 2;
    let pupilOffsetX = 0;
    let pupilOffsetY = 0;
    const pupilShift = eyeRadius / 2;
    if(velocity.x === 1) {
      pupilOffsetX = pupilShift;
    } else if(velocity.x === -1) {
      pupilOffsetX = -pupilShift;
    } else if(velocity.y === 1) {
      pupilOffsetY = pupilShift;
    } else if(velocity.y === -1) {
      pupilOffsetY = -pupilShift;
    }
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(eye1X + pupilOffsetX, eye1Y + pupilOffsetY, pupilRadius, 0, Math.PI * 2);
    ctx.arc(eye2X + pupilOffsetX, eye2Y + pupilOffsetY, pupilRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Draw food
    ctx.fillStyle = '#ff5252';
    ctx.shadowColor = '#b71c1c';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    const centerX = food.x * tileSize + tileSize/2;
    const centerY = food.y * tileSize + tileSize/2;
    const radius = tileSize / 2.5;
    ctx.arc(centerX, centerY, radius, 0, 2*Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Game logic update
  function update() {
    if(gameOver) return;

    // Move snake by adding new head
    const newHead = {
      x: snake[0].x + velocity.x,
      y: snake[0].y + velocity.y
    };

    // Check collision with walls
    if(newHead.x < 0 || newHead.x >= tileCount || newHead.y < 0 || newHead.y >= tileCount) {
      endGame();
      return;
    }

    // Check collision with itself
    if(snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      endGame();
      return;
    }

    snake.unshift(newHead);

    // Check if food eaten
    if(newHead.x === food.x && newHead.y === food.y) {
      score++;
      scoreBoard.textContent = `Score: ${score}`;
      placeFood();
    } else {
      // Remove tail
      snake.pop();
    }
  }

  // Game loop controller
  let lastRenderTime = 0;

  function gameLoop(currentTime) {
    if(!gameRunning) return;

    window.requestAnimationFrame(gameLoop);
    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if(secondsSinceLastRender < 1 / speed) return;

    lastRenderTime = currentTime;

    update();
    draw();
  }

  // Handle keyboard input
  window.addEventListener('keydown', e => {
    if(!gameRunning) return;

    switch(e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if(velocity.y === 1) break; // prevent reverse
        velocity = {x:0, y:-1};
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if(velocity.y === -1) break;
        velocity = {x:0, y:1};
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if(velocity.x === 1) break;
        velocity = {x:-1, y:0};
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if(velocity.x === -1) break;
        velocity = {x:1, y:0};
        break;
    }
  });

  // Touch controls for mobile: swipe detection
  let touchStartX = 0;
  let touchStartY = 0;

  canvas.addEventListener('touchstart', e => {
    if(!gameRunning) return;
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    if(!gameRunning) return;
    if(!touchStartX || !touchStartY) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if(Math.abs(deltaX) > Math.abs(deltaY)) {
      if(deltaX > 20 && velocity.x !== -1) {
        velocity = {x: 1, y: 0};
        touchStartX = 0;
        touchStartY = 0;
      } else if(deltaX < -20 && velocity.x !== 1) {
        velocity = {x: -1, y: 0};
        touchStartX = 0;
        touchStartY = 0;
      }
    } else {
      if(deltaY > 20 && velocity.y !== -1) {
        velocity = {x: 0, y: 1};
        touchStartX = 0;
        touchStartY = 0;
      } else if(deltaY < -20 && velocity.y !== 1) {
        velocity = {x: 0, y: -1};
        touchStartX = 0;
        touchStartY = 0;
      }
    }
    e.preventDefault();
  }, { passive: false });

  // Direction buttons click handlers
  btnUp.addEventListener('click', () => {
    if(!gameRunning) return;
    if(velocity.y === 1) return; // prevent reverse
    velocity = {x:0, y:-1};
  });
  btnDown.addEventListener('click', () => {
    if(!gameRunning) return;
    if(velocity.y === -1) return;
    velocity = {x:0, y:1};
  });
  btnLeft.addEventListener('click', () => {
    if(!gameRunning) return;
    if(velocity.x === 1) return;
    velocity = {x:-1, y:0};
  });
  btnRight.addEventListener('click', () => {
    if(!gameRunning) return;
    if(velocity.x === -1) return;
    velocity = {x:1, y:0};
  });

  // End game
  function endGame() {
    gameOver = true;
    gameRunning = false;
    messageBox.textContent = 'Game Over! Press Start to play again.';
    startButton.textContent = 'Restart Game';
  }

  // Start or restart game
  function startGame() {
    resizeCanvas();
    initSnake();
    placeFood();
    score = 0;
    scoreBoard.textContent = 'Score: 0';
    messageBox.textContent = '';
    gameOver = false;
    gameRunning = true;
    lastRenderTime = 0;
    velocity = {x:1, y:0};
    startButton.textContent = 'Restart Game';
    window.requestAnimationFrame(gameLoop);
  }

  // Handle window resize
  window.addEventListener('resize', () => {
    resizeCanvas();
    draw();
  });

  // Start button click
  startButton.addEventListener('click', () => {
    if(!gameRunning) {
      startGame();
    }
  });

  // Initial setup
  resizeCanvas();
  draw();
  messageBox.textContent = 'Press Start to begin the game!';
})();
