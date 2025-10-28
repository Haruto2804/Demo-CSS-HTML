const raceBtnElement = document.querySelector('.race-button');
const playerElement = document.querySelector('.player');
const enemy1 = document.querySelector('.enemy1');
const enemy2 = document.querySelector('.enemy2');

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  // Số ngẫu nhiên từ 1 đến 15: Có thể nhanh hoặc chậm
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function moveOpponent(enemy, currentPosition) {
  if (gameWon) {
    return;
  }
  const randomStep = getRandomInt(10, 30);
  currentPosition += randomStep;
  enemy.style.transform = `translateX(${currentPosition}px)`;
  if (10 + currentPosition + enemy.clientWidth >= trackWidth - 20) {
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

function begin() {
  let raceInterval = setInterval(() => {
    if (gameWon) {
      return;
    }
    enemy1Position = moveOpponent(enemy1, enemy1Position);
    enemy2Position = moveOpponent(enemy2, enemy2Position);

  }, 100)
}







let gameStarted = false
const finishLineElement = document.querySelector('.finish-line');
const raceTrackElement = document.querySelector('.race-track');
const message = document.querySelector('.message')
const playerWidth = playerElement.clientWidth;
const trackWidth = raceTrackElement.clientWidth;
let gameWon = false;
let currentPosition = 0;

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
    const randomStep = getRandomInt(10, 40);
    currentPosition += randomStep;
    playerElement.style.transform = `translateX(${currentPosition}px)`;

    if (10 + currentPosition + playerWidth >= trackWidth - 20) {
      message.textContent = "BẠN ĐÃ THẮNG";
      raceBtnElement.classList.add('disable');
      gameWon = true;
      const targetPosition = (trackWidth - 20) - playerWidth - 10;
      currentPosition = targetPosition;
      clearInterval(raceInterval);
    }
  }
})
raceBtnElement.addEventListener('click', (e) => {
  
    if (!gameStarted) {
      begin();
      gameStarted = true;
    }
    const clickedBtn = e.currentTarget;
    if (gameWon) {
      return;
    }
    const randomStep = getRandomInt(10, 40);
    currentPosition += randomStep;
    playerElement.style.transform = `translateX(${currentPosition}px)`;

    if (10 + currentPosition + playerWidth >= trackWidth - 20) {
      message.textContent = "BẠN ĐÃ THẮNG";
      raceBtnElement.classList.add('disable');
      gameWon = true;
      const targetPosition = (trackWidth - 20) - playerWidth - 10;
      currentPosition = targetPosition;
      clearInterval(raceInterval);
    }
})

