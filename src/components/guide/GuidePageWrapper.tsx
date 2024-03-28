'use client';

import { useRef } from 'react';
import ScrollUpButton from '../common/ScrollUpButton';

const GuidePageWrapper = ({ children }: { children: React.ReactElement }) => {
  const refMain = useRef<HTMLDivElement>(null);

  return (
    <main
      className="w-full h-full bg-base-100 p-3 overflow-y-auto scroll-smooth"
      ref={refMain}
    >
      <div className="markdown-body rounded-lg p-3">{children}</div>
      <ScrollUpButton refObject={refMain} />
    </main>
  );
};

export default GuidePageWrapper;
