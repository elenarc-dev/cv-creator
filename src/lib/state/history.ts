export interface History<T> {
  push(value: T): void;
  undo(): T | null;
  redo(): T | null;
  canUndo(): boolean;
  canRedo(): boolean;
  length(): number;
}

/** Pila de deshacer/rehacer con truncado de la rama de redo al hacer push. */
export function createHistory<T>(initial: T, max = 100): History<T> {
  const stack: T[] = [initial];
  let pointer = 0;

  return {
    push(value) {
      stack.length = pointer + 1;
      stack.push(value);
      if (stack.length > max) stack.shift();
      pointer = stack.length - 1;
    },
    undo() {
      if (pointer <= 0) return null;
      pointer -= 1;
      return stack[pointer];
    },
    redo() {
      if (pointer >= stack.length - 1) return null;
      pointer += 1;
      return stack[pointer];
    },
    canUndo: () => pointer > 0,
    canRedo: () => pointer < stack.length - 1,
    length: () => stack.length,
  };
}
