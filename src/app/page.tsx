import { redirect } from "next/navigation";
import { getUserCompanies } from "@/lib/context";
export default async function Index() {
  const companies = await getUserCompanies();
  redirect(companies.length ? "/inicio" : "/onboarding");
}
