import {CallbackWithParam} from "./util.js"

export enum GraphProperty {
  Cyclic,
  Directed
}

export type VertexSet<T> = Map<Graph<T>, Graph<T>[]>

export type GraphTraversalOptions = {
  includeRepeatedNodes: boolean,
  algorithm: GraphTraversalAlgorithm
}

export enum GraphTraversalAlgorithm {
  DepthFirstSearch,
  BreathFirstSearch
}

export class Graph<T> {
  constructor(public neighbors: Graph<T>[] = []) {
    //
  }

  *[Symbol.iterator]() {
    // TODO: Implement.
  }

  determineProperties(): Set<GraphProperty> {
    const properties = new Set<GraphProperty>()
    const neighborsSeen = new Set<Graph<T>>()

    this.traverse(node => {
      if (neighborsSeen.has(node))
        properties.add(GraphProperty.Cyclic)
      else if (neighborsSeen.size === 0)
        neighborsSeen.add(node)
    })

    return properties
  }

  traverse(
    callback: CallbackWithParam<Graph<T>>,
    algorithm: GraphTraversalAlgorithm = GraphTraversalAlgorithm.DepthFirstSearch
  ): void {
    switch (algorithm) {
      case GraphTraversalAlgorithm.DepthFirstSearch:
        return this.traverseDepthFirst(callback)
      case GraphTraversalAlgorithm.BreathFirstSearch:
        // TODO: Implement.
        throw new Error("Not yet implemented")
    }
  }

  private traverseDepthFirst(callback: CallbackWithParam<Graph<T>>): void {
    const queue: Graph<T>[] = [this]
    const nodesVisited = new Set<Graph<T>>()

    while (queue.length > 0) {
      const node = queue.pop()!

      if (!nodesVisited.has(node)) {
        callback(node)
        queue.push(...node.neighbors)
        nodesVisited.add(node)
      }
    }
  }

  // flatten(): VertexSet<T> {

  // }
}
