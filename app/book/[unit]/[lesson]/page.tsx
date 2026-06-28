import { PHYSICS_BOOK } from "@/lib/physics-content";
import LessonPageClient from "./LessonPageClient";

export function generateStaticParams() {
  return PHYSICS_BOOK.flatMap(unit =>
    unit.lessons.map(lesson => ({
      unit: unit.id,
      lesson: lesson.id,
    }))
  );
}

export default async function LessonPage({ params }: { params: Promise<{ unit: string; lesson: string }> }) {
  const { unit: unitId, lesson: lessonId } = await params;
  return <LessonPageClient unitId={unitId} lessonId={lessonId} />;
}
