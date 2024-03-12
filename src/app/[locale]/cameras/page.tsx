import camearsData from '@/app/api/data/cameras.json';
import { Camera } from '@/types/api';

const Cameras = () => {
  return (
    <main className="w-full p-3">
      <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical mx-auto">
        {camearsData.cameras.map((camera, index) => (
          <Timeline key={camera._id} camera={camera} isLeft={index % 2 === 0} />
        ))}
      </ul>
    </main>
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
              key="simulation"
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

export default Cameras;
