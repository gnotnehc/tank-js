//UTF-8
var key = {};

var num = new Num();
var stageStart = new StageStart();
var gamesOver = new GameOver();
var gameStart = new GameStart();
var food = new Food();
var tankRun = new TankRun();

var scoreBoard = new ScoreBoard();
var sound = new Sound();
var firstLife = 3;

var time;
var tankNum = 0;
var level = 1;

var playerNum = 1;


var stopTime;
var homeTime;

var startLocation = [192, 0, 384];

var tanks = [];
var bullets = [];
var hitFxs = [];
var bombFxs = [];
var tankStarts = [];
var scoreNums = [];

var player1, player2;

var gameState = STATE_GAMESTART;

var intval = 300;
var nextIntval = 300;

function main () {
  // 调整音乐声音大小
  var audio = document.getElementsByTagName('audio')
  for (var i = 0; i < audio.length; i++) {
    audio[i].volume = 0.3
  }

  setInterval("loop()", 21);
}



function loop () {
  switch (gameState) {
    case STATE_PLAY:
      draw();
      updata();
      break;

    case STATE_INIT:
      initGame();
      break;

    case STATE_STAGE_INIT:
      stageStart.draw("stage");
      break;

    case STATE_GAMEOVER:
      draw();
      updata();
      gameOver();
      break;

    case STATE_SELECT:
      tankRun.draw();
      break;

    case STATE_GAMESTART:
      gameStart.draw();
      break;
  }
}


document.onkeydown = function (e) {
  console.log(e.keyCode)
  console.log(gameState)
  console.log(STATE_PLAY)
  e.preventDefault();
  key[e.keyCode] = true;

  if (e.keyCode == K_9 && (gameState == STATE_SELECT)) {
    firstLife = 9;
    console.log('执行了')
  }
  if (e.keyCode == K_2 && (gameState == STATE_PLAY || gameState == STATE_STAGE_INIT)) nextStage();
  if (e.keyCode == K_1 && (gameState == STATE_PLAY)) food.init();
  if (e.keyCode == K_0 && (gameState == STATE_PLAY)) {
    if (nextIntval == 300) {
      nextIntval = 100;
      document.getElementById('fast-mode').innerHTML = "快速出兵模式开启";
    }
    else {
      nextIntval = 300;
      document.getElementById('fast-mode').innerHTML = "";
    }
  }

  else if (e.keyCode == K_UP && gameState == STATE_SELECT) { tankRun.next(-1); }
  else if (e.keyCode == K_DOWN && gameState == STATE_SELECT) { tankRun.next(1); }

  if ((e.keyCode == K_SPACE || e.keyCode == K_ENTER) && gameState == STATE_SELECT) {
    if (tankRun.num == 0) { playerNum = 1; }
    else if (tankRun.num == 1) { playerNum = 2; }
    else {
      return;
    }

    gameState = STATE_INIT;
    tankRun.init();
    clear("upp");
  }
}

function gameOver () {
  gamesOver.draw();
}

function init () {
  selectMap(level);
  drawAll();
}

function initMyTank (num) {
  if (num == 1 && player1.live > 0) {
    player1.x = 129;
    player1.y = 385;
    player1.dir = UP;
    player1.godTime = 300;
    player1.isGod = true;
  }
  else if (num == 2 && player2.live > 0) {
    player2.x = 256;
    player2.y = 385;
    player2.dir = UP;
    player2.godTime = 300;
    player2.isGod = true;
  }
}

function initGame () {
  player1 = null;
  player2 = null;
  tanks = [];
  key = {};

  addTank(129, 385, 0, 1);
  player1 = tanks[0];

  if (playerNum == 2) {
    addTank(256, 385, 0, 2);
    player2 = tanks[1];
  }

  for (var i = 0; i < playerNum; i++) {
    tanks[i].live = firstLife;
    tanks[i].score = 0;
  }

  level = 1;
  initStage();

}

function initStage () {
  time = -20;

  tankNum = 0;
  stopTime = 0;
  homeTime = 0;

  clearStage();
  food.type = foodNon;
  for (var i = 0; i < playerNum; i++) {
    initMyTank(tanks[i].name);
  }

  stageStart.init();
  gameState = STATE_STAGE_INIT;
}

function clearStage () {
  tankStarts = [];
  bullets = [];
  tanksBomb(false);
  hitFxs = [];
  bombFxs = [];
}

function addTank (x, y, type, name) {
  var tank;
  switch (type) {
    case 0: tank = new MyTank(x, y);
      break;
    case 1: tank = new Tank1(x, y);
      break;
    case 2: tank = new Tank2(x, y);
      break;
    case 3: tank = new Tank3(x, y);
      break;
  }
  if (tank.type == 0) { tank.name = name; }
  tanks.push(tank);
}

function addTankStart (x, y) {
  var tankStart = new TankStart(x, y);

  tankStarts.push(tankStart);

  tankNum++;
  scoreBoard.drawTankNum();
}

function addTanks () {
  var i;
  time++;
  if (time % intval == 1) {
    i = parseInt(time / intval);

    if (tanks.length < 5 && tankNum < 20) {
      if (tankNum % 4 == 2) food.init();
      addTankStart(startLocation[i], 0);
    }
  }
  if (i == 2) {
    intval = nextIntval;
    time = -intval + 1;
  }
}

function drawAll () {
  drawMap();
  drawGrass();
}

function clear (whichCanvas) {
  var myCanvas = document.getElementById(whichCanvas);
  var graphics = myCanvas.getContext("2d");

  graphics.clearRect(0, 0, 512, 448);
}



document.onkeyup = function (e) {
  key[e.keyCode] = false;
}

function keyboardEvent () {

  for (var i = 0; i < playerNum; i++) {
    if (tanks[i].live == 0) { continue; }

    if (tanks[i].name == 1) {
      if (key[K_UP]) { player1.move(UP); }
      else if (key[K_DOWN]) { player1.move(DOWN); }
      else if (key[K_LEFT]) { player1.move(LEFT); }
      else if (key[K_RIGHT]) { player1.move(RIGHT); }
      if (key[K_SPACE || K_ENTER]) { player1.shot(); }
    }

    else if (tanks[i].name == 2) {
      if (key[K_W]) { player2.move(UP); }
      else if (key[K_S]) { player2.move(DOWN); }
      else if (key[K_A]) { player2.move(LEFT); }
      else if (key[K_D]) { player2.move(RIGHT); }

      if (key[K_J]) { player2.shot(); }
    }
  }
}

function updata () {
  updataHitFxs();
  updataBombFxs();
  updataBullets();
  updataTanks();
  updataTankStarts();
  updataFood();
  addTanks();

  keyboardEvent();
}



function draw () {
  clear("main");
  drawHitFxs();
  drawBombFxs();
  drawTanks();
  drawBullets();
  drawTankStarts();
  drawFood();
  drawScoreNums();
}




function tanksBomb (isBomb) {
  while (tanks.length > playerNum) {
    var xx = tanks[playerNum].x;
    var yy = tanks[playerNum].y;

    if (isBomb) {
      var bombFx = new BombFx(xx, yy, tanks[playerNum].score);
      bombFxs.push(bombFx);
      sound.play("bomb1");
    }
    tanks.splice(playerNum, 1);
  }
}

function changeHome (god) {
  var wallType;
  if (god) {
    wallType = GRID;
    homeTime = 1000;
  }

  else {
    wallType = WALL;
  }
  map[23][11] = map[23][12] = map[23][13] =
    map[23][14] = map[24][11] = map[24][14] =
    map[25][11] = map[25][14] = wallType;

  drawMap();
}

function nextStage () {
  level++;
  initStage();
}




