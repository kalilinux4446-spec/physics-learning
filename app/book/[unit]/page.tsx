import { PHYSICS_BOOK } from "@/lib/physics-content";
import UnitPageClient from "./UnitPageClient";

export function generateStaticParams() {
  return PHYSICS_BOOK.map(unit => ({ unit: unit.id }));
}

export default async function UnitPage({ params }: { params: Promise<{ unit: string }> }) {
  const { unit: unitId } = await params;
  return <UnitPageClient unitId={unitId} />;
}
