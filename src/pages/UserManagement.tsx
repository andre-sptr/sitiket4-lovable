import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUsers } from '@/hooks/useUsers';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical,
  Shield,
  Eye,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Headphones,
  ShieldX,
  UserCircle,
  RefreshCcw,
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useState } from 'react';
import { User, UserRole } from '@/types/ticket';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import SEO from '@/components/SEO';
import { Separator } from '@/components/ui/separator';

const roleIcons = {
  admin: Shield,
  hd: Headphones,
  guest: Eye,
};

const roleLabels = {
  admin: 'Admin',
  hd: 'Help Desk',
  guest: 'Guest',
};

const roleColors = {
  admin: 'bg-primary/10 text-primary border-primary/20',
  hd: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  guest: 'bg-muted text-muted-foreground border-border',
};

const roleIconColors = {
  admin: 'bg-primary/10 text-primary',
  hd: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  guest: 'bg-muted text-muted-foreground',
};

interface UserFormData {
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  phone: string;
  area: string;
  isActive: boolean;
}

const initialFormData: UserFormData = {
  email: '',  
  password: '',
  name: '',
  role: 'guest',
  phone: '',
  area: '',
  isActive: true,
};

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

const userCardVariants = {
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

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { users, isLoaded, addUser, updateUser, deleteUser, toggleUserActive } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const isAdmin = currentUser?.role === 'admin';

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.area?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const usersByRole = {
    admin: filteredUsers.filter(u => u.role === 'admin'),
    hd: filteredUsers.filter(u => u.role === 'hd'),
    guest: filteredUsers.filter(u => u.role === 'guest'),
  };

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleWhatsApp = (phone: string) => {
    const formatted = phone.replace(/\D/g, '').replace(/^0/, '62');
    window.open(`https://wa.me/${formatted}`, '_blank');
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const openAddDialog = () => {
    setEditingUser(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    console.log("Data User yang diedit:", user);
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      name: user.name,
      role: user.role,
      phone: user.phone || '',
      area: user.area || '',
      isActive: user.isActive,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error('Nama dan Email harus diisi');
      return;
    }

    if (!editingUser && (!formData.password || formData.password.length < 6)) {
      toast.error('Password wajib diisi minimal 6 karakter');
      return;
    }

    if (editingUser && formData.password && formData.password.length < 6) {
      toast.error('Password baru minimal harus 6 karakter');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
        toast.success('Pengguna berhasil diperbarui');
        setIsDialogOpen(false);
        setFormData(initialFormData);
        setEditingUser(null);
      } else {
        await addUser(formData);
        setIsDialogOpen(false);
        setFormData(initialFormData);
      }
    } catch (error) {
      console.log("Operation cancelled or failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  if (currentUser?.role === 'guest') {
    return (
      <Layout>
        <SEO title="Manajemen Pengguna" />
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
            Role Guest tidak dapat mengakses halaman ini.
          </p>
          <Button 
            onClick={() => window.history.back()}
            className="btn-ripple gap-2"
          >
            Kembali
          </Button>
        </motion.div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Manajemen Pengguna" />
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
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Manajemen Pengguna
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Kelola admin, help desk, dan guest
              </p>
            </div>
          </div>
          {isAdmin && (
            <div className="flex gap-2 shrink-0">
              <Button 
                className="gap-2 self-start btn-ripple" 
                onClick={openAddDialog}
              >
                <Plus className="w-4 h-4" />
                Tambah Pengguna
              </Button>
            </div>
          )}
        </motion.div>

        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, role, atau area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[200px] h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Filter Role" />
              </div>
            </SelectTrigger>
            <SelectContent className="glass-card">
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="hd">Help Desk</SelectItem>
              <SelectItem value="guest">Guest</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(usersByRole).map(([role, roleUsers], index) => {
            const Icon = roleIcons[role as keyof typeof roleIcons];
            const iconColorClass = roleIconColors[role as keyof typeof roleIconColors];
            
            return (
              <motion.div
                key={role}
                custom={index}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
              >
                <Card className="glass-card card-hover p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconColorClass)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{roleUsers.length}</p>
                      <p className="text-xs text-muted-foreground">
                        {roleLabels[role as keyof typeof roleLabels]}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Card className="glass-card card-hover p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accent text-accent-foreground">
                  <UserCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{users.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* User List Card */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Daftar Pengguna
                </CardTitle>
                <CardDescription>
                  {filteredUsers.length} pengguna ditemukan
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {paginatedUsers.map((user, index) => {
                      const Icon = roleIcons[user.role];
                      const roleColor = roleColors[user.role];
                      const iconColorClass = roleIconColors[user.role];
                      
                      return (
                        <motion.div 
                          key={user.id}
                          custom={index}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={userCardVariants}
                          layout
                          className={cn(
                            "group flex flex-col justify-between rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden",
                            user.isActive 
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
                                  iconColorClass
                                )}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </motion.div>
                              
                              <div className="mt-2 flex items-center">
                                <Badge 
                                  variant="outline" 
                                  className={cn("gap-1.5 font-normal", roleColor)}
                                >
                                  <Icon className="w-3 h-3" />
                                  {roleLabels[user.role]}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors truncate">
                                  {user.name}
                                </h3>
                              </div>
                              
                              <div className="space-y-2 pt-3 mt-1 border-t border-dashed">
                                {user.area ? (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="w-4 h-4 text-primary/60 shrink-0" />
                                    <span className="truncate">{user.area}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                                    <MapPin className="w-4 h-4 text-muted shrink-0" />
                                    <span>-</span>
                                  </div>
                                )}
                                
                                {user.phone ? (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="w-4 h-4 text-primary/60 shrink-0" />
                                    <span>{user.phone}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                                    <Phone className="w-4 h-4 text-muted shrink-0" />
                                    <span>-</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* CARD FOOTER / ACTIONS */}
                          <div className="p-3 bg-muted/30 border-t flex items-center justify-between gap-2">
                            <div className="flex gap-2">
                              {user.phone && (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-full border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 dark:border-emerald-800 dark:hover:bg-emerald-950"
                                    onClick={() => handleWhatsApp(user.phone!)}
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
                                    onClick={() => handleCall(user.phone!)}
                                    title="Telepon"
                                  >
                                    <Phone className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
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
                                    onClick={() => openEditDialog(user)}
                                    className="cursor-pointer"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Data
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                                    onClick={() => openDeleteDialog(user)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  {filteredUsers.length === 0 && isLoaded && (
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
                        <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      </motion.div>
                      <p className="text-lg font-medium">Tidak ada pengguna ditemukan</p>
                      <p className="text-sm mt-1">Coba ubah kata kunci pencarian</p>
                    </motion.div>
                  )}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
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
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md glass-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingUser ? (
                <>
                  <Edit className="w-5 h-5 text-primary" />
                  Edit Pengguna
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-primary" />
                  Tambah Pengguna Baru
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Perbarui informasi pengguna di bawah ini.'
                : 'Isi informasi pengguna baru di bawah ini.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={editingUser ? (editingUser.email || '') : "nama@gmail.com"}
                value={formData.email}
                disabled={!!editingUser} 
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                Password
                {!editingUser ? (
                  <span className="text-destructive"> *</span>
                ) : (
                  <span className="text-muted-foreground ml-1 font-normal text-[10px]">(Opsional)</span>
                )}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={editingUser ? "Password baru" : "Minimal 6 karakter"}
                value={formData.password || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">
                Nama <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Masukkan nama pengguna"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-xs font-medium text-muted-foreground">
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200">
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="admin" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="hd" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4" />
                      Help Desk
                    </div>
                  </SelectItem>
                  <SelectItem value="guest" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Guest
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">
                No. Telepon
              </Label>
              <Input
                id="phone"
                placeholder="Contoh: 081234567890"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area" className="text-xs font-medium text-muted-foreground">
                Area
              </Label>
              <Input
                id="area"
                placeholder="Contoh: Pekanbaru"
                value={formData.area}
                onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                className="h-10 bg-muted/50 border-transparent hover:border-border focus:border-primary/50 focus:bg-card transition-all duration-200"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="icon-hover-wiggle"
            >
              Batal
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-ripple gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-icon-spin" />
                  Menyimpan...
                </>
              ) : (
                editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'
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
              Hapus Pengguna?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin menghapus <strong>{userToDelete?.name}</strong>? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 btn-ripple"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default UserManagement;
