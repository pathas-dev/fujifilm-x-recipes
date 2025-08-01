'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { NavigationTitleMessages } from '@/types/language';
import { motion } from 'framer-motion';
import { useCallback, useMemo } from 'react';
import {
  SvgBookmarkMini,
  SvgCogMini,
  SvgPhotoMini,
  SvgVariableMini,
} from '../icon/svgs';

interface INavigationProps {
  titles: NavigationTitleMessages;
}

const NavigationBottom = ({ titles }: INavigationProps) => {
  const buttonProps: INavButtonProps[] = [
    {
      title: titles.bookmarks,
      children: <SvgBookmarkMini />,
      path: '/bookmarks',
    },
    {
      title: titles.recipes,
      children: <SvgPhotoMini />,
      path: '/recipes',
    },
    {
      title: titles.chatbot,
      children: <span>🤖</span>,
      path: '/',
    },
    {
      title: titles.custom,
      children: <SvgVariableMini />,
      path: '/custom',
    },
    {
      title: titles.settings,
      children: <SvgCogMini />,
      path: '/settings',
    },
  ];

  return (
    <motion.nav
      transition={{ duration: 0.4 }}
      initial={{ opacity: 0.3, translateY: '150%' }}
      animate={{ opacity: 1, translateY: '0%' }}
      className="dock relative z-50 w-full md:hidden"
    >
      {buttonProps.map((buttonProp) => (
        <NavButton
          title={buttonProp.title}
          key={buttonProp.path}
          path={buttonProp.path}
        >
          {buttonProp.children}
        </NavButton>
      ))}
    </motion.nav>
  );
};

interface INavButtonProps {
  children: React.ReactElement<any>;
  title: string;
  path: string;
}

const NavButton = ({ children, title, path }: INavButtonProps) => {
  const router = useRouter();
  const currentPath = usePathname();

  const handleClick = useCallback(() => {
    router.push(path);
  }, [path, router]);

  const activeClassName = useMemo(
    () => (currentPath === path ? 'active text-primary' : ''),
    [path, currentPath]
  );

  return (
    <motion.button
      className={activeClassName}
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
    >
      {children}
      <span className="btm-nav-label text-xs">{title}</span>
    </motion.button>
  );
};

export default NavigationBottom;
