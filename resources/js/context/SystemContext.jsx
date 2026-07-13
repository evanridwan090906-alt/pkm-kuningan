/**
 * SystemContext — Global Realtime System Settings Sync
 *
 * Provides live-updated system settings (logo, app_name, school_name, primary_color)
 * to all components in the tree. Polls /api/public/settings every 10 seconds so
 * any change made by the admin is reflected across all portals without a page reload.
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';

const POLL_INTERVAL = 10_000; // 10 seconds

const SystemContext = createContext({
  system: {
    app_name: 'CASPER Smart Library',
    school_name: 'SMK PERTIWI KUNINGAN',
    logo: null,
    primary_color: '#2563EB',
    address: '',
  },
  refreshSystem: async () => {},
});

export function useSystem() {
  return useContext(SystemContext);
}

export function SystemProvider({ children }) {
  const [system, setSystem] = useState(() => {
    // Seed from localStorage cache for instant first render
    try {
      const cached = localStorage.getItem('__system_settings__');
      return cached ? JSON.parse(cached) : {
        app_name: 'CASPER Smart Library',
        school_name: 'SMK PERTIWI KUNINGAN',
        logo: null,
        primary_color: '#2563EB',
        address: '',
      };
    } catch {
      return {
        app_name: 'CASPER Smart Library',
        school_name: 'SMK PERTIWI KUNINGAN',
        logo: null,
        primary_color: '#2563EB',
        address: '',
      };
    }
  });

  const etag = useRef(null); // track last known state to avoid redundant re-renders

  const fetchSystem = useCallback(async () => {
    try {
      const res = await api.get('/public/settings');
      const incoming = res.data?.system;
      if (!incoming) return;

      const key = JSON.stringify(incoming);
      if (key === etag.current) return; // nothing changed — skip re-render
      etag.current = key;

      setSystem(incoming);
      localStorage.setItem('__system_settings__', JSON.stringify(incoming));
    } catch {
      // silently fail — keep showing cached/previous values
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchSystem();
    const timer = setInterval(fetchSystem, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchSystem]);

  // Apply primary_color as CSS variable globally
  useEffect(() => {
    if (system.primary_color) {
      document.documentElement.style.setProperty('--color-primary', system.primary_color);
    }
  }, [system.primary_color]);

  return (
    <SystemContext.Provider value={{ system, refreshSystem: fetchSystem }}>
      {children}
    </SystemContext.Provider>
  );
}
