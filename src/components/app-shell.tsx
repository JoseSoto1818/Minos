"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "@base-ui/react/menu";
import {
  ArrowUpRight,
  Building2,
  Check,
  ChevronsUpDown,
  CircleHelp,
  Home,
  History,
  LogOut,
  Plus,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";
import { cn, initials } from "@/lib/utils";
import { roleLabels, type Role } from "@/lib/constants";
import { signOut } from "@/app/actions/auth";
import { switchCompany } from "@/app/actions/company";

const navigation = [
  { href: "/inicio", label: "Inicio", icon: Home },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/equipo", label: "Equipo", icon: Users },
  { href: "/configuracion", label: "Configuración", icon: Settings2 },
];
type CompanyOption = {
  id: string;
  name: string;
  role: Role;
  base_currency: string;
};
export function AppShell({
  children,
  company,
  companies,
  email,
}: {
  children: React.ReactNode;
  company: CompanyOption;
  companies: CompanyOption[];
  email: string;
}) {
  const pathname = usePathname();
  const currentPage =
    (pathname.startsWith("/inicio/agregar")
      ? "Agregar información"
      : navigation.find((item) => pathname.startsWith(item.href))?.label) ??
    "Conoce Minos";
  const companyMenu = (
    <Menu.Root>
      <Menu.Trigger
        className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-background p-3 text-left outline-none hover:border-primary/40 focus-visible:ring-4 focus-visible:ring-primary/20"
        aria-label="Cambiar empresa"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-accent-foreground">
          {initials(company.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {company.name}
          </span>
          <span className="block text-[11px] text-muted-foreground">
            {roleLabels[company.role]} · {company.base_currency}
          </span>
        </span>
        <ChevronsUpDown size={14} className="shrink-0 text-muted-foreground" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner sideOffset={6} className="z-50">
          <Menu.Popup className="w-64 rounded-xl border border-border bg-card p-1.5 shadow-lg">
            <Menu.Group>
              <Menu.GroupLabel className="px-3 py-2 text-xs text-muted-foreground">
                Tus negocios
              </Menu.GroupLabel>
              {companies.map((item) => (
                <form action={switchCompany} key={item.id}>
                  <input type="hidden" name="company_id" value={item.id} />
                  <Menu.Item
                    nativeButton
                    render={<button type="submit" />}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm outline-none data-highlighted:bg-muted"
                  >
                    <span className="truncate">{item.name}</span>
                    {company.id === item.id && (
                      <Check size={15} className="shrink-0 text-primary" />
                    )}
                  </Menu.Item>
                </form>
              ))}
            </Menu.Group>
            <Menu.Separator className="my-1 h-px bg-border" />
            <Menu.Item
              render={<Link href="/onboarding?nuevo=1" />}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-primary outline-none data-highlighted:bg-muted"
            >
              <Plus size={16} />
              Agregar otro negocio
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
  return (
    <div className="min-h-svh">
      <a
        href="#contenido"
        className="sr-only fixed left-5 top-5 z-50 rounded-xl bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only"
      >
        Saltar al contenido
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border bg-sidebar px-5 py-8 lg:flex">
        <div className="mb-9 px-3">
          <Brand />
        </div>
        {companyMenu}
        <p className="mb-3 mt-9 px-3 text-[10px] font-semibold tracking-[.16em] text-muted-foreground">
          TU ESPACIO
        </p>
        <nav aria-label="Navegación principal" className="space-y-1.5">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition",
                pathname.startsWith(href)
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon size={18} strokeWidth={1.7} />
              {label}
              {pathname.startsWith(href) && (
                <span className="ml-auto size-1.5 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <div className="rounded-xl border border-border bg-background p-4">
            <span className="mb-2 inline-flex size-7 items-center justify-center rounded-lg bg-accent text-primary">
              <CircleHelp size={16} />
            </span>
            <p className="text-sm font-medium">Un paso a la vez.</p>
            <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
              Conoce tu espacio y lo que viene para tu negocio.
            </p>
            <Link
              href="/guia"
              className="mt-4 flex items-center gap-2 text-xs font-medium text-primary"
            >
              Conoce Minos
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="mt-6 flex items-center justify-between px-1">
            <ThemeToggle />
            <span className="text-[10px] tracking-widest text-muted-foreground">
              MINOS
            </span>
          </div>
        </div>
      </aside>
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex min-h-20 items-center justify-between gap-3 border-b border-border bg-card/95 px-5 backdrop-blur-sm sm:px-9">
          <div className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
            <Building2 size={14} />
            <span className="max-w-48 truncate">{company.name}</span>
            <span className="mx-1 text-border">/</span>
            <span className="text-foreground">{currentPage}</span>
          </div>
          <div className="max-w-[240px] flex-1 py-3 lg:hidden">
            {companyMenu}
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden items-center gap-1.5 rounded-full bg-accent/70 px-3 py-1.5 text-[11px] font-medium text-accent-foreground sm:flex">
              <ShieldCheck size={13} />
              Tu espacio privado
            </span>
            <Menu.Root>
              <Menu.Trigger
                aria-label="Abrir menú de perfil"
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-medium outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              >
                {email.slice(0, 2).toUpperCase()}
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner align="end" sideOffset={10} className="z-50">
                  <Menu.Popup className="w-64 rounded-xl border border-border bg-card p-2 shadow-lg">
                    <div className="px-3 py-2">
                      <p className="text-xs text-muted-foreground">Tu cuenta</p>
                      <p className="mt-1 truncate text-sm">{email}</p>
                    </div>
                    <Menu.Separator className="my-1 h-px bg-border" />
                    <Menu.Item
                      render={<Link href="/configuracion" />}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none data-highlighted:bg-muted"
                    >
                      <Settings2 size={16} />
                      Configuración
                    </Menu.Item>
                    <form action={signOut}>
                      <Menu.Item
                        nativeButton
                        render={<button type="submit" />}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none data-highlighted:bg-muted"
                      >
                        <LogOut size={16} />
                        Cerrar sesión
                      </Menu.Item>
                    </form>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </div>
        </header>
        <main
          id="contenido"
          className="mx-auto max-w-[1360px] px-5 pb-28 pt-8 sm:px-9 sm:pt-10 lg:pb-10"
        >
          {children}
        </main>
        <footer className="hidden items-center justify-between border-t border-border px-9 py-5 text-[11px] text-muted-foreground lg:flex">
          <span>Hecho para entender. Diseñado para avanzar.</span>
          <span>Minos · Tu negocio, más claro.</span>
        </footer>
      </div>
      <nav
        aria-label="Navegación móvil"
        className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-border bg-card pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
      >
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={pathname.startsWith(href) ? "page" : undefined}
            className={cn(
              "flex min-w-20 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px]",
              pathname.startsWith(href)
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            <Icon size={21} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
