import Link from "next/link";
import { ArrowRight, Banknote } from "lucide-react";
import { kinds } from "@/lib/finance";
export function ManualCategories() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Object.entries(kinds).map(([kind, title]) => (
        <Link
          key={kind}
          href={`/inicio/agregar/manual/${kind}`}
          className="group rounded-2xl border border-border bg-card p-6 hover:border-primary"
        >
          <Banknote className="mb-4 text-primary" />
          <span className="block font-semibold">{title}</span>
          <span className="mt-5 flex items-center justify-between text-sm text-primary">
            Agregar <ArrowRight size={16} />
          </span>
        </Link>
      ))}
    </div>
  );
}
