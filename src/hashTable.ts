import { Option } from "./option"
import { Util } from "./util"

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
