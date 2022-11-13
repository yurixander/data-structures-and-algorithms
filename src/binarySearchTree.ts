import { BinaryTree } from "./binaryTree"
import { Option } from "./option"

export class BinarySearchTree<T> extends BinaryTree<T> {
  constructor(
    public value: T,
    public left: Option<BinarySearchTree<T>> = Option.none(),
    public right: Option<BinarySearchTree<T>> = Option.none()
  ) {
    super(value, left, right)
  }

  binaryInsert(node: BinarySearchTree<T>) {
    // TODO: Implement.
  }

  binarySearchRecursive(value: T): Option<BinarySearchTree<T>> {
    let go = (nodeOpt: Option<BinarySearchTree<T>>): Option<BinarySearchTree<T>> => {
      if (nodeOpt.isNone())
        return Option.none()

      let node = nodeOpt.unwrap()

      if (node.value === value)
        return nodeOpt
      else if (node.value < value)
        return go(node.right)
      else
        return go(node.left)
    }

    return go(Option.some(this))
  }
}
