import { motion } from 'framer-motion';
import { Home, Package, BarChart3, Settings } from 'lucide-react';

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
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t safe-area-pb">
      <nav className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all relative ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              whileHover={{
                scale: 1.08,
                y: -2,
                transition: {
                  duration: 0.2,
                  ease: "easeOut"
                }
              }}
              whileTap={{
                scale: 0.95,
                transition: {
                  duration: 0.1
                }
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute inset-0 bg-primary/15 rounded-2xl"
                  transition={{
                    type: 'spring',
                    bounce: 0.3,
                    duration: 0.5
                  }}
                />
              )}
              <motion.div
                initial={{ opacity: 0.7, scale: 0.9 }}
                animate={{ opacity: isActive ? 1 : 0.7, scale: 1 }}
                className="relative z-10"
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              </motion.div>
              <motion.span
                initial={{ opacity: 0.7 }}
                animate={{ opacity: isActive ? 1 : 0.7 }}
                className={`text-xs relative z-10 font-medium ${isActive ? 'text-primary font-semibold' : ''}`}
              >
                {item.label}
              </motion.span>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-dot"
                  className="absolute -bottom-1 w-2 h-2 rounded-full bg-primary"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    bounce: 0.5,
                    duration: 0.4
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}
