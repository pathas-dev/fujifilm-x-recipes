'use client';

import { usePathname, useRouter } from '@/navigation';
import { useCallback, useMemo } from 'react';
import {
  SvgBookmarkMicro,
  SvgCameraMicro,
  SvgPencilSquareMicro,
  SvgPhotoMicro,
  SvgSparklesMicro,
  SvgVariableMicro,
} from '../icon/svgs';

interface INavigationProps {
  titles: {
    bookmarks: string;
    recipes: string;
    origins: string;
    cameras: string;
    custom: string;
  };
}

const Navigation = ({ titles }: INavigationProps) => {
  const buttonProps: INavButtonProps[] = [
    {
      title: titles.bookmarks,
      children: <SvgBookmarkMicro />,
      path: '/bookmarks',
    },
    {
      title: titles.recipes,
      children: <SvgPhotoMicro />,
      path: '/recipes',
    },
    {
      title: titles.custom,
      children: <SvgVariableMicro />,
      path: '/',
    },
    {
      title: titles.cameras,
      children: <SvgCameraMicro />,
      path: '/cameras',
    },
    {
      title: titles.origins,
      children: <SvgSparklesMicro />,
      path: '/origins',
    },
  ];

  return (
    <nav className="btm-nav btm-nav-sm w-10/12 shadow-2xl rounded-xl mx-auto bottom-3 z-[9999]">
      {buttonProps.map((buttonProp) => (
        <NavButton
          title={buttonProp.title}
          key={buttonProp.path}
          path={buttonProp.path}
        >
          {buttonProp.children}
        </NavButton>
      ))}
    </nav>
  );
};

interface INavButtonProps {
  children: React.ReactElement;
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
    () => (currentPath === path ? 'active' : ''),
    [path, currentPath]
  );

  return (
    <button className={activeClassName} onClick={handleClick}>
      {children}
      <span className="btm-nav-label">{title}</span>
    </button>
  );
};

export default Navigation;
