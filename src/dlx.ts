import { ColumnNode, ListNode } from './nodes';

export class DLX {
  private _header: ColumnNode;
  private _answer: ListNode[] = [];
  public result!: ListNode[];

  constructor(cover: number[][]) {
    this._header = this.createDLXList(cover);
  }

  private createDLXList(grid: number[][]): ColumnNode {
    const columnLength: number = grid[0].length;

    let headerNode: ColumnNode = new ColumnNode('header');
    const columnNodes: ColumnNode[] = [];

    for (let i = 0; i < columnLength; i++) {
      const n: ColumnNode = new ColumnNode(`${i}`);
      columnNodes.push(n);
      headerNode = headerNode.linkRight(n) as ColumnNode;
    }

    headerNode = headerNode.right.columnNode;

    grid.forEach(aGrid => {
      let previousNode: ListNode | null = null;

      for (let j = 0; j < columnLength; j++) {
        if (aGrid[j] === 1) {
          const columnNode: ColumnNode = columnNodes[j];
          const newNode = new ListNode(columnNode);

          if (previousNode === null) previousNode = newNode;

          columnNode.up.linkDown(newNode);
          previousNode = previousNode.linkRight(newNode);
          columnNode.size++;
        }
      }
    });

    headerNode.size = columnLength;
    return headerNode;
  }

  private getSmallestColumn(): ColumnNode | undefined {
    let header: ColumnNode = this._header.right as ColumnNode;
    let columnNode: ColumnNode | undefined = undefined;
    let size: number = Number.MAX_VALUE;

    while (header !== this._header) {
      if (header.size < size) {
        columnNode = header as ColumnNode;
        size = columnNode.size;
      }
      header = header.right as ColumnNode;
    }

    return columnNode;
  }

  private process(k: number): void {
    if (this._header.right === this._header) {
      this.result = [...this._answer];
      return;
    }

    let columnNode: ColumnNode = this.getSmallestColumn() as ColumnNode;

    columnNode.cover();

    for (let row = columnNode.down; row !== columnNode; row = row.down) {
      this._answer.push(row);

      for (let j = row.right; j !== row; j = j.right) {
        j.columnNode.cover();
      }

      // Todo: Seems there is an infinite loop
      this.process(k + 1);

      row = this._answer.pop() as ListNode;
      columnNode = row.columnNode;

      for (let j = row.left; j !== row; j = j.left) {
        j.columnNode.uncover();
      }
    }

    columnNode.uncover();
  }

  public solve(): void {
    this.process(0);
  }
}
