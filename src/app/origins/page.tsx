import { SvgFilmMicro } from '@/components/icon/svgs';
import { Origin } from '@/types/api';
import Link from 'next/link';
import { getAllDocuments } from '../api/mongodb';
import dayjs from 'dayjs';

const getOrigins = async (): Promise<{
  origins: Origin[];
}> => {
  try {
    const data = await getAllDocuments('origins');
    const origins = JSON.parse(JSON.stringify(data)) as Origin[];
    return {
      origins,
    };
  } catch (error) {
    console.log(error);
    throw new Error('Origins data request failed');
  }
};

const HPCHAVAZ_BLOG_URL = 'https://hpchavaz-photography.blogspot.com/';
const MY_BLOG_URL = 'https://pathas1126.tistory.com/';

const Origins = async () => {
  const { origins } = await getOrigins();
  return (
    <main>
      <ul className="steps steps-vertical ml-2">
        {origins.map((origin) => (
          <li key={origin._id} data-content="★" className="step step-neutral">
            <Link
              id={origin.name}
              href={origin.url ?? HPCHAVAZ_BLOG_URL}
              className="link link-hover link-primary flex"
              target="_blank"
            >
              <h2>{origin.name}</h2>
              <div className="ml-1 mt-1 flex items-center">
                <SvgFilmMicro />
                <span className="text-xs">
                  X{origin.count} (
                  {dayjs(origin.firstPublication).format('YYYYMMDD')}_
                  {dayjs(origin.lastPublication).format('YYYYMMDD')})
                </span>
              </div>
            </Link>
          </li>
        ))}
        <li data-content="♠" className="step step-neutral">
          <Link
            href={HPCHAVAZ_BLOG_URL}
            className="link link-hover link-primary"
            target="_blank"
          >
            Maintained By Henri-Pierre Chavaz
          </Link>
        </li>
        <li data-content="♣" className="step step-neutral">
          <Link
            href={MY_BLOG_URL}
            className="link link-hover link-primary"
            target="_blank"
          >
            Developed By pathas
          </Link>
        </li>
      </ul>
    </main>
  );
};

export default Origins;
