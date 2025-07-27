import SettingsContent from '@/components/settings/SettingsContent';
import { localeIntl } from '@/i18n/navigation';
import { setRequestLocale } from 'next-intl/server';

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
        <SettingsContent />
      </main>
    </section>
  );
};

export default SettingsPage;
