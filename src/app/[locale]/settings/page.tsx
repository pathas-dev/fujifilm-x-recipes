import ThemeSwitch from '@/components/common/ThemeSwitch';
import {
  SvgChevronRight,
  SvgQuestionMarkCircleMini,
  SvgSparklesMini,
} from '@/components/icon/svgs';
import { Link, localeIntl } from '@/navigation';
import { SettingsPageMessages } from '@/types/language';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

const SettingsPage = async ({
  params: { locale },
}: Readonly<{
  params: { locale: (typeof localeIntl)[keyof typeof localeIntl] };
}>) => {
  unstable_setRequestLocale(locale);

  const tSettingsPage = await getTranslations('SettingsPage');

  const settingsPageMessages: SettingsPageMessages = {
    title: tSettingsPage('title'),
    originsPage: tSettingsPage('originsPage'),
    guidePage: tSettingsPage('guidePage'),
  };

  const pages: Array<{
    href: string;
    icon: React.ReactElement;
    label: string;
  }> = [
    {
      href: '/origins',
      icon: <SvgSparklesMini />,
      label: settingsPageMessages.originsPage,
    },
    {
      href: '/guide',
      icon: <SvgQuestionMarkCircleMini />,
      label: settingsPageMessages.guidePage,
    },
  ];

  return (
    <section className="w-full h-full">
      <main className="w-full h-full p-2 overflow-y-auto overflow-x-hidden scroll-smooth">
        <ul className="menu menu-lg h-full bg-base-200 w-full rounded-box">
          <li className="menu-title">{settingsPageMessages.title}</li>
          {pages.map((page) => (
            <li key={page.href}>
              <Link href={page.href}>
                {page.icon}
                {page.label}
                <SvgChevronRight />
              </Link>
            </li>
          ))}
          <li>
            <div>
              <ThemeSwitch />
            </div>
          </li>
        </ul>
      </main>
    </section>
  );
};

export default SettingsPage;
