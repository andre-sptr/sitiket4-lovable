import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { FormSkeleton } from '@/components/skeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, RotateCcw, AlertCircle, ShieldX, Phone, Calendar, Check, ChevronsUpDown, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useDropdownOptions, hsaToStoMap } from '@/hooks/useDropdownOptions';
import { useAuth } from '@/contexts/AuthContext';
import { useTeknisi } from '@/hooks/useTeknisi';
import { useCreateTicket } from '@/hooks/useTickets';
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TicketFormData {
  hsa: string;
  sto: string;
  odc: string;
  stakeHolder: string;
  jenisPelanggan: string;
  kategori: string;
  tiket: string;
  tiketTacc: string;
  indukGamas: string;
  kjd: string;
  summary: string;
  idPelanggan: string;
  namaPelanggan: string;
  datek: string;
  losNonLos: string;
  siteImpact: string;
  classSite: string;
  koordinat: string;
  histori6Bulan: string;
  reportDate: string;
  ttrTarget: string;
  teknisi1: string;
  tim: string;
}

type FormErrors = Partial<Record<keyof TicketFormData, string>>;

const emptyForm: TicketFormData = {
  hsa: '',
  sto: '',
  odc: '',
  stakeHolder: 'TLKM',
  jenisPelanggan: 'TSEL',
  kategori: '',
  tiket: '',
  tiketTacc: '',
  indukGamas: '',
  kjd: '',
  summary: '',
  idPelanggan: '',
  namaPelanggan: '',
  datek: '',
  losNonLos: '',
  siteImpact: '',
  classSite: '',
  koordinat: '',
  histori6Bulan: '',
  reportDate: '',
  ttrTarget: '',
  teknisi1: '',
  tim: '',
};

const REQUIRED_FIELDS: { field: keyof TicketFormData; label: string }[] = [
  { field: 'tiket', label: 'No. Tiket (INC)' },
  { field: 'kategori', label: 'Saverity' },
  { field: 'hsa', label: 'HSA' },
  { field: 'sto', label: 'STO' },
  { field: 'odc', label: 'ODC' },
  { field: 'reportDate', label: 'Report Date' },
  { field: 'idPelanggan', label: 'ID Pelanggan / Site' },
  { field: 'namaPelanggan', label: 'Nama Pelanggan / Site' },
  { field: 'datek', label: 'DATEK' },
  { field: 'teknisi1', label: 'Teknisi' },
];

const ImportTicket = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { options: DROPDOWN_OPTIONS } = useDropdownOptions();
  const { activeTeknisi } = useTeknisi();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<TicketFormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof TicketFormData, boolean>>>({});
  const [openTeknisi, setOpenTeknisi] = useState(false);
  const filteredStoOptions = formData.hsa ? hsaToStoMap[formData.hsa] || [] : [];
  const createTicket = useCreateTicket();

  useEffect(() => {
    const kategori = formData.kategori;
    if (kategori) {
      const match = kategori.match(/\[(\d+)\]/);
      if (match && match[1]) {
        updateField('ttrTarget', match[1]);
      } else {
        updateField('ttrTarget', ''); 
      }
    }
  }, [formData.kategori]);

  useEffect(() => {
    const currentStoOptions = formData.hsa ? hsaToStoMap[formData.hsa] || [] : [];
    if (formData.sto && !currentStoOptions.includes(formData.sto)) {
       updateField('sto', '');
    }
  }, [formData.hsa]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (user?.role === 'guest') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShieldX className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground mb-4">
            Role Guest hanya dapat melihat data, tidak dapat menambah atau mengedit tiket.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Kembali ke Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <FormSkeleton sections={4} fieldsPerSection={6} />
      </Layout>
    );
  }

  const updateField = (field: keyof TicketFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const markTouched = (field: keyof TicketFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    REQUIRED_FIELDS.forEach(({ field, label }) => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = `${label} wajib diisi`;
      }
    });

    if (formData.tiket && !formData.tiket.toUpperCase().startsWith('INC')) {
      newErrors.tiket = 'Format tiket harus dimulai dengan INC (contoh: INC12345678)';
    }

    setErrors(newErrors);
    
    const touchedFields: Partial<Record<keyof TicketFormData, boolean>> = {};
    REQUIRED_FIELDS.forEach(({ field }) => {
      touchedFields[field] = true;
    });
    setTouched(prev => ({ ...prev, ...touchedFields }));

    return Object.keys(newErrors).length === 0;
  };

  const handleReset = () => {
    setFormData(emptyForm);
    setErrors({});
    setTouched({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validasi Gagal",
        description: `Terdapat ${Object.keys(errors).length > 0 ? Object.keys(errors).length : 'beberapa'} field yang perlu diperbaiki`,
        variant: "destructive",
      });
      return;
    }

    try {
      const jamOpen = new Date(formData.reportDate);
      const initialStatus = formData.teknisi1 ? 'ASSIGNED' : 'OPEN';
      const ttrHours = parseInt(formData.ttrTarget) || 24;
      const maxJamClose = new Date(jamOpen.getTime() + (ttrHours * 60 * 60 * 1000));
      let lat = null;
      let lon = null;
      if (formData.koordinat && formData.koordinat.includes(',')) {
        const [latStr, lonStr] = formData.koordinat.split(',').map(s => s.trim());
        lat = parseFloat(latStr);
        lon = parseFloat(lonStr);
      }
      await createTicket.mutateAsync({
        inc_numbers: [formData.tiket],
        site_code: formData.idPelanggan,
        site_name: formData.namaPelanggan,
        kategori: formData.kategori,
        lokasi_text: `${formData.sto} - ${formData.odc}`,
        jam_open: jamOpen.toISOString(),
        ttr_target_hours: ttrHours,
        max_jam_close: maxJamClose.toISOString(),
        status: initialStatus,
        provider: formData.jenisPelanggan,
        kjd: formData.kjd || null,
        inc_gamas: formData.indukGamas || null,
        teknisi_list: formData.teknisi1 ? [formData.teknisi1] : [],
        latitude: isNaN(lat!) ? null : lat,
        longitude: isNaN(lon!) ? null : lon,
        created_by: user?.id,
        raw_ticket_text: formData.summary
      });
      toast({
        title: "Tiket Berhasil Disimpan",
        description: `Tiket ${formData.tiket} telah ditambahkan dengan status ${initialStatus}`,
      });
      navigate('/tickets');
    } catch (error) {
      console.error('Gagal menyimpan tiket:', error);
      toast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan data ke database.",
        variant: "destructive",
      });
    }
  };

  const isFieldRequired = (field: keyof TicketFormData): boolean => {
    return REQUIRED_FIELDS.some(f => f.field === field);
  };

  const getFieldError = (field: keyof TicketFormData): string | undefined => {
    return touched[field] ? errors[field] : undefined;
  };

  const SelectField = ({ 
    label, 
    field, 
    options,
    placeholder = "Pilih...",
  }: { 
    label: string; 
    field: keyof TicketFormData; 
    options: string[];
    placeholder?: string;
  }) => {
    const error = getFieldError(field);
    const required = isFieldRequired(field);
    
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <Select 
          value={formData[field]} 
          onValueChange={(v) => {
            updateField(field, v);
            markTouched(field);
          }}
        >
          <SelectTrigger className={`h-9 ${error ? 'border-destructive ring-1 ring-destructive' : ''}`}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50 max-h-[180px]">
            {options.map(opt => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  };

  const InputField = ({ 
    label, 
    field, 
    placeholder = "",
    type = "text",
  }: { 
    label: string; 
    field: keyof TicketFormData; 
    placeholder?: string;
    type?: string;
  }) => {
    const error = getFieldError(field);
    const required = isFieldRequired(field);
    
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          type={type}
          value={formData[field]}
          onChange={(e) => updateField(field, e.target.value)}
          onBlur={() => markTouched(field)}
          placeholder={placeholder}
          className={`h-9 ${error ? 'border-destructive ring-1 ring-destructive' : ''}`}
        />
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1 mt-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  };

  const setReportDateToNow = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
    
    updateField('reportDate', formattedDate);
  
    if (!touched.reportDate) {
      markTouched('reportDate');
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Layout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Input Tiket Baru</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Masukkan data awal tiket gangguan. Progress & status akan diupdate kemudian.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Save className="w-4 h-4" />
              Simpan
            </Button>
          </div>
        </div>

        {hasErrors && Object.keys(touched).length > 0 && (
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="py-3">
              <div className="flex items-start gap-2 text-destructive">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Mohon lengkapi field berikut:</p>
                  <ul className="text-xs mt-1 list-disc list-inside">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Lokasi & Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <SelectField label="HSA" field="hsa" options={DROPDOWN_OPTIONS.hsa} />
                <SelectField label="STO" field="sto" options={filteredStoOptions} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    ODC <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.odc}
                    onChange={(e) => updateField('odc', e.target.value)}
                    onBlur={() => markTouched('odc')}
                    placeholder="Masukkan ODC"
                    className={`h-9 ${errors.odc && touched.odc ? 'border-destructive ring-1 ring-destructive' : ''}`}
                  />
                  {errors.odc && touched.odc && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.odc}
                    </p>
                  )}
                </div>
                <SelectField label="Stake Holder" field="stakeHolder" options={DROPDOWN_OPTIONS.stakeHolder} />
                <SelectField label="Jenis Pelanggan" field="jenisPelanggan" options={DROPDOWN_OPTIONS.jenisPelanggan} />
                <SelectField label="Saverity" field="kategori" options={DROPDOWN_OPTIONS.kategori} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Informasi Tiket</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    No. Tiket (INC) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.tiket}
                    onChange={(e) => updateField('tiket', e.target.value)}
                    onBlur={() => markTouched('tiket')}
                    placeholder="INC12345678"
                    className={`h-9 ${errors.tiket && touched.tiket ? 'border-destructive ring-1 ring-destructive' : ''}`}
                  />
                  {errors.tiket && touched.tiket && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.tiket}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Tiket TACC
                  </Label>
                  <Input
                    value={formData.tiketTacc}
                    onChange={(e) => updateField('tiketTacc', e.target.value)}
                    onBlur={() => markTouched('tiketTacc')}
                    placeholder="Optional"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Induk GAMAS
                  </Label>
                  <Input
                    value={formData.indukGamas}
                    onChange={(e) => updateField('indukGamas', e.target.value)}
                    onBlur={() => markTouched('indukGamas')}
                    placeholder="Optional"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    KJD
                  </Label>
                  <Input
                    value={formData.kjd}
                    onChange={(e) => updateField('kjd', e.target.value)}
                    onBlur={() => markTouched('kjd')}
                    placeholder="KJD12345"
                    className="h-9"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Report Date <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="datetime-local"
                      value={formData.reportDate}
                      onChange={(e) => updateField('reportDate', e.target.value)}
                      className="pl-9 block w-full"
                    />
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-9 w-9 text-muted-foreground hover:text-primary"
                      onClick={setReportDateToNow}
                      title="Set waktu saat ini"
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.reportDate && touched.reportDate && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.reportDate}
                    </p>
                  )}
                </div>
                <InputField label="TTR Target (Jam)" field="ttrTarget" placeholder="Otomatis..." />
              </div>
              <div className="mt-4">
                <Label className="text-xs font-medium text-muted-foreground">Summary</Label>
                <Textarea
                  value={formData.summary}
                  onChange={(e) => updateField('summary', e.target.value)}
                  placeholder="TSEL_METRO_PBR178_PEKANBARU..."
                  className="mt-1.5 min-h-[60px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Pelanggan & Site</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    ID Pelanggan / Site <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.idPelanggan}
                    onChange={(e) => updateField('idPelanggan', e.target.value)}
                    onBlur={() => markTouched('idPelanggan')}
                    placeholder="PBR123"
                    className={`h-9 ${errors.idPelanggan && touched.idPelanggan ? 'border-destructive ring-1 ring-destructive' : ''}`}
                    />
                    {errors.idPelanggan && touched.idPelanggan && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.idPelanggan}
                      </p>
                    )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Nama Pelanggan / Site <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.namaPelanggan}
                    onChange={(e) => updateField('namaPelanggan', e.target.value)}
                    onBlur={() => markTouched('namaPelanggan')}
                    placeholder="PEKANBARU..."
                    className={`h-9 ${errors.namaPelanggan && touched.namaPelanggan ? 'border-destructive ring-1 ring-destructive' : ''}`}
                    />
                    {errors.namaPelanggan && touched.namaPelanggan && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.namaPelanggan}
                      </p>
                    )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    DATEK <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={formData.datek}
                    onChange={(e) => updateField('datek', e.target.value)}
                    onBlur={() => markTouched('datek')}
                    placeholder="PBR/GPON01-D1-PBB-1"
                    className={`h-9 ${errors.datek && touched.datek ? 'border-destructive ring-1 ring-destructive' : ''}`}
                    />
                    {errors.datek && touched.datek && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.datek}
                      </p>
                    )}
                </div>
                <SelectField label="LOS / Non LOS" field="losNonLos" options={DROPDOWN_OPTIONS.losNonLos} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Site Impact
                  </Label>
                  <Input
                    value={formData.siteImpact}
                    onChange={(e) => updateField('siteImpact', e.target.value)}
                    onBlur={() => markTouched('siteImpact')}
                    placeholder="PBR456"
                    className="h-9"
                  />
                </div>
                <SelectField label="Class Site" field="classSite" options={DROPDOWN_OPTIONS.classSite} />
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Koordinat
                  </Label>
                  <Input
                    value={formData.koordinat}
                    onChange={(e) => updateField('koordinat', e.target.value)}
                    onBlur={() => markTouched('koordinat')}
                    placeholder="-0.123456, 101.123456"
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Histori 6 Bulan
                  </Label>
                  <Input
                    value={formData.histori6Bulan}
                    onChange={(e) => updateField('histori6Bulan', e.target.value)}
                    onBlur={() => markTouched('histori6Bulan')}
                    placeholder="10x"
                    className="h-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Teknisi & Tim</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className={`text-xs font-medium ${errors.teknisi1 && touched.teknisi1 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    Teknisi <span className="text-destructive">*</span>
                  </Label>
                  <Popover open={openTeknisi} onOpenChange={setOpenTeknisi}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openTeknisi}
                        className={cn(
                          "w-full justify-between h-9 px-3 font-normal",
                          !formData.teknisi1 && "text-muted-foreground",
                          errors.teknisi1 && touched.teknisi1 && "border-destructive ring-1 ring-destructive hover:bg-background"
                        )}
                      >
                        {formData.teknisi1
                          ? activeTeknisi.find((teknisi) => teknisi.name === formData.teknisi1)?.name
                          : "Pilih Teknisi..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Cari teknisi..." />
                        <CommandList>
                          <CommandEmpty>Teknisi tidak ditemukan.</CommandEmpty>
                          <CommandGroup>
                            {activeTeknisi.map((teknisi) => (
                              <CommandItem
                                key={teknisi.id}
                                value={teknisi.name}
                                onSelect={(currentValue) => {
                                  updateField('teknisi1', teknisi.name);
                                  setOpenTeknisi(false);
                                  if (!touched.teknisi1) {
                                    markTouched('teknisi1');
                                  }
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.teknisi1 === teknisi.name ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{teknisi.name}</span>
                                  <span className="text-xs text-muted-foreground">{teknisi.area}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {formData.teknisi1 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Phone className="w-3 h-3" />
                      {activeTeknisi.find(t => t.name === formData.teknisi1)?.phone || '-'}
                    </div>
                  )}
                  {errors.teknisi1 && touched.teknisi1 && (
                    <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.teknisi1}
                    </p>
                  )}
                </div>
                <SelectField label="Tim" field="tim" options={DROPDOWN_OPTIONS.tim} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pb-6">
          <Button variant="outline" onClick={handleReset}>
            Reset Form
          </Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Save className="w-4 h-4" />
            Simpan Tiket
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ImportTicket;