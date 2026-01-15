import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  Clock, 
  MessageSquare, 
  Save, 
  RotateCcw, 
  AlertTriangle, 
  Timer, 
  Copy, 
  List, 
  Plus, 
  X, 
  GripVertical,
  Sparkles,
  Zap
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  getDropdownOptions, 
  saveDropdownOptions, 
  defaultDropdownOptions,
  dropdownLabels,
  optionGroups,
  DropdownOptions 
} from '@/hooks/useDropdownOptions';
import SEO from '@/components/SEO';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

const defaultSettings = {
  ttrThresholds: {
    warningHours: 2,
    criticalHours: 1,
    noUpdateAlertMinutes: 60,
    dueSoonHours: 2,
  },
  categoryTtr: {
    premium: 2,
    critical: 4,
    major: 8,
    minor: 16,
    low: 24,
  },
  whatsappTemplates: {
    shareTemplate: `🎫 *TIKET HARI INI*
━━━━━━━━━━━━━━━━━━
*[{{kategori}}] - {{siteCode}}*
*{{siteName}}*

📋 *INC:* {{incNumbers}}
📍 *Lokasi:* {{lokasiText}}
🗺️ *Koordinat:* {{koordinat}}
🔗 *Maps:* {{mapsLink}}
📏 *Jarak:* {{jarakKmRange}}

⏰ *Jam Open:* {{jamOpen}}
⏳ *Sisa TTR:* {{sisaTtr}}
📊 *Status:* {{status}}

━━━━━━━━━━━━━━━━━━
📝 Mohon TA update progress berkala.
🔗 Link Tiket: {{ticketLink}}`,
    updateTemplate: `📍 *UPDATE PROGRESS*
━━━━━━━━━━━━━━━━━━
🎫 Tiket: {{incNumbers}}
📍 Site: {{siteCode}} - {{siteName}}

⏰ Jam: {{currentTime}} WIB
📍 Posisi: [On the way/On site/...]
🔧 Aktivitas: [Apa yang dilakukan]
📋 Hasil: [Hasil ukur/temuan]
⚠️ Kendala: [Akses/material/cuaca/tidak ada]
➡️ Next Action & ETA: [Rencana + estimasi]
🆘 Butuh Bantuan: [Ya/Tidak + detail]
━━━━━━━━━━━━━━━━━━`,
  },
};

export interface AppSettings {
  ttrThresholds: {
    warningHours: number;
    criticalHours: number;
    noUpdateAlertMinutes: number;
    dueSoonHours: number;
  };
  categoryTtr: {
    premium: number;
    critical: number;
    major: number;
    minor: number;
    low: number;
  };
  whatsappTemplates: {
    shareTemplate: string;
    updateTemplate: string;
  };
}

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

export const saveSettings = (settings: AppSettings): void => {
  localStorage.setItem('tiketops_settings', JSON.stringify(settings));
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4 },
  },
  hover: {
    y: -2,
    boxShadow: "0 10px 40px -10px hsl(var(--primary) / 0.15)",
    transition: { duration: 0.2 },
  },
};

const DropdownOptionEditor = ({
  optionKey,
  label,
  values,
  onChange,
}: {
  optionKey: string;
  label: string;
  values: string[];
  onChange: (newValues: string[]) => void;
}) => {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim() && !values.includes(newItem.trim())) {
      onChange([...values, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemove = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <AccordionItem value={optionKey} className="border-b border-border/50">
      <AccordionTrigger className="hover:no-underline py-4 px-2 hover:bg-muted/30 rounded-lg transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <List className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium text-foreground">{label}</span>
          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
            {values.length} item
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-3 px-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Tambah opsi baru..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-10 bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all"
              />
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={handleAdd} 
                size="sm" 
                disabled={!newItem.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>

          <AnimatePresence mode="popLayout">
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {values.map((value, index) => (
                <motion.div
                  key={`${optionKey}-${index}`}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg group hover:bg-muted/50 border border-border/30 transition-all"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab" />
                  <span className="flex-1 text-sm text-foreground">{value}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemove(index)}
                    className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>

          {values.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <List className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Belum ada opsi. Tambahkan opsi pertama di atas.</p>
            </motion.div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [dropdownOptions, setDropdownOptions] = useState<DropdownOptions>(getDropdownOptions());
  const [hasChanges, setHasChanges] = useState(false);
  const [hasDropdownChanges, setHasDropdownChanges] = useState(false);

  useEffect(() => {
    const stored = getSettings();
    setSettings(stored);
    setDropdownOptions(getDropdownOptions());
  }, []);

  const handleThresholdChange = (key: keyof AppSettings['ttrThresholds'], value: number) => {
    setSettings(prev => ({
      ...prev,
      ttrThresholds: {
        ...prev.ttrThresholds,
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleCategoryTtrChange = (key: keyof AppSettings['categoryTtr'], value: number) => {
    setSettings(prev => ({
      ...prev,
      categoryTtr: {
        ...prev.categoryTtr,
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleTemplateChange = (key: keyof AppSettings['whatsappTemplates'], value: string) => {
    setSettings(prev => ({
      ...prev,
      whatsappTemplates: {
        ...prev.whatsappTemplates,
        [key]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleDropdownOptionChange = (key: keyof DropdownOptions, values: string[]) => {
    setDropdownOptions(prev => ({
      ...prev,
      [key]: values,
    }));
    setHasDropdownChanges(true);
  };

  const handleSave = () => {
    saveSettings(settings);
    setHasChanges(false);
    toast({
      title: "Pengaturan Disimpan",
      description: "Konfigurasi berhasil disimpan.",
    });
  };

  const handleSaveDropdownOptions = () => {
    saveDropdownOptions(dropdownOptions);
    setHasDropdownChanges(false);
    toast({
      title: "Opsi Dropdown Disimpan",
      description: "Semua perubahan opsi dropdown berhasil disimpan.",
    });
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
    setHasChanges(false);
    toast({
      title: "Pengaturan Direset",
      description: "Konfigurasi dikembalikan ke default.",
    });
  };

  const handleResetDropdownOptions = () => {
    setDropdownOptions(defaultDropdownOptions);
    saveDropdownOptions(defaultDropdownOptions);
    setHasDropdownChanges(false);
    toast({
      title: "Opsi Dropdown Direset",
      description: "Semua opsi dropdown dikembalikan ke default.",
    });
  };

  const handleCopyTemplate = (template: string) => {
    navigator.clipboard.writeText(template);
    toast({
      title: "Template Disalin",
      description: "Template berhasil disalin ke clipboard.",
    });
  };

  const templateVariables = [
    { var: '{{kategori}}', desc: 'Kategori tiket (CNQ, MINOR, dll)' },
    { var: '{{siteCode}}', desc: 'Kode site (PPN555, SSI278)' },
    { var: '{{siteName}}', desc: 'Nama site' },
    { var: '{{incNumbers}}', desc: 'Nomor INC' },
    { var: '{{lokasiText}}', desc: 'Lokasi teks' },
    { var: '{{koordinat}}', desc: 'Koordinat lat, lon' },
    { var: '{{mapsLink}}', desc: 'Link Google Maps' },
    { var: '{{jarakKmRange}}', desc: 'Range jarak (0-40km, dll)' },
    { var: '{{jamOpen}}', desc: 'Jam open tiket' },
    { var: '{{sisaTtr}}', desc: 'Sisa TTR' },
    { var: '{{status}}', desc: 'Status tiket' },
    { var: '{{ticketLink}}', desc: 'Link ke halaman tiket' },
    { var: '{{currentTime}}', desc: 'Waktu saat ini (WIB)' },
  ];

  return (
    <Layout>
      <SEO title="Pengaturan" />
      
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>
      
      <motion.div 
        className="space-y-6 max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <motion.div 
              className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <SettingsIcon className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Pengaturan</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Konfigurasi sistem, dropdown options, dan template
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs defaultValue="dropdown" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl border border-border/50">
              <TabsTrigger 
                value="dropdown" 
                className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all"
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">Opsi Dropdown</span>
                <span className="sm:hidden">Dropdown</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ttr" 
                className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Threshold TTR</span>
                <span className="sm:hidden">TTR</span>
              </TabsTrigger>
              <TabsTrigger 
                value="whatsapp" 
                className="gap-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Template WA</span>
                <span className="sm:hidden">WA</span>
              </TabsTrigger>
            </TabsList>

            {/* Dropdown Options Tab */}
            <TabsContent value="dropdown" className="space-y-6">
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Kelola Opsi Dropdown</h2>
                  <p className="text-sm text-muted-foreground">
                    Tambah, hapus, atau ubah opsi dropdown yang digunakan di form
                  </p>
                </div>
                <div className="flex gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button variant="outline" size="sm" className="border-border/50 hover:bg-muted/50">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </motion.div>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-border/50">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Opsi Dropdown?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Semua opsi dropdown akan dikembalikan ke nilai default. Perubahan yang disimpan akan hilang.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetDropdownOptions}>Ya, Reset</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={handleSaveDropdownOptions} 
                      disabled={!hasDropdownChanges} 
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Simpan
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg shadow-primary/5 overflow-hidden">
                  <CardHeader className="border-b border-border/50 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-foreground">Form Import Tiket</CardTitle>
                        <CardDescription>
                          Opsi dropdown yang digunakan saat membuat tiket baru
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Accordion type="multiple" className="w-full">
                      {optionGroups['Import Tiket'].map((key) => (
                        <DropdownOptionEditor
                          key={key}
                          optionKey={key}
                          label={dropdownLabels[key]}
                          values={dropdownOptions[key]}
                          onChange={(values) => handleDropdownOptionChange(key, values)}
                        />
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg shadow-primary/5 overflow-hidden">
                  <CardHeader className="border-b border-border/50 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/20">
                        <Sparkles className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-foreground">Form Update Tiket</CardTitle>
                        <CardDescription>
                          Opsi dropdown yang digunakan saat mengupdate tiket
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Accordion type="multiple" className="w-full">
                      {optionGroups['Update Tiket'].map((key) => (
                        <DropdownOptionEditor
                          key={key}
                          optionKey={key}
                          label={dropdownLabels[key]}
                          values={dropdownOptions[key]}
                          onChange={(values) => handleDropdownOptionChange(key, values)}
                        />
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* TTR Tab */}
            <TabsContent value="ttr" className="space-y-6">
              <motion.div 
                variants={itemVariants}
                className="flex items-center justify-end gap-2"
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" size="sm" className="border-border/50 hover:bg-muted/50">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </motion.div>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-border/50">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Pengaturan TTR?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Konfigurasi TTR akan dikembalikan ke nilai default.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReset}>Ya, Reset</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleSave} 
                    disabled={!hasChanges} 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Simpan
                  </Button>
                </motion.div>
              </motion.div>

              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg shadow-primary/5 overflow-hidden">
                  <CardHeader className="border-b border-border/50 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Clock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Standar SLA per Kategori</CardTitle>
                        <CardDescription>
                          Tentukan durasi target untuk setiap kategori tiket
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {Object.entries(settings.categoryTtr || defaultSettings.categoryTtr).map(([key, val]) => (
                        <motion.div 
                          key={key} 
                          className="space-y-2"
                          whileHover={{ scale: 1.02 }}
                        >
                          <Label htmlFor={`cat-${key}`} className="capitalize text-foreground font-medium">
                            {key}
                          </Label>
                          <div className="relative">
                            <Input
                              id={`cat-${key}`}
                              type="number"
                              min={1}
                              value={val}
                              onChange={(e) => handleCategoryTtrChange(key as keyof AppSettings['categoryTtr'], parseFloat(e.target.value) || 0)}
                              className="bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20 pr-12"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">jam</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg shadow-primary/5 overflow-hidden">
                  <CardHeader className="border-b border-border/50 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/20">
                        <Timer className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">Konfigurasi TTR & Reminder</CardTitle>
                        <CardDescription>
                          Atur kapan sistem menampilkan warning dan alert untuk tiket
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    {/* Warning Hours */}
                    <motion.div className="space-y-2" whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                      <Label htmlFor="warningHours" className="flex items-center gap-2 text-foreground">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        Threshold Warning (jam)
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="warningHours"
                          type="number"
                          min={0}
                          max={24}
                          step={0.5}
                          value={settings.ttrThresholds.warningHours}
                          onChange={(e) => handleThresholdChange('warningHours', parseFloat(e.target.value) || 0)}
                          className="w-24 bg-muted/30 border-border/50 focus:border-primary/50"
                        />
                        <span className="text-sm text-muted-foreground">
                          Tiket dengan sisa TTR ≤ {settings.ttrThresholds.warningHours} jam ditampilkan kuning
                        </span>
                      </div>
                    </motion.div>

                    {/* Critical Hours */}
                    <motion.div className="space-y-2" whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                      <Label htmlFor="criticalHours" className="flex items-center gap-2 text-foreground">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        Threshold Critical (jam)
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="criticalHours"
                          type="number"
                          min={0}
                          max={24}
                          step={0.5}
                          value={settings.ttrThresholds.criticalHours}
                          onChange={(e) => handleThresholdChange('criticalHours', parseFloat(e.target.value) || 0)}
                          className="w-24 bg-muted/30 border-border/50 focus:border-primary/50"
                        />
                        <span className="text-sm text-muted-foreground">
                          Tiket dengan sisa TTR ≤ {settings.ttrThresholds.criticalHours} jam ditampilkan merah
                        </span>
                      </div>
                    </motion.div>

                    {/* Due Soon Hours */}
                    <motion.div className="space-y-2" whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                      <Label htmlFor="dueSoonHours" className="flex items-center gap-2 text-foreground">
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                        Alert "Due Soon" (jam)
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="dueSoonHours"
                          type="number"
                          min={0}
                          max={24}
                          step={0.5}
                          value={settings.ttrThresholds.dueSoonHours}
                          onChange={(e) => handleThresholdChange('dueSoonHours', parseFloat(e.target.value) || 0)}
                          className="w-24 bg-muted/30 border-border/50 focus:border-primary/50"
                        />
                        <span className="text-sm text-muted-foreground">
                          Dashboard menampilkan badge "Due Soon" jika sisa TTR ≤ {settings.ttrThresholds.dueSoonHours} jam
                        </span>
                      </div>
                    </motion.div>

                    {/* No Update Alert */}
                    <motion.div className="space-y-2" whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
                      <Label htmlFor="noUpdateAlertMinutes" className="flex items-center gap-2 text-foreground">
                        <Clock className="w-4 h-4 text-orange-500" />
                        Alert Tidak Ada Update (menit)
                      </Label>
                      <div className="flex items-center gap-3">
                        <Input
                          id="noUpdateAlertMinutes"
                          type="number"
                          min={15}
                          max={480}
                          step={15}
                          value={settings.ttrThresholds.noUpdateAlertMinutes}
                          onChange={(e) => handleThresholdChange('noUpdateAlertMinutes', parseInt(e.target.value) || 60)}
                          className="w-24 bg-muted/30 border-border/50 focus:border-primary/50"
                        />
                        <span className="text-sm text-muted-foreground">
                          Alert jika tiket belum diupdate TA setelah {settings.ttrThresholds.noUpdateAlertMinutes} menit
                        </span>
                      </div>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Preview Card */}
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="bg-card/50 backdrop-blur-sm border-dashed border-border/50 overflow-hidden">
                  <CardHeader className="border-b border-border/30 bg-muted/20">
                    <CardTitle className="text-base text-foreground flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Preview Indikator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-3">
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium border border-emerald-500/20"
                      >
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        Safe (&gt; {settings.ttrThresholds.warningHours}j)
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-sm font-medium border border-yellow-500/20"
                      >
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        Warning (≤ {settings.ttrThresholds.warningHours}j)
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium border border-red-500/20"
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        Critical (≤ {settings.ttrThresholds.criticalHours}j)
                      </motion.div>
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 text-red-700 dark:text-red-300 text-sm font-medium border border-red-600/20"
                      >
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        Overdue (&lt; 0)
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* WhatsApp Tab */}
            <TabsContent value="whatsapp" className="space-y-6">
              <motion.div 
                variants={itemVariants}
                className="flex items-center justify-end gap-2"
              >
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button variant="outline" size="sm" className="border-border/50 hover:bg-muted/50">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                    </motion.div>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-border/50">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Template WA?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Konfigurasi template akan dikembalikan ke default.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReset}>Ya, Reset</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    onClick={handleSave} 
                    disabled={!hasChanges} 
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Simpan
                  </Button>
                </motion.div>
              </motion.div>

              {/* Variables Card */}
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg shadow-primary/5 overflow-hidden">
                  <CardHeader className="border-b border-border/50 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <svg 
                          viewBox="0 0 24 24" 
                          fill="currentColor" 
                          className="w-5 h-5 text-primary"
                        >
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </div>
                      <div>
                        <CardTitle className="text-base text-foreground">Variabel Template</CardTitle>
                        <CardDescription>
                          Gunakan variabel berikut dalam template, sistem akan mengganti otomatis
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {templateVariables.map((v, index) => (
                        <motion.div 
                          key={v.var} 
                          className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <code className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-mono shrink-0">
                            {v.var}
                          </code>
                          <span className="text-sm text-muted-foreground">{v.desc}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Share Template */}
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg shadow-primary/5 overflow-hidden">
                  <CardHeader className="border-b border-border/50 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <CardTitle className="text-foreground">Template Share Tiket</CardTitle>
                          <CardDescription>
                            Template pesan WA untuk share tiket ke grup
                          </CardDescription>
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCopyTemplate(settings.whatsappTemplates.shareTemplate)}
                          className="border-border/50 hover:bg-muted/50"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Textarea
                      value={settings.whatsappTemplates.shareTemplate}
                      onChange={(e) => handleTemplateChange('shareTemplate', e.target.value)}
                      className="min-h-[300px] font-mono text-sm bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                      placeholder="Masukkan template share tiket..."
                    />
                  </CardContent>
                </Card>
              </motion.div>

              {/* Update Template */}
              <motion.div variants={cardVariants} whileHover="hover">
                <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg shadow-primary/5 overflow-hidden">
                  <CardHeader className="border-b border-border/50 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-foreground">Template Update Progress</CardTitle>
                          <CardDescription>
                            Template untuk TA update progress
                          </CardDescription>
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCopyTemplate(settings.whatsappTemplates.updateTemplate)}
                          className="border-border/50 hover:bg-muted/50"
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <Textarea
                      value={settings.whatsappTemplates.updateTemplate}
                      onChange={(e) => handleTemplateChange('updateTemplate', e.target.value)}
                      className="min-h-[250px] font-mono text-sm bg-muted/30 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                      placeholder="Masukkan template update progress..."
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Settings;