import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { TicketStatus, TTRCompliance } from '@/types/ticket';
import { getStatusLabel } from '@/lib/formatters';
import { 
  Clock, 
  UserCheck, 
  Loader2, 
  Wrench, 
  Package, 
  Lock, 
  Users, 
  CheckCircle2,
  AlertTriangle,
  Timer
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Types ---

interface StatusBadgeProps {
  status: TicketStatus;
  showIcon?: boolean;
  size?: 'sm' | 'default';
  className?: string;
}

interface ComplianceBadgeProps {
  compliance: TTRCompliance;
  size?: 'sm' | 'default';
}

interface TTRBadgeProps {
  targetDate?: Date | string | null; // Diganti menjadi targetDate untuk countdown
  status: TicketStatus;
  size?: 'sm' | 'default';
}

// --- Maps ---

const statusVariantMap: Record<TicketStatus, 'open' | 'assigned' | 'onprogress' | 'pending' | 'temporary' | 'waiting' | 'closed'> = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  ONPROGRESS: 'onprogress',
  PENDING: 'pending',
  TEMPORARY: 'temporary',
  WAITING_MATERIAL: 'waiting',
  WAITING_ACCESS: 'waiting',
  WAITING_COORDINATION: 'waiting',
  CLOSED: 'closed',
};

const statusIconMap: Record<TicketStatus, React.ReactNode> = {
  OPEN: <Clock className="w-3 h-3" />,
  ASSIGNED: <UserCheck className="w-3 h-3" />,
  ONPROGRESS: <Loader2 className="w-3 h-3 animate-spin" />,
  PENDING: <Clock className="w-3 h-3" />,
  TEMPORARY: <Wrench className="w-3 h-3" />,
  WAITING_MATERIAL: <Package className="w-3 h-3" />,
  WAITING_ACCESS: <Lock className="w-3 h-3" />,
  WAITING_COORDINATION: <Users className="w-3 h-3" />,
  CLOSED: <CheckCircle2 className="w-3 h-3" />,
};

// --- Components ---

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true, size = 'default', className }) => {
  return (
    <Badge 
      variant={statusVariantMap[status]} 
      className={`gap-1.5 font-medium whitespace-nowrap ${size === 'sm' ? 'text-[10px] px-2 py-0.5 h-5' : 'text-xs px-2.5 py-1'} ${className}`}
    >
      {showIcon && statusIconMap[status]}
      {getStatusLabel(status)}
    </Badge>
  );
};

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({ compliance, size = 'default' }) => {
  return (
    <Badge 
      variant={compliance === 'COMPLY' ? 'comply' : 'notcomply'}
      className={`gap-1.5 font-medium whitespace-nowrap ${size === 'sm' ? 'text-[10px] px-2 py-0.5 h-5' : 'text-xs px-2.5 py-1'}`}
    >
      {compliance === 'COMPLY' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
      {compliance}
    </Badge>
  );
};

export const TTRBadge: React.FC<TTRBadgeProps> = ({ targetDate, status, size = 'default' }) => {
  const [timeLeft, setTimeLeft] = useState<{ text: string; isOverdue: boolean }>({ text: '-', isOverdue: false });

  useEffect(() => {
    if (status === 'CLOSED' || !targetDate) {
      return;
    }

    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;
      const isLate = diff < 0;
      
      const absDiff = Math.abs(diff);
      const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));

      let text = `${hours}j ${minutes}m`;
      if (days > 0) text = `${days}h ${text}`;
      if (isLate) text = `+${text}`; // Menandakan lewat waktu

      setTimeLeft({ text, isOverdue: isLate });
    };

    calculate();
    const interval = setInterval(calculate, 60000); // Update tiap menit cukup untuk badge
    return () => clearInterval(interval);
  }, [targetDate, status]);

  if (status === 'CLOSED') {
    return (
      <Badge variant="outline" className={`gap-1.5 bg-muted/50 text-muted-foreground border-border ${size === 'sm' ? 'text-[10px] px-2 py-0.5 h-5' : 'text-xs px-2.5 py-1'}`}>
        <CheckCircle2 className="w-3 h-3" />
        Selesai
      </Badge>
    );
  }

  if (!targetDate) return null;

  return (
    <Badge 
      variant={timeLeft.isOverdue ? 'destructive' : 'default'}
      className={`gap-1.5 font-mono whitespace-nowrap ${
        timeLeft.isOverdue 
          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800 animate-pulse' 
          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200'
      } border ${size === 'sm' ? 'text-[10px] px-2 py-0.5 h-5' : 'text-xs px-2.5 py-1'}`}
    >
      {timeLeft.isOverdue ? <AlertTriangle className="w-3 h-3" /> : <Timer className="w-3 h-3" />}
      {timeLeft.isOverdue ? 'Overdue' : 'Sisa'}: {timeLeft.text}
    </Badge>
  );
};