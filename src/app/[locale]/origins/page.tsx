import { getOrigins } from '@/app/api/data/localData';
import OriginList from '@/components/origin/OriginList';
import { localeIntl } from '@/i18n/navigation';
import { setRequestLocale } from 'next-intl/server';

const Origins = async (
  props: Readonly<{
    params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
  }>
) => {
  const params = await props.params;

  const { locale } = params;
  setRequestLocale(locale);

  const { origins } = await getOrigins();

  return <OriginList origins={origins} />;
};

export default Origins;
