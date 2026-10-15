import { describe, expect, it } from "vitest";
import { DateString } from "../domain/schema";
import { formatCvDate, formatDateRange } from "./dates";

describe("CV dates", () => {
  it("acepta año sin mes y año con mes", () => {
    expect(DateString.safeParse("2025").success).toBe(true);
    expect(DateString.safeParse("2025-08").success).toBe(true);
    expect(DateString.safeParse("").success).toBe(true);
  });

  it("rechaza meses inválidos", () => {
    expect(DateString.safeParse("2025-00").success).toBe(false);
    expect(DateString.safeParse("2025-13").success).toBe(false);
    expect(DateString.safeParse("25-08").success).toBe(false);
  });

  it("formatea fechas con mes opcional", () => {
    expect(formatCvDate("2025")).toBe("2025");
    expect(formatCvDate("2025-08")).toBe("08/2025");
    expect(formatDateRange("2020", "2025-08", "Actualidad")).toBe("2020 — 08/2025");
    expect(formatDateRange("2025-08", undefined, "Actualidad")).toBe("08/2025 — Actualidad");
  });
});
