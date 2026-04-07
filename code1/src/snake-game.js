export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const DEFAULT_BOARD = { columns: 16, rows: 16 };
const DEFAULT_DIRECTION = "RIGHT";

export function createInitialState(options = {}) {
  const columns = options.columns ?? DEFAULT_BOARD.columns;
  const rows = options.rows ?? DEFAULT_BOARD.rows;
  const rng = options.rng ?? Math.random;
  const originX = Math.floor(columns / 2);
  const originY = Math.floor(rows / 2);
  const snake = [
    { x: originX, y: originY },
    { x: originX - 1, y: originY },
    { x: originX - 2, y: originY },
  ];

  return {
    columns,
    rows,
    snake,
    direction: DEFAULT_DIRECTION,
    nextDirection: DEFAULT_DIRECTION,
    food: placeFood({ columns, rows, snake }, rng),
    score: 0,
    bestScore: 0,
    paused: false,
    gameOver: false,
  };
}

export function restartGame(state, options = {}) {
  const nextState = createInitialState({
    columns: state.columns,
    rows: state.rows,
    rng: options.rng,
  });

  return {
    ...nextState,
    bestScore: Math.max(state.bestScore, state.score, nextState.bestScore),
  };
}

export function setDirection(state, requestedDirection) {
  if (!DIRECTIONS[requestedDirection] || state.gameOver) {
    return state;
  }

  const blockedReverse = areOpposite(state.direction, requestedDirection);
  if (blockedReverse && state.snake.length > 1) {
    return state;
  }

  return {
    ...state,
    nextDirection: requestedDirection,
  };
}

export function togglePause(state) {
  if (state.gameOver) {
    return state;
  }

  return {
    ...state,
    paused: !state.paused,
  };
}

export function stepGame(state, options = {}) {
  if (state.paused || state.gameOver) {
    return state;
  }

  const rng = options.rng ?? Math.random;
  const activeDirection = state.nextDirection;
  const vector = DIRECTIONS[activeDirection];
  const currentHead = state.snake[0];
  const nextHead = {
    x: currentHead.x + vector.x,
    y: currentHead.y + vector.y,
  };

  if (hitsBoundary(nextHead, state.columns, state.rows)) {
    return {
      ...state,
      direction: activeDirection,
      gameOver: true,
      bestScore: Math.max(state.bestScore, state.score),
    };
  }

  const ateFood = positionsEqual(nextHead, state.food);
  const bodyToCheck = ateFood ? state.snake : state.snake.slice(0, -1);
  if (bodyToCheck.some((segment) => positionsEqual(segment, nextHead))) {
    return {
      ...state,
      direction: activeDirection,
      gameOver: true,
      bestScore: Math.max(state.bestScore, state.score),
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!ateFood) {
    nextSnake.pop();
  }

  const nextScore = ateFood ? state.score + 1 : state.score;
  const nextFood = ateFood
    ? placeFood({ columns: state.columns, rows: state.rows, snake: nextSnake }, rng)
    : state.food;

  return {
    ...state,
    snake: nextSnake,
    direction: activeDirection,
    food: nextFood,
    score: nextScore,
    bestScore: Math.max(state.bestScore, nextScore),
  };
}

export function placeFood(board, rng = Math.random) {
  const openCells = [];

  for (let y = 0; y < board.rows; y += 1) {
    for (let x = 0; x < board.columns; x += 1) {
      const occupied = board.snake.some((segment) => segment.x === x && segment.y === y);
      if (!occupied) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return null;
  }

  const index = Math.min(openCells.length - 1, Math.floor(rng() * openCells.length));
  return openCells[index];
}

function hitsBoundary(position, columns, rows) {
  return position.x < 0 || position.y < 0 || position.x >= columns || position.y >= rows;
}

function areOpposite(first, second) {
  return (
    (first === "UP" && second === "DOWN") ||
    (first === "DOWN" && second === "UP") ||
    (first === "LEFT" && second === "RIGHT") ||
    (first === "RIGHT" && second === "LEFT")
  );
}

function positionsEqual(first, second) {
  if (!first || !second) {
    return false;
  }

  return first.x === second.x && first.y === second.y;
}
