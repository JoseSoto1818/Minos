import { requireCompany } from "@/lib/context";
import { AppShell } from "@/components/app-shell";
export default async function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, company, companies } = await requireCompany();
  return (
    <AppShell
      company={company}
      companies={companies}
      email={user.email ?? "Tu cuenta"}
    >
      {children}
    </AppShell>
  );
}
