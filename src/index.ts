import { SudokuSolver } from './sudoku';

const inputGrid = [
  [0, 0, 5, 0, 0, 0, 1, 7, 0],
  [0, 0, 0, 0, 0, 2, 0, 0, 4],
  [0, 0, 0, 5, 0, 8, 9, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 1, 0],
  [0, 0, 4, 0, 0, 3, 0, 0, 0],
  [9, 0, 0, 0, 0, 5, 0, 6, 0],
  [0, 0, 0, 7, 0, 0, 0, 0, 6],
  [0, 6, 2, 9, 0, 0, 0, 0, 0],
  [0, 4, 0, 0, 0, 0, 0, 0, 2],
];

// eslint-disable-line
console.clear();

const solver = new SudokuSolver(inputGrid, 9);
solver.solve();
