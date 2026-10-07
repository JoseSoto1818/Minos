import { describe, expect, it } from "vitest";
import {
  companySchema,
  onboardingSchema,
  signupSchema,
} from "../../src/lib/validation";
import { canManageCompany } from "../../src/lib/constants";

const company = {
  name: "Mi empresa",
  country_code: "CO",
  base_currency: "COP",
  timezone: "America/Bogota",
  industry: "Comercio",
  business_type: "products",
  has_locations: false,
};
describe("company validation", () => {
  it("allows onboarding without optional locations, interests or financial input", () => {
    expect(
      onboardingSchema.safeParse({ ...company, locations: [], interests: [] })
        .success,
    ).toBe(true);
  });
  it("rejects invalid currency, country and timezone", () => {
    for (const bad of [
      { base_currency: "XYZ" },
      { country_code: "ZZ" },
      { timezone: "Invented/City" },
    ])
      expect(companySchema.safeParse({ ...company, ...bad }).success).toBe(
        false,
      );
  });
  it("rejects duplicate normalized location names", () => {
    expect(
      onboardingSchema.safeParse({
        ...company,
        has_locations: true,
        locations: [" Norte ", "norte"],
        interests: [],
      }).success,
    ).toBe(false);
  });
  it("rejects locations when disabled and caps initial locations at ten", () => {
    expect(
      onboardingSchema.safeParse({
        ...company,
        locations: ["Norte"],
        interests: [],
      }).success,
    ).toBe(false);
    expect(
      onboardingSchema.safeParse({
        ...company,
        has_locations: true,
        locations: Array.from({ length: 11 }, (_, i) => `Sede ${i}`),
        interests: [],
      }).success,
    ).toBe(false);
  });
  it("rejects whitespace-only company names", () =>
    expect(companySchema.safeParse({ ...company, name: "  " }).success).toBe(
      false,
    ));
});
describe("access validation", () => {
  it("requires a ten-character signup password and valid email", () => {
    expect(
      signupSchema.safeParse({ email: "owner@example.com", password: "short" })
        .success,
    ).toBe(false);
    expect(
      signupSchema.safeParse({ email: "not-email", password: "long password" })
        .success,
    ).toBe(false);
    expect(
      signupSchema.safeParse({
        email: "owner@example.com",
        password: "long password",
      }).success,
    ).toBe(true);
  });
  it("limits company management to owner and admin", () => {
    expect(canManageCompany("owner")).toBe(true);
    expect(canManageCompany("admin")).toBe(true);
    expect(canManageCompany("accountant")).toBe(false);
    expect(canManageCompany("viewer")).toBe(false);
  });
});
