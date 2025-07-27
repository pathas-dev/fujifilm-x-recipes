'use client';

import { useRef } from 'react';
import ScrollUpButton from '../common/ScrollUpButton';

const GuidePageWrapper = ({
  children,
}: {
  children: React.ReactElement<any>;
}) => {
  const refMain = useRef<HTMLDivElement>(null);

  return (
    <main
      className="bg-base-100 h-full w-full overflow-y-auto scroll-smooth p-3"
      ref={refMain}
    >
      <div className="markdown-body rounded-lg p-3">{children}</div>
      <ScrollUpButton refObject={refMain} />
    </main>
  );
};

export default GuidePageWrapper;
