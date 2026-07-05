"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { EmptyState, Button } from "@/components/ui";

export default function NotFound() {
  const t = useTranslations("common");
  const router = useRouter();
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <EmptyState icon="search" title={t("notFoundTitle")} hint={t("notFoundHint")} />
      <Button variant="soft" onClick={() => router.push("/")}>{t("backHome")}</Button>
    </div>
  );
}
