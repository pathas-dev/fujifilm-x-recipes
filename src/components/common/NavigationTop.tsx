'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { NavigationTitleMessages } from '@/types/language';

interface INavigationProps {
  titles: NavigationTitleMessages;
}

const NavigationTop = ({ titles }: INavigationProps) => {
  const buttonProps: INavLinkProps[] = [
    {
      title: titles.bookmarks,
      path: '/bookmarks',
    },
    {
      title: titles.recipes,
      path: '/recipes',
    },
    {
      title: titles.chatbot,
      path: '/',
    },
    {
      title: titles.custom,
      path: '/custom',
    },
    {
      title: titles.settings,
      path: '/settings',
    },
  ];

  return (
    <nav className="navbar bg-base-100 relative z-[100] hidden h-16 w-full md:flex">
      <div className="flex-1">
        <Link className="btn btn-ghost text-xl" href="/">
          Fujifilm-X-Recipes
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          {buttonProps.map((buttonProp) => (
            <NavLink
              title={buttonProp.title}
              key={buttonProp.path}
              path={buttonProp.path}
            ></NavLink>
          ))}
        </ul>
      </div>
    </nav>
  );
};

interface INavLinkProps {
  title: string;
  path: string;
}

const NavLink = ({ title, path }: INavLinkProps) => {
  const pathname = usePathname();

  const className =
    pathname === path
      ? 'menu menu-horizontal px-1 text-primary'
      : 'menu menu-horizontal px-1';

  return (
    <li className={className}>
      <Link href={path}>{title}</Link>
    </li>
  );
};

export default NavigationTop;
