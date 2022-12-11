import {Maybe} from "./maybe.js"
import {unimplemented} from "./util.js"

export class HashTable<TKey, TValue> {
  constructor() {
    //
  }

  set(key: TKey): boolean {
    return true
  }

  get(key: TKey): Maybe<TValue> {
    return Maybe.none()
  }

  has(key: TKey): boolean {
    // TODO: Implement.
    unimplemented()
  }
}
