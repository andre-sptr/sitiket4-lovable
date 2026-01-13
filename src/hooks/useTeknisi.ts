import { useState, useEffect, useCallback } from 'react';

export interface Teknisi {
  id: string;
  name: string;
  phone: string;
  area: string;
  isActive: boolean;
}

const defaultTeknisiList: Teknisi[] = [
  { id: 'tek-fedry', name: 'Fedry', phone: '081234567801', area: 'Kandis', isActive: true },
  { id: 'tek-dimas', name: 'Dimas Rio Swardy Bintang', phone: '081234567802', area: 'Selat Panjang', isActive: true },
  { id: 'tek-doni', name: 'Doni Harun', phone: '081234567803', area: 'Duri', isActive: true },
  { id: 'tek-syukri', name: 'M. Syukri', phone: '081234567804', area: 'Duri', isActive: true },
  { id: 'tek-wandoko', name: 'Sri Wandoko', phone: '081234567805', area: 'Bagan Siapi-Api', isActive: true },
  { id: 'tek-rino', name: 'Rino Akta', phone: '081234567806', area: 'Bagan Siapi-Api', isActive: true },
  { id: 'tek-adi', name: 'Adi Pratama', phone: '081234567807', area: 'Pekanbaru', isActive: true },
  { id: 'tek-budi', name: 'Budi Santoso', phone: '081234567808', area: 'Dumai', isActive: true },
  { id: 'tek-irwan', name: 'Irwan Setiawan', phone: '081234567809', area: 'Bengkalis', isActive: true },
  { id: 'tek-hendra', name: 'Hendra Wijaya', phone: '081234567810', area: 'Tembilahan', isActive: true },
];

const STORAGE_KEY = 'tiketops_teknisi';

export const getTeknisiList = (): Teknisi[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse teknisi data', e);
  }
  return defaultTeknisiList;
};

export const saveTeknisiList = (teknisiList: Teknisi[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teknisiList));
  window.dispatchEvent(new CustomEvent('teknisi-updated'));
};

export const generateTeknisiId = (): string => {
  return `tek-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useTeknisi = () => {
  const [teknisiList, setTeknisiList] = useState<Teknisi[]>(getTeknisiList);

  useEffect(() => {
    const handleUpdate = () => {
      setTeknisiList(getTeknisiList());
    };

    window.addEventListener('teknisi-updated', handleUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        handleUpdate();
      }
    });

    return () => {
      window.removeEventListener('teknisi-updated', handleUpdate);
    };
  }, []);

  const refreshTeknisi = useCallback(() => {
    setTeknisiList(getTeknisiList());
  }, []);

  const addTeknisi = useCallback((teknisi: Omit<Teknisi, 'id'>) => {
    const newTeknisi: Teknisi = {
      ...teknisi,
      id: generateTeknisiId(),
    };
    const updated = [...getTeknisiList(), newTeknisi];
    saveTeknisiList(updated);
    setTeknisiList(updated);
    return newTeknisi;
  }, []);

  const updateTeknisi = useCallback((id: string, data: Partial<Omit<Teknisi, 'id'>>) => {
    const current = getTeknisiList();
    const updated = current.map((t) => (t.id === id ? { ...t, ...data } : t));
    saveTeknisiList(updated);
    setTeknisiList(updated);
  }, []);

  const deleteTeknisi = useCallback((id: string) => {
    const current = getTeknisiList();
    const updated = current.filter((t) => t.id !== id);
    saveTeknisiList(updated);
    setTeknisiList(updated);
  }, []);

  const resetToDefault = useCallback(() => {
    saveTeknisiList(defaultTeknisiList);
    setTeknisiList(defaultTeknisiList);
  }, []);

  const activeTeknisi = teknisiList.filter((t) => t.isActive);

  return {
    teknisiList,
    activeTeknisi,
    refreshTeknisi,
    addTeknisi,
    updateTeknisi,
    deleteTeknisi,
    resetToDefault,
  };
};

export default useTeknisi;
