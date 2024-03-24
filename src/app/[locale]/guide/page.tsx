import { localeIntl } from '@/navigation';
import KoGuide from './ko.guide.mdx';
import EnGuide from './en.guide.mdx';
import FrGuide from './fr.guide.mdx';
import 'github-markdown-css';

const ManualPage = ({
  params: { locale },
}: Readonly<{
  params: { locale: (typeof localeIntl)[keyof typeof localeIntl] };
}>) => {
  const manualMdx = {
    [localeIntl.ko]: <KoGuide />,
    [localeIntl.en]: <EnGuide />,
    [localeIntl.fr]: <FrGuide />,
  };

  return (
    <main className="w-full h-full bg-base-100 p-3 overflow-y-auto scroll-smooth">
      <div className="markdown-body rounded-lg p-3">
        {manualMdx[locale] ?? <EnGuide />}
      </div>
    </main>
  );
};

export default ManualPage;
