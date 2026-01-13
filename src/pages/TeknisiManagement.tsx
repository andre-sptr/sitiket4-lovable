import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeknisiManagement = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { teknisiList, addTeknisi, updateTeknisi, deleteTeknisi, resetToDefault } = useTeknisi();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTeknisi, setSelectedTeknisi] = useState<Teknisi | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    area: '',
    isActive: true,
  });

  if (user?.role === 'guest') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <ShieldX className="w-16 h-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Akses Ditolak</h1>
          <p className="text-muted-foreground text-center max-w-md">
            Anda tidak memiliki izin untuk mengelola data teknisi. Silakan hubungi admin.
          </p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const filteredTeknisi = teknisiList.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.phone.includes(searchQuery)
  );

  const resetForm = () => {
    setFormData({ name: '', phone: '', area: '', isActive: true });
    setSelectedTeknisi(null);
  };

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.area.trim()) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Mohon isi semua field yang diperlukan.',
        variant: 'destructive',
      });
      return;
    }

    addTeknisi({
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
  };

  const handleEdit = () => {
    if (!selectedTeknisi) return;
    
    if (!formData.name.trim() || !formData.phone.trim() || !formData.area.trim()) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Mohon isi semua field yang diperlukan.',
        variant: 'destructive',
      });
      return;
    }

    updateTeknisi(selectedTeknisi.id, {
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
  };

  const handleDelete = (teknisi: Teknisi) => {
    deleteTeknisi(teknisi.id);
    toast({
      title: 'Teknisi Dihapus',
      description: `${teknisi.name} berhasil dihapus.`,
    });
  };

  const handleReset = () => {
    resetToDefault();
    toast({
      title: 'Data Direset',
      description: 'Semua data teknisi dikembalikan ke default.',
    });
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

  const toggleActive = (teknisi: Teknisi) => {
    updateTeknisi(teknisi.id, { isActive: !teknisi.isActive });
    toast({
      title: teknisi.isActive ? 'Teknisi Dinonaktifkan' : 'Teknisi Diaktifkan',
      description: `${teknisi.name} ${teknisi.isActive ? 'dinonaktifkan' : 'diaktifkan'}.`,
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Kelola Teknisi
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Tambah, edit, atau hapus data teknisi lapangan
            </p>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
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
            </AlertDialog>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Teknisi
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Teknisi Baru</DialogTitle>
                  <DialogDescription>
                    Masukkan data teknisi baru yang akan ditambahkan
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-name">Nama Teknisi *</Label>
                    <Input
                      id="add-name"
                      placeholder="Masukkan nama teknisi"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-phone">Nomor HP *</Label>
                    <Input
                      id="add-phone"
                      placeholder="08xxxxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-area">Area Kerja *</Label>
                    <Input
                      id="add-area"
                      placeholder="Masukkan area kerja"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="add-active">Status Aktif</Label>
                    <Switch
                      id="add-active"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleAdd}>Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, area, atau nomor HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="px-3 py-1">
              Total: {teknisiList.length}
            </Badge>
            <Badge variant="default" className="px-3 py-1 bg-green-500">
              Aktif: {teknisiList.filter((t) => t.isActive).length}
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Teknisi</CardTitle>
            <CardDescription>
              {filteredTeknisi.length} teknisi ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Nomor HP</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTeknisi.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? 'Tidak ada teknisi yang cocok dengan pencarian' : 'Belum ada data teknisi'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTeknisi.map((teknisi) => (
                    <TableRow key={teknisi.id}>
                      <TableCell className="font-medium">{teknisi.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          {teknisi.phone}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {teknisi.area}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={teknisi.isActive}
                          onCheckedChange={() => toggleActive(teknisi)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(teknisi)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Teknisi?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus {teknisi.name}? Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(teknisi)}>
                                  Ya, Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Teknisi</DialogTitle>
              <DialogDescription>
                Ubah data teknisi yang dipilih
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nama Teknisi *</Label>
                <Input
                  id="edit-name"
                  placeholder="Masukkan nama teknisi"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Nomor HP *</Label>
                <Input
                  id="edit-phone"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-area">Area Kerja *</Label>
                <Input
                  id="edit-area"
                  placeholder="Masukkan area kerja"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-active">Status Aktif</Label>
                <Switch
                  id="edit-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleEdit}>Simpan Perubahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default TeknisiManagement;
