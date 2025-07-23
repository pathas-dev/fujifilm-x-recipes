import ThemeSwitch from "@/components/settings/ThemeSwitch";
import {
  SvgBeakerMini,
  SvgCameraMini,
  SvgChevronRight,
  SvgQuestionMarkCircleMini,
  SvgSparklesMini,
} from "@/components/icon/svgs";
import { Link, localeIntl } from "@/i18n/navigation";
import { SettingsPageMessages } from "@/types/language";
import { getTranslations, setRequestLocale } from "next-intl/server";
import HideCardImageToggle from "@/components/settings/HideCardImageToggle";
import packageJson from "../../../../package.json";

const SettingsPage = async (
  props: Readonly<{
    params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
  }>
) => {
  const params = await props.params;

  const { locale } = params;
  setRequestLocale(locale);

  const tSettingsPage = await getTranslations("SettingsPage");

  const settingsPageMessages: SettingsPageMessages = {
    title: tSettingsPage("title"),
    originsPage: tSettingsPage("originsPage"),
    guidePage: tSettingsPage("guidePage"),
    notePage: tSettingsPage("notePage"),
    camerasPage: tSettingsPage("camerasPage"),
    hideCardImage: tSettingsPage("hideCardImage"),
  };

  const pages: Array<{
    href: string;
    icon: React.ReactElement<any>;
    label: string;
  }> = [
    {
      href: "/origins",
      icon: <SvgSparklesMini />,
      label: settingsPageMessages.originsPage,
    },
    {
      href: "/cameras",
      icon: <SvgCameraMini />,
      label: settingsPageMessages.camerasPage,
    },
    {
      href: "/guide",
      icon: <SvgQuestionMarkCircleMini />,
      label: settingsPageMessages.guidePage,
    },
    {
      href: "/note",
      icon: <SvgBeakerMini />,
      label: settingsPageMessages.notePage,
    },
  ];

  return (
    <section className="w-full h-full">
      <main className="w-full h-full p-2 overflow-y-auto overflow-x-hidden scroll-smooth">
        <ul className="menu menu-lg h-full bg-base-200 w-full rounded-box">
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
            <HideCardImageToggle label={settingsPageMessages.hideCardImage} />
          </li>
          <li>
            <ThemeSwitch />
          </li>
        </ul>
      </main>
    </section>
  );
};

export default SettingsPage;
