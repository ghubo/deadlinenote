export type WorkerEnv = Env

export type WorkerVariables = {
  userId: string
}

export type WorkerContext = {
  Bindings: WorkerEnv
  Variables: WorkerVariables
}
