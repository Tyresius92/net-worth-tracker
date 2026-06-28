export class NonErrorThrown extends Error {
  constructor(value: unknown) {
    super(`Non-error thrown: ${String(value)}`, { cause: value });
    this.name = "NonErrorThrown";
  }
}

export const toError = (value: unknown): Error => {
  if (value instanceof Error) {
    return value;
  }
  return new NonErrorThrown(value);
};
