'use client';

import { Link } from '@/navigation';
import { Origin } from '@/types/api';
import dayjs from 'dayjs';
import { SvgFilmMicro } from '../icon/svgs';
import { motion } from 'framer-motion';

const HPCHAVAZ_BLOG_URL = 'https://hpchavaz-photography.blogspot.com/';
const MY_BLOG_URL = 'https://pathas.tistory.com/';

interface IOriginListProps {
  origins: Origin[];
}

const OriginList = ({ origins }: IOriginListProps) => {
  return (
    <main className="w-full h-full pb-16 overflow-auto whitespace-nowrap text-ellipsis scroll-smooth">
      <motion.ul
        className="steps steps-vertical w-full p-2"
        transition={{ duration: 0.4 }}
        initial={{ opacity: 0.3, translateX: '-150%' }}
        animate={{ opacity: 1, translateX: '0%' }}
      >
        <li data-content="♠" className="step step-neutral">
          <Link
            href={HPCHAVAZ_BLOG_URL}
            className="link link-hover link-primary"
            target="_blank"
          >
            Maintained By @Henri-Pierre Chavaz
          </Link>
        </li>
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

        <li data-content="♣" className="step step-neutral">
          <Link
            href={MY_BLOG_URL}
            className="link link-hover link-primary"
            target="_blank"
          >
            Developed by pathas
          </Link>
        </li>
      </motion.ul>
    </main>
  );
};

export default OriginList;
