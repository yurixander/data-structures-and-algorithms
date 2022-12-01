import {Option} from "./option.js"
import {ThunkWithParam} from "./util.js"

export enum TreeTraversalOrder {
  DepthFirstSearch,
  BreathFirstSearch,
  InOrder,
  InOrderRecursive,
  PreOrder,
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

  private inOrderTraversalIterative(callback: ThunkWithParam<BinaryTree<T>>) {
    const stack: BinaryTree<T>[] = []
    let current: BinaryTree<T> | null = this

    while (stack.length > 0 || current !== null) {
      // Push all the nodes to the left of the current node.
      while (current !== null) {
        stack.push(current)
        current = current.left.unwrapOrElse(null)
      }

      const node = stack.pop()

      if (node !== undefined) {
        callback(node)
        current = node.right.unwrapOrElse(null)
      }
      else
        current = null
    }
  }

  private inOrderTraversalRecursive(callback: ThunkWithParam<BinaryTree<T>>) {
    this.left.do(left => left.inOrderTraversalRecursive(callback))
    callback(this)
    this.right.do(right => right.inOrderTraversalRecursive(callback))
  }

  *[Symbol.iterator]() {
    // OPTIMIZE: Collect as needed, recall using generator.
    const nodes = this.collectIterative()

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

  traverse(callback: ThunkWithParam<BinaryTree<T>>, order: TreeTraversalOrder): void {
    // TODO: Implement other orders.
    if (order === TreeTraversalOrder.InOrder)
      return this.inOrderTraversalIterative(callback)
    else if (order === TreeTraversalOrder.InOrderRecursive)
      return this.inOrderTraversalRecursive(callback)
    else
      this.collectIterative().forEach(node => callback(node))
  }

  isLeaf(): boolean {
    return this.left === Option.none() && this.right === Option.none()
  }

  collectIterative(): BinaryTree<T>[] {
    const queue: BinaryTree<T>[] = [this]
    const nodes: BinaryTree<T>[] = []

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
    const result: BinaryTree<T>[] = []

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
