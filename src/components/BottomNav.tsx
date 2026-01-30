import { motion } from 'framer-motion';
import { Home, Package, BarChart3, Settings } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'items', label: '物品', icon: Package },
  { id: 'statistics', label: '统计', icon: BarChart3 },
  { id: 'settings', label: '设置', icon: Settings },
];

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  useTheme();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t safe-area-pb">
      <nav className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors relative ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-primary/10 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={`w-5 h-5 relative z-10 transition-transform ${isActive ? 'scale-110' : ''}`} />
              <span className={`text-xs relative z-10 font-medium ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-dot"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
