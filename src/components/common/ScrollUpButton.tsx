'use client';

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'framer-motion';
import { RefObject, useState } from 'react';
import { SvgArrowUpSolid } from '../icon/svgs';

interface IScrollUpButtonProps {
  refObject: RefObject<HTMLElement | null> | undefined;
}

const ScrollUpButton = ({ refObject }: IScrollUpButtonProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleToUpButton = () => {
    refObject?.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { scrollY } = useScroll({ container: refObject, layoutEffect: false });

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrollPosition(latest);
  });

  return (
    <AnimatePresence>
      {scrollPosition > 0 && (
        <motion.button
          className="btn btn-accent btn-circle btn-sm md:btn-md fixed right-6 bottom-20 z-[999] fill-white shadow-md md:bottom-6"
          onClick={handleToUpButton}
          transition={{ duration: 0.4 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          whileTap={{ scale: 0.9 }}
        >
          <SvgArrowUpSolid />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollUpButton;
