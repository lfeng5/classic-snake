import {
  createInitialState,
  restartGame,
  setDirection,
  stepGame,
  togglePause,
} from "./snake-game.js";

const TICK_MS = 140;
const STORAGE_KEY = "classic-snake-best-score";
const boardElement = document.querySelector("#game-board");
const scoreElement = document.querySelector("#score");
const bestScoreElement = document.querySelector("#best-score");
const statusElement = document.querySelector("#status");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");
const controlButtons = Array.from(document.querySelectorAll("[data-direction]"));

let state = withStoredBestScore(createInitialState());
let cells = [];

buildBoard(state.columns, state.rows);
render();

const tickHandle = window.setInterval(() => {
  const nextState = stepGame(state);
  if (nextState !== state) {
    state = nextState;
    render();
  }
}, TICK_MS);

document.addEventListener("keydown", (event) => {
  const direction = mapKeyToDirection(event.key);

  if (direction) {
    event.preventDefault();
    state = setDirection(state, direction);
    render();
    return;
  }

  if (event.key === " " || event.key.toLowerCase() === "p") {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  if (event.key.toLowerCase() === "r") {
    event.preventDefault();
    state = withStoredBestScore(restartGame(state));
    render();
  }
});

pauseButton.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

restartButton.addEventListener("click", () => {
  state = withStoredBestScore(restartGame(state));
  render();
});

controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.direction;
    state = setDirection(state, direction);
    render();
  });
});

window.addEventListener("beforeunload", () => {
  window.clearInterval(tickHandle);
});

function render() {
  const snakeLookup = new Map(state.snake.map((segment, index) => [`${segment.x},${segment.y}`, index]));

  cells.forEach((cell) => {
    cell.className = "cell";
    const key = `${cell.dataset.x},${cell.dataset.y}`;
    const segmentIndex = snakeLookup.get(key);

    if (segmentIndex !== undefined) {
      cell.classList.add("cell-snake");
      if (segmentIndex === 0) {
        cell.classList.add("cell-head");
      }
    }

    if (state.food && state.food.x === Number(cell.dataset.x) && state.food.y === Number(cell.dataset.y)) {
      cell.classList.add("cell-food");
    }
  });

  scoreElement.textContent = String(state.score);
  bestScoreElement.textContent = String(state.bestScore);
  pauseButton.textContent = state.paused ? "Resume" : "Pause";
  statusElement.textContent = getStatusMessage(state);
  persistBestScore(state.bestScore);
}

function buildBoard(columns, rows) {
  const fragment = document.createDocumentFragment();

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.x = String(x);
      cell.dataset.y = String(y);
      cell.setAttribute("role", "gridcell");
      fragment.appendChild(cell);
      cells.push(cell);
    }
  }

  boardElement.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  boardElement.replaceChildren(fragment);
}

function mapKeyToDirection(key) {
  const normalized = key.toLowerCase();
  const mapping = {
    arrowup: "UP",
    w: "UP",
    arrowdown: "DOWN",
    s: "DOWN",
    arrowleft: "LEFT",
    a: "LEFT",
    arrowright: "RIGHT",
    d: "RIGHT",
  };

  return mapping[normalized] ?? null;
}

function getStatusMessage(currentState) {
  if (currentState.gameOver) {
    return "Game over. Press Restart or R to play again.";
  }

  if (currentState.paused) {
    return "Paused. Press Pause, P, or Space to continue.";
  }

  return "Use arrow keys or WASD to move. Press P or Space to pause.";
}

function withStoredBestScore(nextState) {
  const storedBest = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
  return {
    ...nextState,
    bestScore: Math.max(nextState.bestScore, storedBest),
  };
}

function persistBestScore(bestScore) {
  window.localStorage.setItem(STORAGE_KEY, String(bestScore));
}
