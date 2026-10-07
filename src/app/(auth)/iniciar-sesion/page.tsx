import { AuthScreen } from "@/components/auth-screen";
export const metadata = { title: "Iniciar sesión" };
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const query = await searchParams;
  return (
    <AuthScreen
      mode="login"
      confirmationError={query.error === "confirmacion"}
    />
  );
}
