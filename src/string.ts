import {ForwardIterator} from "./iterator/iterator.js"
import {Lazy} from "./lazy.js"

export type Char = string

export class String {
  static unit(value: string): String {
    return new String(value)
  }

  static fromChars(chars: Char[]): String {
    return String.unit(chars.join(""))
  }

  private chars: Char[] = []
  private charSet: Set<Char>
  private isPalindromeMarker: Lazy<boolean>

  constructor(public value: string) {
    this.chars = value.split("")
    this.charSet = new Set(value)

    this.isPalindromeMarker = Lazy.lift(() =>
      this.value === this.chars.reverse().join("")
    )
  }

  iter(): ForwardIterator<Char> {
    return ForwardIterator.lift(this.chars)
  }

  toString(): string {
    return this.value
  }

  // TODO: Should be moved to `algorithm`, and not be a method of `String`.
  isPalindrome(): boolean {
    return this.isPalindromeMarker.evaluate()
  }

  getWords(): string[] {
    return this.value.trim().split(" ")
  }

  includesSubstring(substring: string): boolean {
    return this.value.includes(substring)
  }

  map(callback: (char: Char) => Char): String {
    return new String(this.chars.map(callback).join(""))
  }
}


String.unit("hello there")
  .iter()
  .into
