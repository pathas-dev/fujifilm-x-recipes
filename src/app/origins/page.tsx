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
const MY_BLOG_URL = 'https://pathas.tistory.com/';

const Origins = async () => {
  const { origins } = await getOrigins();
  return (
    <main className="w-full verflow-hidden whitespace-nowrap text-ellipsis">
      <ul className="steps steps-vertical w-full p-2">
        {origins.map((origin) => (
          <li
            key={origin._id}
            data-content="★"
            className="step step-neutral w-full"
          >
            <div className="indicator">
              <div
                className="tooltip tooltip-bottom"
                data-tip={`${dayjs(origin.firstPublication).format('YYYYMMDD')}~
                      ${dayjs(origin.lastPublication).format('YYYYMMDD')}`}
              >
                <span className="indicator-item badge badge-outline border-none text-xs text-accent">
                  <SvgFilmMicro />
                  {isNaN(Number(origin.count)) ? '' : `x${origin.count}`}
                </span>
                <Link
                  id={origin.name}
                  href={origin.url ?? HPCHAVAZ_BLOG_URL}
                  className="link link-hover link-primary flex"
                  target="_blank"
                >
                  {origin.name}
                </Link>
              </div>
            </div>
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
