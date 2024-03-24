'use client';

import { useRouter } from '@/navigation';
import { motion } from 'framer-motion';

const Help = () => {
  const router = useRouter();

  const handleToUpButton = () => {
    router.push('/guide');
  };

  return (
    <motion.button
      className="fixed z-[999] btn bottom-20 md:bottom-6 right-6 btn-info btn-circle btn-sm md:btn-md  shadow-md"
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
