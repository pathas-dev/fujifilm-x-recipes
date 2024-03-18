import { getOrigins } from '@/app/api/data/localData';
import OriginList from '@/components/origin/OriginList';
import { localeIntl } from '@/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';

const Origins = async ({
  params: { locale },
}: Readonly<{
  params: { locale: (typeof localeIntl)[keyof typeof localeIntl] };
}>) => {
  unstable_setRequestLocale(locale);

  const { origins } = await getOrigins();

  return <OriginList origins={origins} />;
};

export default Origins;
