import { motion, AnimatePresence } from 'framer-motion';
import { ProgressUpdate } from '@/types/ticket';
import { formatDateShort, formatTimeOnly } from '@/lib/formatters';
import { StatusBadge } from '@/components/StatusBadge';
import { User, Bot, Settings, Image as ImageIcon, MessageCircle } from 'lucide-react';

interface TimelineProps {
  updates: ProgressUpdate[];
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 }
};

export const Timeline: React.FC<TimelineProps> = ({ updates }) => {
  const sortedUpdates = [...updates].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getSourceIcon = (source: ProgressUpdate['source']) => {
    switch (source) {
      case 'ADMIN':
        return <Bot className="w-4 h-4" />;
      case 'SYSTEM':
        return <Settings className="w-4 h-4" />;
      case 'HD':
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source: ProgressUpdate['source']) => {
    switch (source) {
      case 'ADMIN':
        return 'bg-gradient-to-br from-purple-500 to-purple-600';
      case 'SYSTEM':
        return 'bg-gradient-to-br from-slate-400 to-slate-500';
      case 'HD':
        return 'bg-gradient-to-br from-primary to-primary/80';
      default:
        return 'bg-gradient-to-br from-muted-foreground to-muted-foreground/80';
    }
  };

  const getSourceLabel = (source: ProgressUpdate['source']) => {
    switch (source) {
      case 'ADMIN':
        return 'Admin';
      case 'SYSTEM':
        return 'Sistem';
      case 'HD':
        return 'Help Desk';
      default:
        return 'Unknown';
    }
  };

  if (updates.length === 0) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-muted-foreground">Belum ada update</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Update akan muncul di sini</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {sortedUpdates.map((update, index) => (
          <motion.div 
            key={update.id} 
            className="relative pl-10"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            custom={index}
            layout
          >
            {index < sortedUpdates.length - 1 && (
              <motion.div 
                className="absolute left-[15px] top-10 bottom-0 w-0.5 bg-gradient-to-b from-border to-transparent"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: index * 0.05 + 0.2, duration: 0.3 }}
                style={{ originY: 0 }}
              />
            )}
            
            <motion.div 
              className={`absolute left-0 top-3 w-8 h-8 rounded-full ${getSourceColor(update.source)} flex items-center justify-center text-white shadow-lg`}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                delay: index * 0.05, 
                duration: 0.4,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ scale: 1.1 }}
            >
              {getSourceIcon(update.source)}
            </motion.div>

            <motion.div 
              className="bg-card border border-border/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-border"
              whileHover={{ y: -2, scale: 1.005 }}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted/50 text-muted-foreground">
                    {getSourceLabel(update.source)}
                  </span>
                  {update.statusAfterUpdate && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <StatusBadge status={update.statusAfterUpdate} size="sm" showIcon={false} />
                    </motion.div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded-md">
                  {formatDateShort(new Date(update.timestamp))}
                </span>
              </div>
              
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{update.message}</p>

              {update.attachments && update.attachments.length > 0 && (
                <motion.div 
                  className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>{update.attachments.length} lampiran</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
