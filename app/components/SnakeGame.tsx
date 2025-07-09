
'use client';

import React, { useState, useEffect, useCallback } from 'react';

const BOARD_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 5, y: 5 };
const INITIAL_DIRECTION = { x: 0, y: 1 }; // Start moving right
const GAME_SPEED = 150; // Milliseconds

type Coordinates = {
  x: number;
  y: number;
};

type Direction = {
  x: number;
  y: number;
};

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Coordinates[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Coordinates>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const generateFood = useCallback(() => {
    let newFood: Coordinates;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  }, [snake]);

  const checkCollision = useCallback((head: Coordinates) => {
    // Wall collision
    if (
      head.x < 0 ||
      head.x >= BOARD_SIZE ||
      head.y < 0 ||
      head.y >= BOARD_SIZE
    ) {
      return true;
    }
    // Self-collision
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }
    return false;
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (!gameStarted || gameOver) return;

    const newSnake = [...snake];
    const head = { x: newSnake[0].x + direction.x, y: newSnake[0].y + direction.y };

    if (checkCollision(head)) {
      setGameOver(true);
      return;
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      setScore(prevScore => prevScore + 1);
      generateFood();
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, gameStarted, gameOver, checkCollision, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted && e.key === 'Enter') {
        startGame();
        return;
      }
      if (gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver, gameStarted]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const gameInterval = setInterval(moveSnake, GAME_SPEED);
      return () => clearInterval(gameInterval);
    }
  }, [gameStarted, gameOver, moveSnake]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-5xl font-extrabold mb-8 text-green-400 drop-shadow-lg">
        Snake Game
      </h1>
      <div className="mb-4 text-2xl font-semibold">Score: {score}</div>

      {!gameStarted && (
        <button
          onClick={startGame}
          className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-2xl font-bold rounded-lg shadow-lg transform transition duration-300 hover:scale-105 mb-8"
        >
          Start Game (Press Enter)
        </button>
      )}

      {gameOver && (
        <div className="text-red-500 text-3xl font-bold mb-4 animate-bounce">
          Game Over!
          <button
            onClick={startGame}
            className="ml-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-lg shadow-lg transform transition duration-300 hover:scale-105"
          >
            Play Again
          </button>
        </div>
      )}

      <div
        className="grid border-4 border-green-500 rounded-lg shadow-2xl"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
          width: `${BOARD_SIZE * 25}px`, // Each cell 25px
          height: `${BOARD_SIZE * 25}px`,
          backgroundColor: '#1a202c', // Dark background for the board
        }}
      >
        {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
          const x = index % BOARD_SIZE;
          const y = Math.floor(index / BOARD_SIZE);
          const isSnake = snake.some(segment => segment.x === x && segment.y === y);
          const isFood = food.x === x && food.y === y;

          return (
            <div
              key={index}
              className={`
                w-full h-full
                ${isSnake ? 'bg-green-400 rounded-sm shadow-md' : ''}
                ${isFood ? 'bg-red-500 rounded-full animate-pulse' : ''}
                ${!isSnake && !isFood ? 'bg-gray-800' : ''}
              `}
              style={{
                boxShadow: isSnake ? '0 0 8px rgba(74, 222, 128, 0.7)' : isFood ? '0 0 10px rgba(239, 68, 68, 0.9)' : 'none',
                transition: 'background-color 0.1s ease-in-out, box-shadow 0.1s ease-in-out',
              }}
            ></div>
          );
        })}
      </div>
      <p className="mt-8 text-gray-400 text-lg">Use Arrow Keys to Move</p>
    </div>
  );
};

export default SnakeGame;
