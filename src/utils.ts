export function getEmpty2DArray<T>(
  size1: number,
  size2: number,
  value?: T,
): T[][] {
  const createEmptyArray: Function = (size: number) =>
    Array(size).fill(value ?? null);

  return createEmptyArray(size1).map(() => createEmptyArray(size2));
}
