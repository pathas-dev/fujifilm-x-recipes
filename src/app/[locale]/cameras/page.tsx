import camearsData from "@/app/api/data/cameras.json";
import CameraList from "@/components/camera/CameraList";
import { localeIntl } from "@/i18n/navigation";
import { setRequestLocale } from "next-intl/server";

const Cameras = async (
  props: Readonly<{
    params: Promise<{ locale: (typeof localeIntl)[keyof typeof localeIntl] }>;
  }>
) => {
  const params = await props.params;

  const { locale } = params;
  setRequestLocale(locale);

  return <CameraList cameras={camearsData.cameras} />;
};

export default Cameras;
