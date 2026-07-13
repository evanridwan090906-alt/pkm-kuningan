import { Plus, Minus, Edit2, MapPin, Clock } from 'lucide-react';

const TYPE_CONFIG = {
  masuk: {
    icon: Plus,
    color: 'bg-emerald-500',
    badge: 'bg-emerald-400/20 text-emerald-100',
    label: 'Masuk'
  },
  keluar: {
    icon: Minus,
    color: 'bg-rose-500',
    badge: 'bg-rose-400/20 text-rose-100',
    label: 'Keluar'
  },
  update: {
    icon: Edit2,
    color: 'bg-blue-500',
    badge: 'bg-blue-400/20 text-blue-100',
    label: 'Update'
  },
  pindah: {
    icon: MapPin,
    color: 'bg-amber-500',
    badge: 'bg-amber-400/20 text-amber-100',
    label: 'Pindah'
  }
};

export default function ActivityItem({ item }) {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.update;
  const Icon = config.icon;

  return (
    <div className="flex gap-4 items-start group hover:bg-white/5 p-2 rounded-2xl transition-all duration-300 cursor-default">
      {/* Date Badge */}
      <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-xl flex flex-col items-center justify-center flex-shrink-0 border border-white/20 group-hover:scale-110 transition-transform duration-500">
        <span className="text-lg font-black leading-none text-white">{item.date}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-100">{item.month}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${config.badge}`}>
            {config.label} {item.qty && `(${item.qty})`}
          </span>
          <div className="h-px flex-1 bg-white/10"></div>
        </div>
        
        <h4 className="text-sm font-bold text-white mb-1 truncate group-hover:text-blue-200 transition-colors">
          {item.title}
        </h4>
        
        <div className="flex items-center gap-3 text-[11px] text-blue-100/70 font-medium">
          <div className="flex items-center gap-1">
            <MapPin size={12} className="text-white/50" />
            {item.location}
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-white/50" />
            {item.time}
          </div>
        </div>
      </div>

      {/* Floating Icon Indicator */}
      <div className={`w-8 h-8 ${config.color} rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-100 transition-all duration-300`}>
        <Icon size={14} />
      </div>
    </div>
  );
}
