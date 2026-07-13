import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Swal from 'sweetalert2';

export default function AutoLogout({ minutes }) {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  
  // Convert minutes to milliseconds
  const timeoutMs = minutes * 60 * 1000;

  const handleLogout = async (reason = 'inactivity') => {
    try {
      await api.post('/logout');
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (reason === 'inactivity') {
        Swal.fire({
          title: 'Sesi Berakhir',
          text: 'Anda telah otomatis keluar karena tidak ada aktivitas selama ' + minutes + ' menit.',
          icon: 'info',
          confirmButtonText: 'Login Kembali'
        }).then(() => {
          navigate('/login');
        });
      } else {
        navigate('/login');
      }
    }
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (minutes > 0) {
      timerRef.current = setTimeout(() => {
        handleLogout('inactivity');
      }, timeoutMs);
    }
  };

  useEffect(() => {
    if (minutes <= 0) return;

    const events = [
      'mousedown', 'mousemove', 'keypress', 
      'scroll', 'touchstart', 'click'
    ];

    // Initial timer start
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [minutes]);

  return null; // This component doesn't render anything
}
