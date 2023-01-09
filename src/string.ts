import {ForwardIterator} from "./iterator/iterator.js"
import {Lazy} from "./lazy.js"

export type Char = string

export class String {
  static from(value: string): String {
    return new String(value)
  }

  static fromChars(chars: Char[]): String {
    return String.from(chars.join(""))
  }

  private chars: Char[] = []
  private charSet: Set<Char>
  private _isPalindrome: Lazy<boolean>

  constructor(public value: string) {
    this.chars = value.split("")
    this.charSet = new Set(value)

    this._isPalindrome = new Lazy(() =>
      this.value === this.chars.reverse().join("")
    )
  }

  iter(): ForwardIterator<Char> {
    return new ForwardIterator(this.chars)
  }

  toString(): string {
    return this.value
  }

  isPalindrome(): boolean {
    return this._isPalindrome.value
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
