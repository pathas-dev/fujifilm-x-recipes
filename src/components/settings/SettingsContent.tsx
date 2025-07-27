'use client';

import {
  SvgBeakerMini,
  SvgCameraMini,
  SvgChevronRight,
  SvgQuestionMarkCircleMini,
  SvgSparklesMini,
} from '@/components/icon/svgs';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import HideCardImageToggle from './HideCardImageToggle';
import ThemeSwitch from './ThemeSwitch';
import packageJson from '../../../package.json';

const SettingsContent = () => {
  const tSettingsPage = useTranslations('SettingsPage');

  const settingsPageMessages = {
    title: tSettingsPage('title'),
    originsPage: tSettingsPage('originsPage'),
    guidePage: tSettingsPage('guidePage'),
    notePage: tSettingsPage('notePage'),
    camerasPage: tSettingsPage('camerasPage'),
    hideCardImage: tSettingsPage('hideCardImage'),
  };

  const pages: Array<{
    href: string;
    icon: React.ReactElement<any>;
    label: string;
  }> = [
    {
      href: '/origins',
      icon: <SvgSparklesMini />,
      label: settingsPageMessages.originsPage,
    },
    {
      href: '/cameras',
      icon: <SvgCameraMini />,
      label: settingsPageMessages.camerasPage,
    },
    {
      href: '/guide',
      icon: <SvgQuestionMarkCircleMini />,
      label: settingsPageMessages.guidePage,
    },
    {
      href: '/note',
      icon: <SvgBeakerMini />,
      label: settingsPageMessages.notePage,
    },
  ];

  return (
    <ul className="menu menu-lg bg-base-200 rounded-box h-full w-full">
      <li className="menu-title">
        {settingsPageMessages.title}(v{packageJson.version})
      </li>
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
        <HideCardImageToggle />
      </li>
      <li>
        <ThemeSwitch />
      </li>
    </ul>
  );
};

export default SettingsContent;
