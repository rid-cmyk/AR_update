// 🎯 Form Target Hafalan dengan Support Juz dan Surat
// Komponen untuk guru membuat target hafalan fleksibel

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Target, 
  BookOpen, 
  Calendar as CalendarIcon,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useTargetSurat } from '@/hooks/useProgressJuz';
import { getAllJuzNumbers, getAllSuratNames } from '@/utils/juz-mapping';

interface Santri {
  id: number;
  namaLengkap: string;
  username: string;
}

interface TargetJuzFormProps {
  santriList: Santri[];
  onTargetCreated: () => void;
}

export default function TargetJuzForm({ santriList, onTargetCreated }: TargetJuzFormProps) {
  const [targetType, setTargetType] = useState<'juz' | 'surat'>('juz');
  const [selectedSantri, setSelectedSantri] = useState<number[]>([]);
  const [selectedJuz, setSelectedJuz] = useState<number[]>([]);
  const [selectedSurat, setSelectedSurat] = useState('');
  const [ayatTarget, setAyatTarget] = useState('');
  const [deadline, setDeadline] = useState<Date>();
  const [keterangan, setKeterangan] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { data: targetPreview, generateTarget, loading: previewLoading } = useTargetSurat();

  // Generate preview ketika juz dipilih
  useEffect(() => {
    if (targetType === 'juz' && selectedJuz.length > 0) {
      generateTarget(selectedJuz);
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  }, [selectedJuz, targetType]);

  const handleJuzToggle = (juzNumber: number) => {
    setSelectedJuz(prev => 
      prev.includes(juzNumber) 
        ? prev.filter(j => j !== juzNumber)
        : [...prev, juzNumber].sort()
    );
  };

  const handleSantriToggle = (santriId: number) => {
    setSelectedSantri(prev => 
      prev.includes(santriId)
        ? prev.filter(s => s !== santriId)
        : [...prev, santriId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSantri.length === 0) {
      alert('Pilih minimal 1 santri');
      return;
    }

    if (!deadline) {
      alert('Pilih tanggal deadline');
      return;
    }

    if (targetType === 'juz' && selectedJuz.length === 0) {
      alert('Pilih minimal 1 juz');
      return;
    }

    if (targetType === 'surat' && (!selectedSurat || !ayatTarget)) {
      alert('Pilih surat dan masukkan target ayat');
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      const targetData = {
        santriIds: selectedSantri,
        targetType,
        ...(targetType === 'juz' ? {
          juzTarget: selectedJuz
        } : {
          surat: selectedSurat,
          ayatTarget: parseInt(ayatTarget)
        }),
        deadline: deadline.toISOString(),
        keterangan
      };

      const response = await fetch('/api/guru/target', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(targetData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal membuat target');
      }

      alert('Target hafalan berhasil dibuat!');
      
      // Reset form
      setSelectedSantri([]);
      setSelectedJuz([]);
      setSelectedSurat('');
      setAyatTarget('');
      setDeadline(undefined);
      setKeterangan('');
      setShowPreview(false);
      
      onTargetCreated();

    } catch (error) {
      console.error('❌ Error creating target:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Buat Target Hafalan Baru
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pilih Santri */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Pilih Santri ({selectedSantri.length} dipilih)
            </Label>
            
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
              {santriList.map(santri => (
                <div key={santri.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`santri-${santri.id}`}
                    checked={selectedSantri.includes(santri.id)}
                    onCheckedChange={() => handleSantriToggle(santri.id)}
                  />
                  <Label 
                    htmlFor={`santri-${santri.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {santri.namaLengkap}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Format Target */}
          <div className="space-y-3">
            <Label>Format Target Hafalan</Label>
            <Tabs value={targetType} onValueChange={(value) => setTargetType(value as 'juz' | 'surat')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="juz">Berdasarkan Juz</TabsTrigger>
                <TabsTrigger value="surat">Berdasarkan Surat</TabsTrigger>
              </TabsList>

              <TabsContent value="juz" className="space-y-4">
                <div className="space-y-3">
                  <Label>Pilih Juz Target ({selectedJuz.length} dipilih)</Label>
                  
                  <div className="grid grid-cols-6 gap-2">
                    {getAllJuzNumbers().map(juz => (
                      <Button
                        key={juz}
                        type="button"
                        variant={selectedJuz.includes(juz) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleJuzToggle(juz)}
                        className="h-12"
                      >
                        Juz {juz}
                      </Button>
                    ))}
                  </div>

                  {selectedJuz.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedJuz.map(juz => (
                        <Badge key={juz} variant="secondary">
                          Juz {juz}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preview Target Surat */}
                {showPreview && targetPreview && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Preview Rencana Hafalan
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="text-blue-700">Total Juz:</span>
                        <span className="ml-2 font-medium">{targetPreview.statistik.totalJuz}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Total Surat:</span>
                        <span className="ml-2 font-medium">{targetPreview.statistik.totalSurat}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Total Ayat:</span>
                        <span className="ml-2 font-medium">{targetPreview.statistik.totalAyatTarget}</span>
                      </div>
                      <div>
                        <span className="text-blue-700">Estimasi:</span>
                        <span className="ml-2 font-medium">{targetPreview.statistik.estimasiWaktu}</span>
                      </div>
                    </div>

                    <div className="max-h-32 overflow-y-auto">
                      <div className="text-sm space-y-1">
                        {targetPreview.rencanaHafalan.slice(0, 5).map(rencana => (
                          <div key={rencana.urutan} className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {rencana.urutan}
                            </Badge>
                            <span>{rencana.rencana}</span>
                          </div>
                        ))}
                        {targetPreview.rencanaHafalan.length > 5 && (
                          <div className="text-xs text-gray-500">
                            ... dan {targetPreview.rencanaHafalan.length - 5} surat lainnya
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="surat" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pilih Surat</Label>
                    <Select value={selectedSurat} onValueChange={setSelectedSurat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih surat..." />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllSuratNames().map(surat => (
                          <SelectItem key={surat} value={surat}>
                            {surat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Target Ayat</Label>
                    <Input
                      type="number"
                      placeholder="Jumlah ayat target"
                      value={ayatTarget}
                      onChange={(e) => setAyatTarget(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Deadline
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP", { locale: id }) : "Pilih tanggal deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Keterangan */}
          <div className="space-y-2">
            <Label>Keterangan (Opsional)</Label>
            <Input
              placeholder="Catatan atau instruksi tambahan..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || selectedSantri.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Membuat Target...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Buat Target Hafalan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}