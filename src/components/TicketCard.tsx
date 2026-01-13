import { Ticket } from '@/types/ticket';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, ComplianceBadge, TTRBadge } from '@/components/StatusBadge';
import { formatDateShort, generateGoogleMapsLink } from '@/lib/formatters';
import { getSettings, getTTRStatus, isDueSoon as checkIsDueSoon } from '@/hooks/useSettings';
import { 
  MapPin, 
  Clock, 
  User, 
  MessageSquare, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface TicketCardProps {
  ticket: Ticket;
  onCopyWhatsApp?: (ticket: Ticket) => void;
  compact?: boolean;
  index?: number;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onCopyWhatsApp, compact = false, index = 0 }) => {
  const navigate = useNavigate();
  const settings = getSettings();
  const ttrStatus = getTTRStatus(ticket.sisaTtrHours, settings.ttrThresholds);
  const isOverdue = ttrStatus === 'overdue' && ticket.status !== 'CLOSED';
  const isDueSoon = checkIsDueSoon(ticket.sisaTtrHours, settings.ttrThresholds) && ticket.status !== 'CLOSED';
  const isUnassigned = !ticket.assignedTo && ticket.status === 'OPEN';

  const handleClick = () => {
    navigate(`/ticket/${ticket.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
    >
      <Card 
        hover
        className={`relative overflow-hidden border-0 shadow-sm group cursor-pointer transition-all duration-300 ${
          isOverdue ? 'ring-1 ring-destructive/30 bg-destructive/[0.02] hover:ring-destructive/50' : ''
        } ${isDueSoon ? 'ring-1 ring-amber-400/30 bg-amber-500/[0.02] hover:ring-amber-400/50' : ''}`}
        onClick={handleClick}
      >
        <motion.div 
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            isOverdue ? 'bg-destructive' : 
            isDueSoon ? 'bg-amber-500' : 
            ticket.status === 'CLOSED' ? 'bg-emerald-500' : 
            'bg-primary'
          }`}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 0.3, delay: index * 0.05 + 0.2 }}
          style={{ originY: 0 }}
        />

        <CardContent className="p-4 pl-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <motion.span 
                  className="font-mono text-xs text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded transition-colors duration-200 hover:bg-muted"
                  whileHover={{ scale: 1.05 }}
                >
                  {ticket.incNumbers[0]}
                </motion.span>
                {ticket.incNumbers.length > 1 && (
                  <span className="text-xs text-muted-foreground">
                    +{ticket.incNumbers.length - 1}
                  </span>
                )}
                {isUnassigned && (
                  <motion.span 
                    className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full font-medium"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, delay: index * 0.05 + 0.3 }}
                  >
                    <AlertCircle className="w-3 h-3" />
                    Belum assign
                  </motion.span>
                )}
              </div>
              <h3 className="font-semibold text-sm md:text-base text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                {ticket.siteCode} - {ticket.siteName}
              </h3>
              <motion.span 
                className="inline-block text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1.5 transition-colors duration-200 hover:bg-primary/20"
                whileHover={{ scale: 1.05 }}
              >
                {ticket.kategori}
              </motion.span>
            </div>
            <StatusBadge status={ticket.status} size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs mb-3">
            <motion.div 
              className="flex items-center gap-1.5 text-muted-foreground group/item"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 transition-colors duration-200 group-hover/item:text-primary" />
              <span className="truncate transition-colors duration-200 group-hover/item:text-foreground">{ticket.lokasiText}</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-1.5 text-muted-foreground group/item"
              whileHover={{ x: 2 }}
              transition={{ duration: 0.2 }}
            >
              <Clock className="w-3.5 h-3.5 flex-shrink-0 transition-colors duration-200 group-hover/item:text-primary" />
              <span className="transition-colors duration-200 group-hover/item:text-foreground">{formatDateShort(ticket.jamOpen)}</span>
            </motion.div>
            {ticket.assignedTo && (
              <motion.div 
                className="flex items-center gap-1.5 text-muted-foreground col-span-2 group/item"
                whileHover={{ x: 2 }}
                transition={{ duration: 0.2 }}
              >
                <User className="w-3.5 h-3.5 flex-shrink-0 transition-colors duration-200 group-hover/item:text-primary" />
                <span className="truncate transition-colors duration-200 group-hover/item:text-foreground">{ticket.teknisiList?.join(', ') || 'TA Assigned'}</span>
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
            <div className="flex items-center gap-2">
              <TTRBadge hours={ticket.sisaTtrHours} size="sm" />
              <ComplianceBadge compliance={ticket.ttrCompliance} size="sm" />
            </div>
            <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
              {ticket.latitude && ticket.longitude && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 rounded-lg hover:bg-primary/10 transition-colors duration-200"
                    asChild
                  >
                    <a href={generateGoogleMapsLink(ticket.latitude, ticket.longitude)} target="_blank" rel="noopener noreferrer">
                      <MapPin className="w-4 h-4" />
                    </a>
                  </Button>
                </motion.div>
              )}
              {onCopyWhatsApp && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 rounded-lg text-emerald-600 hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCopyWhatsApp(ticket);
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors duration-200 ml-1" />
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
