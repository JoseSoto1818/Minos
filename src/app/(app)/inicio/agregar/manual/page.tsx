import { EntryAvailability, EntryFrame } from "@/components/data-entry/frame";
import { ManualCategories } from "@/components/data-entry/manual-categories";

export const metadata = { title: "Entrada manual" };

export default function ManualEntry() {
  return (
    <EntryFrame
      current="Entrada manual"
      title="¿Qué quieres agregar?"
      description="Cada número tiene su lugar. Conoce las opciones y empieza por la información que ya tienes."
    >
      <ManualCategories />
      <EntryAvailability />
    </EntryFrame>
  );
}
