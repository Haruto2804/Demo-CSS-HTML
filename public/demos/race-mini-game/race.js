const raceBtnElement = document.querySelector('.race-button');
const playerElement = document.querySelector('.player');
const enemy1 = document.querySelector('.enemy1');
const enemy2 = document.querySelector('.enemy2');
const line1Element = document.querySelector('.center-line1');
const line2Element = document.querySelector('.center-line2');
const finishLineElement = document.querySelector('.finish-line');
const raceTrackElement = document.querySelector('.race-track');
const message = document.querySelector('.message')
const playerWidth = playerElement.clientWidth;
const trackWidth = raceTrackElement.clientWidth;
let currentPosition = 0;
let gameStarted = false
let gameWon = false;
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  // Số ngẫu nhiên từ 1 đến 15: Có thể nhanh hoặc chậm
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



function startRaceLine() {
  line1Element.classList.add('running');
  line2Element.classList.add('running');
}
function stopRaceLine() {
  line1Element.classList.remove('running');
  line2Element.classList.remove('running');
}
function moveOpponent(enemy, currentPosition) {
  if (gameWon) {
    return;
  }
  const randomStep = getRandomInt(10, 30);
  currentPosition += randomStep;
  enemy.style.transform = `translateX(${currentPosition}px)`;
  if (10 + currentPosition + enemy.clientWidth >= trackWidth - 20) {
    stopRaceLine();
    message.textContent = `BẠN ĐÃ THUA!`;
    raceBtnElement.classList.add('disable');
    message.style.color = 'red';
    gameWon = true;
    const newPosition = (trackWidth - 20) - enemy.clientWidth - 10;
    currentPosition = targetPosition;
    clearInterval(raceInterval);
  }
  return currentPosition;
}



let enemy1Position = 0;
let enemy2Position = 0;
let raceInterval;
function begin() {
   raceInterval = setInterval(() => {
    if (gameWon) {
      return;
    }
    enemy1Position = moveOpponent(enemy1, enemy1Position);
    enemy2Position = moveOpponent(enemy2, enemy2Position);

  }, 100)
}








raceBtnElement.addEventListener('keydown', (e) => {

  if (e.key == "d" || e.key == "D") {
    if (!gameStarted) {
      begin();
      gameStarted = true;
    }
    const clickedBtn = e.currentTarget;
    if (gameWon) {
      return;
    }
    startRaceLine();
    const randomStep = getRandomInt(10, 40);
    currentPosition += randomStep;
    playerElement.style.transform = `translateX(${currentPosition}px)`;

    if (10 + currentPosition + playerWidth >= trackWidth - 20) {
      stopRaceLine();
      message.textContent = "BẠN ĐÃ THẮNG";
      raceBtnElement.classList.add('disable');
      gameWon = true;
      const targetPosition = (trackWidth - 20) - playerWidth - 10;
      currentPosition = targetPosition;
      clearInterval(raceInterval);
    }
  }
})
raceBtnElement.addEventListener('keyup', (e) => {
    if (e.key == "d" || e.key == "D") {
        // Tắt animation ngay lập tức khi phím 'D' được nhả ra
        if (!gameWon) {
            stopRaceLine(); 
        }
    }
});

raceBtnElement.addEventListener('click', (e) => {
  if (!gameStarted) {
    begin();
    gameStarted = true;
  }
  const clickedBtn = e.currentTarget;
  if (gameWon) {
    return;
  }
  startRaceLine();

  const randomStep = getRandomInt(10, 40);
  currentPosition += randomStep;
  playerElement.style.transform = `translateX(${currentPosition}px)`;

  if (10 + currentPosition + playerWidth >= trackWidth - 20) {
    stopRaceLine();
    message.textContent = "BẠN ĐÃ THẮNG";
    raceBtnElement.classList.add('disable');
    gameWon = true;
    const targetPosition = (trackWidth - 20) - playerWidth - 10;
    currentPosition = targetPosition;
    clearInterval(raceInterval);
  }
})



