import ThemeSwitch from '@/components/settings/ThemeSwitch';
import {
  SvgBeakerMini,
  SvgCameraMini,
  SvgChevronRight,
  SvgQuestionMarkCircleMini,
  SvgSparklesMini,
} from '@/components/icon/svgs';
import { Link, localeIntl } from '@/i18n/navigation';
import { setRequestLocale } from 'next-intl/server';
import HideCardImageToggle from '@/components/settings/HideCardImageToggle';
import packageJson from '../../../../package.json';
import { NextIntlClientProvider } from 'next-intl';
import SettingsContent from '@/components/settings/SettingsContent';

const SettingsPage = async (
  props: Readonly<{
    params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
  }>
) => {
  const params = await props.params;

  const { locale } = params;
  setRequestLocale(locale);

  return (
    <section className="h-full w-full">
      <main className="h-full w-full overflow-x-hidden overflow-y-auto scroll-smooth p-2">
        <NextIntlClientProvider>
          <SettingsContent />
        </NextIntlClientProvider>
      </main>
    </section>
  );
};

export default SettingsPage;
