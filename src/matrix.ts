import {Either, MayFail, Result} from "./monad/either.js"
import {Maybe} from "./monad/maybe.js"
import {Nat} from "./nat.js"
import {validateIndex, cyclicRangeClamp} from "./util.js"

export type MatrixForEachCallback<T, U = void> =
  (value: T, row: number, column: number) => U

// This might be pesky for all implementations!
// export type MatrixOptions<T> = {
//   valueAdd: (a: T, b: T) => T,
//   valueSubtract: (a: T, b: )
// }

export class Matrix<T> {
  static unit<T>(
    rows: Nat,
    columns: Nat,
    initializer?: T
  ): Matrix<T> {
    return new Matrix(rows, columns, initializer)
  }

  private readonly values: T[][]
  private readonly capacity_: number
  private rowPointer: number
  private columnPointer: number
  private sizeMarker: number

  constructor(
    public readonly rows: Nat,
    public readonly columns: Nat,
    initializer?: T
  ) {
    this.rowPointer = 0
    this.columnPointer = 0
    this.values = new Array(rows.value)
    this.sizeMarker = 0
    this.capacity_ = rows.value * columns.value

    for (const index of this.values.keys())
      this.values[index] = new Array(columns.value)

    if (initializer !== undefined)
      this.fill(initializer)
  }

  *[Symbol.iterator]() {
    // TODO: Implement.
  }

  get size(): number {
    return this.sizeMarker
  }

  get capacity(): number {
    return this.capacity_
  }

  apply(other: Matrix<T>, op: (a: T, b: T) => T): Result<Matrix<T>> {
    if (this.rows !== other.rows || this.columns !== other.columns)
      return Either.error("Cannot add matricies with different dimensions")

    const result = new Matrix<T>(this.rows, this.columns)

    for (let i = 0; i < this.rows.value; i++)
      for (let j = 0; j < this.columns.value; j++)
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

    for (let i = 0; i < this.rows.value; i++)
      for (let j = 0; j < this.columns.value; j++)
        result.values[j][i] = this.values[i][j]

    return result
  }

  set(row: number, column: number, value: T): boolean {
    if (!validateIndex(row, this.rows.value) || !validateIndex(column, this.columns.value))
      return false

    if (this.values[row][column] === undefined)
      this.sizeMarker++

    this.values[row][column] = value

    return true
  }

  get(row: number, column: number): Maybe<T> {
    // BUG: If the row is undefined, the other accessor will fail with an error.
    return Maybe.from(this.values[row][column])
  }

  isFull(): boolean {
    return this.sizeMarker === this.capacity_
  }

  forEach(callback: MatrixForEachCallback<T>, skipEmpty = true): void {
    for (let rowIndex = 0; rowIndex < this.rows.value; rowIndex++)
      for (let columnIndex = 0; columnIndex < this.columns.value; columnIndex++)
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

    this.forEach((value, row, column) =>
      result.values[row][column] = callback(value, row, column)
    )

    return result
  }

  clear(): void {
    this.forEach((_, row, column) => delete this.values[row][column])
  }

  // FIXME: Not working. Cycling & replacing? for some reason.
  push(value: T): boolean {
    if (this.isFull() || !this.set(this.rowPointer, this.columnPointer, value))
      return false

    this.rowPointer = cyclicRangeClamp(this.rowPointer, 1, this.rows.value)

    this.columnPointer =
      cyclicRangeClamp(this.columnPointer, 1, this.columns.value)

    return true
  }

  display(): this {
    this.forEach((value, row, column) =>
      console.log(`[${row}:${column}] => ${value}`)
    )

    return this
  }

  resize(rows: number, columns: number): MayFail {
    if (rows < 1 || columns < 1 || !Number.isInteger(columns))
      return Either.error(`Cannot resize matrix: Dimensions '${rows}x${columns}' are invalid`)

    this.values.length = rows

    for (const column of this.values)
      column.length = columns

    // TODO: Need to resize inner columns.

    return Either.pass()
  }

  // performOperation()
}
