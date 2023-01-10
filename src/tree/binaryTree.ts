import {Maybe} from "../monad/maybe.js"
import {CallbackWithParam} from "../util.js"

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
    public left: Maybe<BinaryTree<T>> = Maybe.nothing(),
    public right: Maybe<BinaryTree<T>> = Maybe.nothing()
  ) {
    //
  }

  private inOrderTraversalIterative(callback: CallbackWithParam<BinaryTree<T>>) {
    const stack: BinaryTree<T>[] = []
    let current: BinaryTree<T> | null = this

    while (stack.length > 0 || current !== null) {
      // Push all the nodes to the left of the current node.
      while (current !== null) {
        stack.push(current)
        current = current.left.unwrapOrElse(null).value
      }

      const node = stack.pop()

      if (node !== undefined) {
        callback(node)
        current = node.right.unwrapOrElse(null).value
      }
      else
        current = null
    }
  }

  private inOrderTraversalRecursive(callback: CallbackWithParam<BinaryTree<T>>) {
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

    this[position] = Maybe.just(node)

    return true
  }

  traverse(callback: CallbackWithParam<BinaryTree<T>>, order: TreeTraversalOrder): void {
    // TODO: Implement other orders.
    if (order === TreeTraversalOrder.InOrder)
      return this.inOrderTraversalIterative(callback)
    else if (order === TreeTraversalOrder.InOrderRecursive)
      return this.inOrderTraversalRecursive(callback)
    else
      this.collectIterative().forEach(node => callback(node))
  }

  isLeaf(): boolean {
    return this.left === Maybe.nothing() && this.right === Maybe.nothing()
  }

  collectIterative(): BinaryTree<T>[] {
    const queue: BinaryTree<T>[] = [this]
    const nodes: BinaryTree<T>[] = []

    while (queue.length > 0) {
      const node = queue.pop()!

      nodes.push(node)

      if (node.left.isSome())
        queue.push(node.left.getOrDo())

      if (node.right.isSome())
        queue.push(node.right.getOrDo())
    }

    return nodes
  }

  collectRecursive(): BinaryTree<T>[] {
    const result: BinaryTree<T>[] = []

    const go = (node: BinaryTree<T>): void => {
      result.push(node)

      if (node.left.isSome())
        go(node.left.getOrDo())

      if (node.right.isSome())
        go(node.right.getOrDo())
    }

    go(this)

    return result
  }
}
