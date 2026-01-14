import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTeknisi, Teknisi } from '@/hooks/useTeknisi';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  Phone, 
  MapPin, 
  RotateCcw,
  Search,
  ShieldX,
  Wrench,
  UserCheck,
  UserX,
  MoreVertical,
  RefreshCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import SEO from '@/components/SEO';
import { Separator } from '@/components/ui/separator';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: "easeOut" as const
    }
  })
};

const teknisiCardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut" as const
    }
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const TeknisiManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { teknisiList, isLoaded, addTeknisi, updateTeknisi, deleteTeknisi, resetToDefault } = useTeknisi();
  
  const [searchQuery, setSearchQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [selectedTeknisi, setSelectedTeknisi] = useState<Teknisi | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    area: '',
    isActive: true,
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (user?.role === 'guest') {
    return (
      <Layout>
        <SEO title="Kelola Teknisi" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6"
          >
            <ShieldX className="w-10 h-10 text-destructive" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Anda tidak memiliki izin untuk mengelola data teknisi. Silakan hubungi admin.
          </p>
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="btn-ripple gap-2"
          >
            Kembali ke Dashboard
          </Button>
        </motion.div>
      </Layout>
    );
  }

  const filteredTeknisi = teknisiList.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.phone.includes(searchQuery)
  );

  const activeTeknisi = teknisiList.filter((t) => t.isActive);
  const inactiveTeknisi = teknisiList.filter((t) => !t.isActive);

  const totalPages = Math.ceil(filteredTeknisi.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTeknisi = filteredTeknisi.slice(startIndex, startIndex + itemsPerPage);

  const resetForm = () => {
    setFormData({ name: '', phone: '', area: '', isActive: true });
    setSelectedTeknisi(null);
  };

  const handleAdd = async () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.area.trim()) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Mohon isi semua field yang diperlukan.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addTeknisi({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        area: formData.area.trim(),
        isActive: formData.isActive,
      });

      toast({
        title: 'Teknisi Ditambahkan',
        description: `${formData.name} berhasil ditambahkan.`,
      });

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Failed to add teknisi:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedTeknisi) return;
    
    if (!formData.name.trim() || !formData.phone.trim() || !formData.area.trim()) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Mohon isi semua field yang diperlukan.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateTeknisi(selectedTeknisi.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        area: formData.area.trim(),
        isActive: formData.isActive,
      });

      toast({
        title: 'Teknisi Diperbarui',
        description: `Data ${formData.name} berhasil diperbarui.`,
      });

      resetForm();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update teknisi:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTeknisi) return;
    
    try {
      await deleteTeknisi(selectedTeknisi.id);
      toast({
        title: 'Teknisi Dihapus',
        description: `${selectedTeknisi.name} berhasil dihapus.`,
      });
      setIsDeleteDialogOpen(false);
      setSelectedTeknisi(null);
    } catch (error) {
      console.error('Failed to delete teknisi:', error);
    }
  };

  const handleReset = async () => {
    try {
      await resetToDefault();
      toast({
        title: 'Data Direset',
        description: 'Semua data teknisi dikembalikan ke default.',
      });
      setIsResetDialogOpen(false);
    } catch (error) {
      console.error('Failed to reset:', error);
    }
  };

  const openEditDialog = (teknisi: Teknisi) => {
    setSelectedTeknisi(teknisi);
    setFormData({
      name: teknisi.name,
      phone: teknisi.phone,
      area: teknisi.area,
      isActive: teknisi.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (teknisi: Teknisi) => {
    setSelectedTeknisi(teknisi);
    setIsDeleteDialogOpen(true);
  };

  const toggleActive = async (teknisi: Teknisi) => {
    try {
      await updateTeknisi(teknisi.id, { isActive: !teknisi.isActive });
      toast({
        title: teknisi.isActive ? 'Teknisi Dinonaktifkan' : 'Teknisi Diaktifkan',
        description: `${teknisi.name} ${teknisi.isActive ? 'dinonaktifkan' : 'diaktifkan'}.`,
      });
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  const handleWhatsApp = (phone: string) => {
    const formatted = phone.replace(/\D/g, '').replace(/^0/, '62');
    window.open(`https://wa.me/${formatted}`, '_blank');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <Layout>
      <SEO title="Kelola Teknisi" />
      <div className="space-y-6 max-w-6xl mx-auto pb-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Wrench className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Kelola Teknisi
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Tambah, edit, atau hapus data teknisi lapangan
              </p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2 shrink-0">
              {/* <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset Data Teknisi?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Semua data teknisi akan dikembalikan ke nilai default. Perubahan yang disimpan akan hilang.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset}>Ya, Reset</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog> */}
              <Button 
                onClick={() => {
                  resetForm();
                  setIsAddDialogOpen(true);
                }}
                className="gap-2 btn-ripple"
              >
                <Plus className="w-4 h-4" />
                Tambah Teknisi
              </Button>
            </div>
          )}
        </motion.div>

        {/* Search & Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, area, atau nomor HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
            />
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="glass-card card-hover p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent text-accent-foreground">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{teknisiList.length}</p>
                  <p className="text-xs text-muted-foreground">Total Teknisi</p>
                </div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="glass-card card-hover p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeTeknisi.length}</p>
                  <p className="text-xs text-muted-foreground">Aktif</p>
                </div>
              </div>
            </Card>
          </motion.div>
          
          <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="glass-card card-hover p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inactiveTeknisi.length}</p>
                  <p className="text-xs text-muted-foreground">Nonaktif</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Teknisi List Card */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-primary" />
                  Daftar Teknisi
                </CardTitle>
                <CardDescription>
                  {filteredTeknisi.length} teknisi ditemukan
                </CardDescription>
              </div>
              {!isLoaded && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCcw className="w-4 h-4 animate-icon-spin" />
                  Memuat...
                </div>
              )}
            </CardHeader>
            <Separator/>
            <CardContent>
              {!isLoaded ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-card">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                      {paginatedTeknisi.map((teknisi, index) => (
                        <motion.div 
                          key={teknisi.id}
                          custom={index}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={teknisiCardVariants}
                          layout
                          className={cn(
                            "group flex flex-col justify-between rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
                            teknisi.isActive 
                              ? "border-border hover:border-primary/40" 
                              : "border-border/50 opacity-75 hover:opacity-100"
                          )}
                        >
                          {/* CARD BODY */}
                          <div className="p-5 flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className={cn(
                                  "w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold shrink-0 shadow-sm",
                                  teknisi.isActive 
                                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground" 
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {teknisi.name.charAt(0).toUpperCase()}
                              </motion.div>
                              
                              <Badge 
                                variant={teknisi.isActive ? "default" : "secondary"}
                                className={cn(
                                  "px-2.5 py-0.5 text-xs font-medium transition-colors",
                                  teknisi.isActive 
                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/20 border" 
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                                )}
                              >
                                {teknisi.isActive ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                                  {teknisi.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">NIK: {teknisi.id.slice(-6)}</p>
                              </div>
                              
                              <div className="space-y-2 pt-2 border-t border-dashed">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4 text-primary/60 shrink-0" />
                                  <span className="truncate">{teknisi.area}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="w-4 h-4 text-primary/60 shrink-0" />
                                  <span>{teknisi.phone}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* CARD FOOTER / ACTIONS */}
                          <div className="p-3 bg-muted/30 border-t flex items-center justify-between gap-2">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-emerald-800 dark:hover:bg-emerald-950"
                                onClick={() => handleWhatsApp(teknisi.phone)}
                                title="WhatsApp"
                              >
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary"
                                onClick={() => handleCall(teknisi.phone)}
                                title="Telepon"
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                            </div>

                            {isAdmin && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                                  >
                                    <span className="text-xs mr-1">Opsi</span>
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-card w-48">
                                  <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => openEditDialog(teknisi)}
                                    className="cursor-pointer"
                                  >
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit Data
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => toggleActive(teknisi)}
                                    className="cursor-pointer"
                                  >
                                    {teknisi.isActive ? (
                                      <>
                                        <UserX className="w-4 h-4 mr-2" />
                                        Nonaktifkan
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        Aktifkan
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                                    onClick={() => openDeleteDialog(teknisi)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Hapus Permanen
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {filteredTeknisi.length === 0 && isLoaded && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12 text-muted-foreground col-span-full"
                      >
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Wrench className="w-16 h-16 mx-auto mb-4 opacity-30" />
                        </motion.div>
                        <p className="text-lg font-medium">
                          {searchQuery ? 'Tidak ada teknisi yang cocok' : 'Belum ada data teknisi'}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center mt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              className={cn(
                                "cursor-pointer select-none", 
                                currentPage === 1 && "pointer-events-none opacity-50"
                              )} 
                            />
                          </PaginationItem>
                          
                          {Array.from({ length: totalPages }).map((_, i) => {
                            const pageNumber = i + 1;
                            if (
                              totalPages > 7 &&
                              pageNumber !== 1 &&
                              pageNumber !== totalPages &&
                              Math.abs(currentPage - pageNumber) > 1
                            ) {
                              if (pageNumber === 2 || pageNumber === totalPages - 1) {
                                return (
                                  <PaginationItem key={i}>
                                    <span className="px-2 text-muted-foreground">...</span>
                                  </PaginationItem>
                                );
                              }
                              return null;
                            }

                            return (
                              <PaginationItem key={i}>
                                <PaginationLink
                                  isActive={pageNumber === currentPage}
                                  onClick={() => setCurrentPage(pageNumber)}
                                  className="cursor-pointer select-none"
                                >
                                  {pageNumber}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}

                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              className={cn(
                                "cursor-pointer select-none", 
                                currentPage === totalPages && "pointer-events-none opacity-50"
                              )}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md glass-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Tambah Teknisi Baru
            </DialogTitle>
            <DialogDescription>
              Masukkan data teknisi baru yang akan ditambahkan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name" className="text-xs font-medium text-muted-foreground">
                Nama Teknisi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-name"
                placeholder="Masukkan nama teknisi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-phone" className="text-xs font-medium text-muted-foreground">
                Nomor HP <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-phone"
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-area" className="text-xs font-medium text-muted-foreground">
                Area Kerja <span className="text-destructive">*</span>
              </Label>
              <Input
                id="add-area"
                placeholder="Masukkan area kerja"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <Label htmlFor="add-active" className="text-sm font-medium">Status Aktif</Label>
              <Switch
                id="add-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
              className="icon-hover-wiggle"
            >
              Batal
            </Button>
            <Button 
              onClick={handleAdd}
              disabled={isSubmitting}
              className="btn-ripple gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-icon-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md glass-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Edit Teknisi
            </DialogTitle>
            <DialogDescription>
              Ubah data teknisi yang dipilih
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-xs font-medium text-muted-foreground">
                Nama Teknisi <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                placeholder="Masukkan nama teknisi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-xs font-medium text-muted-foreground">
                Nomor HP <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-phone"
                placeholder="08xxxxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-area" className="text-xs font-medium text-muted-foreground">
                Area Kerja <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-area"
                placeholder="Masukkan area kerja"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
              />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <Label htmlFor="edit-active" className="text-sm font-medium">Status Aktif</Label>
              <Switch
                id="edit-active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              className="icon-hover-wiggle"
            >
              Batal
            </Button>
            <Button 
              onClick={handleEdit}
              disabled={isSubmitting}
              className="btn-ripple gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-icon-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Perubahan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Hapus Teknisi?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus <strong>{selectedTeknisi?.name}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 btn-ripple"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-500" />
              Reset Data Teknisi?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Semua data teknisi akan dikembalikan ke nilai default. 
              Perubahan yang disimpan akan hilang.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReset}
              className="btn-ripple"
            >
              Ya, Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default TeknisiManagement;
