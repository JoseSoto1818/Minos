import { expect, test, type Page } from "@playwright/test";
import { checkEntryNavigation } from "./data-entry-navigation";

async function noHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
}

test("public navigation, protected routes and Spanish auth forms", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/inicio");
  await expect(page).toHaveURL(/iniciar-sesion/);
  await page.goto("/inicio/agregar/manual");
  await expect(page).toHaveURL(/iniciar-sesion/);
  await expect(
    page.getByRole("heading", { name: "Qué bueno verte de nuevo." }),
  ).toBeVisible();
  await page
    .getByLabel("Contraseña", { exact: true })
    .fill("A visible password");
  await page.getByRole("button", { name: "Mostrar contraseña" }).click();
  await expect(page.getByLabel("Contraseña", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByRole("button", { name: "Tema oscuro", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.screenshot({
    path: testInfo.outputPath("login-dark.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Tema claro", exact: true }).click();
  await page.getByRole("link", { name: "Crea tu cuenta" }).click();
  await expect(page).toHaveURL(/registro/);
  await expect(
    page.getByRole("heading", { name: "Grandes pasos. Un inicio simple." }),
  ).toBeVisible();
  await noHorizontalOverflow(page);
  await page.screenshot({
    path: testInfo.outputPath("signup-light.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page.goto("/auth/confirm?token_hash=invalid&type=email");
  await expect(
    page.getByRole("alert").filter({ hasText: "El enlace ya no es válido" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("registration, company onboarding, settings, themes, switch and persistent return", async ({
  page,
}, testInfo) => {
  test.skip(
    process.env.MINOS_E2E_AUTH !== "1",
    "Requires the local Supabase stack; no production accounts are created.",
  );
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const email = `minos-${testInfo.project.name}-${Date.now()}@example.test`;
  const password = "Minos-test-passphrase-2026";
  const companyName = "Taller Horizonte QA";
  await page.goto("/registro");
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Crear mi cuenta" }).click();
  await expect(page).toHaveURL(/onboarding/);
  await page.getByLabel("¿Cómo se llama tu negocio?").fill(companyName);
  await page
    .getByLabel("¿En qué sector trabajas?")
    .selectOption("Servicios profesionales");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByText("Sí, tengo varias", { exact: true }).click();
  await page.getByRole("button", { name: "Agregar sede", exact: true }).click();
  await page.getByLabel("Nombre de sede 1").fill("Sede Centro");
  await page.screenshot({
    path: testInfo.outputPath("onboarding.png"),
    fullPage: true,
    animations: "disabled",
  });
  await noHorizontalOverflow(page);
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Configúralo por mí" }).click();
  await page.getByRole("button", { name: "Entrar a mi negocio" }).click();
  await expect(page).toHaveURL(/inicio/);
  await expect(
    page.getByRole("heading", { name: "Bienvenido a tu espacio." }),
  ).toBeVisible();
  await expect(
    page.getByText("Configuración completa", { exact: true }),
  ).toBeVisible();
  await noHorizontalOverflow(page);
  await page.screenshot({
    path: testInfo.outputPath("home-light.png"),
    fullPage: true,
    animations: "disabled",
  });
  await checkEntryNavigation(page, testInfo);
  await page.getByRole("link", { name: "Ver configuración" }).click();
  await page.getByRole("button", { name: "Editar perfil del negocio" }).click();
  await expect(page.getByLabel("Nombre del negocio")).toHaveValue(companyName);
  await expect(page.getByText("Sede Centro", { exact: true })).toBeVisible();
  await page
    .getByLabel("Nombre del negocio")
    .fill("Taller Horizonte actualizado");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("status")).toContainText("se guardaron");
  // Every business type is reversible; existing locations survive disabling them.
  for (const kind of ["services", "both", "products"]) {
    await page
      .getByRole("button", { name: "Editar perfil del negocio" })
      .click();
    await page.getByLabel("Tipo de negocio").selectOption(kind);
    await page.getByLabel("País", { exact: true }).selectOption("MX");
    await page.getByLabel("Moneda principal").selectOption("MXN");
    await page.getByLabel("Sedes", { exact: true }).selectOption("false");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(
      page.getByRole("button", { name: "Editar perfil del negocio" }),
    ).toBeVisible();
    await page.reload();
    await page
      .getByRole("button", { name: "Editar perfil del negocio" })
      .click();
    await expect(page.getByLabel("Tipo de negocio")).toHaveValue(kind);
    await expect(page.getByLabel("País", { exact: true })).toHaveValue("MX");
    await expect(page.getByLabel("Moneda principal")).toHaveValue("MXN");
    await page.getByLabel("Sedes", { exact: true }).selectOption("true");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByText("Sede Centro", { exact: true })).toBeVisible();
  }
  await page.getByRole("button", { name: "Editar perfil del negocio" }).click();
  await page.getByLabel("Nombre del negocio").fill("Cambio cancelado");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.getByLabel("Nueva sede").fill("Sede Norte");
  await page.getByRole("button", { name: /Agregar/ }).click();
  await expect(page.getByText("Sede Norte", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Tema oscuro", exact: true })
    .last()
    .click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.screenshot({
    path: testInfo.outputPath("settings-dark.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page.goto("/inicio");
  await page.screenshot({
    path: testInfo.outputPath("home-dark.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page.goto("/equipo");
  await expect(page.getByRole("heading", { name: "Tu equipo" })).toBeVisible();
  await expect(page.getByText(email, { exact: false }).first()).toBeVisible();
  await page.goto("/onboarding");
  await expect(page).toHaveURL(/inicio/);
  const stalePage = await page.context().newPage();
  await stalePage.goto("/configuracion");
  await stalePage
    .getByRole("button", { name: "Editar perfil del negocio" })
    .click();
  await stalePage
    .getByLabel("Nombre del negocio")
    .fill("No debe sobrescribir otra empresa");
  await page.goto("/onboarding?nuevo=1");
  await page
    .getByLabel("¿Cómo se llama tu negocio?")
    .fill("Segundo negocio QA");
  await page.getByLabel("¿En qué sector trabajas?").selectOption("Comercio");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Entrar a mi negocio" }).click();
  await expect(page).toHaveURL(/inicio/);
  await stalePage.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(
    stalePage
      .getByRole("alert")
      .filter({ hasText: "La empresa activa cambió" }),
  ).toContainText("La empresa activa cambió");
  await stalePage.close();
  await page.goto("/configuracion");
  await page.getByRole("button", { name: "Editar perfil del negocio" }).click();
  await expect(page.getByLabel("Nombre del negocio")).toHaveValue(
    "Segundo negocio QA",
  );
  await expect(page.getByLabel("País", { exact: true })).toHaveValue("CO");
  await expect(page.getByLabel("Moneda principal")).toHaveValue("COP");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page
    .getByRole("button", { name: "Cambiar empresa" })
    .filter({ visible: true })
    .click();
  await page
    .getByRole("menuitem", { name: "Taller Horizonte actualizado" })
    .click();
  await expect(
    page
      .getByRole("button", { name: "Cambiar empresa" })
      .filter({ visible: true }),
  ).toContainText("Taller Horizonte actualizado");
  await page.getByRole("button", { name: "Abrir menú de perfil" }).click();
  await page.getByRole("menuitem", { name: "Cerrar sesión" }).click();
  await expect(page).toHaveURL(/iniciar-sesion/);
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Entrar a mi negocio" }).click();
  await expect(page).toHaveURL(/inicio/);
  await page.goto("/configuracion");
  await page.getByRole("button", { name: "Editar perfil del negocio" }).click();
  await expect(page.getByLabel("Nombre del negocio")).toHaveValue(
    "Taller Horizonte actualizado",
  );
  await expect(page.getByText("Sede Norte", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
