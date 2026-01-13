import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  index?: number;
}

const variantStyles = {
  default: {
    bg: 'bg-muted/60',
    icon: 'text-muted-foreground',
    value: 'text-foreground',
    ring: '',
    iconBg: 'group-hover:bg-muted',
  },
  primary: {
    bg: 'bg-primary/10',
    icon: 'text-primary',
    value: 'text-primary',
    ring: 'ring-1 ring-primary/10',
    iconBg: 'group-hover:bg-primary/20',
  },
  success: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-600 dark:text-emerald-400',
    value: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-1 ring-emerald-500/10',
    iconBg: 'group-hover:bg-emerald-500/20',
  },
  warning: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-600 dark:text-amber-400',
    value: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-1 ring-amber-500/10',
    iconBg: 'group-hover:bg-amber-500/20',
  },
  danger: {
    bg: 'bg-destructive/10',
    icon: 'text-destructive',
    value: 'text-destructive',
    ring: 'ring-1 ring-destructive/10',
    iconBg: 'group-hover:bg-destructive/20',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  index = 0,
}) => {
  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -4 }}
    >
      <Card className={`overflow-hidden border-0 shadow-sm ${styles.ring} group cursor-default hover:shadow-lg transition-shadow duration-300`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {title}
              </p>
              <motion.p 
                className={`text-2xl md:text-3xl font-bold ${styles.value} tracking-tight`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1 + 0.2,
                  type: "spring",
                  stiffness: 200
                }}
              >
                {value}
              </motion.p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </div>
            <motion.div 
              className={`p-3 rounded-xl ${styles.bg} ${styles.iconBg} transition-colors duration-300`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className={`w-5 h-5 ${styles.icon} transition-transform duration-300 group-hover:scale-110`} />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
