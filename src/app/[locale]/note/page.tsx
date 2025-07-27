import { localeIntl } from '@/i18n/navigation';
import KoNote from './ko.note.mdx';
import EnNote from './en.note.mdx';
import 'github-markdown-css';
import GuidePageWrapper from '@/components/guide/GuidePageWrapper';
import { setRequestLocale } from 'next-intl/server';

const NotePage = async (
  props: Readonly<{
    params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
  }>
) => {
  const params = await props.params;

  const { locale } = params;
  setRequestLocale(locale);

  const manualMdx = {
    [localeIntl.ko]: <KoNote />,
    [localeIntl.en]: <EnNote />,
  };

  return <GuidePageWrapper>{manualMdx[locale] ?? <EnNote />}</GuidePageWrapper>;
};

export default NotePage;
