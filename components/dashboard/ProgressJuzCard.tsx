// 📊 Komponen Progress Juz Card
// Menampilkan progress hafalan per juz dengan visual yang menarik

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  EyeOff 
} from 'lucide-react';

interface JuzProgress {
  juz: number;
  progress: number;
  ayatHafal: number;
  totalAyat: number;
  detail: string;
  status: 'selesai' | 'proses' | 'belum';
}

interface ProgressJuzCardProps {
  juzProgress: JuzProgress[];
  loading?: boolean;
}

export default function ProgressJuzCard({ juzProgress, loading = false }: ProgressJuzCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);

  // Statistik ringkasan
  const totalSelesai = juzProgress.filter(j => j.status === 'selesai').length;
  const totalProses = juzProgress.filter(j => j.status === 'proses').length;
  const totalBelum = juzProgress.filter(j => j.status === 'belum').length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Progress Hafalan per Juz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="grid grid-cols-6 gap-2">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Progress Hafalan per Juz
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetail(!showDetail)}
          >
            {showDetail ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showDetail ? 'Sembunyikan' : 'Detail'}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statistik Ringkasan */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Selesai</span>
            </div>
            <div className="text-2xl font-bold text-green-800">{totalSelesai}</div>
            <div className="text-xs text-green-600">dari 30 juz</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-700">Proses</span>
            </div>
            <div className="text-2xl font-bold text-yellow-800">{totalProses}</div>
            <div className="text-xs text-yellow-600">sedang berjalan</div>
          </div>
          
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700">Belum</span>
            </div>
            <div className="text-2xl font-bold text-red-800">{totalBelum}</div>
            <div className="text-xs text-red-600">belum dimulai</div>
          </div>
        </div>

        {/* Grid Juz */}
        <div className="grid grid-cols-6 gap-2">
          {juzProgress.map((juz) => (
            <div
              key={juz.juz}
              className={`
                relative p-2 rounded-lg border-2 cursor-pointer transition-all
                ${selectedJuz === juz.juz ? 'ring-2 ring-blue-500' : ''}
                ${juz.status === 'selesai' ? 'bg-green-100 border-green-300 hover:bg-green-200' :
                  juz.status === 'proses' ? 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200' :
                  'bg-red-100 border-red-300 hover:bg-red-200'}
              `}
              onClick={() => setSelectedJuz(selectedJuz === juz.juz ? null : juz.juz)}
            >
              <div className="text-center">
                <div className="text-xs font-medium mb-1">Juz {juz.juz}</div>
                <div className={`
                  text-lg font-bold
                  ${juz.status === 'selesai' ? 'text-green-800' :
                    juz.status === 'proses' ? 'text-yellow-800' :
                    'text-red-800'}
                `}>
                  {juz.progress}%
                </div>
                
                {/* Progress bar mini */}
                <div className="w-full bg-white rounded-full h-1 mt-1">
                  <div 
                    className={`
                      h-1 rounded-full transition-all
                      ${juz.status === 'selesai' ? 'bg-green-600' :
                        juz.status === 'proses' ? 'bg-yellow-600' :
                        'bg-red-600'}
                    `}
                    style={{ width: `${juz.progress}%` }}
                  />
                </div>
              </div>
              
              {/* Status badge */}
              <div className="absolute -top-1 -right-1">
                {juz.status === 'selesai' && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                {juz.status === 'proses' && (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
                {juz.status === 'belum' && (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detail Juz yang dipilih */}
        {selectedJuz && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            {(() => {
              const juz = juzProgress.find(j => j.juz === selectedJuz);
              if (!juz) return null;
              
              return (
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Detail Juz {juz.juz}
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-sm text-blue-700">Progress:</span>
                      <div className="flex items-center gap-2">
                        <Progress value={juz.progress} className="flex-1" />
                        <span className="text-sm font-medium">{juz.progress}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-sm text-blue-700">Ayat:</span>
                      <div className="text-sm font-medium">
                        {juz.ayatHafal} / {juz.totalAyat} ayat
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-blue-700">Surat yang dihafal:</span>
                    <div className="text-sm mt-1">
                      {juz.detail || 'Belum ada hafalan'}
                    </div>
                  </div>
                  
                  <Badge 
                    variant={juz.status === 'selesai' ? 'default' : 
                            juz.status === 'proses' ? 'secondary' : 'destructive'}
                    className="mt-2"
                  >
                    {juz.status === 'selesai' ? '✅ Selesai' :
                     juz.status === 'proses' ? '🔄 Sedang Proses' :
                     '❌ Belum Dimulai'}
                  </Badge>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tampilkan detail lengkap jika diminta */}
        {showDetail && (
          <div className="mt-4 space-y-2">
            <h4 className="font-semibold text-gray-900">Detail Lengkap Semua Juz</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {juzProgress.map((juz) => (
                <div key={juz.juz} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">Juz {juz.juz}</span>
                    <Badge 
                      variant={juz.status === 'selesai' ? 'default' : 
                              juz.status === 'proses' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {juz.progress}%
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    {juz.ayatHafal}/{juz.totalAyat} ayat
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}