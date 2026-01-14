import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/Layout';
import { UpdateFormSkeleton } from '@/components/skeletons';
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
import { 
  ArrowLeft, 
  Save, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  ShieldX, 
  Phone,
  Users,
  Wrench,
  MapPin,
  Timer,
  FileWarning,
  Loader2,
  Ticket as TicketIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTicket, useUpdateTicket, useAddProgressUpdate } from '@/hooks/useTickets';
import { StatusBadge, TTRBadge, ComplianceBadge } from '@/components/StatusBadge';
import { formatDateWIB } from '@/lib/formatters';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { useAuth } from '@/contexts/AuthContext';
import { useTeknisi } from '@/hooks/useTeknisi';
import { TicketStatus, TTRCompliance } from '@/types/ticket';
import SEO from '@/components/SEO';

interface UpdateFormData {
  statusTiket: string;
  closedDate: string;
  ttrSisa: string;
  compliance: string;
  penyebabNotComply: string;
  segmenTerganggu: string;
  penyebabGangguan: string;
  perbaikanGangguan: string;
  statusAlatBerat: string;
  progressSaatIni: string;
  teknisi1: string;
  teknisi2: string;
  teknisi3: string;
  teknisi4: string;
  permanenTemporer: string;
  koordinatTipus: string;
  dispatchMbb: string;
  prepareTim: string;
  otwKeLokasi: string;
  identifikasi: string;
  breakTime: string;
  splicing: string;
  closing: string;
  totalTtr: string;
  kendala: string;
  atbt: string;
  tiketEksternal: string;
}

type FormErrors = Partial<Record<keyof UpdateFormData, string>>;

const emptyForm: UpdateFormData = {
  statusTiket: '',
  closedDate: '',
  ttrSisa: '',
  compliance: '',
  penyebabNotComply: '',
  segmenTerganggu: '',
  penyebabGangguan: '',
  perbaikanGangguan: '',
  statusAlatBerat: '',
  progressSaatIni: '',
  teknisi1: '',
  teknisi2: '',
  teknisi3: '',
  teknisi4: '',
  permanenTemporer: '',
  koordinatTipus: '',
  dispatchMbb: '',
  prepareTim: '',
  otwKeLokasi: '',
  identifikasi: '',
  breakTime: '',
  splicing: '',
  closing: '',
  totalTtr: '',
  kendala: '',
  atbt: '',
  tiketEksternal: '',
};

const REQUIRED_FIELDS: { field: keyof UpdateFormData; label: string }[] = [
  { field: 'statusTiket', label: 'Status Tiket' },
];

const getConditionalRequiredFields = (formData: UpdateFormData): { field: keyof UpdateFormData; label: string }[] => {
  const conditionalFields: { field: keyof UpdateFormData; label: string }[] = [];
  
  if (formData.statusTiket === 'CLOSED') {
    conditionalFields.push({ field: 'closedDate', label: 'Closed Date' });
    conditionalFields.push({ field: 'compliance', label: 'Compliance' });
  }
  
  if (formData.compliance === 'NOT COMPLY') {
    conditionalFields.push({ field: 'penyebabNotComply', label: 'Penyebab Not Comply' });
  }
  
  return conditionalFields;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

const UpdateTicket = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { options: DROPDOWN_OPTIONS } = useDropdownOptions();
  const { activeTeknisi } = useTeknisi();
  const { data: ticket, isLoading: isTicketLoading } = useTicket(id || '');
  const updateTicketMutation = useUpdateTicket();
  const addProgressMutation = useAddProgressUpdate();
  const [formData, setFormData] = useState<UpdateFormData>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof UpdateFormData, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (ticket) {
      setFormData(prev => ({
        ...prev,
        statusTiket: ticket.status || '',
        compliance: ticket.ttr_compliance || '', 
        ttrSisa: ticket.sisa_ttr_hours?.toString() || '',
        penyebabGangguan: ticket.penyebab || '',
        segmenTerganggu: ticket.segmen || '',
        permanenTemporer: ticket.is_permanent ? 'PERMANEN' : 'TEMPORER',
      }));
    }
  }, [ticket]);

  if (user?.role === 'guest') {
    return (
      <Layout>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mb-6"
          >
            <ShieldX className="w-10 h-10 text-destructive" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Akses Ditolak</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Role Guest hanya dapat melihat data, tidak dapat menambah atau mengedit tiket.
          </p>
          <Button onClick={() => navigate('/dashboard')} className="btn-ripple">
            Kembali ke Dashboard
          </Button>
        </motion.div>
      </Layout>
    );
  }

  if (isTicketLoading) {
    return (
      <Layout>
        <UpdateFormSkeleton />
      </Layout>
    );
  }

  if (!ticket) {
    return (
      <Layout>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FileWarning className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">Tiket tidak ditemukan</p>
          <Button variant="outline" onClick={() => navigate(-1)} className="hover-lift">
            Kembali
          </Button>
        </motion.div>
      </Layout>
    );
  }

  const updateField = (field: keyof UpdateFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const markTouched = (field: keyof UpdateFormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const allRequiredFields = [...REQUIRED_FIELDS, ...getConditionalRequiredFields(formData)];
    
    allRequiredFields.forEach(({ field, label }) => {
      if (!formData[field] || formData[field].trim() === '') {
        newErrors[field] = `${label} wajib diisi`;
      }
    });

    if (formData.closedDate && !/^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}$/.test(formData.closedDate)) {
      newErrors.closedDate = 'Format harus DD/MM/YYYY HH:MM';
    }

    setErrors(newErrors);
    
    const touchedFields: Partial<Record<keyof UpdateFormData, boolean>> = {};
    allRequiredFields.forEach(({ field }) => {
      touchedFields[field] = true;
    });
    setTouched(prev => ({ ...prev, ...touchedFields }));

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Validasi Gagal",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const teknisiList = [formData.teknisi1, formData.teknisi2, formData.teknisi3, formData.teknisi4]
        .filter(t => t && t.trim() !== '');

      const updates = {
        status: formData.statusTiket as TicketStatus,
        ttr_compliance: formData.compliance as TTRCompliance,
        sisa_ttr_hours: parseFloat(formData.ttrSisa) || 0,
        penyebab: formData.penyebabGangguan,
        segmen: formData.segmenTerganggu,
        is_permanent: formData.permanenTemporer === 'PERMANEN',
        teknisi_list: teknisiList.length > 0 ? teknisiList : null,
      };

      await updateTicketMutation.mutateAsync({ 
        id: id!, 
        updates: updates 
      });

      if (formData.progressSaatIni && formData.progressSaatIni.trim() !== '') {
        await addProgressMutation.mutateAsync({
          ticket_id: id!,
          message: formData.progressSaatIni,
          source: 'web',
          status_after_update: formData.statusTiket as TicketStatus,
        });
      }

      toast({
        title: "Update Berhasil",
        description: `Tiket berhasil diupdate`,
      });
      
      navigate(`/ticket/${id}`);

    } catch (error) {
      console.error('Error updating ticket:', error);
      toast({
        title: "Gagal Update",
        description: "Terjadi kesalahan saat menyimpan data.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFieldRequired = (field: keyof UpdateFormData): boolean => {
    const allRequiredFields = [...REQUIRED_FIELDS, ...getConditionalRequiredFields(formData)];
    return allRequiredFields.some(f => f.field === field);
  };

  const getFieldError = (field: keyof UpdateFormData): string | undefined => {
    return touched[field] ? errors[field] : undefined;
  };

  const SelectField = ({ 
    label, 
    field, 
    options,
    placeholder = "Pilih...",
    icon: Icon
  }: { 
    label: string; 
    field: keyof UpdateFormData; 
    options: string[];
    placeholder?: string;
    icon?: React.ElementType;
  }) => {
    const error = getFieldError(field);
    const required = isFieldRequired(field);
    
    return (
      <motion.div 
        className="space-y-2"
        whileTap={{ scale: 0.995 }}
      >
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <Select 
          value={formData[field]} 
          onValueChange={(v) => {
            updateField(field, v);
            markTouched(field);
          }}
        >
          <SelectTrigger 
            className={`h-10 bg-muted/30 border-border/50 transition-all duration-200 
              hover:border-primary/30 hover:bg-muted/50
              focus:ring-2 focus:ring-primary/20 focus:border-primary/50
              ${error ? 'border-destructive ring-1 ring-destructive/20' : ''}`}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/60 shadow-xl z-50">
            {options.map(opt => (
              <SelectItem 
                key={opt} 
                value={opt}
                className="focus:bg-primary/10 cursor-pointer transition-colors"
              >
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-destructive flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const InputField = ({ 
    label, 
    field, 
    placeholder = "",
    type = "text",
    disabled = false,
    icon: Icon
  }: { 
    label: string; 
    field: keyof UpdateFormData; 
    placeholder?: string;
    type?: string;
    disabled?: boolean;
    icon?: React.ElementType;
  }) => {
    const error = getFieldError(field);
    const required = isFieldRequired(field);
    
    return (
      <motion.div 
        className="space-y-2"
        whileTap={{ scale: 0.995 }}
      >
        <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        <Input
          type={type}
          value={formData[field]}
          onChange={(e) => updateField(field, e.target.value)}
          onBlur={() => markTouched(field)}
          placeholder={placeholder}
          className={`h-10 bg-muted/30 border-border/50 transition-all duration-200 
            hover:border-primary/30 hover:bg-muted/50
            focus:ring-2 focus:ring-primary/20 focus:border-primary/50
            ${error ? 'border-destructive ring-1 ring-destructive/20' : ''}`}
          disabled={disabled}
        />
        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-destructive flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <Layout>
      {ticket && (
        <SEO 
          title={`Update ${Array.isArray(ticket.inc_numbers) ? ticket.inc_numbers[0] : ticket.inc_numbers || 'Tiket'}`} 
          description={`Halaman update untuk tiket ${ticket.site_name}`}
        />
      )} 
      <motion.div 
        className="space-y-6 max-w-5xl mx-auto pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-start gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="h-10 w-10 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </motion.div>
          <div className="flex-1">
            <motion.h1 
              className="text-2xl md:text-3xl font-bold flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <TicketIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              Update Tiket
            </motion.h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Update progress dan status tiket dengan informasi terbaru
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="btn-gradient-primary btn-ripple gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Simpan
            </Button>
          </motion.div>
        </motion.div>

        {/* Ticket Summary Card */}
        <motion.div variants={cardVariants}>
          <Card className="glass-card border-primary/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <CardContent className="pt-5 pb-5 relative">
              <div className="flex flex-wrap items-center gap-6">
                <motion.div whileHover={{ scale: 1.02 }} className="group">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">No. Tiket</p>
                  <p className="font-mono font-bold text-lg group-hover:text-primary transition-colors">
                    {Array.isArray(ticket.inc_numbers) ? ticket.inc_numbers.join(', ') : ticket.inc_numbers}
                  </p>
                </motion.div>
                <div className="h-10 w-px bg-border/50 hidden md:block" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Site</p>
                  <p className="font-medium">{ticket.site_code} - {ticket.site_name}</p>
                </div>
                <div className="h-10 w-px bg-border/50 hidden md:block" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Kategori</p>
                  <p className="font-medium">{ticket.kategori}</p>
                </div>
                <div className="h-10 w-px bg-border/50 hidden md:block" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Status</p>
                  <StatusBadge status={ticket.status} />
                </div>
                <div className="h-10 w-px bg-border/50 hidden md:block" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Jam Open</p>
                  <p className="font-mono text-sm">{formatDateWIB(new Date(ticket.jam_open))}</p>
                </div>
                <div className="h-10 w-px bg-border/50 hidden md:block" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">TTR Sisa</p>
                  <TTRBadge hours={ticket.sisa_ttr_hours} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Summary */}
        <AnimatePresence>
          {hasErrors && Object.keys(touched).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
            >
              <Card className="border-destructive/50 bg-destructive/5">
                <CardContent className="py-4">
                  <div className="flex items-start gap-3 text-destructive">
                    <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Mohon lengkapi field berikut:</p>
                      <ul className="text-xs mt-1.5 space-y-0.5">
                        {Object.entries(errors).map(([field, message]) => (
                          <li key={field} className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-destructive" />
                            {message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Sections */}
        <motion.div className="grid gap-5" variants={containerVariants}>
          {/* Status & TTR */}
          <motion.div variants={cardVariants}>
            <Card className="glass-card card-hover overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  Status & TTR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <SelectField 
                    label="Status Tiket" 
                    field="statusTiket" 
                    options={DROPDOWN_OPTIONS.statusTiket}
                    icon={Clock}
                  />
                  <InputField 
                    label="Closed Date" 
                    field="closedDate" 
                    placeholder="DD/MM/YYYY HH:MM"
                    icon={Timer}
                  />
                  <InputField 
                    label="TTR Sisa (Jam)" 
                    field="ttrSisa" 
                    placeholder="Otomatis" 
                    type="number"
                    icon={Timer}
                  />
                  <SelectField 
                    label="Compliance" 
                    field="compliance" 
                    options={DROPDOWN_OPTIONS.compliance}
                    icon={CheckCircle}
                  />
                  <InputField 
                    label="Penyebab Not Comply" 
                    field="penyebabNotComply" 
                    placeholder="Jika NOT COMPLY"
                    icon={AlertTriangle}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gangguan & Perbaikan */}
          <motion.div variants={cardVariants}>
            <Card className="glass-card card-hover overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  Gangguan & Perbaikan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InputField 
                    label="Segmen Terganggu" 
                    field="segmenTerganggu" 
                    placeholder="Segmen A-B" 
                  />
                  <SelectField 
                    label="Penyebab Gangguan" 
                    field="penyebabGangguan" 
                    options={DROPDOWN_OPTIONS.penyebabGangguan} 
                  />
                  <SelectField 
                    label="Perbaikan Gangguan" 
                    field="perbaikanGangguan" 
                    options={DROPDOWN_OPTIONS.perbaikanGangguan} 
                  />
                  <SelectField 
                    label="Status Alat Berat" 
                    field="statusAlatBerat" 
                    options={DROPDOWN_OPTIONS.statusAlatBerat} 
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress */}
          <motion.div variants={cardVariants}>
            <Card className="glass-card card-hover overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                    <Wrench className="w-4 h-4 text-emerald-500" />
                  </div>
                  Progress Saat Ini
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.progressSaatIni}
                  onChange={(e) => updateField('progressSaatIni', e.target.value)}
                  placeholder="Deskripsikan progress penanganan saat ini..."
                  className="min-h-[120px] bg-muted/30 border-border/50 transition-all duration-200 
                    hover:border-primary/30 hover:bg-muted/50
                    focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Tim Teknisi */}
          <motion.div variants={cardVariants}>
            <Card className="glass-card card-hover overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                    <Users className="w-4 h-4 text-violet-500" />
                  </div>
                  Tim Teknisi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(['teknisi1', 'teknisi2', 'teknisi3', 'teknisi4'] as const).map((field, idx) => (
                    <motion.div 
                      key={field} 
                      className="space-y-2"
                      whileHover={{ scale: 1.01 }}
                    >
                      <Label className="text-xs font-medium text-muted-foreground">
                        Teknisi {idx + 1}
                      </Label>
                      <Select 
                        value={formData[field] || "__none__"} 
                        onValueChange={(v) => updateField(field, v === "__none__" ? "" : v)}
                      >
                        <SelectTrigger className="h-10 bg-muted/30 border-border/50 transition-all duration-200 hover:border-primary/30">
                          <SelectValue placeholder="Pilih Teknisi" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/60 shadow-xl z-50">
                          <SelectItem value="__none__">- Kosong -</SelectItem>
                          {activeTeknisi.map(teknisi => (
                            <SelectItem key={teknisi.id} value={teknisi.name}>
                              <div className="flex items-center gap-2">
                                <span>{teknisi.name}</span>
                                <span className="text-xs text-muted-foreground">({teknisi.area})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <AnimatePresence>
                        {formData[field] && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-2 text-xs text-muted-foreground px-1"
                          >
                            <Phone className="w-3 h-3" />
                            {activeTeknisi.find(t => t.name === formData[field])?.phone || '-'}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Perbaikan */}
          <motion.div variants={cardVariants}>
            <Card className="glass-card card-hover overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                    <CheckCircle className="w-4 h-4 text-cyan-500" />
                  </div>
                  Status Perbaikan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField 
                    label="Permanen / Temporer" 
                    field="permanenTemporer" 
                    options={DROPDOWN_OPTIONS.permanenTemporer} 
                  />
                  <InputField 
                    label="Koordinat Tipus" 
                    field="koordinatTipus" 
                    placeholder="-0.123456, 101.123456"
                    icon={MapPin}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Timeline */}
          <motion.div variants={cardVariants}>
            <Card className="glass-card card-hover overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    <Timer className="w-4 h-4 text-indigo-500" />
                  </div>
                  Timeline Penanganan (MBB)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  <InputField label="Dispatch" field="dispatchMbb" placeholder="HH:MM" />
                  <InputField label="Prepare" field="prepareTim" placeholder="HH:MM" />
                  <InputField label="OTW" field="otwKeLokasi" placeholder="HH:MM" />
                  <InputField label="Identifikasi" field="identifikasi" placeholder="HH:MM" />
                  <InputField label="Break" field="breakTime" placeholder="HH:MM" />
                  <InputField label="Splicing" field="splicing" placeholder="HH:MM" />
                  <InputField label="Closing" field="closing" placeholder="HH:MM" />
                  <InputField label="Total TTR" field="totalTtr" placeholder="HH:MM" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Kendala */}
          <motion.div variants={cardVariants}>
            <Card className="glass-card card-hover overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                    <FileWarning className="w-4 h-4 text-rose-500" />
                  </div>
                  Kendala & Informasi Lainnya
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SelectField 
                    label="Kendala" 
                    field="kendala" 
                    options={DROPDOWN_OPTIONS.kendala} 
                  />
                  <InputField label="ATBT" field="atbt" placeholder="Alat Berat yang digunakan" />
                  <InputField label="Tiket Eksternal" field="tiketEksternal" placeholder="Tiket dari sistem lain" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Footer Actions */}
        <motion.div 
          variants={itemVariants}
          className="flex justify-end gap-3 pt-2"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="h-11 px-6 rounded-xl hover:bg-muted/80"
            >
              Batal
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="btn-gradient-primary btn-ripple gap-2 h-11 px-8 rounded-xl shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Simpan Update
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default UpdateTicket;
