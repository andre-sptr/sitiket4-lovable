import { useState, useEffect, useCallback } from 'react';

export interface AppSettings {
  ttrThresholds: {
    warningHours: number;
    criticalHours: number;
    noUpdateAlertMinutes: number;
    dueSoonHours: number;
  };
  whatsappTemplates: {
    shareTemplate: string;
    updateTemplate: string;
  };
}

const defaultSettings: AppSettings = {
  ttrThresholds: {
    warningHours: 2,
    criticalHours: 1,
    noUpdateAlertMinutes: 60,
    dueSoonHours: 2,
  },
  whatsappTemplates: {
    shareTemplate: '',
    updateTemplate: '',
  },
};

export const getSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem('tiketops_settings');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse settings', e);
  }
  return defaultSettings;
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(getSettings);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'tiketops_settings') {
        setSettings(getSettings());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const refreshSettings = useCallback(() => {
    setSettings(getSettings());
  }, []);

  return { settings, refreshSettings };
};

export const getTTRStatus = (hours: number, thresholds: AppSettings['ttrThresholds']): 'safe' | 'warning' | 'critical' | 'overdue' => {
  if (hours <= 0) return 'overdue';
  if (hours <= thresholds.criticalHours) return 'critical';
  if (hours <= thresholds.warningHours) return 'warning';
  return 'safe';
};

export const isDueSoon = (hours: number, thresholds: AppSettings['ttrThresholds']): boolean => {
  return hours > 0 && hours <= thresholds.dueSoonHours;
};
