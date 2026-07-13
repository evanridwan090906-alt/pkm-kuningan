import { User, Lock, Settings as SettingsIcon, Bell, Shield, ChevronRight } from 'lucide-react';

export default function SettingsSidebar({ activeTab, setActiveTab, userRole }) {
  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'account', label: 'Akun', icon: Lock },
    { id: 'staff', label: 'Kelola Petugas', icon: Shield, adminOnly: true },
    { id: 'system', label: 'Sistem', icon: SettingsIcon, adminOnly: true },
    { id: 'notifications', label: 'Notifikasi', icon: Bell, adminOnly: true },
    { id: 'security', label: 'Keamanan', icon: Shield, adminOnly: true },
  ];

  return (
    <div className="w-full lg:w-64 space-y-2">
      {tabs.map((tab) => {
        if (tab.adminOnly && userRole !== 'admin') return null;
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 border-l-4 ${
              isActive 
                ? 'bg-blue-50/50 border-blue-800 text-blue-900' 
                : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon size={18} className={isActive ? 'text-blue-800' : 'text-slate-400'} />
              <span className="text-sm font-bold">{tab.label}</span>
            </div>
            {isActive && <ChevronRight size={16} className="text-blue-800" />}
          </button>
        );
      })}
    </div>
  );
}
