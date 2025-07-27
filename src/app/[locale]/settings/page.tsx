import ThemeSwitch from "@/components/settings/ThemeSwitch";
import {
  SvgBeakerMini,
  SvgCameraMini,
  SvgChevronRight,
  SvgQuestionMarkCircleMini,
  SvgSparklesMini,
} from "@/components/icon/svgs";
import { Link, localeIntl } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";
import HideCardImageToggle from "@/components/settings/HideCardImageToggle";
import packageJson from "../../../../package.json";
import { NextIntlClientProvider } from "next-intl";
import SettingsContent from "@/components/settings/SettingsContent";

const SettingsPage = async (
  props: Readonly<{
    params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
  }>
) => {
  const params = await props.params;

  const { locale } = params;
  setRequestLocale(locale);

  return (
    <section className="w-full h-full">
      <main className="w-full h-full p-2 overflow-y-auto overflow-x-hidden scroll-smooth">
        <NextIntlClientProvider>
          <SettingsContent />
        </NextIntlClientProvider>
      </main>
    </section>
  );
};

export default SettingsPage;
