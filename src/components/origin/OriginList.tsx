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
  const getAnimatedText = (text: string) =>
    text.split('').map((char, index) => (
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.25,
          delay: index / 10,
        }}
        key={index}
      >
        {char}
      </motion.span>
    ));

  return (
    <main className="w-full h-full pb-16 overflow-auto whitespace-nowrap text-ellipsis scroll-smooth">
      <motion.ul
        className="steps steps-vertical w-full p-2"
        transition={{ duration: 0.4 }}
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
      >
        <li data-content="♠" className="step step-neutral">
          <Link
            href={HPCHAVAZ_BLOG_URL}
            className="link link-hover link-primary"
            target="_blank"
          >
            {getAnimatedText('Maintained By @Henri-Pierre Chavaz')}
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
                <motion.span
                  className="indicator-item badge badge-outline border-none text-xs text-accent"
                  transition={{ duration: 0.4 }}
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: 1 }}
                >
                  <SvgFilmMicro />
                  {isNaN(Number(origin.count)) ? '' : `x${origin.count}`}
                </motion.span>
                <Link
                  id={origin.name}
                  href={origin.url ?? HPCHAVAZ_BLOG_URL}
                  className="link link-hover link-primary flex"
                  target="_blank"
                >
                  {getAnimatedText(origin.name)}
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
            {getAnimatedText('Developed by pathas')}
          </Link>
        </li>
      </motion.ul>
    </main>
  );
};

export default OriginList;
