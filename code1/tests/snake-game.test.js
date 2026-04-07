import test from "node:test";
import assert from "node:assert/strict";

import {
  createInitialState,
  placeFood,
  setDirection,
  stepGame,
  togglePause,
} from "../src/snake-game.js";

test("moves the snake one cell in the active direction", () => {
  const state = createInitialState({
    columns: 8,
    rows: 8,
    rng: () => 0,
  });

  const nextState = stepGame(state);

  assert.deepEqual(nextState.snake[0], { x: 5, y: 4 });
  assert.deepEqual(nextState.snake[1], { x: 4, y: 4 });
  assert.equal(nextState.score, 0);
});

test("grows the snake and increments the score when food is eaten", () => {
  const state = {
    columns: 6,
    rows: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    direction: "RIGHT",
    nextDirection: "RIGHT",
    food: { x: 3, y: 2 },
    score: 0,
    bestScore: 0,
    paused: false,
    gameOver: false,
  };

  const nextState = stepGame(state, { rng: () => 0 });

  assert.equal(nextState.snake.length, 4);
  assert.deepEqual(nextState.snake[0], { x: 3, y: 2 });
  assert.equal(nextState.score, 1);
  assert.notDeepEqual(nextState.food, { x: 3, y: 2 });
});

test("marks the game over when the snake hits a wall", () => {
  const state = {
    columns: 4,
    rows: 4,
    snake: [
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 1 },
    ],
    direction: "RIGHT",
    nextDirection: "RIGHT",
    food: { x: 0, y: 0 },
    score: 2,
    bestScore: 1,
    paused: false,
    gameOver: false,
  };

  const nextState = stepGame(state);

  assert.equal(nextState.gameOver, true);
  assert.equal(nextState.bestScore, 2);
});

test("marks the game over when the snake hits its own body", () => {
  const state = {
    columns: 5,
    rows: 5,
    snake: [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
      { x: 1, y: 2 },
    ],
    direction: "LEFT",
    nextDirection: "LEFT",
    food: { x: 4, y: 4 },
    score: 0,
    bestScore: 0,
    paused: false,
    gameOver: false,
  };

  const nextState = stepGame(state);

  assert.equal(nextState.gameOver, true);
});

test("food placement only selects open cells", () => {
  const food = placeFood(
    {
      columns: 2,
      rows: 2,
      snake: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ],
    },
    () => 0,
  );

  assert.deepEqual(food, { x: 1, y: 0 });
});

test("cannot reverse directly into the opposite direction", () => {
  const state = createInitialState();

  const nextState = setDirection(state, "LEFT");

  assert.equal(nextState.nextDirection, "RIGHT");
});

test("pause prevents the game from advancing", () => {
  const state = togglePause(createInitialState());
  const nextState = stepGame(state);

  assert.deepEqual(nextState, state);
});
