import { Search, Scan, Edit3 } from 'lucide-react';

export default function ModeTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'select', label: 'Pilih Buku', icon: Search },
    { id: 'scan', label: 'Scan', icon: Scan },
    { id: 'manual', label: 'Manual', icon: Edit3 },
  ];

  return (
    <div className="flex w-full md:w-auto p-1 bg-gray-100 rounded-xl gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-[1.02]'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
          }`}
        >
          <tab.icon size={16} />
          <span className={activeTab === tab.id ? 'block' : 'hidden md:block'}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
