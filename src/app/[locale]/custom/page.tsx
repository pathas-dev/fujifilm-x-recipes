import { getCamerasWithFilters } from "@/app/api/data/localData";
import CustomList from "@/components/custom/CustomList";
import { localeIntl } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export default async function CustomPage(
  props: Readonly<{
    params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
  }>
) {
  const params = await props.params;

  const { locale } = params;

  setRequestLocale(locale);
  const { cameras, filters } = await getCamerasWithFilters();

  return (
    <NextIntlClientProvider>
      <CustomList
        filters={filters}
        cameras={cameras}
      />
    </NextIntlClientProvider>
  );
}
