import Link from "next/link";
import { cn } from "@/lib/utils";
export function Brand({
  light = false,
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="Minos · inicio"
      className={cn("inline-flex items-center gap-2.5", light && "text-white")}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground",
          light && "bg-white/15 text-white",
        )}
      >
        <svg
          width="23"
          height="23"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 18V6l8 8 8-8v12M4 12l8 8 8-8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="text-[26px] font-semibold tracking-[-1.2px]">
          minos<span className="text-primary">.</span>
        </span>
      )}
    </Link>
  );
}
