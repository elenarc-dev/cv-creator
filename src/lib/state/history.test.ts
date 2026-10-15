import { describe, expect, it } from "vitest";
import { createHistory } from "./history";

describe("history", () => {
  it("permite deshacer y rehacer", () => {
    const h = createHistory<string>("a");
    h.push("b");
    h.push("c");

    expect(h.canUndo()).toBe(true);
    expect(h.undo()).toBe("b");
    expect(h.undo()).toBe("a");
    expect(h.canUndo()).toBe(false);
    expect(h.undo()).toBeNull();
    expect(h.redo()).toBe("b");
    expect(h.redo()).toBe("c");
    expect(h.canRedo()).toBe(false);
    expect(h.redo()).toBeNull();
  });

  it("trunca la rama de redo al hacer push", () => {
    const h = createHistory<string>("a");
    h.push("b");
    h.push("c");
    h.undo(); // vuelve a "b"

    h.push("d"); // "c" se descarta
    expect(h.undo()).toBe("b");
    expect(h.redo()).toBe("d");
    expect(h.redo()).toBeNull();
  });

  it("limita el tamaño de la pila", () => {
    const h = createHistory<string>("0", 3);
    h.push("1");
    h.push("2");
    h.push("3");
    h.push("4");
    expect(h.length()).toBe(3);
    expect(h.undo()).toBe("3");
  });
});
