import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { MapPin, Calendar, Signal, ChevronRight, User } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { StatusBadge, ComplianceBadge, TTRBadge } from '@/components/StatusBadge';
import { Ticket } from '@/types/ticket';
import { formatDateWIB } from '@/lib/formatters';

interface TicketCardProps {
  ticket: Ticket;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket }) => {
  const navigate = useNavigate();

  const relativeTime = formatDistanceToNow(new Date(ticket.updatedAt || ticket.jamOpen), { 
    addSuffix: true, 
    locale: idLocale 
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="group relative overflow-hidden border hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer bg-card"
        onClick={() => navigate(`/ticket/${ticket.id}`)}
      >
        {/* Strip indikator status di kiri */}
        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
          ticket.status === 'OPEN' ? 'bg-red-500' :
          ticket.status === 'CLOSED' ? 'bg-slate-300 dark:bg-slate-700' :
          'bg-blue-500'
        }`} />

        <div className="pl-4 pr-3 py-3">
          {/* Baris 1: Header (ID, Waktu, Status) */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono font-medium text-foreground bg-muted px-1.5 py-0.5 rounded">
                {ticket.incNumbers[0]}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDateWIB(ticket.jamOpen)}
              </span>
            </div>
            <StatusBadge status={ticket.status} size="sm" />
          </div>

          {/* Baris 2: Judul Utama (Site) */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate group-hover:text-primary transition-colors flex items-center gap-2">
                {ticket.siteName}
                <span className="font-normal text-muted-foreground text-xs border border-border px-1.5 rounded hidden sm:inline-block">
                  {ticket.siteCode}
                </span>
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 truncate">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-none">
                  {ticket.lokasiText || 'Lokasi belum diset'}
                </span>
              </div>
            </div>
            
            {/* Tombol panah kecil di kanan untuk indikasi klik */}
            <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
          </div>

          {/* Baris 3: Footer Compact (Badges & Teknisi) */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40 mt-2">
            <div className="flex items-center gap-2 flex-wrap">
              <TTRBadge targetDate={ticket.maxJamClose} status={ticket.status} size="sm" />
              <ComplianceBadge compliance={ticket.ttrCompliance} size="sm" />
            </div>

            {/* Teknisi Stack + Nama */}
            <div className="flex items-center gap-2 shrink-0 max-w-[40%] justify-end">
              {ticket.teknisiList && ticket.teknisiList.length > 0 ? (
                <>
                  <div className="flex -space-x-1.5 shrink-0">
                    {ticket.teknisiList.slice(0, 3).map((tech, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-center w-5 h-5 rounded-full bg-background border border-border ring-1 ring-background text-[9px] font-bold text-muted-foreground uppercase"
                        title={tech}
                      >
                        {tech.charAt(0)}
                      </div>
                    ))}
                    {ticket.teknisiList.length > 3 && (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted border border-border ring-1 ring-background text-[8px] font-medium">
                        +{ticket.teknisiList.length - 3}
                      </div>
                    )}
                  </div>
                  {/* Nama Teknisi Ditambahkan di Sini */}
                  <span className="text-xs text-muted-foreground truncate hidden sm:block" title={ticket.teknisiList.join(', ')}>
                    {ticket.teknisiList[0]}
                    {ticket.teknisiList.length > 1 && ` +${ticket.teknisiList.length - 1}`}
                  </span>
                </>
              ) : (
                <span className="text-[10px] text-muted-foreground italic">No Tech</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};