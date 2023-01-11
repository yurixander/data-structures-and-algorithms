import chalk from "chalk"
import {Either} from "../monad/either.js"
import {Maybe, MayFail} from "../monad/maybe.js"
import {IndexableObject, Callback, CallbackWithParam, zip, unimplemented, isArray, isObject, Comparable} from "../util.js"
import {IO, log} from "../monad/io.js"

enum TestType {
  Unit
}

type Test = {
  type: TestType,
  name: string,
  executor?: Callback<MayFail>
}

type TestResult = {
  result: Either<MayFail, Error>,
  runtime: number,
  logs: IO[]
}

export function suite(target: IndexableObject | Function): TestSuite {
  return new TestSuite(target)
}

export function expect<T>(value: T): TestBuilder<T> {
  // CONSIDER: If the value is a callback, consider executing it (maybe taking a parameter?). This might help with errors thrown?
  return new TestBuilder(value)
}

export function assert(
  condition: boolean,
  message?: string
): TestBuilder<boolean> {
  // TODO: Use message.
  return expect(condition).toEqual(true)
}

export function assertThrows(
  callback: () => unknown,
  cause?: string
): TestBuilder<() => unknown> {
  return expect(callback).to(_ => {
    try {
      _.value()

      return Maybe.error("No error was thrown")
    }
    catch (error) {
      // REVISE: Simplify.
      if (cause !== undefined && !(error instanceof Error))
        return Maybe.error("Expected error but caught different object")
      else if (cause !== undefined && error instanceof Error)
        return Maybe.assert(error.cause !== cause, "Error cause mismatch")

      return Maybe.ok()
    }
  })
}

export enum Type {
  Object = "object",
  Function = "function",
  String = "string",
  Number = "number",
  BigInt = "bigint",
  Undefined = "undefined",
  Null = "null",
  Boolean = "boolean",
  Array = "array"
}

export type Matcher<T> = (instance: TestBuilder<T>) => MayFail

export class TestBuilder<T> {
  private static determineTypeOf(value: unknown): Type {
    if (Array.isArray(value))
      return Type.Array
    else if (value === null)
      return Type.Null

    // REVIEW: Casting.
    return typeof value as Type
  }

  private chain: CallbackWithParam<this, MayFail>[]

  constructor(public readonly value: T) {
    this.chain = []
  }

  private difference<A, B>(actual: A, expected: B): string {
    return [
      chalk.green(`\n      + ${JSON.stringify(expected)}`),
      chalk.red(`\n      - ${JSON.stringify(actual)}`)
    ].join("")
  }

  private compareElements<T>(arrayA: T[], arrayB: T[]): MayFail {
    for (const [a, b] of zip(arrayA, arrayB))
      // TODO: Add an equality helper for deep comparisons.
      if (a.isNone() || b.isNone() || a.do() !== b.do())
        // TODO: Need a more descriptive message. Perhaps compare diffs?
        // BUG: Cannot unwrap if it is none. Temporarily passing in the entire object.
        return Maybe.error(`Element differs ${this.difference(a, b)}`)

    return Maybe.ok()
  }

  private compareWithArray<T extends unknown[]>(expected: T): MayFail {
    // TODO: Use `isObject` helper.
    if (typeof this.value !== "object" || this.value === null || !Array.isArray(this.value))
      return Maybe.error("Value is not an array")
    else if (this.value.length !== expected.length)
      return Maybe.error(`Array lengths differ ${this.difference(this.value.length, expected.length)}`)

    return this.compareElements(this.value, expected)
  }

  private compareWithObject<T extends object>(object: T): MayFail {
    if (typeof this.value !== "object" || this.value === null)
      return Maybe.error("Value is not an object")

    const valueKeys = Object.keys(this.value)
    const objectKeys = Object.keys(object)

    if (valueKeys.length !== objectKeys.length)
      return Maybe.error("Objects differ in key lengths")

    return this.compareElements(valueKeys, objectKeys)
  }

  toEqual(expected: T): this {
    return this.to(() => {
      if (isArray(this.value) && isArray(expected))
        return this.compareWithArray(expected)
      else if (isObject(this.value) && isObject(expected))
        return this.compareWithObject(expected)

      return Maybe.assert(
        this.value === expected,
        `Values are not equal ${this.difference(this.value, expected)}`
      )
    })
  }

  toEqualComparable(other: T extends Comparable<T> ? T : never): this {
    return this.to(() => {
      return Maybe.assert(
        other.equals(other),
        `Objects are not equal ${this.difference(this.value, other)}`
      )
    })
  }

  toBeTruthy(): this {
    return this.assert(() => !!this.value, "Value is not truthy")
  }

  toBeFalsy(): this {
    return this.assert(() => !this.value, "Value is not falsy")
  }

  toBeOfType(expected: Type): this {
    const actual = TestBuilder.determineTypeOf(this.value)

    return this.assert(
      () => actual === expected,
      `Type mismatch ${this.difference(actual, expected)}`
    )
  }

  toBeInstanceOf(other: Function): this {
    return this.assert(() => this.value instanceof other, "Instance mismatch")
  }

  toBeNull(): this {
    return this.assert(() => this.value === null, "Value is not null")
  }

  toBeArrayOfLength(length: number): this {
    return this.to(() => {
      if (!Array.isArray(this.value))
        return Maybe.error("Value is not an array")

      return Maybe.assert(
        this.value.length === length,
        `Array length differs from expected size ${this.difference(this.value.length, length)}`
      )
    })
  }

  toBeOption(isSome: boolean): this {
    return this.to(() => {
      if (!(this.value instanceof Maybe))
        return Maybe.error("Value is not an instance of Option")

      const condition = this.value.isSome() === isSome

      return Maybe.assert(condition, `Value is ${condition ? "some" : "none"}`)
    })
  }

  toBeSome(): this {
    return this.toBeOption(true)
  }

  toBeNone(): this {
    return this.toBeOption(false)
  }

  toMatchPartial(partial: Partial<T>): this {
    return this.to(() => {
      if (typeof this.value !== "object" || this.value === null)
        return Maybe.error(`Value is not an object ${this.difference(TestBuilder.determineTypeOf(this.value), "object")}`)

      const object = this.value as {[_: string]: unknown}
      const partialKeys = Object.keys(partial)
      const valueKeys = Object.keys(this.value)

      if (partialKeys.length > valueKeys.length)
        return Maybe.error(`Partial object has more keys than value ${this.difference(valueKeys.length, partialKeys.length)}`)

      for (const partialKey in partial) {
        const objectValue = object[partialKey]
        const partialValue = partial[partialKey]

        if (objectValue === undefined)
          return Maybe.error(`Value is missing key, or property is undefined: ${partialKey} ${this.difference(undefined, partialValue)}`)
        // TODO: Use deep comparison.
        else if (objectValue !== partialValue)
          return Maybe.error(`Object property mismatch: ${partialKey} ${this.difference(objectValue, partialValue)}`)
      }

      return Maybe.ok()
    })
  }

  map<U>(callback: CallbackWithParam<T, U>): TestBuilder<U> {
    // let next = new TestBuilder(callback(this.value))

    // next.chain = this.chain

    // TODO: Finish implementing.
    unimplemented()
  }

  assert(
    condition: CallbackWithParam<this, boolean>,
    errorMessage = "Unmet condition"
  ): this {
    return this.to(() => Maybe.okIf(condition(this), new Error(errorMessage)))
  }

  not(matcher: Matcher<T>): this {
    // TODO: Implement.
    unimplemented()
  }

  to(functor: Matcher<T>): this {
    this.chain.push(functor)

    return this
  }

  try(): MayFail {
    for (const test of this.chain) {
      const result = test(this)

      if (result.isSome())
        return result
    }

    return Maybe.ok()
  }
}

export class TestSuite {
  private readonly tests: Test[]
  private todos: Set<string>

  readonly name: string

  constructor(target: Function | IndexableObject | string) {
    this.tests = []
    this.todos = new Set()

    if (target instanceof Function) {
      for (const propertyName of Object.getOwnPropertyNames(target.prototype))
        // REVISE: Should be registered by reference to the function, not simply by name string.
        this.todos.add(propertyName)

      this.name = target.name
    }
    else if (target instanceof Object) {
      const targetKeys = Object.keys(target)
      const name = targetKeys.at(0)

      this.name = name ?? chalk.bgRed.black(" Unknown ")

      if (name !== undefined)
        for (const propertyName of Object.getOwnPropertyNames(target[name]))
          this.todos.add(propertyName)
    }
    else
      this.name = target
  }

  private beautifyErrorStack(stack: string | undefined): string {
    if (stack === undefined)
      return ""

    const spacing = " ".repeat(8)

    return spacing + stack
      .split("\n")
      .slice(1)
      .map(line => chalk.gray("• " + line.trim().slice(3)))
      .join("\n" + spacing)
  }

  // REVIEW: Using `any`.
  // CONSIDER: Restricting target's name to `keyof typeof T`.
  test(
    target: string | Function,
    callback: Callback<TestBuilder<any> | TestBuilder<any>[]>
  ): this {
    let name = target instanceof Function ? target.name : target

    if (name === this.name)
      name = "constructor"

    if (this.todos.has(name))
      this.todos.delete(name)

    const result = callback()
    const tests = Array.isArray(result) ? result : [result]

    for (const test of tests)
      this.tests.push({
        name,
        type: TestType.Unit,
        executor: test.try.bind(test)
      })

    return this
  }

  private runTest(test: Test): TestResult {
    if (test.executor === undefined)
      return {
        result: Either.right(new Error("Test executor is undefined")),
        runtime: 0,
        logs: []
      }

    const logs: IO[] = []
    const startTime = performance.now()

    const result = Either.try(test.executor).mapRight(error =>
      new Error(`${error.message}\n${this.beautifyErrorStack(error.stack)}`)
    )

    const runtime = Math.floor(performance.now() - startTime)
    const testRuntimeString = `${runtime}ms`

    const runtimeColoredString =
      // REVISE: Hard-coded limit. Perhaps taking it in as a default option would be better.
      runtime >= 100 ? chalk.red(testRuntimeString) : testRuntimeString

    if (result.isRight())
      // CONSIDER: Combine log messages.
      logs.push(log(`  ${chalk.red("✗")} ${test.name} (${runtimeColoredString})`))
    else
      logs.push(log(chalk.gray(`  ${chalk.green("✓")} ${test.name} (${runtimeColoredString})`)))

    return {
      result,
      runtime,
      logs
    }
  }

  // REVISE: Decouple logic a bit further.
  run(): IO[] {
    const totalTests = this.tests.length + this.todos.size
    const registeredTests = this.tests.length

    // REVISE: Possible division by zero.
    const coverageRatio = Math.floor(registeredTests / totalTests * 100)

    let coverageColor: (_: string) => string

    if (coverageRatio < 50)
      coverageColor = chalk.red
    else if (coverageRatio < 80)
      coverageColor = chalk.yellow
    else if (coverageRatio < 90)
      coverageColor = chalk.gray
    else
      coverageColor = chalk.green

    let suiteRuntime = 0
    const failingTests: [string, string][] = []
    const sortedTests = [...this.tests].sort((a, b) => a.name > b.name ? 1 : -1)
    const suiteLogs: IO[] = []
    const addLog = (...messages: string[]) => suiteLogs.push(log(...messages))

    addLog(this.name, coverageColor(`(${coverageRatio}% coverage)`))

    for (const todoName of this.todos)
      // REVISE: Hard-coded symbols.
      addLog(`  ${chalk.yellow("⋈")} ` + chalk.gray(`todo: ${todoName}`))

    for (const test of sortedTests) {
      if (test.executor === undefined)
        continue

      const {result, runtime: testRuntime, logs: testLogs} = this.runTest(test)

      suiteRuntime += testRuntime
      suiteLogs.push(...testLogs)

      if (result.isRight())
        failingTests.push([test.name, result.value.message])
    }

    // Add a newline to separate output.
    addLog("")

    if (failingTests.length === 0)
      addLog(" ", chalk.bgGreen.black(" PASS "), chalk.gray(`${suiteRuntime}ms`))
    else {
      addLog(" ", chalk.bgRed.black(" * FAIL "), chalk.gray(`${suiteRuntime}ms`))

      failingTests.forEach(failingTest =>
        addLog(`    ${chalk.red("*")} ${failingTest[0]}: ${failingTest[1]}`)
      )
    }

    addLog("")

    return suiteLogs
  }
}
