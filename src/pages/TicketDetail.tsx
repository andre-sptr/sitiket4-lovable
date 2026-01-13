import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { StatusBadge, ComplianceBadge, TTRBadge } from '@/components/StatusBadge';
import { Timeline } from '@/components/Timeline';
import { TicketDetailSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTicket, useDeleteTicket, useAddProgressUpdate } from '@/hooks/useTickets';
import { mapDbTicketToTicket } from '@/lib/ticketMappers';
import { formatDateWIB, generateWhatsAppMessage, generateGoogleMapsLink, getStatusLabel } from '@/lib/formatters';
import { TicketStatus } from '@/types/ticket';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  Copy, 
  ExternalLink,
  FileText,
  Send,
  Phone,
  Trash2,
  Calendar,
  Target,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Zap,
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const TTRCountdown = ({ targetDate, status }: { targetDate: Date | string, status: string }) => {
  const [timeState, setTimeState] = useState({ display: '-', isOverdue: false, isClosed: false, percent: 100 });

  useEffect(() => {
    if (status === 'CLOSED') {
      setTimeState({ display: "TIKET CLOSED", isOverdue: false, isClosed: true, percent: 100 });
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;
      const isLate = diff < 0; 

      const duration = Math.abs(diff);
      const days = Math.floor(duration / (1000 * 60 * 60 * 24));
      const hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((duration % (1000 * 60)) / 1000);

      let timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      if (days > 0) {
        timeString = `${days}h ${timeString}`;
      }

      const totalHours = days * 24 + hours + minutes / 60;
      const percent = isLate ? 0 : Math.min(100, (totalHours / 4) * 100);

      setTimeState({ 
        display: timeString, 
        isOverdue: isLate, 
        isClosed: false,
        percent
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000); 

    return () => clearInterval(interval);
  }, [targetDate, status]);

  return (
    <motion.div 
      className="relative"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`
        relative overflow-hidden rounded-xl p-4 
        ${timeState.isClosed 
          ? 'bg-muted/50 border border-border' 
          : timeState.isOverdue 
            ? 'bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/30' 
            : 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30'
        }
      `}>
        {!timeState.isClosed && !timeState.isOverdue && (
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
        
        <div className="relative z-10 flex items-center gap-3">
          <div className={`
            p-2 rounded-lg 
            ${timeState.isClosed 
              ? 'bg-muted text-muted-foreground' 
              : timeState.isOverdue 
                ? 'bg-destructive/20 text-destructive' 
                : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }
          `}>
            {timeState.isClosed ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : timeState.isOverdue ? (
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            ) : (
              <Timer className="w-5 h-5" />
            )}
          </div>
          
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-0.5">
              {timeState.isClosed ? 'Status' : timeState.isOverdue ? 'Overdue' : 'Sisa Waktu'}
            </p>
            <p className={`
              font-mono text-lg font-bold tracking-tight
              ${timeState.isClosed 
                ? 'text-muted-foreground' 
                : timeState.isOverdue 
                  ? 'text-destructive' 
                  : 'text-emerald-600 dark:text-emerald-400'
              }
            `}>
              {timeState.isClosed ? (
                'CLOSED'
              ) : timeState.isOverdue ? (
                <span className="flex items-center gap-1">
                  +{timeState.display}
                </span>
              ) : (
                timeState.display
              )}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const deleteTicket = useDeleteTicket();
  const { data: dbTicket, isLoading } = useTicket(id || '');
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateStatus, setUpdateStatus] = useState<TicketStatus | ''>('');
  const addProgressUpdate = useAddProgressUpdate();
  const isGuest = user?.role === 'guest';
  const ticket = dbTicket ? mapDbTicketToTicket(dbTicket) : null;

  if (isLoading) {
    return (
      <Layout>
        <TicketDetailSkeleton />
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <motion.div 
          className="text-center py-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">Tiket tidak ditemukan</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Button>
        </motion.div>
      </Layout>
    );
  }

  const handleDelete = async () => {
    if (!ticket) return;

    try {
      await deleteTicket.mutateAsync(ticket.id);
      toast({
        title: "Tiket Dihapus",
        description: `Tiket ${ticket.incNumbers?.[0] || 'tersebut'} berhasil dihapus permanen.`,
      });
      navigate('/tickets');
    } catch (error) {
      console.error('Gagal menghapus:', error);
      toast({
        title: "Gagal Menghapus",
        description: "Terjadi kesalahan saat menghapus tiket.",
        variant: "destructive",
      });
    }
  };

  const handleCopyShareMessage = () => {
    const message = generateWhatsAppMessage('share', ticket);
    navigator.clipboard.writeText(message);
    toast({
      title: "Pesan WhatsApp Disalin",
      description: "Pesan share tiket sudah disalin ke clipboard",
    });
  };

  const handleCopyUpdateTemplate = () => {
    const message = generateWhatsAppMessage('update', ticket);
    navigator.clipboard.writeText(message);
    toast({
      title: "Template Update Disalin",
      description: "Template update progress sudah disalin ke clipboard",
    });
  };

  const handleSubmitUpdate = async () => {
    if (!updateMessage.trim()) {
      toast({
        title: "Error",
        description: "Pesan update tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    if (!ticket || !user) return;

    try {
      await addProgressUpdate.mutateAsync({
        ticket_id: ticket.id,
        message: updateMessage,
        status_after_update: updateStatus || null, 
        source: 'HD',
        created_by: user.id,
      });

      toast({
        title: "Update Berhasil",
        description: "Progress update telah ditambahkan ke timeline",
      });
      
      setUpdateMessage('');
      setUpdateStatus('');
      
    } catch (error) {
      console.error('Gagal update:', error);
      toast({
        title: "Gagal Update",
        description: "Terjadi kesalahan saat menyimpan update.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex items-start gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-xl bg-muted/50 hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <motion.span 
                className="font-mono text-sm px-2 py-1 rounded-md bg-muted/50 text-muted-foreground"
                whileHover={{ scale: 1.02 }}
              >
                {ticket.incNumbers.join(', ')}
              </motion.span>
              <StatusBadge status={ticket.status} />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {ticket.siteCode} - {ticket.siteName}
            </h1>
            
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="outline" className="rounded-full px-3">
                {ticket.kategori}
              </Badge>
              <ComplianceBadge compliance={ticket.ttrCompliance} />
            </div>
          </div>
        </motion.div>

        {!isGuest && (
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                size="sm" 
                className="gap-2 rounded-xl shadow-lg shadow-primary/20" 
                onClick={() => navigate(`/ticket/${id}/update`)}
              >
                <FileText className="w-4 h-4" />
                Update Tiket
              </Button>
            </motion.div>
            
            {user?.role !== 'guest' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="destructive" size="sm" className="gap-2 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Hapus Tiket</span>
                    </Button>
                  </motion.div>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Tiket <strong>{ticket?.incNumbers?.[0]}</strong> akan dihapus secara permanen dari database.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
                    >
                      Ya, Hapus
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="whatsapp" size="sm" className="gap-2 rounded-xl" onClick={handleCopyShareMessage}>
                <Copy className="w-4 h-4" />
                Copy Pesan WA
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="outline" size="sm" className="gap-2 rounded-xl" onClick={handleCopyUpdateTemplate}>
                <FileText className="w-4 h-4" />
                Template Update
              </Button>
            </motion.div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div variants={containerVariants} className="lg:col-span-1 space-y-4">
            <motion.div variants={cardVariants}>
              <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Status TTR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <TTRCountdown targetDate={ticket.maxJamClose} status={ticket.status} />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">Jam Open</p>
                      <p className="font-mono text-xs font-medium">{formatDateWIB(ticket.jamOpen)}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">Max Close</p>
                      <p className="font-mono text-xs font-medium">{formatDateWIB(ticket.maxJamClose)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <span className="text-sm text-muted-foreground">Target TTR</span>
                    <span className="font-bold text-primary">{ticket.ttrTargetHours} jam</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Lokasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm">{ticket.lokasiText}</p>
                  
                  {ticket.latitude && ticket.longitude && (
                    <>
                      <p className="text-xs font-mono text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
                        {ticket.latitude}, {ticket.longitude}
                      </p>
                      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full gap-2 rounded-xl group"
                          asChild
                        >
                          <a 
                            href={generateGoogleMapsLink(ticket.latitude, ticket.longitude)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Navigation className="w-4 h-4 group-hover:text-primary transition-colors" />
                            Buka di Google Maps
                            <ChevronRight className="w-4 h-4 ml-auto opacity-50 group-hover:translate-x-1 transition-transform" />
                          </a>
                        </Button>
                      </motion.div>
                    </>
                  )}
                  
                  {ticket.jarakKmRange && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                      <span className="text-sm text-muted-foreground">Jarak</span>
                      <span className="font-medium">{ticket.jarakKmRange}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={cardVariants}>
              <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Teknisi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ticket.teknisiList && ticket.teknisiList.length > 0 ? (
                    <div className="space-y-2">
                      {ticket.teknisiList.map((name, i) => (
                        <motion.div 
                          key={i} 
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/30 group"
                          whileHover={{ scale: 1.01, backgroundColor: 'hsl(var(--muted) / 0.5)' }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium">{name}</span>
                          </div>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-50 group-hover:opacity-100">
                              <Phone className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-2">
                        <User className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground">Belum ada teknisi</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {(ticket.penyebab || ticket.segmen || ticket.networkElement) && (
              <motion.div variants={cardVariants}>
                <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                  <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Detail Tambahan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {ticket.penyebab && (
                      <div className="p-3 rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">Penyebab</p>
                        <p className="text-sm font-medium">{ticket.penyebab}</p>
                      </div>
                    )}
                    {ticket.segmen && (
                      <div className="p-3 rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">Segmen</p>
                        <p className="text-sm font-medium">{ticket.segmen}</p>
                      </div>
                    )}
                    {ticket.networkElement && (
                      <div className="p-3 rounded-xl bg-muted/30">
                        <p className="text-xs text-muted-foreground mb-1">Network Element</p>
                        <p className="text-xs font-mono break-all">{ticket.networkElement}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          <motion.div variants={containerVariants} className="lg:col-span-2 space-y-4">
            {!isGuest && (
              <motion.div variants={cardVariants}>
                <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                  <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Tambah Update
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={updateStatus} onValueChange={(v) => setUpdateStatus(v as TicketStatus)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Status baru (opsional)" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="ONPROGRESS">On Progress</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="TEMPORARY">Temporary</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                        <SelectItem value="WAITING_MATERIAL">Menunggu Material</SelectItem>
                        <SelectItem value="WAITING_ACCESS">Menunggu Akses</SelectItem>
                        <SelectItem value="WAITING_COORDINATION">Menunggu Koordinasi</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Textarea
                      placeholder="Tulis update progress..."
                      value={updateMessage}
                      onChange={(e) => setUpdateMessage(e.target.value)}
                      className="min-h-[120px] resize-none rounded-xl"
                    />
                    
                    <div className="flex justify-end gap-2">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline" size="sm" onClick={handleCopyUpdateTemplate} className="rounded-xl">
                          <FileText className="w-4 h-4 mr-2" />
                          Pakai Template
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button 
                          size="sm" 
                          onClick={handleSubmitUpdate} 
                          className="rounded-xl shadow-lg shadow-primary/20"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Kirim Update
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <motion.div variants={cardVariants}>
              <Card className="overflow-hidden border-0 shadow-lg shadow-black/5 dark:shadow-black/20">
                <CardHeader className="pb-3 bg-gradient-to-r from-muted/50 to-transparent">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Timeline Progress
                    {ticket.progressUpdates.length > 0 && (
                      <Badge variant="secondary" className="rounded-full ml-2">
                        {ticket.progressUpdates.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Timeline updates={ticket.progressUpdates} />
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default TicketDetail;
