import { Either, Result } from "./either.js"
import { Option } from "./option.js"
import { Util } from "./util.js"

export type MatrixForEachCallback<T, U = void> = (value: T, row: number, column: number) => U

export class Matrix<T> {
  static unit<T>(rows: number, columns: number, initializer?: T): Result<Matrix<T>> {
    return Either.try(() => new Matrix(rows, columns, initializer))
  }

  private values: T[][]
  private rowPointer: number
  private columnPointer: number
  private size_: number
  private capacity_: number

  private constructor(public rows: number, public columns: number, initializer?: T) {
    if (rows < 1 || columns < 1)
      throw new Error("Matrix must be able to hold at least one element")

    this.rowPointer = 0
    this.columnPointer = 0
    this.values = new Array(rows)
    this.size_ = 0
    this.capacity_ = rows * columns

    for (const index of this.values.keys())
      this.values[index] = new Array(columns)

    if (initializer !== undefined)
      this.fill(initializer)
  }

  *[Symbol.iterator]() {
    // TODO: Implement.
  }

  get size(): number {
    return this.size_
  }

  get capacity(): number {
    return this.capacity_
  }

  set(row: number, column: number, value: T): boolean {
    if (!Util.validateIndex(row, this.rows) || !Util.validateIndex(column, this.columns))
      return false

    if (this.values[row][column] === undefined)
      this.size_++

    this.values[row][column] = value

    return true
  }

  get(row: number, column: number): Option<T> {
    // BUG: If the row is undefined, the other accessor will fail with an error.
    return Option.try(this.values[row][column])
  }

  isFull(): boolean {
    return this.size_ === this.capacity_
  }

  forEach(callback: MatrixForEachCallback<T>, skipEmpty: boolean = true): void {
    for (let rowIndex = 0; rowIndex < this.rows; rowIndex++)
      for (let columnIndex = 0; columnIndex < this.columns; columnIndex++)
        if (!skipEmpty || this.values[rowIndex][columnIndex] !== undefined)
          callback(this.values[rowIndex][columnIndex], rowIndex, columnIndex)
  }

  fill(value: T, replace: boolean = false): this {
    // TODO: Everything should be functional.

    this.forEach((_, row, column) => {
      if (!replace && this.values[row][column] !== undefined)
        return

      this.values[row][column] = value
    }, false)

    return this
  }

  map<U>(callback: MatrixForEachCallback<T, U>): Matrix<U> {
    let result = new Matrix<U>(this.rows, this.columns)

    this.forEach((value, row, column) => result.values[row][column] = callback(value, row, column))

    return result
  }

  clear(): void {
    this.forEach((_, row, column) => delete this.values[row][column])
  }

  // FIXME: Not working. Cycling & replacing? for some reason.
  push(value: T): boolean {
    if (this.isFull() || !this.set(this.rowPointer, this.columnPointer, value))
      return false

    this.rowPointer = Util.cyclicRangeClamp(this.rowPointer, 1, this.rows)
    this.columnPointer = Util.cyclicRangeClamp(this.columnPointer, 1, this.columns)

    return true
  }

  display(): this {
    this.forEach((value, row, column) => console.log(`[${row}:${column}] => ${value}`))

    return this
  }

  resize(rows: number, columns: number): void {
    if (rows < 1 || columns < 1 || !Number.isInteger(columns))
      throw new Error(`Cannot resize matrix: Dimensions '${rows}x${columns}' are invalid`)

    this.values.length = rows

    for (const column of this.values)
      column.length = columns

    // TODO: Need to resize inner columns.
  }

  // performOperation()
}
