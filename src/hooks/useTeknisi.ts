import { useState, useEffect, useCallback } from 'react';

export interface Teknisi {
  id: string;
  name: string;
  phone: string;
  area: string;
  isActive: boolean;
}

const defaultTeknisiList: Teknisi[] = [
  { id: '20971173', name: 'EDY DARMINTO', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20990100', name: 'RISKI TRISTIO. P', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20810031', name: 'DINO AFRIANTO', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20921018', name: 'RAHMAT FAJRI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20961385', name: 'RAMADHAN MULYADI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20980878', name: 'ROMA ANANDA PUTRA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '19940205', name: 'ADE TRIA PUTRA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18960154', name: 'ADI JUMAGA SIMANJUNTAK', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20971455', name: 'AHMAD HABIL', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20890114', name: 'ANDI SOPANDI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '19920283', name: 'AULIA FIRDAUS SIREGAR', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25000012', name: 'DELTA PRATAMA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20890117', name: 'FIRMANSYAH', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22990117', name: 'GUNAWAN MARULI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20950857', name: 'GUSRI SULITA INDRA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22010052', name: 'HAYKHAL BAGAS', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20951052', name: 'IQBAL AZIZ', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22000178', name: 'JANU ANWAR MANIK', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22990118', name: 'JENDRA ALFREDI SINAGA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18930009', name: 'JUMADI AWAL', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22030032', name: 'KEVIN ISRAEL TAMBUNAN', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '19920091', name: 'KHAIRUL ANWAR', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22010053', name: 'M HAKIM HABIBA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22010051', name: 'MUHAMMAD ANDIKA FIKRIANSYAH', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22020065', name: 'MUHAMMAD ROIHAN', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22960083', name: 'NOFIYA RANDI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20921023', name: 'OKTAVIANUS', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '19970012', name: 'RANDI HOSANA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20930970', name: 'RENDI PERIANTO', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '19850003', name: 'RENOEL PRADICA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '19930091', name: 'RESTU RESKIA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18980253', name: 'REZA JUNIELFI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20970935', name: 'RIAN MAI FADLY', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20890253', name: 'RIBUT WAHIDI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20880186', name: 'ROMI IRTANTO', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20870146', name: 'SAFRIZAL', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '19970336', name: 'TATANG SUKARNA TARIGAN', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20950856', name: 'YAN FAISAL PRATAMA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22980100', name: 'YOVAN ALBAR NASUTION', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20971214', name: 'JOSUA HERIANTO MARBUN', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20950855', name: 'LALITO PRANATA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18960234', name: 'MUHAMMAD IQBAL', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18930010', name: 'RAHMATDI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22960108', name: 'RUDI SAPUTRA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '19920057', name: 'AGA ANGREA SAPUTRA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '19940263', name: 'AGIL OKTAVIALI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20941176', name: 'FADHILLAH AZANDI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22020040', name: 'FEREZI LUVI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18980025', name: 'G. NATANIEL', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20880002', name: 'HARRY KURNIAWAN', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20930953', name: 'HUTARI SYAPUTRA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18920151', name: 'M. YUSUF HABIBI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20951232', name: 'MITRA ILLAHI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20880185', name: 'PEBRIANDITIA PRANATA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20971580', name: 'RIDUAN', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20970939', name: 'SYAFRIZAL NUR', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22960084', name: 'VICKY AUGUSTO', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25020012', name: 'ANGGA AHMAN MAULANA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25030001', name: 'CAHYO SUPRIONO', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18940132', name: 'DONI HARUN', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25020004', name: 'FIKRAL BONAR PANGGABEAN', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25030002', name: 'KURNIA AHMAD REZY', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25040006', name: 'M. SYUKRI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25900004', name: 'MUHAMMAD YUNUS', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22000179', name: 'REZKI SAIFULLAH', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25990008', name: 'RINO AKTA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25020005', name: 'RISKI SAPUTRA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25990003', name: 'RIZKY ARYANDI SAPUTRA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20941057', name: 'YOGI SAPUTRA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '21960092', name: 'AHMAD ARJUWANDA ANUGRAHA PRATAMA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18970102', name: 'ALFAYAD', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20941016', name: 'DEDI AFRIZON', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '21000080', name: 'HARIS FADLY', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18950250', name: 'HARIZKY HERMAN', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '21020052', name: 'YOGGI SAPUTRA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '21980112', name: 'YOGI PRANANDA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20971215', name: 'FITRA SANDY', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18940250', name: 'RIZIO ADIANTA DARIEN', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20971172', name: 'FADLY HIDAYAT', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20860088', name: 'RIRI EKA PUTRA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20971507', name: 'SURYA PRASETIO', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20950853', name: 'WAHYU FADHILLAH', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '19900003', name: 'ARIF MAULANA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20940720', name: 'BERI KURNIAWAN', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18940128', name: 'DARIATIN WIDODO', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20961409', name: 'DEZY PUTRA MALINDO', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22010054', name: 'DIMAS RIO SWARDY BINTANG', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18970155', name: 'DONI KURNIADI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20941021', name: 'EKO SAPUTRA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18950752', name: 'ERIANTO SERGIO NABABAN', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20961386', name: 'FAUZI AFRIAN', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22010189', name: 'FEBI RIYANTO', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20940850', name: 'FERI HANDANI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22000268', name: 'LUCKY ANDREANSYAH', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22010118', name: 'MUHAMMAD REZKY ADHA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '22980142', name: 'MUHAMMAD RIZKI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20980851', name: 'NANDA SAPUTRA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20971458', name: 'RAPIAN SYAHPUTRA', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18980272', name: 'RENALDI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '19910173', name: 'RICO WARMAN', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18970012', name: 'RIKSON NAIDI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20921025', name: 'SONI JEFRY', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20920714', name: 'SRI WANDOKO', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '19930236', name: 'TEGUH SULASTYO HADI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18970049', name: 'DICKY NOVRIANTO', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '19970312', name: 'DICKY RUARDI', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '20971621', name: 'MUHAMMAD FAJAR Z.', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '18970245', name: 'YOGI NOVIKO', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25020042', name: 'Hendry Christian Purba', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25010027', name: 'Muhammad Fauzan', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25970041', name: 'Rizki Rahmat illahi', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25010026', name: 'Noviardi wijaya', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25020043', name: 'Steven Sianturi', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25000030', name: 'Dewanda Ashauky', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25020044', name: 'RIZKY ADILLAH', phone: '0812345678', area: 'Pekanbaru', isActive: true },
  { id: '25010028', name: 'RIAN AKBAR', phone: '0812345678', area: 'Pekanbaru', isActive: true },
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
  const [isLoaded, setIsLoaded] = useState(false);

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

    const timer = setTimeout(() => setIsLoaded(true), 300);

    return () => {
      window.removeEventListener('teknisi-updated', handleUpdate);
      clearTimeout(timer);
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
    isLoaded,
    refreshTeknisi,
    addTeknisi,
    updateTeknisi,
    deleteTeknisi,
    resetToDefault,
  };
};

export default useTeknisi;
