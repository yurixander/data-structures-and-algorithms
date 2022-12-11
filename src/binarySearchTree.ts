import {BinaryTree} from "./binaryTree.js"
import {Maybe} from "./maybe.js"

export class BinarySearchTree<T> extends BinaryTree<T> {
  constructor(
    public override value: T,
    public override left: Maybe<BinarySearchTree<T>> = Maybe.none(),
    public override right: Maybe<BinarySearchTree<T>> = Maybe.none()
  ) {
    super(value, left, right)
  }

  binaryInsert(node: BinarySearchTree<T>) {
    // TODO: Implement.
  }

  binarySearchRecursive(value: T): Maybe<BinarySearchTree<T>> {
    const go = (nodeOpt: Maybe<BinarySearchTree<T>>): Maybe<BinarySearchTree<T>> => {
      if (nodeOpt.isNone())
        return Maybe.none()

      const node = nodeOpt.getOrDo()

      if (node.value === value)
        return nodeOpt
      else if (node.value < value)
        return go(node.right)
      else
        return go(node.left)
    }

    return go(Maybe.some(this))
  }

  // TODO: Missing re-balancing logic.
}
