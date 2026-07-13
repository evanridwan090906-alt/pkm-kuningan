import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Loader2 } from 'lucide-react';
import api from '../../api';
import SettingsSidebar from '../../components/SettingsSidebar';
import ProfileForm from '../../components/ProfileForm';
import AccountForm from '../../components/AccountForm';
import SystemForm from '../../components/SystemForm';
import NotificationSettings from '../../components/NotificationSettings';
import SecuritySettings from '../../components/SecuritySettings';
import StaffManagement from '../../components/StaffManagement';

import { useOutletContext } from 'react-router-dom';
import { useSystem } from '../../context/SystemContext';

export default function Settings() {
  const { user: globalUser, setUser: setGlobalUser, fetchSystemSettings } = useOutletContext();
  const { refreshSystem } = useSystem();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [system, setSystem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/settings');
      setGlobalUser(res.data.user);
      setSystem(res.data.system);
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 py-6 space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600">
          <SettingsIcon size={24} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Pengaturan</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1 font-medium">Kelola profil, akun, dan konfigurasi sistem perpustakaan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <SettingsSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          userRole={globalUser?.role} 
        />

        {/* Right Content */}
        <div className="lg:col-span-3 min-h-[500px]">
          {activeTab === 'profile' && (
            <ProfileForm user={globalUser} onUpdate={setGlobalUser} />
          )}
          {activeTab === 'account' && (
            <AccountForm />
          )}
          {activeTab === 'staff' && (
            <StaffManagement />
          )}
          {activeTab === 'system' && (
            <SystemForm system={system} onUpdate={(newSystem) => { setSystem(newSystem); fetchSystemSettings(); refreshSystem(); }} />
          )}
          {activeTab === 'notifications' && (
            <NotificationSettings system={system} onUpdate={(newSystem) => { setSystem(newSystem); fetchSystemSettings(); refreshSystem(); }} />
          )}
          {activeTab === 'security' && (
            <SecuritySettings system={system} onUpdate={(newSystem) => { setSystem(newSystem); fetchSystemSettings(); refreshSystem(); }} />
          )}
        </div>
      </div>
    </div>
  );
}
