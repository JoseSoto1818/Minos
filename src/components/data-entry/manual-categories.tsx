"use client";

import { Dialog } from "@base-ui/react/dialog";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Building2,
  HandCoins,
  ShoppingBag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  {
    title: "Venta / ingreso",
    icon: Banknote,
    description: "Lo que vendes o recibes por la actividad de tu negocio.",
    guidance:
      "Aquí podrás registrar las ventas de tus productos o servicios. Los préstamos y aportes se registrarán por separado.",
  },
  {
    title: "Compra / gasto",
    icon: ShoppingBag,
    description:
      "Lo que compras para producir, vender o hacer funcionar tu negocio.",
    guidance:
      "Aquí podrás registrar tus compras y gastos, distinguiendo lo que cuesta vender de lo que cuesta mantener tu negocio funcionando.",
  },
  {
    title: "Dinero que te deben",
    icon: ArrowDownLeft,
    description:
      "Ventas o servicios que tus clientes todavía no te han pagado.",
    guidance:
      "Aquí podrás indicar quién te debe y cuánto está pendiente. Si conoces la fecha de vencimiento, también podrás agregarla.",
  },
  {
    title: "Dinero que debes",
    icon: ArrowUpRight,
    description:
      "Cuentas de tu negocio que todavía tienes pendientes por pagar.",
    guidance:
      "Aquí podrás indicar a quién le debes y cuánto está pendiente por pagar. La fecha de vencimiento será opcional.",
  },
  {
    title: "Activo / inversión",
    icon: Building2,
    description:
      "Algo que tu negocio usará por bastante tiempo, como un equipo.",
    guidance:
      "Aquí podrás registrar las compras que se usarán por bastante tiempo en tu negocio, sin mezclarlas con los gastos para funcionar.",
  },
  {
    title: "Préstamo",
    icon: HandCoins,
    description: "Dinero prestado que tu negocio tendrá que devolver.",
    guidance:
      "Aquí podrás registrar un préstamo recibido. El dinero de un préstamo no se contará como una venta de tu negocio.",
  },
];

export function ManualCategories() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map(({ title, icon: Icon, description, guidance }) => (
        <Dialog.Root key={title}>
          <Dialog.Trigger className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary/60 focus-visible:outline-primary">
            <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
              <Icon size={20} strokeWidth={1.7} />
            </span>
            <span className="text-sm font-semibold">{title}</span>
            <span className="mb-4 mt-2 text-xs leading-6 text-muted-foreground">
              {description}
            </span>
            <span className="mt-auto flex w-full items-center justify-between gap-2 text-xs font-medium text-primary">
              Conocer esta opción
              <ArrowRight size={15} />
            </span>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 z-40 bg-black/40" />
            <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-lg outline-none sm:p-7">
              <div className="mb-5 flex items-center justify-between">
                <span className="rounded-xl bg-accent p-3 text-primary">
                  <Icon size={24} />
                </span>
                <Dialog.Close
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Cerrar detalle"
                    />
                  }
                >
                  <X />
                </Dialog.Close>
              </div>
              <Dialog.Title className="text-xl font-semibold tracking-tight">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-3 text-sm leading-7 text-muted-foreground">
                {guidance}
              </Dialog.Description>
              <p className="mb-6 mt-5 rounded-xl bg-muted p-4 text-xs leading-6 text-muted-foreground">
                La entrada de datos para esta opción estará disponible
                próximamente. Todavía no se guarda información.
              </p>
              <Dialog.Close
                render={<Button variant="outline" className="w-full" />}
              >
                Volver a las categorías
              </Dialog.Close>
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      ))}
    </div>
  );
}
