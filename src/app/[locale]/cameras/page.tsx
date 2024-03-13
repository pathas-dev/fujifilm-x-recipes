import camearsData from '@/app/api/data/cameras.json';
import CameraList from '@/components/camera/CameraList';
import { localeIntl } from '@/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';

const Cameras = async ({
  params: { locale },
}: Readonly<{
  params: { locale: (typeof localeIntl)[keyof typeof localeIntl] };
}>) => {
  unstable_setRequestLocale(locale);

  return <CameraList cameras={camearsData.cameras} />;
};

export default Cameras;
