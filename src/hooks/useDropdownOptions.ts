import { useState, useEffect, useCallback } from 'react';

export interface DropdownOptions {
  hsa: string[];
  sto: string[];
  odc: string[];
  stakeHolder: string[];
  jenisPelanggan: string[];
  kategori: string[];
  losNonLos: string[];
  classSite: string[];
  tim: string[];
  
  statusTiket: string[];
  compliance: string[];
  permanenTemporer: string[];
  statusAlatBerat: string[];
  penyebabGangguan: string[];
  perbaikanGangguan: string[];
  kendala: string[];
}

export const hsaToStoMap: Record<string, string[]> = {
  'ARENGKA': ['ARK'],
  'BUKIT RAYA': ['BKR', 'BKN', 'UBT', 'PPN', 'SAK', 'SEA', 'SGP'],
  'DUMAI': ['DUM', 'BAG', 'BAS', 'SLJ', 'DRI', 'BGU'],
  'PANGKALAN KERINCI': ['PKR', 'RBI', 'PWG', 'SOK', 'MIS'],
  'PEKANBARU': ['PBR'],
  'RENGAT': ['RGT', 'TBH', 'AMK', 'TAK', 'PMB', 'KLE'], 
};

export const defaultDropdownOptions: DropdownOptions = {
  hsa: ['ARENGKA', 'BUKIT RAYA', 'DUMAI', 'PANGKALAN KERINCI', 'PEKANBARU', 'RENGAT'],
  sto: ['ARK', 'BKR', 'BKN', 'UBT', 'PPN', 'SAK', 'SEA', 'SGP', 'DUM', 'BAG', 'BAS', 'SLJ', 'DRI', 'BGU', 'PKR', 'RBI', 'PWG', 'SOK', 'MIS', 'PBR', 'RGT', 'TBH', 'AMK', 'TAK', 'PMB', 'KLE'],
  odc: ['MIS', 'SLJ', 'TBH', 'DUM', 'PKU', 'BKN'],
  stakeHolder: ['TLKM', 'MTEL', 'LA', 'SPBU', 'UMT', 'ALFAMART', 'INDOMARET', 'KIMIA FARMA'],
  jenisPelanggan: ['TSEL', 'OTHER'],
  kategori: ['LOW[24]', 'MINOR[16]', 'MAJOR[8]', 'CRITICAL[4]', 'PREMIUM[2]', 'OLO[4]', 'OLO GAMAS[7]', 'OLO QUALITY[7]', 'CNQ'],
  losNonLos: ['LOS', 'NON LOS', 'UNSPEC'],
  classSite: ['Platinum'],
  tim: ['SQUAT-A', 'SQUAT-B'],
  
  statusTiket: ['OPEN', 'CLOSED', 'GAMAS', 'PENDING', 'ASSIGNED', 'ONPROGRESS', 'TEMPORARY', 'WAITING_MATERIAL', 'WAITING_ACCESS', 'WAITING_COORDINATION' ],
  compliance: ['COMPLY', 'NOT COMPLY'],
  permanenTemporer: ['PERMANEN', 'TEMPORER'],
  statusAlatBerat: ['TIDAK PERLU', 'DIMINTA', 'DALAM PROSES', 'SELESAI'],
  penyebabGangguan: [
    'Kabel Putus',
    'ODP Rusak',
    'Connector Rusak',
    'Power Off',
    'Gangguan Cuaca',
    'Gangguan Pihak Ketiga',
    'Lainnya'
  ],
  perbaikanGangguan: [
    'Splicing',
    'Ganti Connector',
    'Ganti ODP',
    'Recovery Kabel',
    'Reset Perangkat',
    'Lainnya'
  ],
  kendala: [
    'Tidak Ada Kendala',
    'Akses Lokasi Sulit',
    'Menunggu Material',
    'Menunggu Koordinasi',
    'Cuaca Buruk',
    'Alat Berat Belum Tersedia',
    'Lainnya'
  ],
};

const STORAGE_KEY = 'tiketops_dropdown_options';

export const getDropdownOptions = (): DropdownOptions => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultDropdownOptions, ...parsed };
    }
  } catch (e) {
    console.error('Failed to parse dropdown options', e);
  }
  return defaultDropdownOptions;
};

export const saveDropdownOptions = (options: DropdownOptions): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
  window.dispatchEvent(new CustomEvent('dropdown-options-updated'));
};

export const useDropdownOptions = () => {
  const [options, setOptions] = useState<DropdownOptions>(getDropdownOptions);

  useEffect(() => {
    const handleUpdate = () => {
      setOptions(getDropdownOptions());
    };

    window.addEventListener('dropdown-options-updated', handleUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        handleUpdate();
      }
    });

    return () => {
      window.removeEventListener('dropdown-options-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const refreshOptions = useCallback(() => {
    setOptions(getDropdownOptions());
  }, []);

  const updateOptions = useCallback((newOptions: DropdownOptions) => {
    saveDropdownOptions(newOptions);
    setOptions(newOptions);
  }, []);

  return { options, refreshOptions, updateOptions };
};

export const dropdownLabels: Record<keyof DropdownOptions, string> = {
  hsa: 'HSA (Holding Sub Area)',
  sto: 'STO (Sentral Telepon Otomat)',
  odc: 'ODC',
  stakeHolder: 'Stake Holder',
  jenisPelanggan: 'Jenis Pelanggan',
  kategori: 'Kategori Tiket',
  losNonLos: 'LOS / Non LOS',
  classSite: 'Class Site',
  tim: 'Tim',
  statusTiket: 'Status Tiket',
  compliance: 'Compliance',
  permanenTemporer: 'Permanen / Temporer',
  statusAlatBerat: 'Status Alat Berat',
  penyebabGangguan: 'Penyebab Gangguan',
  perbaikanGangguan: 'Perbaikan Gangguan',
  kendala: 'Kendala',
};

export const optionGroups = {
  'Import Tiket': ['hsa', 'sto', 'odc', 'stakeHolder', 'jenisPelanggan', 'kategori', 'losNonLos', 'classSite', 'tim'] as (keyof DropdownOptions)[],
  'Update Tiket': ['statusTiket', 'compliance', 'permanenTemporer', 'statusAlatBerat', 'penyebabGangguan', 'perbaikanGangguan', 'kendala'] as (keyof DropdownOptions)[],
};