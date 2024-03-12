import camearsData from '@/app/api/data/cameras.json';
import CameraList from '@/components/camera/CameraList';
import { localeIntl } from '@/i18n';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

const Cameras = async ({
  params: { locale },
}: Readonly<{
  params: { locale: (typeof localeIntl)[keyof typeof localeIntl] };
}>) => {
  unstable_setRequestLocale(locale);

  const t = await getTranslations('Cameras');

  const title = t('badgesTitle');

  return <CameraList cameras={camearsData.cameras} title={title} />;
};

export default Cameras;
