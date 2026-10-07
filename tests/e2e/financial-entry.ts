import { expect, type Page, type TestInfo } from "@playwright/test";
export async function checkFinancialEntry(page: Page, info: TestInfo) {
  let currency = "COP";
  async function create(
    kind: string,
    concept: string,
    value: string,
    extra?: () => Promise<void>,
  ) {
    await page.goto(`/inicio/agregar/manual/${kind}`);
    currency = await page
      .getByRole("main")
      .locator('input[name="currency"]')
      .inputValue();
    await page
      .getByLabel(kind === "asset" ? "Nombre / descripción" : "Concepto", {
        exact: true,
      })
      .fill(concept);
    await page
      .getByLabel(
        kind === "loan"
          ? "Monto inicial"
          : kind === "asset"
            ? "Valor de adquisición"
            : "Valor",
        { exact: true },
      )
      .fill(value);
    if (extra) await extra();
    await page
      .getByRole("button", { name: /^Guardar (ingreso|gasto|registro)$/ })
      .click();
    await expect(page).toHaveURL(/historial/);
    await expect(
      page.getByRole("heading", { name: concept, exact: true }),
    ).toBeVisible();
  }
  const article = (name: string) =>
    page
      .getByRole("article")
      .filter({ has: page.getByRole("heading", { name, exact: true }) });
  await create("income", "Venta manual QA", "1200000", async () => {
    await page.getByLabel("Estado del cobro").selectOption("partial");
    await page.getByLabel("Valor recibido", { exact: true }).fill("2000000");
    await page
      .getByRole("button", { name: "Guardar ingreso", exact: true })
      .click();
    await expect(
      page.getByRole("alert").filter({ hasText: "El pago parcial" }),
    ).toBeVisible();
    await expect(page.getByLabel("Concepto", { exact: true })).toHaveValue(
      "Venta manual QA",
    );
    await page.getByLabel("Valor recibido", { exact: true }).fill("500000");
    await page.screenshot({
      path: info.outputPath("finance-form.png"),
      fullPage: true,
      animations: "disabled",
    });
  });
  await create("expense", "Materiales QA", "350000", async () => {
    await page.getByLabel("Estado del pago").selectOption("pending");
  });
  await expect(article("Materiales QA")).toContainText(
    `Pendiente: ${currency} 350000.00`,
  );
  await expect(article("Venta manual QA")).toContainText(
    `Pendiente: ${currency} 700000.00`,
  );
  await article("Venta manual QA")
    .getByRole("link", { name: "Editar registro" })
    .click();
  await page.getByLabel("Valor", { exact: true }).fill("1500000");
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(article("Venta manual QA")).toContainText(
    `Pendiente: ${currency} 1000000.00`,
  );
  await article("Venta manual QA")
    .getByRole("button", { name: "Marcar pagado y cerrar" })
    .click();
  await expect(article("Venta manual QA")).toHaveCount(0);
  await page.getByRole("link", { name: "Cerrados", exact: true }).click();
  await expect(article("Venta manual QA")).toContainText(
    `Pendiente: ${currency} 0.00`,
  );
  await article("Venta manual QA")
    .getByRole("button", { name: "Restaurar", exact: true })
    .click();
  await expect(article("Venta manual QA")).toHaveCount(0);
  await page.getByRole("link", { name: "Activos", exact: true }).click();
  await expect(article("Venta manual QA")).toContainText(
    `Pendiente: ${currency} 1000000.00`,
  );
  await create("receivable", "Cuenta manual QA", "50000", async () => {
    await page.getByLabel("Cliente", { exact: true }).fill("Cliente QA");
  });
  await create("payable", "Proveedor manual QA", "80000", async () => {
    await page.getByLabel("Proveedor", { exact: true }).fill("Proveedor QA");
  });
  await create("asset", "Equipo QA", "900000");
  await create("loan", "Capital QA", "2000000", async () => {
    await page.getByLabel("Entidad o persona que presta").fill("Entidad QA");
    await page.getByLabel("Saldo actual").fill("1500000");
  });
  await page.goto("/inicio");
  await expect(
    page.getByRole("heading", { name: "Tu negocio, en números" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("heading", { name: "Ventas / ingresos", exact: true })
      .locator(".."),
  ).toContainText(`${currency} 1500000.00`);
  await expect(
    page
      .getByRole("heading", { name: "Resultado estimado", exact: true })
      .locator(".."),
  ).toContainText(`${currency} 1150000.00`);
  await expect(
    page
      .getByRole("heading", { name: "Cuentas por cobrar", exact: true })
      .locator(".."),
  ).toContainText(`${currency} 1050000.00`);
  await expect(
    page
      .getByRole("heading", { name: "Cuentas por pagar", exact: true })
      .locator(".."),
  ).toContainText(`${currency} 430000.00`);
  await expect(
    page.getByText("Sin período anterior", { exact: true }),
  ).toHaveCount(2);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Ingresos por tiempo" }),
  ).toBeVisible();
  await page
    .getByLabel("Período", { exact: true })
    .selectOption("previous-month");
  await page.getByRole("button", { name: "Aplicar período" }).click();
  await expect(
    page
      .getByRole("heading", { name: "Ventas / ingresos", exact: true })
      .locator(".."),
  ).toContainText(`${currency} 0.00`);
  await page.getByLabel("Período", { exact: true }).selectOption("custom");
  await expect(page.getByLabel("Desde", { exact: true })).toBeVisible();
  await page.getByLabel("Período", { exact: true }).selectOption("month");
  await page.getByRole("button", { name: "Aplicar período" }).click();
  await expect(
    page
      .getByRole("heading", { name: "Ventas / ingresos", exact: true })
      .locator(".."),
  ).toContainText(`${currency} 1500000.00`);
  for (const theme of ["claro", "oscuro"]) {
    await page.goto("/configuracion");
    await page
      .getByRole("button", { name: `Tema ${theme}`, exact: true })
      .last()
      .click();
    await page.goto("/inicio");
    await expect(
      page.getByRole("heading", { name: "Tu negocio, en números" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath(`finance-dashboard-${theme}.png`),
      fullPage: true,
      animations: "disabled",
    });
  }
  await page.goto("/historial");
  await page.screenshot({
    path: info.outputPath("finance-history.png"),
    fullPage: true,
    animations: "disabled",
  });
  await article("Proveedor manual QA")
    .getByRole("button", { name: "Marcar pagado y cerrar" })
    .click();
  await page.getByRole("link", { name: "Cerrados", exact: true }).click();
  await article("Proveedor manual QA")
    .getByRole("button", { name: "Eliminar definitivamente" })
    .click();
  await article("Proveedor manual QA").getByRole("checkbox").check();
  await article("Proveedor manual QA")
    .getByLabel("Escribe ELIMINAR para confirmar")
    .fill("ELIMINAR");
  await article("Proveedor manual QA")
    .getByRole("button", { name: "Confirmar eliminación" })
    .click();
  await expect(article("Proveedor manual QA")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Cambiar empresa" })
    .filter({ visible: true })
    .click();
  await page.getByRole("menuitem", { name: "Segundo negocio QA" }).click();
  await expect(
    page.getByRole("heading", { name: "Bienvenido a tu espacio." }),
  ).toBeVisible();
  await page.goto("/historial");
  await expect(page.getByRole("article")).toHaveCount(0);
}
