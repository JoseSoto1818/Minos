import { expect, type Page, type TestInfo } from "@playwright/test";

export async function checkEntryNavigation(page: Page, testInfo: TestInfo) {
  if (testInfo.project.name === "mobile") {
    const button = await page
      .getByRole("link", { name: "Agregar mis números", exact: true })
      .boundingBox();
    const navigation = await page
      .getByRole("navigation", { name: "Navegación móvil", exact: true })
      .boundingBox();
    expect(button).not.toBeNull();
    expect(navigation).not.toBeNull();
    expect(button!.y + button!.height).toBeLessThan(navigation!.y);
  }
  await expect(
    page.getByText(
      "Puedes empezar con tan poco como tus ventas y gastos del mes.",
      { exact: true },
    ),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Agregar mis números", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "¿Cómo quieres agregar tu información?",
    }),
  ).toBeVisible();
  for (const title of [
    "Ingresarla ahora",
    "Subir Excel o CSV",
    "Usar plantilla de Minos",
  ]) {
    await expect(
      page.getByRole("link").filter({
        has: page.getByRole("heading", { name: title, exact: true }),
      }),
    ).toBeVisible();
  }
  await capture(page, testInfo, "entry-choices-light.png");
  await page
    .getByRole("link")
    .filter({
      has: page.getByRole("heading", { name: "Ingresarla ahora", exact: true }),
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "¿Qué quieres agregar?" }),
  ).toBeVisible();
  await capture(page, testInfo, "manual-categories-light.png");
  const writes: string[] = [];
  const onRequest = (request: import("@playwright/test").Request) => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method()))
      writes.push(request.url());
  };
  page.on("request", onRequest);
  for (const title of [
    "Venta / ingreso",
    "Compra / gasto",
    "Dinero que te deben",
    "Dinero que debes",
    "Activo / inversión",
    "Préstamo",
  ]) {
    const option = page.getByRole("link", { name: new RegExp(`^${title}`) });
    await option.click();
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByLabel("Fecha", { exact: true })
        .or(page.getByLabel("Fecha inicial")),
    ).toBeVisible();
    await page.getByRole("link", { name: "← Volver", exact: true }).click();
  }
  await page
    .getByRole("link", { name: "Volver a las opciones", exact: true })
    .click();
  await page
    .getByRole("link")
    .filter({
      has: page.getByRole("heading", {
        name: "Subir Excel o CSV",
        exact: true,
      }),
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Subir Excel o CSV", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Seleccionar archivo" }),
  ).toBeDisabled();
  await page
    .getByRole("link", { name: "Volver a las opciones", exact: true })
    .click();
  await page
    .getByRole("link")
    .filter({
      has: page.getByRole("heading", {
        name: "Usar plantilla de Minos",
        exact: true,
      }),
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Usar plantilla de Minos", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Descargar plantilla" }),
  ).toBeDisabled();
  await page
    .getByRole("link", { name: "Conocer la entrada manual", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "¿Qué quieres agregar?" }),
  ).toBeVisible();
  page.off("request", onRequest);
  expect(writes).toEqual([]);
  await page.goto("/inicio");
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath(name),
    fullPage: true,
    animations: "disabled",
  });
}
