"use client";
import { useActionState, useState } from "react";
import { changeFinancial } from "@/app/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
export function HistoryActions({
  id,
  version,
  companyId,
  closed,
  deletable,
  closable,
}: {
  id: string;
  version: string;
  companyId: string;
  closed: boolean;
  deletable: boolean;
  closable: boolean;
}) {
  const [state, action, pending] = useActionState(changeFinancial, {});
  const [deleting, setDeleting] = useState(false);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="version" value={version} />
      <input type="hidden" name="company_id" value={companyId} />
      <div className="flex flex-wrap gap-2">
        {(closed || closable) && (
          <Button
            size="sm"
            variant="outline"
            type="submit"
            name="operation"
            value={closed ? "restore" : "close"}
            disabled={pending}
          >
            {closed ? "Restaurar" : "Marcar pagado y cerrar"}
          </Button>
        )}
        {deletable && (
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => setDeleting(!deleting)}
          >
            Eliminar definitivamente
          </Button>
        )}
      </div>
      {deleting && (
        <div className="space-y-3 rounded-xl border border-destructive p-4">
          <p className="text-sm">
            Esta cuenta se eliminará de forma irreversible. Se conservará su
            auditoría.
          </p>
          <label className="flex gap-2 text-sm">
            <input type="checkbox" name="confirm_delete" required />
            Confirmo que quiero eliminar esta cuenta.
          </label>
          <label className="block text-sm">
            Escribe ELIMINAR para confirmar
            <Input name="confirmation" required pattern="ELIMINAR" />
          </label>
          <Button
            type="submit"
            name="operation"
            value="delete"
            disabled={pending}
          >
            Confirmar eliminación
          </Button>
        </div>
      )}
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-success">
          {state.success}
        </p>
      )}
    </form>
  );
}
