import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { TicketCard } from '@/components/TicketCard';
import { TicketCardSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTickets } from '@/hooks/useTickets';
import { mapDbTicketToTicket } from '@/lib/ticketMappers';
import { generateWhatsAppMessage, getStatusLabel } from '@/lib/formatters';
import { Ticket, TicketStatus } from '@/types/ticket';
import { Search, Filter, X, SlidersHorizontal, Calendar as CalendarIcon, RotateCcw, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { format, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/SEO';
import { FilterCombobox } from '@/components/FilterCombobox';

const statusOptions: TicketStatus[] = [
  'OPEN',
  'ASSIGNED',
  'ONPROGRESS',
  'PENDING',
  'TEMPORARY',
  'WAITING_MATERIAL',
  'WAITING_ACCESS',
  'WAITING_COORDINATION',
  'CLOSED',
];

const getUniqueValues = (tickets: Ticket[], key: keyof Ticket): string[] => {
  const values = tickets.map(t => t[key]).filter(Boolean) as string[];
  return [...new Set(values)].sort();
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 }
  }
};

const AllTickets = () => {
  const { toast } = useToast();
  const { data: dbTickets, isLoading, refetch } = useTickets();

  const allTickets = useMemo(() => 
    dbTickets?.map(mapDbTicketToTicket) || [], 
    [dbTickets]
  );
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [complianceFilter, setComplianceFilter] = useState<string>('ALL');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [kategoriFilter, setKategoriFilter] = useState<string>('ALL');
  const [jarakFilter, setJarakFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const [sortBy, setSortBy] = useState<string>('newest');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast({ title: "Data diperbarui", description: "Daftar tiket telah di-refresh" });
  };
  
  const filterOptions = useMemo(() => ({
    providers: getUniqueValues(allTickets, 'provider'),
    kategoris: getUniqueValues(allTickets, 'kategori'),
    jaraks: getUniqueValues(allTickets, 'jarakKmRange'),
  }), [allTickets]);

  const filteredTickets = useMemo(() => {
    return allTickets.filter(ticket => {
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = !searchLower || 
        ticket.incNumbers.some(inc => inc.toLowerCase().includes(searchLower)) ||
        ticket.siteCode.toLowerCase().includes(searchLower) ||
        ticket.siteName.toLowerCase().includes(searchLower) ||
        ticket.lokasiText.toLowerCase().includes(searchLower) ||
        ticket.provider?.toLowerCase().includes(searchLower) ||
        ticket.kategori?.toLowerCase().includes(searchLower) ||
        ticket.teknisiList?.some(tek => tek.toLowerCase().includes(searchLower)) ||
        ticket.networkElement?.toLowerCase().includes(searchLower) ||
        ticket.penyebab?.toLowerCase().includes(searchLower) ||
        ticket.incGamas?.toLowerCase().includes(searchLower) ||
        ticket.kjd?.toLowerCase().includes(searchLower);

      const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter;
      const matchesCompliance = complianceFilter === 'ALL' || ticket.ttrCompliance === complianceFilter;
      const matchesProvider = providerFilter === 'ALL' || ticket.provider === providerFilter;
      const matchesKategori = kategoriFilter === 'ALL' || ticket.kategori === kategoriFilter;
      const matchesJarak = jarakFilter === 'ALL' || ticket.jarakKmRange === jarakFilter;

      let matchesDateRange = true;
      if (dateRange.from && dateRange.to) {
        const ticketDate = new Date(ticket.jamOpen);
        matchesDateRange = isWithinInterval(ticketDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to),
        });
      } else if (dateRange.from) {
        matchesDateRange = new Date(ticket.jamOpen) >= startOfDay(dateRange.from);
      } else if (dateRange.to) {
        matchesDateRange = new Date(ticket.jamOpen) <= endOfDay(dateRange.to);
      }

      return matchesSearch && matchesStatus && matchesCompliance && 
             matchesProvider && matchesKategori && matchesJarak && matchesDateRange;
    });
  }, [allTickets, searchQuery, statusFilter, complianceFilter, providerFilter, 
      kategoriFilter, jarakFilter, dateRange]);

  const sortedTickets = useMemo(() => {
    return [...filteredTickets].sort((a, b) => {
      switch (sortBy) {
        case 'ttr':
          if (a.status === 'CLOSED' && b.status !== 'CLOSED') return 1;
          if (a.status !== 'CLOSED' && b.status === 'CLOSED') return -1;
          return a.sisaTtrHours - b.sisaTtrHours;
        case 'newest':
          return new Date(b.jamOpen).getTime() - new Date(a.jamOpen).getTime();
        case 'oldest':
          return new Date(a.jamOpen).getTime() - new Date(b.jamOpen).getTime();
        case 'site':
          return a.siteCode.localeCompare(b.siteCode);
        default:
          return 0;
      }
    });
  }, [filteredTickets, sortBy]);

  const handleCopyWhatsApp = (ticket: Ticket) => {
    const message = generateWhatsAppMessage('share', ticket);
    navigator.clipboard.writeText(message);
    toast({
      title: "Pesan WhatsApp Disalin",
      description: `Pesan untuk ${ticket.siteCode} sudah disalin ke clipboard`,
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setComplianceFilter('ALL');
    setProviderFilter('ALL');
    setKategoriFilter('ALL');
    setJarakFilter('ALL');
    setDateRange({ from: undefined, to: undefined });
    setSortBy('newest'); 
  };

  const handlePresetRange = (days: number) => {
    setDateRange({
      from: subDays(new Date(), days - 1),
      to: new Date(),
    });
  };

  const activeFiltersCount = 
    (statusFilter !== 'ALL' ? 1 : 0) + 
    (complianceFilter !== 'ALL' ? 1 : 0) +
    (providerFilter !== 'ALL' ? 1 : 0) +
    (kategoriFilter !== 'ALL' ? 1 : 0) +
    (jarakFilter !== 'ALL' ? 1 : 0) +
    (dateRange.from || dateRange.to ? 1 : 0);

  const FilterSelect = ({ 
    label, 
    value, 
    onValueChange, 
    options, 
    placeholder,
    allLabel = "Semua"
  }: { 
    label: string;
    value: string; 
    onValueChange: (val: string) => void; 
    options: string[];
    placeholder: string;
    allLabel?: string;
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full transition-all duration-200 hover:border-primary/50 focus:ring-primary/20">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[200px] overflow-y-auto">
          <SelectItem value="ALL">{allLabel}</SelectItem>
          {options.map(option => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Layout>
      <SEO title="Semua Tiket" description="Daftar seluruh tiket gangguan Telkom Infra." />
      <div className="space-y-4 md:space-y-6">
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Semua Tiket</h1>
            <p className="text-muted-foreground text-sm mt-1">
              <motion.span
                key={filteredTickets.length}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                {filteredTickets.length}
              </motion.span>
              {' '}dari {allTickets.length} tiket
              {activeFiltersCount > 0 && (
                <motion.span 
                  className="text-primary"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  {' '}• {activeFiltersCount} filter aktif
                </motion.span>
              )}
            </p>
          </div>

          <motion.div 
            className="hidden md:flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 h-9 mr-2" 
              onClick={handleRefresh} 
              disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            
            <span className="text-sm text-muted-foreground">Urutkan:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] transition-all duration-200 hover:border-primary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Terbaru</SelectItem>
                <SelectItem value="oldest">Terlama</SelectItem>
                <SelectItem value="ttr">Sisa TTR</SelectItem>
                <SelectItem value="site">Site Code</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </motion.div>

        <motion.div 
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />
              <Input
                placeholder="Cari INC, site, lokasi, atau teknisi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" className="md:hidden gap-2 shrink-0 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="sr-only sm:not-sr-only">Filter</span>
                    <AnimatePresence>
                      {activeFiltersCount > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
                            {activeFiltersCount}
                          </Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filter & Urutkan</SheetTitle>
                  <SheetDescription>
                    Pilih kriteria untuk menyaring tiket
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-4 mt-4">
                  <FilterSelect
                    label="Urutkan"
                    value={sortBy}
                    onValueChange={setSortBy}
                    options={['newest', 'oldest', 'ttr', 'site']}
                    placeholder="Urutkan"
                    allLabel="Sisa TTR"
                  />
                  
                  <Separator />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[190px] overflow-y-auto">
                        <SelectItem value="ALL">Semua Status</SelectItem>
                        {statusOptions.map(status => (
                          <SelectItem key={status} value={status}>
                            {getStatusLabel(status)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Compliance</label>
                    <Select value={complianceFilter} onValueChange={setComplianceFilter}>
                      <SelectTrigger className="transition-all duration-200 hover:border-primary/50">
                        <SelectValue placeholder="Compliance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Semua</SelectItem>
                        <SelectItem value="COMPLY">Comply</SelectItem>
                        <SelectItem value="NOT COMPLY">Not Comply</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <FilterSelect
                    label="Pelanggan"
                    value={providerFilter}
                    onValueChange={setProviderFilter}
                    options={filterOptions.providers}
                    placeholder="Pelanggan"
                  />

                  <FilterSelect
                    label="Kategori"
                    value={kategoriFilter}
                    onValueChange={setKategoriFilter}
                    options={filterOptions.kategoris}
                    placeholder="Kategori"
                  />

                  <FilterSelect
                    label="Range Jarak"
                    value={jarakFilter}
                    onValueChange={setJarakFilter}
                    options={filterOptions.jaraks}
                    placeholder="Jarak"
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Periode</label>
                    <div className="flex gap-2 flex-wrap">
                      {[7, 14, 30].map((days) => (
                        <motion.div key={days} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handlePresetRange(days)}
                            className="text-xs transition-all duration-200 hover:border-primary/50 hover:bg-primary/5"
                          >
                            {days} Hari
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "flex-1 justify-start text-left font-normal text-xs transition-all duration-200 hover:border-primary/50",
                              !dateRange.from && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {dateRange.from ? format(dateRange.from, "dd MMM yy", { locale: id }) : "Dari"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.from}
                            onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                            disabled={(date) => date > new Date() || (dateRange.to ? date > dateRange.to : false)}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "flex-1 justify-start text-left font-normal text-xs transition-all duration-200 hover:border-primary/50",
                              !dateRange.to && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3 w-3" />
                            {dateRange.to ? format(dateRange.to, "dd MMM yy", { locale: id }) : "Sampai"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={dateRange.to}
                            onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                            disabled={(date) => date > new Date() || (dateRange.from ? date < dateRange.from : false)}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" className="w-full" onClick={clearFilters}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </motion.div>
                    <SheetClose asChild>
                      <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button className="w-full">Terapkan</Button>
                      </motion.div>
                    </SheetClose>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <motion.div 
            className="hidden md:flex items-center gap-2 flex-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] transition-all duration-200 hover:border-primary/50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="max-h-[190px] overflow-y-auto">
                <SelectItem value="ALL">Semua Status</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={complianceFilter} onValueChange={setComplianceFilter}>
              <SelectTrigger className="w-[130px] transition-all duration-200 hover:border-primary/50">
                <SelectValue placeholder="Compliance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Compliance</SelectItem>
                <SelectItem value="COMPLY">Comply</SelectItem>
                <SelectItem value="NOT COMPLY">Not Comply</SelectItem>
              </SelectContent>
            </Select>

            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-[120px] transition-all duration-200 hover:border-primary/50">
                <SelectValue placeholder="Pelanggan" />
              </SelectTrigger>
              <SelectContent className="max-h-[190px] overflow-y-auto">
                <SelectItem value="ALL">Pelanggan</SelectItem>
                {filterOptions.providers.map(provider => (
                  <SelectItem key={provider} value={provider}>
                    {provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FilterCombobox
              value={kategoriFilter}
              onValueChange={setKategoriFilter}
              options={filterOptions.kategoris}
              placeholder="Saverity"
              className="w-[150px]"
            />

            <Select value={jarakFilter} onValueChange={setJarakFilter}>
              <SelectTrigger className="w-[120px] transition-all duration-200 hover:border-primary/50">
                <SelectValue placeholder="Jarak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Jarak</SelectItem>
                {filterOptions.jaraks.map(jarak => (
                  <SelectItem key={jarak} value={jarak}>
                    {jarak}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal transition-all duration-200 hover:border-primary/50",
                    !dateRange.from && !dateRange.to && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd MMM", { locale: id })} - {format(dateRange.to, "dd MMM", { locale: id })}
                      </>
                    ) : (
                      format(dateRange.from, "dd MMM yyyy", { locale: id })
                    )
                  ) : (
                    "Periode"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-4" align="start">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    {[7, 14, 30].map((days) => (
                      <motion.div key={days} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="sm" onClick={() => handlePresetRange(days)}>
                          {days} Hari
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Dari</p>
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                        disabled={(date) => date > new Date() || (dateRange.to ? date > dateRange.to : false)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sampai</p>
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                        disabled={(date) => date > new Date() || (dateRange.from ? date < dateRange.from : false)}
                        className="pointer-events-auto"
                      />
                    </div>
                  </div>
                  <AnimatePresence>
                    {(dateRange.from || dateRange.to) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                          onClick={() => setDateRange({ from: undefined, to: undefined })}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Hapus Periode
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </PopoverContent>
            </Popover>

            <AnimatePresence>
              {activeFiltersCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="hover:bg-destructive/10 hover:text-destructive transition-colors duration-200">
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset ({activeFiltersCount})
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {activeFiltersCount > 0 && (
            <motion.div 
              className="flex flex-wrap gap-2 md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {statusFilter !== 'ALL' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/20 transition-colors duration-200">
                    {getStatusLabel(statusFilter as TicketStatus)}
                    <X 
                      className="w-3 h-3" 
                      onClick={() => setStatusFilter('ALL')}
                    />
                  </Badge>
                </motion.div>
              )}
              {complianceFilter !== 'ALL' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/20 transition-colors duration-200">
                    {complianceFilter}
                    <X 
                      className="w-3 h-3" 
                      onClick={() => setComplianceFilter('ALL')}
                    />
                  </Badge>
                </motion.div>
              )}
              {providerFilter !== 'ALL' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/20 transition-colors duration-200">
                    {providerFilter}
                    <X 
                      className="w-3 h-3" 
                      onClick={() => setProviderFilter('ALL')}
                    />
                  </Badge>
                </motion.div>
              )}
              {kategoriFilter !== 'ALL' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/20 transition-colors duration-200">
                    {kategoriFilter}
                    <X 
                      className="w-3 h-3" 
                      onClick={() => setKategoriFilter('ALL')}
                    />
                  </Badge>
                </motion.div>
              )}
              {jarakFilter !== 'ALL' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/20 transition-colors duration-200">
                    {jarakFilter}
                    <X 
                      className="w-3 h-3" 
                      onClick={() => setJarakFilter('ALL')}
                    />
                  </Badge>
                </motion.div>
              )}
              {(dateRange.from || dateRange.to) && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/20 transition-colors duration-200">
                    {dateRange.from && format(dateRange.from, "dd/MM", { locale: id })}
                    {dateRange.from && dateRange.to && " - "}
                    {dateRange.to && format(dateRange.to, "dd/MM", { locale: id })}
                    <X 
                      className="w-3 h-3" 
                      onClick={() => setDateRange({ from: undefined, to: undefined })}
                    />
                  </Badge>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {isLoading ? (
            <TicketCardSkeleton count={5} />
          ) : sortedTickets.length === 0 ? (
            <motion.div 
              className="text-center py-16 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
              </motion.div>
              <p className="font-medium">Tidak ada tiket yang sesuai filter</p>
              <p className="text-sm mt-1">Coba ubah atau reset filter</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset semua filter
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <AnimatePresence mode="popLayout">
                {sortedTickets.map((ticket, index) => (
                  <TicketCard 
                    key={ticket.id}
                    ticket={ticket} 
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AllTickets;
