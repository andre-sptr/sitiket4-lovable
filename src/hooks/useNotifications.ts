import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('progress_updates')
        .select(`
          id,
          message,
          timestamp,
          tickets (
            site_name,
            site_code
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      if (data) {
        const formatted: NotificationItem[] = data.map((item: any) => ({
          id: item.id,
          title: item.tickets?.site_name || 'System Update',
          message: item.message,
          isRead: true,
          timestamp: item.timestamp
        }));
        setNotifications(formatted);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'progress_updates' },
        async (payload: RealtimePostgresChangesPayload<Tables<'progress_updates'>>) => {
          const newUpdate = payload.new as Tables<'progress_updates'>;
          const { data: ticketData } = await supabase
            .from('tickets')
            .select('site_name')
            .eq('id', newUpdate.ticket_id)
            .single();

          const notif: NotificationItem = {
            id: newUpdate.id,
            title: ticketData?.site_name || 'Tiket Update',
            message: newUpdate.message,
            isRead: false,
            timestamp: newUpdate.timestamp
          };

          setNotifications(prev => [notif, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return {
    notifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
    markAsRead,
    markAllAsRead
  };
};