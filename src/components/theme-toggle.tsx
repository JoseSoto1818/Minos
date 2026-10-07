"use client";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
export function ThemeToggle({ full = false }: { full?: boolean }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return (
    <div
      className={cn(
        "theme-selector inline-flex gap-1 rounded-xl border border-border bg-background p-1",
        full && "flex-wrap",
      )}
      role="group"
      aria-label="Apariencia"
    >
      {[
        { value: "light", label: "Claro", Icon: Sun },
        { value: "dark", label: "Oscuro", Icon: Moon },
        { value: "system", label: "Sistema", Icon: Monitor },
      ].map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          title={label}
          aria-label={`Tema ${label.toLowerCase()}`}
          aria-pressed={mounted && theme === value}
          data-theme-option={value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex h-8 items-center justify-center gap-2 rounded-lg px-2.5 text-xs text-muted-foreground transition hover:bg-muted focus-visible:outline-primary",
            full && "px-4",
          )}
        >
          <Icon size={15} />
          {full && label}
        </button>
      ))}
    </div>
  );
}
function subscribe() {
  return () => {};
}
