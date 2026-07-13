import { CheckCircle2, Clock } from 'lucide-react';

export default function ActivityList({ activities = [1, 2, 3] }) {
  return (
    <div className="space-y-4">
      {activities.map((_, i) => (
        <div key={i} className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-xl transition-all group cursor-default">
          <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
              <CheckCircle2 size={14} className={i === 0 ? "text-emerald-500 group-hover:text-white" : "text-gray-300 group-hover:text-white"} />
          </div>
          <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black text-gray-900 truncate">Restock Berhasil</p>
              <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock size={10} /> {i === 0 ? 'Baru saja' : i + ' jam lalu'}
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-[10px] font-bold text-blue-600">+10 Buku</span>
              </div>
          </div>
        </div>
      ))}
    </div>
  );
}
