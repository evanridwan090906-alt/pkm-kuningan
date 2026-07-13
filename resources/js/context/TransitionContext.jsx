/**
 * TransitionContext — Global Page Transition Controller
 *
 * Exposes:
 *  - direction: 'left' | 'right' | 'split'
 *  - isTransitioning: boolean — drives the top progress bar
 *  - setTransition(role): triggers transition state for a given role
 *  - clearTransition(): resets after navigation completes
 */
import { createContext, useContext, useState, useCallback } from 'react';

const TransitionContext = createContext({
  direction: 'right',
  isTransitioning: false,
  setTransition: () => {},
  clearTransition: () => {},
});

export function useTransition() {
  return useContext(TransitionContext);
}

export function TransitionProvider({ children }) {
  const [direction, setDirection]           = useState('right');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const setTransition = useCallback((role) => {
    if (role === 'siswa')    setDirection('left');
    else if (role === 'petugas') setDirection('right');
    else if (role === 'admin')   setDirection('split');
    else                         setDirection('fade');
    setIsTransitioning(true);
  }, []);

  const clearTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  return (
    <TransitionContext.Provider value={{ direction, isTransitioning, setTransition, clearTransition }}>
      {children}
    </TransitionContext.Provider>
  );
}
