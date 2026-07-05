"use client";

import { useStore } from "@/lib/store";
import Discovery from "@/components/Discovery";
import AvailabilityEditor from "@/components/AvailabilityEditor";

export default function NewVisitPage() {
  const { isHcp, currentUser } = useStore();
  if (!currentUser) return null;
  return isHcp ? <AvailabilityEditor /> : <Discovery />;
}
