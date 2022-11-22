import { Option } from "./option.js"
import { Util } from "./util.js"

export class HashTable<TKey, TValue> {
  constructor() {
    //
  }

  set(key: TKey): boolean {
    return true
  }

  get(key: TKey): Option<TValue> {
    return Option.none()
  }

  has(key: TKey): boolean {
    // TODO: Implement.
    Util.unimplemented()
  }
}
