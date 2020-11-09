export class ListNode {
  public up: ListNode;
  public down: ListNode;
  public left: ListNode;
  public right: ListNode;
  public columnNode: ColumnNode;

  constructor(columnNode?: ColumnNode) {
    this.up = this.down = this.left = this.right = this;
    this.columnNode = columnNode as ColumnNode;
  }

  public linkDown(node: ListNode): ListNode {
    node.down = this.down;
    node.down.up = node;
    node.up = this;
    this.down = node;
    return node;
  }

  public linkRight(node: ListNode): ListNode {
    node.right = this.right;
    node.right.left = node;
    node.left = this;
    this.right = node;
    return node;
  }

  public removeLeftRight(): void {
    this.left.right = this.right;
    this.right.left = this.left;
  }

  public reinsertLeftRight(): void {
    this.left.right = this;
    this.right.left = this;
  }

  public removeUpDown(): void {
    this.up.down = this.down;
    this.down.up = this.up;
  }

  public reinsertUpDown(): void {
    this.up.down = this;
    this.down.up = this;
  }
}

export class ColumnNode extends ListNode {
  public size: number = 0;
  public name: string;

  constructor(name: string) {
    super();
    this.name = name;
    this.columnNode = this;
  }

  public cover(): void {
    this.removeLeftRight();

    for (let i = this.down; i !== this; i = i.down) {
      for (let j = i.right; j !== i; j = j.right) {
        j.removeUpDown();
        j.columnNode.size--;
      }
    }
  }

  public uncover(): void {
    for (let i = this.up; i !== this; i = i.up) {
      for (let j = i.left; j !== i; j = j.left) {
        j.columnNode.size++;
        j.reinsertUpDown();
      }
    }

    this.reinsertLeftRight();
  }
}
