import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUsers } from '@/hooks/useUsers';
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
  X
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
import { useState } from 'react';
import { User, UserRole } from '@/types/ticket';
import { toast } from 'sonner';

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
  admin: 'bg-blue-100 text-blue-700 border-blue-200',
  hd: 'bg-purple-100 text-purple-700 border-purple-200',
  guest: 'bg-gray-100 text-gray-700 border-gray-200',
};

interface UserFormData {
  name: string;
  role: UserRole;
  phone: string;
  area: string;
  isActive: boolean;
}

const initialFormData: UserFormData = {
  name: '',
  role: 'guest',
  phone: '',
  area: '',
  isActive: true,
};

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const { users, addUser, updateUser, deleteUser, toggleUserActive } = useUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.area?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const usersByRole = {
    admin: filteredUsers.filter(u => u.role === 'admin'),
    hd: filteredUsers.filter(u => u.role === 'hd'),
    guest: filteredUsers.filter(u => u.role === 'guest'),
  };

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
    setEditingUser(user);
    setFormData({
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
    if (!formData.name.trim()) {
      toast.error('Nama pengguna harus diisi');
      return;
    }
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
    }
  };

  const handleDelete = async () => {
    if (userToDelete) {
      await deleteUser(userToDelete.id);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleToggleActive = (user: User) => {
    toggleUserActive(user.id);
    toast.success(`Pengguna ${user.isActive ? 'dinonaktifkan' : 'diaktifkan'}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Pengguna</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Kelola admin, help desk, dan guest
            </p>
          </div>
          {currentUser?.role !== 'guest' && currentUser?.role !== 'hd' && (
            <Button className="gap-2 self-start" onClick={openAddDialog}>
              <Plus className="w-4 h-4" />
              Tambah Pengguna
            </Button>
          )}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, role, atau area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(usersByRole).map(([role, roleUsers]) => {
            const Icon = roleIcons[role as keyof typeof roleIcons];
            return (
              <Card key={role} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    role === 'admin' ? 'bg-blue-100' :
                    role === 'hd' ? 'bg-purple-100' : 'text-gray-600'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      role === 'admin' ? 'text-blue-600' : 
                      role === 'hd' ? 'text-purple-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{roleUsers.length}</p>
                    <p className="text-xs text-muted-foreground">
                      {roleLabels[role as keyof typeof roleLabels]}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daftar Pengguna</CardTitle>
            <CardDescription>
              {filteredUsers.length} pengguna ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              
              {filteredUsers.map(user => {
                const Icon = roleIcons[user.role];
                return (
                  <div 
                    key={user.id} 
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all gap-4"
                  >
                    <div className="flex items-center gap-4 w-full sm:flex-1 sm:min-w-0">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center text-lg font-semibold shrink-0">
                        {user.name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{user.name}</p>
                          <Badge 
                            variant="outline" 
                            className={`gap-1 whitespace-nowrap ${roleColors[user.role]}`}
                          >
                            <Icon className="w-3 h-3" />
                            <span className="hidden sm:inline">
                              {roleLabels[user.role]}
                            </span>
                          </Badge>
                          {!user.isActive && (
                            <Badge variant="secondary" className="whitespace-nowrap">Nonaktif</Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1.5 text-sm text-muted-foreground">
                          {user.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </span>
                          )}
                          {user.area && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {user.area}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center self-end sm:self-auto shrink-0">
                      {user.phone && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleCall(user.phone!)}
                            title="Telepon"
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleWhatsApp(user.phone!)}
                            title="WhatsApp"
                          >
                            <svg 
                              viewBox="0 0 24 24" 
                              fill="currentColor" 
                              className="w-4 h-4" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                          </Button>
                        </>
                      )}

                      {currentUser?.role !== 'guest' && currentUser?.role !== 'hd' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                              {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => openDeleteDialog(user)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground col-span-full">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Tidak ada pengguna ditemukan</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Perbarui informasi pengguna di bawah ini.'
                : 'Isi informasi pengguna baru di bawah ini.'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama *</Label>
              <Input
                id="name"
                placeholder="Masukkan nama pengguna"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="hd">
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4" />
                      Help Desk
                    </div>
                  </SelectItem>
                  <SelectItem value="guest">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Guest
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">No. Telepon</Label>
              <Input
                id="phone"
                placeholder="Contoh: 081234567890"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                placeholder="Contoh: Pekanbaru"
                value={formData.area}
                onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              {editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pengguna "{userToDelete?.name}"? 
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default UserManagement;
