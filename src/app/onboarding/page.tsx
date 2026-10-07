import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { OnboardingForm } from "@/components/onboarding-form";
import { getUserCompanies } from "@/lib/context";
import { signOut } from "@/app/actions/auth";
export const metadata = { title: "Tu nuevo comienzo" };
export default async function Onboarding({
  searchParams,
}: {
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const companies = await getUserCompanies();
  const { nuevo } = await searchParams;
  if (companies.length && nuevo !== "1") redirect("/inicio");
  return (
    <main className="min-h-svh">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-7 sm:px-8">
        <Brand />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {companies.length ? (
            <Link
              href="/inicio"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Volver al negocio
            </Link>
          ) : (
            <form action={signOut}>
              <button className="text-xs text-muted-foreground hover:text-foreground">
                Salir
              </button>
            </form>
          )}
        </div>
      </header>
      <div className="px-4 pt-6 sm:pt-10">
        <OnboardingForm />
      </div>
    </main>
  );
}
