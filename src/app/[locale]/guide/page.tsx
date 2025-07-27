import { localeIntl } from '@/i18n/navigation';
import KoGuide from './ko.guide.mdx';
import EnGuide from './en.guide.mdx';
import 'github-markdown-css';
import GuidePageWrapper from '@/components/guide/GuidePageWrapper';
import { setRequestLocale } from 'next-intl/server';

const GuidePage = async (
  props: Readonly<{
    params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
  }>
) => {
  const params = await props.params;

  const { locale } = params;
  setRequestLocale(locale);

  const manualMdx = {
    [localeIntl.ko]: <KoGuide />,
    [localeIntl.en]: <EnGuide />,
  };

  return (
    <GuidePageWrapper>{manualMdx[locale] ?? <EnGuide />}</GuidePageWrapper>
  );
};

export default GuidePage;
