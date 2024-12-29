import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  Icon: LucideIcon;
  count?: number;
  color: string;
  onClick: () => void;
}

export default function CategoryCard({ title, Icon, count, color, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 ${color}`} />
      <div className="relative z-10">
        <Icon className={`h-8 w-8 ${color.replace('bg-', 'text-')} mb-4`} />
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
        {count !== undefined && (
          <p className="text-sm text-gray-500">{count} items</p>
        )}
      </div>
      <div className="absolute bottom-0 right-0 p-2">
        <div className={`w-2 h-2 rounded-full ${color.replace('bg-', 'text-')} opacity-50`} />
      </div>
    </button>
  );
}