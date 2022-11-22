import { Util } from "./util.js"

export class Tree<T> {
  constructor(public value: T, public children: Tree<T>[] = []) {
    //
  }

  *[Symbol.iterator]() {
    let nodes = this.collectIterative()

    for (const node of nodes)
      yield node
  }

  traverse(callback: Util.ThunkWithParam<Tree<T>>): void {
    this.collectIterative().forEach(node => callback(node))
  }

  isLeaf(): boolean {
    return this.children.length === 0
  }

  collectIterative(): Tree<T>[] {
    let queue: Tree<T>[] = [this]
    let nodes: Tree<T>[] = []

    while (queue.length > 0) {
      const node = queue.pop()!

      nodes.push(node)
      queue.push(...node.children)
    }

    return nodes
  }

  collectRecursive(): Tree<T>[] {
    let result: Tree<T>[] = []

    const go = (node: Tree<T>) => {
      result.push(node)

      for (const child of node.children)
        go(child)
    }

    go(this)

    return result
  }
}
