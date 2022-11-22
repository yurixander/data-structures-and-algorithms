import { Option } from "./option.js"
import { Util } from "./util.js"

export enum TreeTraversalOrder {
  DepthFirstSearch,
  BreathFirstSearch,
  InOrder,
  PostOrder
}

export enum BinaryTreeBranch {
  Left = "left",
  Right = "right"
}

export class BinaryTree<T> {
  constructor(
    public value: T,
    public left: Option<BinaryTree<T>> = Option.none(),
    public right: Option<BinaryTree<T>> = Option.none()
  ) {
    //
  }

  *[Symbol.iterator]() {
    // OPTIMIZE: Collect as needed, recall using generator.
    let nodes = this.collectIterative()

    for (const node of nodes)
      yield node
  }

  tryInsert(position: BinaryTreeBranch, node: BinaryTree<T>): boolean {
    const branch = position === BinaryTreeBranch.Left ? this.left : this.right

    if (branch.isSome())
      return false

    this[position] = Option.some(node)

    return true
  }

  traverse(callback: Util.ThunkWithParam<BinaryTree<T>>): void {
    this.collectIterative().forEach(node => callback(node))
  }

  isLeaf(): boolean {
    return this.left === Option.none() && this.right === Option.none()
  }

  collectIterative(): BinaryTree<T>[] {
    let queue: BinaryTree<T>[] = [this]
    let nodes: BinaryTree<T>[] = []

    while (queue.length > 0) {
      const node = queue.pop()!

      nodes.push(node)

      if (node.left.isSome())
        queue.push(node.left.unwrap())

      if (node.right.isSome())
        queue.push(node.right.unwrap())
    }

    return nodes
  }

  collectRecursive(): BinaryTree<T>[] {
    let result: BinaryTree<T>[] = []

    const go = (node: BinaryTree<T>): void => {
      result.push(node)

      if (node.left.isSome())
        go(node.left.unwrap())

      if (node.right.isSome())
        go(node.right.unwrap())
    }

    go(this)

    return result
  }
}
