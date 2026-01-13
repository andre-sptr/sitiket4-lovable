import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { useEffect } from 'react';

export type TicketRow = Tables<'tickets'>;
export type TicketInsert = TablesInsert<'tickets'>;
export type TicketUpdate = TablesUpdate<'tickets'>;
export type ProgressUpdateRow = Tables<'progress_updates'>;

export interface TicketWithProgress extends TicketRow {
  progress_updates: ProgressUpdateRow[];
}

export const useTickets = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          progress_updates (*)
        `)
        .order('jam_open', { ascending: false });

      if (error) throw error;
      return data as TicketWithProgress[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('tickets-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tickets'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'progress_updates' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tickets'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          progress_updates (*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as TicketWithProgress | null;
    },
    enabled: !!id,
  });
};

export const useTodayTickets = () => {
  const queryClient = useQueryClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const query = useQuery({
    queryKey: ['tickets', 'today'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          progress_updates (*)
        `)
        .gte('jam_open', today.toISOString())
        .order('jam_open', { ascending: false });

      if (error) throw error;
      return data as TicketWithProgress[];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('today-tickets-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['tickets', 'today'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticket: TicketInsert) => {
      const { data, error } = await supabase
        .from('tickets')
        .insert(ticket)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.resetQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TicketUpdate }) => {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (_, { id }) => {
      await queryClient.resetQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error, count } = await supabase
        .from('tickets')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (error) throw error;
      if (count === 0) {
        throw new Error("Gagal menghapus. Data tidak ditemukan atau akses ditolak.");
      }
    },
    onSuccess: async () => {
      await queryClient.resetQueries({ queryKey: ['tickets'] });
    },
  });
};

export const useAddProgressUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: TablesInsert<'progress_updates'>) => {
      const { data, error } = await supabase
        .from('progress_updates')
        .insert(update)
        .select()
        .single();

      if (error) throw error;

      if (update.status_after_update) {
        const { error: ticketError } = await supabase
          .from('tickets')
          .update({ 
            status: update.status_after_update,
            updated_at: new Date().toISOString() 
          })
          .eq('id', update.ticket_id);

        if (ticketError) throw ticketError;
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets', data.ticket_id] });
    },
  });
};

export const useDashboardStats = () => {
  const { data: tickets } = useTodayTickets();

  const pendingCount = tickets?.filter(t => 
    t.status === 'WAITING_MATERIAL' || 
    t.status === 'WAITING_ACCESS' || 
    t.status === 'WAITING_COORDINATION' ||
    t.status === 'TEMPORARY'
  ).length ?? 0;

  const stats = {
    totalToday: tickets?.length ?? 0,
    openTickets: tickets?.filter(t => t.status === 'OPEN' || t.status === 'ASSIGNED' || t.status === 'ONPROGRESS').length ?? 0,
    overdueTickets: tickets?.filter(t => t.sisa_ttr_hours < 0 && t.status !== 'CLOSED').length ?? 0,
    closedToday: tickets?.filter(t => t.status === 'CLOSED').length ?? 0,
    pendingTickets: pendingCount,
    complianceRate: tickets?.length 
      ? Math.round((tickets.filter(t => t.ttr_compliance === 'COMPLY').length / tickets.length) * 100) 
      : 0,
  };

  return stats;
};
