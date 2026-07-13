import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { SystemProvider } from './context/SystemContext';
import { StudentProvider } from './context/StudentContext';
import { TransitionProvider, useTransition } from './context/TransitionContext';
import LoginAdmin from './pages/LoginAdmin';
import LoginPetugas from './pages/LoginPetugas';
import LoginSiswa from './pages/LoginSiswa';
import Setup from './pages/Setup';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminBooks from './pages/admin/Books';
import AdminEbooks from './pages/admin/Ebooks';
import AdminStudents from './pages/admin/Students';
import AdminUsers from './pages/admin/Users';
import AdminCategories from './pages/admin/Categories';
import AdminRacks from './pages/admin/Racks';
import AdminArchives from './pages/admin/Archives';
import AdminSettings from './pages/admin/Settings';
import AdminStockIn from './pages/admin/StockIn';
import AdminStockOut from './pages/admin/StockOut';
import AdminBorrowManagement from './pages/admin/BorrowManagement';
import Reports from './pages/shared/Reports';

// Petugas Pages
import PetugasDashboard from './pages/staff/Dashboard';
import PetugasBorrowManagement from './pages/staff/BorrowManagement';
import PetugasTransactions from './pages/staff/Transactions';
import PetugasBooks from './pages/staff/Books';
import PetugasStudents from './pages/staff/Students';
import PetugasArchives from './pages/staff/Archives';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentEbooks from './pages/student/Ebooks';
import StudentBorrow from './pages/student/BorrowBooks';
import StudentHistory from './pages/student/MyHistory';
import StudentFavorites from './pages/student/Favorites';

import AdminLayout from './components/AdminLayout';
import PetugasLayout from './components/PetugasLayout';
import StudentLayout from './components/StudentLayout';
import api from './api';

// ─── Page variants per transition direction ───────────────────────────────────
const pageVariants = {
  left: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -100 },
  },
  right: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: 100 },
  },
  split: { // Admin now also uses a slide or fade
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -100 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit:    { opacity: 0 },
  },
};

const pageTransition = { duration: 0.9, ease: [0.4, 0, 0.2, 1] };

// ─── Thin Progress Bar ────────────────────────────────────────────────────────
function TopProgressBar({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[200] h-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 origin-left"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 0.92, opacity: 1 }}
          exit={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  );
}

// ─── Animated Page Wrapper ────────────────────────────────────────────────────
function AnimatedPage({ children, variantKey = 'fade' }) {
  const v = pageVariants[variantKey] || pageVariants.fade;
  return (
    <motion.div
      initial={v.initial}
      animate={v.animate}
      exit={v.exit}
      transition={pageTransition}
      className="w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
}

// ─── Protected Route ──────────────────────────────────────────────────────────
function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    if (location.pathname.startsWith('/admin')) return <Navigate to="/login/admin" state={{ from: location }} replace />;
    if (location.pathname.startsWith('/petugas')) return <Navigate to="/login/petugas" state={{ from: location }} replace />;
    if (location.pathname.startsWith('/siswa')) return <Navigate to="/login/siswa" state={{ from: location }} replace />;
    return <Navigate to="/login/siswa" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'siswa') return <Navigate to="/siswa/dashboard" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'petugas') return <Navigate to="/petugas/dashboard" replace />;
    return <Navigate to="/login/siswa" replace />;
  }

  return children;
}

// ─── Route Variant Resolver ───────────────────────────────────────────────────
function getVariant(pathname) {
  if (pathname.startsWith('/login/siswa'))    return 'left';
  if (pathname.startsWith('/login/petugas'))  return 'right';
  if (pathname.startsWith('/login/admin'))    return 'split';
  if (pathname.startsWith('/admin'))          return 'split';
  if (pathname.startsWith('/petugas'))        return 'right';
  if (pathname.startsWith('/siswa'))          return 'left';
  return 'fade';
}

// ─── Basic Routes ─────────────────────────────────────────────────────────────
function BasicRoutes({ status }) {
  const location = useLocation();
  const { isTransitioning } = useTransition();
  const variantKey = getVariant(location.pathname);

  return (
    <>
      <TopProgressBar active={isTransitioning} />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {status === 'setup' ? (
            <>
              <Route path="/setup" element={<AnimatedPage variantKey="fade"><Setup /></AnimatedPage>} />
              <Route path="*" element={<Navigate to="/setup" replace />} />
            </>
          ) : (
            <>
              {/* Default Redirects */}
              <Route path="/" element={<Navigate to="/login/siswa" replace />} />
              <Route path="/login" element={<Navigate to="/login/siswa" replace />} />
              <Route path="/setup" element={<Navigate to="/login/admin" replace />} />
              
              {/* Login Routes */}
              <Route path="/login/admin"   element={<AnimatedPage variantKey="split"><LoginAdmin /></AnimatedPage>} />
              <Route path="/login/petugas" element={<AnimatedPage variantKey="right"><LoginPetugas /></AnimatedPage>} />
              <Route path="/login/siswa"   element={<AnimatedPage variantKey="left"><LoginSiswa /></AnimatedPage>} />
              
              {/* ADMIN Routes */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="books" element={<AdminBooks />} />
                <Route path="ebooks" element={<AdminEbooks />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="racks" element={<AdminRacks />} />
                <Route path="archives" element={<AdminArchives />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="stock-in" element={<AdminStockIn />} />
                <Route path="stock-out" element={<AdminStockOut />} />
                <Route path="borrow-management" element={<AdminBorrowManagement />} />
                <Route path="reports" element={<Reports />} />
              </Route>

              {/* PETUGAS Routes */}
              <Route path="/petugas" element={
                <ProtectedRoute allowedRoles={['petugas', 'admin']}>
                  <PetugasLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<PetugasDashboard />} />
                <Route path="transactions" element={<PetugasBorrowManagement />} />
                <Route path="scan" element={<PetugasTransactions />} />
                <Route path="books" element={<PetugasBooks />} />
                <Route path="ebooks" element={<AdminEbooks />} />
                <Route path="students" element={<PetugasStudents />} />
                <Route path="archives" element={<PetugasArchives />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* SISWA Routes */}
              <Route path="/siswa" element={
                <ProtectedRoute allowedRoles={['siswa']}>
                  <StudentLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="ebooks" element={<StudentEbooks />} />
                <Route path="borrow" element={<StudentBorrow />} />
                <Route path="my-history" element={<StudentHistory />} />
                <Route path="history-full" element={<StudentHistory />} />
                <Route path="favorites" element={<StudentFavorites />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              <Route path="*" element={<Navigate to="/login/siswa" replace />} />
            </>
          )}
        </Routes>
      </AnimatePresence>
    </>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function AppRouter() {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const check = async () => {
      try {
        const setupRes = await api.get('/check-setup');
        if (setupRes.data.setup_required) {
          setStatus('setup');
          return;
        }
        const token = localStorage.getItem('token');
        if (token) {
          try { await api.get('/me'); }
          catch (err) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
        setStatus('ready');
      } catch (err) {
        setStatus('ready');
      }
    };
    check();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500">Memuat Sistem...</p>
      </div>
    );
  }

  return (
    <SystemProvider>
      <StudentProvider>
        <TransitionProvider>
          <BrowserRouter>
            <Toaster position="top-center" reverseOrder={false} toastOptions={{ style: { zIndex: 9999 } }} />
            <BasicRoutes status={status} />
          </BrowserRouter>
        </TransitionProvider>
      </StudentProvider>
    </SystemProvider>
  );
}
