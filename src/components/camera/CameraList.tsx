'use client';

import { Camera } from '@/types/api';
import { useMemo, useState } from 'react';
import _filter from 'lodash/filter';

const SIMULATIONS = [
  'Provia',
  'Velvia',
  'Astia',
  'Prog Neg Std',
  'Prog Neg Hi',
  'Monochrome (_/Y/R/G/S)',
  'Classic Chrome',
  'Acros (_/Y/R/G)',
  'Eterna',
  'Classic Negative',
  'Eterna Bleach Bypass',
  'Nostalgic Negative',
];

interface ICameraListProps {
  cameras: Camera[];
  title: string;
}

const CameraList = ({ cameras, title }: ICameraListProps) => {
  const [simulations, setSimulations] = useState<string[]>([]);

  const filteredSimulations = useMemo(() => {
    if (simulations.length === 0) return cameras;

    return _filter(cameras, function (camera) {
      return simulations.every(
        (simulation) => camera.simulations.indexOf(simulation) >= 0
      );
    });
  }, [simulations, cameras]);

  return (
    <article className="w-full p-3">
      <div className="w-10/12">
        <h1 className="text-xl font-medium mb-1">{title}</h1>
        {SIMULATIONS.map((simulation) => {
          const isIncluded = simulations.includes(simulation);
          const buttonClassName = isIncluded
            ? 'badge badge-secondary text-base-content mx-0.5'
            : 'badge badge-outline text-base-content mx-0.5';

          return (
            <button
              className={buttonClassName}
              key={simulation}
              onClick={() => {
                if (!simulations.includes(simulation))
                  return setSimulations((prev) => [...prev, simulation]);

                setSimulations((prev) => prev.filter((v) => v !== simulation));
              }}
            >
              #{simulation}
            </button>
          );
        })}
      </div>
      <div className="divider" />
      <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical mx-auto">
        {filteredSimulations.map((camera, index) => (
          <Timeline key={camera._id} camera={camera} isLeft={index % 2 === 0} />
        ))}
      </ul>
    </article>
  );
};

interface ITimelineProps {
  camera: Camera;
  isLeft: boolean;
}

const Timeline = ({ camera, isLeft }: ITimelineProps) => {
  const contentClassName = isLeft
    ? 'timeline-start md:text-end mb-10'
    : 'timeline-end mb-10';

  return (
    <li>
      <div className="timeline-middle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div className={contentClassName}>
        <time className="font-mono italic">{camera.announced}</time>
        <h2 className="text-lg font-black">{camera.cameraType}</h2>
        <span className="text-sm">{camera.sensor}</span>
        <p>
          {camera.simulations.split(',').map((simulation) => (
            <span
              className="badge badge-primary text-base-content mx-0.5"
              key={simulation}
            >
              {simulation.trim()}
            </span>
          ))}
        </p>
      </div>
      <hr />
    </li>
  );
};

export default CameraList;
