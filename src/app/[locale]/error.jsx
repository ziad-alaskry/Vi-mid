"use client";

import { useTranslations } from "next-intl";
import { EmptyState, Button } from "@/components/ui";
import { Icon } from "@/components/icons";

export default function Error({ reset }) {
  const t = useTranslations("common");
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <EmptyState icon="x" title={t("errorTitle")} hint={t("errorHint")} titleAs="h1" />
      <Button variant="soft" onClick={() => reset()}>
        <Icon name="refresh" size={18} /> {t("tryAgain")}
      </Button>
    </div>
  );
}
