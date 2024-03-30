import { localeIntl } from '@/navigation';
import KoNote from './ko.note.mdx';
import EnNote from './en.note.mdx';
import 'github-markdown-css';
import GuidePageWrapper from '@/components/guide/GuidePageWrapper';

const NotePage = ({
  params: { locale },
}: Readonly<{
  params: { locale: (typeof localeIntl)[keyof typeof localeIntl] };
}>) => {
  const manualMdx = {
    [localeIntl.ko]: <KoNote />,
    [localeIntl.en]: <EnNote />,
  };

  return <GuidePageWrapper>{manualMdx[locale] ?? <EnNote />}</GuidePageWrapper>;
};

export default NotePage;
