import { describe, it, expect } from "vitest";
import {
  financialSchema,
  moneySchema,
  dateSchema,
  cents,
  decimal,
  periodRange,
  summarize,
  type FinancialRecord,
} from "../../src/lib/finance";
const valid = {
  kind: "income",
  date: "2026-10-07",
  amount: "120.25",
  paid: "20.10",
  description: "Venta",
  category: "product",
};
const record = (overrides: Partial<FinancialRecord>): FinancialRecord => ({
  id: "id",
  company_id: "company",
  created_by: "user",
  created_at: "",
  updated_at: "",
  closed_at: null,
  kind: "income",
  date: "2026-10-07",
  amount: "120.25",
  paid: "20.10",
  description: "Venta",
  category: "product",
  currency: "COP",
  notes: "",
  reference: "",
  counterparty: "",
  details: {},
  due_date: null,
  location_id: null,
  ...overrides,
});
describe("financial validation and exact calculations", () => {
  it("keeps cents exact at maximum supported amounts", () => {
    expect(cents("9999999999999999.99") + cents("0.01")).toBe(
      1000000000000000000n,
    );
    expect(decimal(-123n)).toBe("-1.23");
  });
  it("rejects invalid amounts without throwing", () => {
    for (const amount of ["-1", "0", "NaN", "1e4", "1.234", ""])
      expect(financialSchema.safeParse({ ...valid, amount }).success).toBe(
        false,
      );
    expect(moneySchema.safeParse("0.01").success).toBe(true);
  });
  it("validates paid totals, calendar dates and optional fields", () => {
    expect(financialSchema.safeParse(valid).success).toBe(true);
    expect(financialSchema.safeParse({ ...valid, paid: "121" }).success).toBe(
      false,
    );
    expect(dateSchema.safeParse("2026-02-30").success).toBe(false);
    expect(
      financialSchema.safeParse({ ...valid, due_date: "2026-10-01" }).success,
    ).toBe(false);
  });
  it("validates each category and loan/asset details", () => {
    expect(
      financialSchema.safeParse({ ...valid, category: "toString" }).success,
    ).toBe(false);
    expect(
      financialSchema.safeParse({
        ...valid,
        kind: "asset",
        category: "equipment",
      }).success,
    ).toBe(false);
    expect(
      financialSchema.safeParse({
        ...valid,
        kind: "loan",
        category: "other",
        counterparty: "Banco",
        details: { payment_day: "32" },
      }).success,
    ).toBe(false);
  });
  it("uses calendar months across leap years and Monday weeks", () => {
    expect(periodRange("month", "2024-03-03")).toEqual({
      start: "2024-03-01",
      end: "2024-03-31",
      previousStart: "2024-02-01",
      previousEnd: "2024-02-29",
    });
    expect(periodRange("week", "2026-01-01").start).toBe("2025-12-29");
    expect(() =>
      periodRange("custom", "2026-10-07", "2026-10-20", "2026-10-01"),
    ).toThrow();
  });
  it("does not double count debts, loans, assets or other currencies as revenue", () => {
    const rows = [
      record({}),
      record({
        kind: "expense",
        category: "direct",
        amount: "40.15",
        paid: "0",
      }),
      record({
        kind: "receivable",
        category: "other",
        amount: "50",
        paid: "10",
      }),
      record({ kind: "loan", amount: "1000" }),
      record({ kind: "asset", amount: "1000" }),
      record({ currency: "USD", amount: "900" }),
    ];
    const s = summarize(rows, "2026-10-01", "2026-10-31", "COP");
    expect(s.income).toBe(12025n);
    expect(s.result).toBe(8010n);
    expect(s.receivable).toBe(14015n);
    expect(s.payable).toBe(4015n);
  });
  it("keeps older outstanding balances while restricting period revenues", () => {
    const s = summarize(
      [record({ date: "2026-09-01" }), record({ paid: "120.25" })],
      "2026-10-01",
      "2026-10-31",
      "COP",
    );
    expect(s.income).toBe(12025n);
    expect(s.receivable).toBe(10015n);
  });
});
