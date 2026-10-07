"use client";
import { Popover } from "@base-ui/react/popover";
import { CircleHelp, X } from "lucide-react";
export function Help({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Popover.Root>
      <Popover.Trigger
        className="inline-flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-primary"
        aria-label={`Ayuda: ${title}`}
      >
        <CircleHelp size={16} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8} className="z-50">
          <Popover.Popup className="max-w-72 rounded-2xl border border-border bg-card p-5 text-sm shadow-lg">
            <div className="mb-2 flex items-center justify-between gap-4">
              <Popover.Title className="font-semibold">{title}</Popover.Title>
              <Popover.Close aria-label="Cerrar ayuda">
                <X size={16} />
              </Popover.Close>
            </div>
            <Popover.Description className="leading-relaxed text-muted-foreground">
              {children}
            </Popover.Description>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
