import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/ticket';
import { toast } from 'sonner';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const combinedUsers: User[] = profiles.map(profile => {
        const userRole = roles.find(r => r.user_id === profile.user_id);
        return {
          id: profile.user_id,
          name: profile.name,
          role: (userRole?.role as UserRole) || 'guest',
          email: profile.email || undefined,
          phone: profile.phone || undefined,
          area: profile.area || undefined,
          isActive: true 
        };
      });

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Gagal mengambil data pengguna');
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('users-management')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchUsers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_roles' }, fetchUsers)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addUser = async (userData: any) => {
    try {
      if (!userData.email || !userData.password) {
        throw new Error("Email dan Password wajib diisi");
      }

      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: userData.email,
          password: userData.password,
          name: userData.name,
          role: userData.role,
          phone: userData.phone,
          area: userData.area
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Pengguna baru berhasil dibuat!');

      await fetchUsers();
      
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(error.message || 'Gagal membuat pengguna baru');
      throw error;
    }
  };

  const updateUser = async (id: string, userData: Partial<User>) => {
    try {
      if (userData.name || userData.phone || userData.area) {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: userData.name,
            phone: userData.phone,
            area: userData.area
          })
          .eq('user_id', id);
        
        if (error) throw error;
      }

      if (userData.role) {
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', id)
          .maybeSingle();

        if (existingRole) {
          const { error } = await supabase
            .from('user_roles')
            .update({ role: userData.role as any })
            .eq('user_id', id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('user_roles')
            .insert({ user_id: id, role: userData.role as any });
          if (error) throw error;
        }
      }

    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', id);

      if (error) throw error;
      toast.success('Profil pengguna dihapus (Akun login mungkin masih ada di Auth)');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Gagal menghapus pengguna');
    }
  };

  const toggleUserActive = async (id: string) => {
    toast.warning('Fitur nonaktifkan pengguna belum tersedia di struktur database saat ini.');
  };

  const getUserById = (id: string) => users.find(user => user.id === id);

  return {
    users,
    isLoaded,
    addUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    getUserById,
  };
};
