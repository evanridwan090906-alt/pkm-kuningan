/**
 * StudentContext — Realtime Student Data Sync
 *
 * Provides live-synced student list to both Admin and Petugas portals.
 * Uses smart polling (every 8s) + an ETag hash check to avoid redundant re-renders.
 * jurusanList & angkatanList are fetched from ALL students (no filter) so the
 * dropdowns always reflect the actual data in the database in realtime.
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api';

const POLL_INTERVAL = 8_000; // 8 seconds

const StudentContext = createContext({
  students: [],
  meta: {},
  loading: true,
  params: {},
  jurusanList: [],
  angkatanList: [],
  setParams: () => {},
  refreshStudents: async () => {},
});

export function useStudents() {
  return useContext(StudentContext);
}

export function StudentProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({ page: 1, search: '', jurusan: '', angkatan: '' });

  // Dynamic unique lists — always from ALL students (no filter applied)
  const [jurusanList, setJurusanList] = useState([]);
  const [angkatanList, setAngkatanList] = useState([]);

  const etag = useRef(null);
  const allEtag = useRef(null);
  const isMounted = useRef(true);

  // Fetch all students (no filter) just to build the jurusan/angkatan dropdown lists
  const fetchAllForLists = useCallback(async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || !['admin', 'petugas'].includes(user.role)) return;
    try {
      const res = await api.get('/students', { params: { page: 1, per_page: 9999 } });
      if (!isMounted.current) return;

      const all = res.data.data?.data || [];
      const key = all.map(s => `${s.id}:${s.jurusan}:${s.angkatan}`).join(',');
      if (key === allEtag.current) return; // nothing changed
      allEtag.current = key;

      const jurusans = [...new Set(all.map(s => s.jurusan).filter(Boolean))].sort();
      const angkatans = [...new Set(all.map(s => s.angkatan).filter(Boolean))].sort((a, b) => b - a);

      setJurusanList(jurusans);
      setAngkatanList(angkatans);
    } catch {
      // silently fail
    }
  }, []);

  // Fetch paginated/filtered students for the table
  const fetchStudents = useCallback(async (silent = false) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || !['admin', 'petugas'].includes(user.role)) {
      if (!silent) setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const queryParams = {};
      if (params.page) queryParams.page = params.page;
      if (params.search) queryParams.search = params.search;
      if (params.jurusan) queryParams.jurusan = params.jurusan;
      if (params.angkatan) queryParams.angkatan = params.angkatan;

      const res = await api.get('/students', { params: queryParams });
      if (!isMounted.current) return;

      const d = res.data.data;
      const incoming = d.data || [];
      const key = JSON.stringify(incoming.map(s => `${s.id}:${s.updated_at}:${s.is_active}`));

      if (!silent || key !== etag.current) {
        etag.current = key;
        setStudents(incoming);
        setMeta(d);
      }
    } catch {
      // silently fail on polling errors
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [params]);

  // Re-fetch when params change
  useEffect(() => {
    fetchStudents(false);
  }, [fetchStudents]);

  // Initial dropdown lists fetch
  useEffect(() => {
    fetchAllForLists();
  }, [fetchAllForLists]);

  // Background polling — both table data AND dropdown lists
  useEffect(() => {
    const timer = setInterval(() => {
      fetchStudents(true);
      fetchAllForLists();
    }, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchStudents, fetchAllForLists]);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const refreshStudents = useCallback(() => {
    fetchStudents(false);
    fetchAllForLists();
  }, [fetchStudents, fetchAllForLists]);

  return (
    <StudentContext.Provider value={{
      students,
      meta,
      loading,
      params,
      jurusanList,
      angkatanList,
      setParams,
      refreshStudents,
    }}>
      {children}
    </StudentContext.Provider>
  );
}
