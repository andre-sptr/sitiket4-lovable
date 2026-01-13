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
import { Settings as SettingsIcon, Clock, MessageSquare, Save, RotateCcw, AlertTriangle, Timer, Copy, List, Plus, X, GripVertical } from 'lucide-react';
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
    <AccordionItem value={optionKey}>
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center gap-3">
          <span className="font-medium">{label}</span>
          <Badge variant="secondary" className="text-xs">
            {values.length} item
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3 pt-2">
          <div className="flex gap-2">
            <Input
              placeholder="Tambah opsi baru..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleAdd} size="sm" disabled={!newItem.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {values.map((value, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded-md group hover:bg-muted"
              >
                <GripVertical className="w-4 h-4 text-muted-foreground opacity-50" />
                <span className="flex-1 text-sm">{value}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(index)}
                >
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {values.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Belum ada opsi. Tambahkan opsi pertama di atas.
            </p>
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
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <SettingsIcon className="w-6 h-6" />
              Pengaturan
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Konfigurasi sistem, dropdown options, dan template
            </p>
          </div>
        </div>

        <Tabs defaultValue="dropdown" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dropdown" className="gap-2">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Opsi Dropdown</span>
              <span className="sm:hidden">Dropdown</span>
            </TabsTrigger>
            <TabsTrigger value="ttr" className="gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Threshold TTR</span>
              <span className="sm:hidden">TTR</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Template WA</span>
              <span className="sm:hidden">WA</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dropdown" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Kelola Opsi Dropdown</h2>
                <p className="text-sm text-muted-foreground">
                  Tambah, hapus, atau ubah opsi dropdown yang digunakan di form Import dan Update Tiket
                </p>
              </div>
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
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
                <Button onClick={handleSaveDropdownOptions} disabled={!hasDropdownChanges} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Form Import Tiket</CardTitle>
                <CardDescription>
                  Opsi dropdown yang digunakan saat membuat tiket baru
                </CardDescription>
              </CardHeader>
              <CardContent>
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

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Form Update Tiket</CardTitle>
                <CardDescription>
                  Opsi dropdown yang digunakan saat mengupdate tiket
                </CardDescription>
              </CardHeader>
              <CardContent>
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
          </TabsContent>

          <TabsContent value="ttr" className="space-y-4">
            <div className="flex items-center justify-between">
              <div />
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
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
                <Button onClick={handleSave} disabled={!hasChanges} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Simpan
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Standar SLA per Kategori
                </CardTitle>
                <CardDescription>
                  Tentukan durasi target untuk setiap kategori tiket
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(settings.categoryTtr || defaultSettings.categoryTtr).map(([key, val]) => (
                    <div key={key} className="grid gap-2">
                      <Label htmlFor={`cat-${key}`} className="capitalize">
                        {key} (jam)
                      </Label>
                      <Input
                        id={`cat-${key}`}
                        type="number"
                        min={1}
                        value={val}
                        onChange={(e) => handleCategoryTtrChange(key as keyof AppSettings['categoryTtr'], parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Konfigurasi TTR & Reminder
                </CardTitle>
                <CardDescription>
                  Atur kapan sistem menampilkan warning dan alert untuk tiket
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="warningHours" className="flex items-center gap-2">
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
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      Tiket dengan sisa TTR ≤ {settings.ttrThresholds.warningHours} jam ditampilkan kuning
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="criticalHours" className="flex items-center gap-2">
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
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      Tiket dengan sisa TTR ≤ {settings.ttrThresholds.criticalHours} jam ditampilkan merah
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="dueSoonHours" className="flex items-center gap-2">
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
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      Dashboard menampilkan badge "Due Soon" jika sisa TTR ≤ {settings.ttrThresholds.dueSoonHours} jam
                    </span>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="noUpdateAlertMinutes" className="flex items-center gap-2">
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
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      Alert jika tiket belum diupdate TA setelah {settings.ttrThresholds.noUpdateAlertMinutes} menit
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">Preview Indikator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    Safe (&gt; {settings.ttrThresholds.warningHours}j)
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-sm">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    Warning (≤ {settings.ttrThresholds.warningHours}j)
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    Critical (≤ {settings.ttrThresholds.criticalHours}j)
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-200 text-red-800 text-sm">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    Overdue (&lt; 0)
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-4">
            <div className="flex items-center justify-between">
              <div />
              <Button onClick={handleSave} disabled={!hasChanges} size="sm">
                <Save className="w-4 h-4 mr-2" />
                Simpan
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Variabel Template</CardTitle>
                <CardDescription>
                  Gunakan variabel berikut dalam template, sistem akan mengganti otomatis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {templateVariables.map((v) => (
                    <div key={v.var} className="flex items-start gap-2">
                      <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">{v.var}</code>
                      <span className="text-muted-foreground">{v.desc}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Template Share Tiket
                    </CardTitle>
                    <CardDescription>
                      Template pesan WA untuk share tiket ke grup
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyTemplate(settings.whatsappTemplates.shareTemplate)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.whatsappTemplates.shareTemplate}
                  onChange={(e) => handleTemplateChange('shareTemplate', e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                  placeholder="Masukkan template share tiket..."
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Template Update Progress
                    </CardTitle>
                    <CardDescription>
                      Template untuk TA update progress
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyTemplate(settings.whatsappTemplates.updateTemplate)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={settings.whatsappTemplates.updateTemplate}
                  onChange={(e) => handleTemplateChange('updateTemplate', e.target.value)}
                  className="min-h-[250px] font-mono text-sm"
                  placeholder="Masukkan template update progress..."
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;