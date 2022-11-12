import { CallbackWithParam } from "./common"
import { Option } from "./option"

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

  tryInsert(position: BinaryTreeBranch, node: BinaryTree<T>): boolean {
    let branch = position === BinaryTreeBranch.Left ? this.left : this.right

    if (branch.isSome())
      return false

    this[position] = Option.some(node)

    return true
  }

  traverse(callback: CallbackWithParam<BinaryTree<T>>): void {
    this.collectIterative().forEach(node => callback(node))
  }

  isLeaf(): boolean {
    return this.left === Option.none() && this.right === Option.none()
  }

  collectIterative(): BinaryTree<T>[] {
    let queue: BinaryTree<T>[] = [this]
    let nodes: BinaryTree<T>[] = []

    while (queue.length > 0) {
      let node = queue.pop()!

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

    let go = (node: BinaryTree<T>): void => {
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
