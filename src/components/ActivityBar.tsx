import { 
  Files, 
  Search, 
  GitBranch, 
  Bug, 
  Blocks,
  Settings,
  User
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import type { SidebarView } from '@/types';

interface ActivityItem {
  id: SidebarView;
  icon: React.ElementType;
  label: string;
}

const activities: ActivityItem[] = [
  { id: 'explorer', icon: Files, label: 'Explorer' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'scm', icon: GitBranch, label: 'Source Control' },
  { id: 'debug', icon: Bug, label: 'Run and Debug' },
  { id: 'extensions', icon: Blocks, label: 'Extensions' },
];

export function ActivityBar() {
  const { sidebarView, setSidebarView } = useUIStore();

  return (
    <div className="w-12 flex-shrink-0 bg-[#333333] flex flex-col items-center py-2 z-10">
      {/* Top icons */}
      <div className="flex flex-col gap-1 flex-1">
        {activities.map((activity) => {
          const isActive = sidebarView === activity.id;
          const Icon = activity.icon;

          return (
            <button
              key={activity.id}
              className="relative w-12 h-12 flex items-center justify-center group"
              onClick={() => setSidebarView(activity.id)}
              title={activity.label}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white" />
              )}

              <Icon
                size={24}
                className={`transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-[#858585] group-hover:text-[#cccccc]'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Bottom icons */}
      <div className="flex flex-col gap-1 mt-auto">
        <button
          className="w-12 h-12 flex items-center justify-center group"
          title="Accounts"
        >
          <User
            size={24}
            className="text-[#858585] group-hover:text-[#cccccc] transition-colors"
          />
        </button>
        <button
          className="w-12 h-12 flex items-center justify-center group"
          title="Manage"
        >
          <Settings
            size={24}
            className="text-[#858585] group-hover:text-[#cccccc] transition-colors"
          />
        </button>
      </div>
    </div>
  );
}
