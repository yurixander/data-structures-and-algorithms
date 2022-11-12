export type Callback<T = void> = () => T

export type CallbackWithParam<T, U = void> = (_: T) => U
