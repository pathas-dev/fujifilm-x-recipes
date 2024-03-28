import { localeIntl } from '@/navigation';
import KoGuide from './ko.guide.mdx';
import EnGuide from './en.guide.mdx';
import 'github-markdown-css';
import GuidePageWrapper from '@/components/guide/GuidePageWrapper';

const GuidePage = ({
  params: { locale },
}: Readonly<{
  params: { locale: (typeof localeIntl)[keyof typeof localeIntl] };
}>) => {
  const manualMdx = {
    [localeIntl.ko]: <KoGuide />,
    [localeIntl.en]: <EnGuide />,
  };

  return (
    <GuidePageWrapper>{manualMdx[locale] ?? <EnGuide />}</GuidePageWrapper>
  );
};

export default GuidePage;
