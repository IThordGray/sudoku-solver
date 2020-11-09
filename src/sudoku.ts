import { performance } from 'perf_hooks';
import { DLX } from './dlx';
import { ListNode } from './nodes';
import { getEmpty2DArray } from './utils';

export class SudokuSolver {
  private readonly _minValue: number = 1;
  private readonly _cover_matrix_start_index: number = 1;
  private readonly _constraints: number = 4;

  private _boxSize: number;
  private _emptyCell: number | string;
  private _size: number;
  private _maxValue: number;

  private _grid: number[][];
  private _gridSolved: number[][];

  constructor(
    grid: number[][],
    size: number,
    options?: { emptyCell?: number | string; boxSize?: number },
  ) {
    // Defaults
    this._size = this._maxValue = size;
    this._boxSize = options?.boxSize ?? Math.sqrt(size);
    this._emptyCell = options?.emptyCell ?? 0;
    this._gridSolved = getEmpty2DArray(this._size, this._size, null);
    this._grid = [...grid.map(x => [...x])];
  }

  private indexInCoverMatrix(
    row: number,
    column: number,
    value: number,
  ): number {
    return (
      (row - 1) * this._size * this._size +
      (column - 1) * this._size +
      (value - 1)
    );
  }

  private createCoverMatrix(): number[][] {
    const coverMatrix: number[][] = getEmpty2DArray(
      this._size * this._size * this._maxValue,
      this._size * this._size * this._constraints,
      0,
    );

    let header = 0;
    header = this.createCellConstraints(coverMatrix, header);
    header = this.createRowConstraints(coverMatrix, header);
    header = this.createColumnConstraints(coverMatrix, header);
    this.createBoxConstraints(coverMatrix, header);
    return coverMatrix;
  }

  /**
   * Create the box constraints in the map of:
   *
   * Grid cell  Value   Contstraint columns
   *
   *                    1  2 ... 10 11 ... 19 20 ... 81
   * ---------------------------------------------------
   * G[0][0]    1       1  0 ...  0  0 ...  0  0 ...  0
   * G[0][0]    2       0  1 ...  0  0 ...  0  0 ...  0
   *
   * G[0][1]    1       0  0 ...  1  0 ...  0  0 ...  0
   * G[0][1]    2       0  0 ...  0  1 ...  0  0 ...  0
   *
   * G[0][2]    1       0  0 ...  0  0 ...  1  0 ...  0
   * G[0][2]    2       0  0 ...  0  0 ...  0  1 ...  0
   *
   * G[1][0]    1       1  0 ...  0  0 ...  0  0 ...  0
   * G[1][0]    2       0  1 ...  0  0 ...  0  0 ...  0
   *
   */
  private createBoxConstraints(matrix: number[][], header: number): number {
    for (
      let row = this._cover_matrix_start_index;
      row <= this._size;
      row += this._boxSize
    ) {
      for (
        let column = this._cover_matrix_start_index;
        column <= this._size;
        column += this._boxSize
      ) {
        for (
          let value = this._cover_matrix_start_index;
          value <= this._size;
          value++, header++
        ) {
          for (let rowDelta = 0; rowDelta < this._boxSize; rowDelta++) {
            for (
              let columnDelta = 0;
              columnDelta < this._boxSize;
              columnDelta++
            ) {
              const idx = this.indexInCoverMatrix(
                row + rowDelta,
                column + columnDelta,
                value,
              );
              matrix[idx][header] = 1;
            }
          }
        }
      }
    }

    return header;
  }

  /**
   * Create the column constraints in the map of:
   *
   * Grid cell  Value   Contstraint columns
   *
   *                    1  2 ... 10 11 ... 19 20 ... 81
   * ---------------------------------------------------
   * G[0][0]    1       1  0 ...  0  0 ...  0  0 ...  0
   * G[0][0]    2       0  1 ...  0  0 ...  0  0 ...  0
   *
   * G[0][1]    1       0  0 ...  1  0 ...  0  0 ...  0
   * G[0][1]    2       0  0 ...  0  1 ...  0  0 ...  0
   *
   * G[1][0]    1       1  0 ...  0  0 ...  0  0 ...  0
   * G[1][0]    2       0  1 ...  0  0 ...  0  0 ...  0
   *
   */
  private createColumnConstraints(matrix: number[][], header: number): number {
    for (
      let column = this._cover_matrix_start_index;
      column <= this._size;
      column++
    ) {
      for (
        let value = this._cover_matrix_start_index;
        value <= this._size;
        value++, header++
      ) {
        for (
          let row = this._cover_matrix_start_index;
          row <= this._size;
          row++
        ) {
          const idx = this.indexInCoverMatrix(row, column, value);
          matrix[idx][header] = 1;
        }
      }
    }
    return header;
  }

  /**
   * Create the row constraints in the map of:
   *
   * Grid cell  Value   Contstraint columns
   *
   *                    1  2 ... 80 81
   * --------------------------------
   * G[0][0]    1       1  0 ...  0  0
   * G[0][0]    2       0  1 ...  0  0
   *
   * G[0][1]    1       1  0 ...  0  0
   * G[0][1]    2       0  1 ...  0  0
   *
   * G[8][8]    1       0  0 ...  1  0
   * G[8][8]    2       0  1 ...  0  1
   *
   */
  private createRowConstraints(matrix: number[][], header: number): number {
    for (let row = this._cover_matrix_start_index; row <= this._size; row++) {
      for (
        let n = this._cover_matrix_start_index;
        n <= this._size;
        n++, header++
      ) {
        for (
          let column = this._cover_matrix_start_index;
          column <= this._size;
          column++
        ) {
          const idx = this.indexInCoverMatrix(row, column, n);
          matrix[idx][header] = 1;
        }
      }
    }

    return header;
  }

  /**
   * Create the cells constraints in the map of:
   *
   * Grid cell  Value   Contstraint columns
   *
   *                    1  2 ... 81
   * -----------------------------
   * G[0][0]    1       1  0 ...  0
   *
   * G[0][1]    1       0  1 ...  0
   *
   * G[8][8]    9       0  0 ...  1
   *
   */
  private createCellConstraints(matrix: number[][], header: number): number {
    for (let row = this._cover_matrix_start_index; row <= this._size; row++) {
      for (
        let column = this._cover_matrix_start_index;
        column <= this._size;
        column++, header++
      ) {
        for (let n = this._cover_matrix_start_index; n <= this._size; n++) {
          const idx = this.indexInCoverMatrix(row, column, n);
          matrix[idx][header] = 1;
        }
      }
    }

    return header;
  }

  private convertToCoverMatrix(grid: number[][]): number[][] {
    const coverMatrix: number[][] = this.createCoverMatrix();

    for (let row = this._cover_matrix_start_index; row <= this._size; row++) {
      for (
        let column = this._cover_matrix_start_index;
        column <= this._size;
        column++
      ) {
        const existingValue = grid[row - 1][column - 1];

        if (existingValue !== this._emptyCell) {
          for (let num = this._minValue; num <= this._maxValue; num++) {
            if (num !== existingValue) {
              coverMatrix[this.indexInCoverMatrix(row, column, num)].fill(0);
            }
          }
        }
      }
    }

    return coverMatrix;
  }

  private convertDLXListToGrid(answer: ListNode[]): number[][] {
    const result: number[][] = getEmpty2DArray(this._size, this._size);

    answer?.forEach(node => {
      let rcNode = node;
      let min = Number(rcNode.columnNode.name);

      for (let tmp = node.right; tmp !== node; tmp = tmp.right) {
        const val = Number(tmp.columnNode.name);
        if (val < min) {
          min = val;
          rcNode = tmp;
        }
      }

      const ans1 = Number(rcNode.columnNode.name);
      const ans2 = Number(rcNode.right.columnNode.name);

      const r = Math.floor(ans1 / this._size);
      const c = ans1 % this._size;

      const num = (ans2 % this._size) + 1;
      result[r][c] = num;
    });

    return result;
  }

  private print(grid: number[][]): void {
    if (!grid?.length) return;

    let output = '';

    for (let i = 0; i < this._size; i++) {
      if (i % this._boxSize == 0)
        output +=
          Array(this._boxSize)
            .fill(
              '+' +
                Array(this._boxSize)
                  .fill('---')
                  .join(''),
            )
            .join('') + '+\n';

      for (let j = 0; j < this._size; j++) {
        if (j % this._boxSize == 0) output += '|';

        const el = grid[i][j] == 0 ? '.' : grid[i][j];
        output += ` ${el} `;

        if (j + 1 == this._size) output += '|';
      }

      if (i + 1 == this._size)
        output +=
          '\n' +
          Array(this._boxSize)
            .fill(
              '+' +
                Array(this._boxSize)
                  .fill('---')
                  .join(''),
            )
            .join('') +
          '+';

      output += '\n';
    }

    console.log(output);
  }

  public solve(): void {
    console.clear();
    console.log(new Date().toLocaleString());
    console.log('\n');
    console.log('Problem');
    this.print(this._grid);

    const b = performance.now();

    const cover: number[][] = this.convertToCoverMatrix(this._grid);
    const dlx: DLX = new DLX(cover);
    dlx.solve();
    this._gridSolved = this.convertDLXListToGrid(dlx.result);

    console.log('Solution');
    if (!this._gridSolved.length) {
      console.log('No solution found');
    } else {
      this.print(this._gridSolved);
    }

    console.log(`Solved in ${performance.now() - b} ms.`);
  }
}
