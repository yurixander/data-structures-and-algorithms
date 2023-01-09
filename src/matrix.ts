import {Either, Result} from "./monad/either.js"
import {Maybe} from "./monad/maybe.js"
import {validateIndex, cyclicRangeClamp} from "./util.js"

export type MatrixForEachCallback<T, U = void> =
  (value: T, row: number, column: number) => U

// This might be pesky for all implementations!
// export type MatrixOptions<T> = {
//   valueAdd: (a: T, b: T) => T,
//   valueSubtract: (a: T, b: )
// }

export class Matrix<T> {
  static unit<T>(rows: number, columns: number, initializer?: T): Result<Matrix<T>> {
    return Either.try(() => new Matrix(rows, columns, initializer))
  }

  private readonly values: T[][]
  private readonly capacity_: number
  private rowPointer: number
  private columnPointer: number
  private size_: number

  constructor(public rows: number, public columns: number, initializer?: T) {
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

  apply(other: Matrix<T>, op: (a: T, b: T) => T): Result<Matrix<T>> {
    if (this.rows !== other.rows || this.columns !== other.columns)
      return Either.right(new Error("Cannot add matricies with different dimensions"))

    const result = new Matrix<T>(this.rows, this.columns)

    for (let i = 0; i < this.rows; i++)
      for (let j = 0; j < this.columns; j++)
        result.values[i][j] = op(this.values[i][j], other.values[i][j])

    return Either.left(result)
  }

  /**
   * Transposes the matrix and returns the result as a new matrix.
   *
   * The transpose of a matrix is a new matrix that is formed by swapping the rows and columns
   * of the original matrix. For example, the transpose of a 3x4 matrix is a 4x3 matrix.
   *
   * @returns {Matrix} A new matrix that is the transpose of the original matrix.
   */
  transpose(): Matrix<T> {
    const result = new Matrix<T>(this.rows, this.columns)

    for (let i = 0; i < this.rows; i++)
      for (let j = 0; j < this.columns; j++)
        result.values[j][i] = this.values[i][j]

    return result
  }

  set(row: number, column: number, value: T): boolean {
    if (!validateIndex(row, this.rows) || !validateIndex(column, this.columns))
      return false

    if (this.values[row][column] === undefined)
      this.size_++

    this.values[row][column] = value

    return true
  }

  get(row: number, column: number): Maybe<T> {
    // BUG: If the row is undefined, the other accessor will fail with an error.
    return Maybe.try(this.values[row][column])
  }

  isFull(): boolean {
    return this.size_ === this.capacity_
  }

  forEach(callback: MatrixForEachCallback<T>, skipEmpty = true): void {
    for (let rowIndex = 0; rowIndex < this.rows; rowIndex++)
      for (let columnIndex = 0; columnIndex < this.columns; columnIndex++)
        if (!skipEmpty || this.values[rowIndex][columnIndex] !== undefined)
          callback(this.values[rowIndex][columnIndex], rowIndex, columnIndex)
  }

  fill(value: T, replace = false): this {
    // TODO: Everything should be functional.

    this.forEach((_, row, column) => {
      if (!replace && this.values[row][column] !== undefined)
        return

      this.values[row][column] = value
    }, false)

    return this
  }

  map<U>(callback: MatrixForEachCallback<T, U>): Matrix<U> {
    const result = new Matrix<U>(this.rows, this.columns)

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

    this.rowPointer = cyclicRangeClamp(this.rowPointer, 1, this.rows)
    this.columnPointer = cyclicRangeClamp(this.columnPointer, 1, this.columns)

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
