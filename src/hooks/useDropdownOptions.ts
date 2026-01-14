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
  odc: [],
  stakeHolder: ['TLKM', 'MTEL', 'LA', 'SPBU', 'UMT', 'ALFAMART', 'INDOMARET', 'KIMIA FARMA'],
  jenisPelanggan: ['DATIN', 'FTM', 'GAMAS', 'HSI', 'INDIBIZ', 'LA', 'MTEL', 'NE', 'ODC', 'OLO', 'POTS', 'SDWAN', 'SIPTRUNK', 'SPBU', 'TSEL', 'UMT', 'WICO', 'WMS LITE', 'WMS REGULER'],
  
  kategori: ['LOW[24]', 'MINOR[16]', 'MAJOR[8]', 'CRITICAL[4]', 'PREMIUM[2]', 'OLO[4]', 'OLO GAMAS[7]', 'OLO QUALITY[7]', 'CNQ', 'HSI RESELLER[6]', 'HSI RESELLER[36]', 'POTS[6]', 
    'INDIBIZ[4]', 'INDIBIZ[24]', 'SIPTRUNK[14]', 'DATIN K2[3.6]', 'DATIN K3[7.2]', 'WICO[12]', 'WMS LITE[3]', 'WMS REGULER[3]', 'LA[5]', 'MTEL[4]', 'NE DOWN[3]', 'SPBU[2]', 'MONET', 
    'SQM', 'MANUAL', 'AP DOWN', 'MOJANG GAUL', 'VALINS', 'GCU', 'COMO', 'REVITALISASI', 'VALIDASI', 'FEEDER[10]', 'DISTRIBUSI[4]', 'ODC[18]', 'ODP[3]', 'UMT[4]', 'PATROLI', 
    'PREVENTIVE', 'INVENTORY', 'MS SDWAN', 'PSB SDWAN'],

  losNonLos: ['LOS', 'NON LOS', 'UNSPEC'],
  classSite: ['Platinum'],
  tim: ['SQUAT-A', 'SQUAT-B'],
  
  statusTiket: ['OPEN', 'ASSIGNED', 'ONPROGRESS', 'PENDING', 'TEMPORARY', 'WAITING_MATERIAL', 'WAITING_ACCESS', 'WAITING_COORDINATION', 'CLOSED', 'GAMAS'],
  compliance: ['COMPLY', 'NOT COMPLY'],
  permanenTemporer: ['PERMANEN', 'TEMPORER LAMA', 'TEMPORER BARU'],
  statusAlatBerat: ['DI LOKASI DAN BEROPERASI', 'STOP TETAPI DI LOKASI', 'TIDAK ADA ALBER DI LOKASI'],
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
  kendala: [],
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
  hsa: 'HSA (Head of Service Area)',
  sto: 'STO (Sentral Telepon Otomat)',
  odc: 'ODC',
  stakeHolder: 'Stake Holder',
  jenisPelanggan: 'Jenis Pelanggan',
  kategori: 'Saverity',
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