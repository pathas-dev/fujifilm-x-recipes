'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
  SvgBookmarkMini,
  SvgSparklesMini,
  SvgVariableMini,
} from '../icon/svgs';

const Navigation = () => {
  const buttonProps: INavButtonProps[] = [
    { title: 'Bookmarks', children: <SvgBookmarkMini />, path: '/bookmarks' },
    { title: 'Recipes', children: <SvgVariableMini />, path: '/' },
    { title: 'Origins', children: <SvgSparklesMini />, path: '/origins' },
  ];

  return (
    <div className="btm-nav btm-nav-sm w-9/12 shadow-2xl rounded-xl mx-auto bottom-3 z-[9999]">
      {buttonProps.map((buttonProp) => (
        <NavButton
          title={buttonProp.title}
          key={buttonProp.path}
          path={buttonProp.path}
        >
          {buttonProp.children}
        </NavButton>
      ))}
    </div>
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
