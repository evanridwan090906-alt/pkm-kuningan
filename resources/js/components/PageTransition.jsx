import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    x: 100,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: {
    opacity: 0,
    x: -100,
    scale: 0.95,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

const PageTransition = ({ children }) => {
  return (
    <div className="w-full h-full overflow-hidden">
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default PageTransition;
