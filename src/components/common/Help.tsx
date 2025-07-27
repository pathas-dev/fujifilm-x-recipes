'use client';

import { useRouter } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const STORAGE_HELP_CLICKED_KEY = 'helpClicked';

const Help = () => {
  const [helpClicked, setHelpClicked] = useState(false);

  const router = useRouter();

  const visit = () => {
    localStorage.setItem(STORAGE_HELP_CLICKED_KEY, 'true');
  };

  const handleToUpButton = () => {
    visit();
    setHelpClicked(true);
    router.push('/guide');
  };

  useEffect(() => {
    const storedHelpClicked = localStorage.getItem(STORAGE_HELP_CLICKED_KEY);
    if (!!storedHelpClicked) setHelpClicked(true);
  }, []);

  if (helpClicked) return null;

  return (
    <motion.button
      className="btn btn-info btn-circle btn-sm md:btn-md fixed right-6 bottom-32 z-[999] shadow-md md:bottom-20"
      onClick={handleToUpButton}
      transition={{ duration: 0.4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileTap={{ scale: 0.9 }}
    >
      ?
    </motion.button>
  );
};

export default Help;
