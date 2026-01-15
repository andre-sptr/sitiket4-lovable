import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { StatsCard } from '@/components/StatsCard';
import { TicketCard } from '@/components/TicketCard';
import { StatsCardSkeleton, TicketCardSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTodayTickets, useDashboardStats } from '@/hooks/useTickets';
import { mapDbTicketToTicket } from '@/lib/ticketMappers';
import { generateWhatsAppMessage } from '@/lib/formatters';
import { getSettings, isDueSoon as checkIsDueSoon } from '@/hooks/useSettings';
import { Ticket } from '@/types/ticket';
import { 
  Ticket as TicketIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Percent,
  Plus,
  RefreshCw,
  ArrowRight,
  Hourglass
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const settings = getSettings();
  
  const { data: dbTickets, isLoading, refetch } = useTodayTickets();
  const stats = useDashboardStats();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const todayTickets = dbTickets?.map(mapDbTicketToTicket) || [];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast({ title: "Data diperbarui", description: "Dashboard telah di-refresh" });
  };

  const sortedTickets = [...todayTickets].sort((a, b) => {
    if (a.status === 'CLOSED' && b.status !== 'CLOSED') return 1;
    if (a.status !== 'CLOSED' && b.status === 'CLOSED') return -1;
    return a.sisaTtrHours - b.sisaTtrHours;
  });

  const overdueTickets = todayTickets.filter(t => t.sisaTtrHours < 0 && t.status !== 'CLOSED');
  const dueSoonTickets = todayTickets.filter(t => 
    checkIsDueSoon(t.sisaTtrHours, settings.ttrThresholds) && t.status !== 'CLOSED'
  );
  const unassignedTickets = todayTickets.filter(t => !t.assignedTo && t.status === 'OPEN');

  const handleCopyWhatsApp = (ticket: Ticket) => {
    const message = generateWhatsAppMessage('share', ticket);
    navigator.clipboard.writeText(message);
    toast({
      title: "Pesan WhatsApp Disalin",
      description: `Pesan untuk ${ticket.siteCode} sudah disalin ke clipboard`,
    });
  };

  return (
    <Layout>
      <SEO title="Dashboard" description="Dashboard monitoring tiket gangguan hari ini. Lihat statistik TTR, status tiket aktif, dan performa penanganan secara real-time." />
      <div className="space-y-6 lg:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Tiket hari ini — {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 h-9" 
              onClick={handleRefresh} 
              disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {user?.role !== 'guest' && user?.role !== 'admin' && (
              <Link to="/import">
                <Button size="sm" className="gap-2 h-9">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Import Tiket</span>
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {isLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Total Hari Ini"
                value={stats.totalToday}
                icon={TicketIcon}
                variant="primary"
                index={0}
              />
              <StatsCard
                title="Open"
                value={stats.openTickets}
                subtitle={unassignedTickets.length > 0 ? `${unassignedTickets.length} belum assign` : undefined}
                icon={Clock}
                variant="warning"
                index={1}
              />
              <StatsCard
                title="Overdue"
                value={stats.overdueTickets}
                icon={AlertTriangle}
                variant="danger"
                index={2}
              />
              <StatsCard
                title="Closed"
                value={stats.closedToday}
                icon={CheckCircle2}
                variant="success"
                index={3}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {isLoading ? (
            <>
              <StatsCardSkeleton />
              <StatsCardSkeleton />
            </>
          ) : (
            <>
              <StatsCard
                title="Tiket Pending"
                value={stats.pendingTickets}
                subtitle="Menunggu Material/Akses"
                icon={Hourglass}
                variant="default"
                index={4}
              />
              <StatsCard
                title="Compliance Rate"
                value={`${stats.complianceRate}%`}
                subtitle="Target: 90%"
                icon={Percent}
                variant={stats.complianceRate >= 90 ? 'success' : stats.complianceRate >= 70 ? 'warning' : 'danger'}
                index={5}
              />
            </>
          )}
        </div>

        {(overdueTickets.length > 0 || dueSoonTickets.length > 0 || unassignedTickets.length > 0) && (
          <motion.div 
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {overdueTickets.length > 0 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Badge variant="critical" className="gap-1.5 py-1.5 px-3 text-xs font-medium cursor-pointer">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {overdueTickets.length} tiket overdue
                </Badge>
              </motion.div>
            )}
            {dueSoonTickets.length > 0 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Badge variant="warning" className="gap-1.5 py-1.5 px-3 text-xs font-medium cursor-pointer">
                  <Clock className="w-3.5 h-3.5" />
                  {dueSoonTickets.length} tiket hampir due
                </Badge>
              </motion.div>
            )}
            {unassignedTickets.length > 0 && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Badge variant="info" className="gap-1.5 py-1.5 px-3 text-xs font-medium cursor-pointer">
                  <TicketIcon className="w-3.5 h-3.5" />
                  {unassignedTickets.length} belum assign
                </Badge>
              </motion.div>
            )}
          </motion.div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Tiket Hari Ini</h2>
            <Link to="/tickets">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          <div className="space-y-3">
            {isLoading ? (
              <TicketCardSkeleton count={3} />
            ) : sortedTickets.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
                <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Belum ada tiket hari ini</p>
                <p className="text-sm mt-1">Tiket yang dibuat hari ini akan muncul di sini</p>
              </div>
            ) : (
              sortedTickets.map((ticket, index) => (
                <TicketCard 
                  key={ticket.id}
                  ticket={ticket} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
