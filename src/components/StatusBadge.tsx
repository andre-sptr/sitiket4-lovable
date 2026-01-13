import { Badge } from '@/components/ui/badge';
import { TicketStatus, TTRCompliance } from '@/types/ticket';
import { getStatusLabel } from '@/lib/formatters';
import { getSettings, getTTRStatus } from '@/hooks/useSettings';
import { 
  Clock, 
  UserCheck, 
  Loader2, 
  Wrench, 
  Package, 
  Lock, 
  Users, 
  CheckCircle2,
  AlertTriangle 
} from 'lucide-react';

interface StatusBadgeProps {
  status: TicketStatus;
  showIcon?: boolean;
  size?: 'sm' | 'default';
}

const statusVariantMap: Record<TicketStatus, 'open' | 'assigned' | 'onprogress' | 'temporary' | 'waiting' | 'closed'> = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  ONPROGRESS: 'onprogress',
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
  TEMPORARY: <Wrench className="w-3 h-3" />,
  WAITING_MATERIAL: <Package className="w-3 h-3" />,
  WAITING_ACCESS: <Lock className="w-3 h-3" />,
  WAITING_COORDINATION: <Users className="w-3 h-3" />,
  CLOSED: <CheckCircle2 className="w-3 h-3" />,
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showIcon = true, size = 'default' }) => {
  return (
    <Badge 
      variant={statusVariantMap[status]} 
      className={`gap-1.5 font-medium ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
    >
      {showIcon && statusIconMap[status]}
      {getStatusLabel(status)}
    </Badge>
  );
};

interface ComplianceBadgeProps {
  compliance: TTRCompliance;
  size?: 'sm' | 'default';
}

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({ compliance, size = 'default' }) => {
  return (
    <Badge 
      variant={compliance === 'COMPLY' ? 'comply' : 'notcomply'}
      className={`gap-1.5 font-medium ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
    >
      {compliance === 'COMPLY' ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <AlertTriangle className="w-3 h-3" />
      )}
      {compliance}
    </Badge>
  );
};

interface TTRBadgeProps {
  hours: number;
  size?: 'sm' | 'default';
}

export const TTRBadge: React.FC<TTRBadgeProps> = ({ hours, size = 'default' }) => {
  const settings = getSettings();
  const ttrStatus = getTTRStatus(hours, settings.ttrThresholds);
  
  const variantMap: Record<string, 'success' | 'warning' | 'critical'> = {
    safe: 'success',
    warning: 'warning',
    critical: 'critical',
    overdue: 'critical',
  };

  const formatHours = (h: number) => {
    const absH = Math.abs(h);
    const hrs = Math.floor(absH);
    const mins = Math.round((absH - hrs) * 60);
    const sign = h < 0 ? '-' : '';
    return `${sign}${hrs}j ${mins}m`;
  };

  return (
    <Badge 
      variant={variantMap[ttrStatus]}
      className={`font-mono gap-1.5 font-medium ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'} ${ttrStatus === 'overdue' ? 'animate-pulse' : ''}`}
    >
      <Clock className="w-3 h-3" />
      {formatHours(hours)}
      {ttrStatus === 'overdue' && <span className="ml-0.5">OVERDUE</span>}
    </Badge>
  );
};
