import { Lazy } from "./lazy"

export class String {
  private chars: string[] = []
  private charSet: Set<string>
  private _isPalindrome: Lazy<boolean>

  constructor(public value: string) {
    this.chars = value.split("")
    this.charSet = new Set(value)

    this._isPalindrome = new Lazy(() =>
      this.value === this.chars.reverse().join("")
    )
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
}
