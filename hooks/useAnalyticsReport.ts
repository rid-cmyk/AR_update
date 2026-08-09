import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { message } from 'antd';

export function useAnalyticsReport() {
  const [reportData, setReportData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs().startOf('month'), dayjs()]);
  const [reportType, setReportType] = useState<'halaqah' | 'santri' | 'guru' | 'ujian' | 'target' | 'tahfidz'>('halaqah');
  const [selectedSemester, setSelectedSemester] = useState<'S1' | 'S2'>('S1');
  const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('2024/2025');

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = dateRange[0].format('YYYY-MM-DD');
      const endDate = dateRange[1].format('YYYY-MM-DD');
      
      const promises: Promise<any>[] = [
        fetch(`/api/analytics/reports?startDate=${startDate}&endDate=${endDate}`).then(r => r.ok ? r.json() : null)
      ];
      
      if (reportType === 'ujian') {
        promises.push(fetch(`/api/analytics/ujian-reports?startDate=${startDate}&endDate=${endDate}`).then(r => r.ok ? r.json() : null));
      }
      
      if (reportType === 'tahfidz') {
        promises.push(fetch(`/api/analytics/tahfidz-reports?semester=${selectedSemester}&tahunAjaran=${selectedTahunAjaran}`).then(r => r.ok ? r.json() : null));
      }
      
      const results = await Promise.all(promises);
      const mainData = results[0] || {};
      
      let mergedData = { ...mainData };
      
      if (reportType === 'ujian' && results[1]) {
        mergedData.ujian = results[1].data || results[1];
      }
      
      if (reportType === 'tahfidz' && results.length > 1) {
        const tahfidzData = results[results.length - 1];
        if (tahfidzData) mergedData.tahfidz = tahfidzData.data || tahfidzData;
      }
      
      setReportData(mergedData);
    } catch (err) {
      message.error('Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  }, [dateRange, reportType, selectedSemester, selectedTahunAjaran]);

  const exportCSV = useCallback(async () => {
    if (!reportData) return;
    try {
      // Generate basic CSV from JSON object (flattening first level)
      const extractData = () => {
        // Simple logic to extract array of objects from reportData
        if (Array.isArray(reportData)) return reportData;
        if (reportData.data && Array.isArray(reportData.data)) return reportData.data;
        if (reportType === 'ujian' && reportData.ujian) return Array.isArray(reportData.ujian) ? reportData.ujian : [reportData.ujian];
        if (reportType === 'tahfidz' && reportData.tahfidz) return Array.isArray(reportData.tahfidz) ? reportData.tahfidz : [reportData.tahfidz];
        return [reportData];
      };

      const items = extractData();
      if (!items || items.length === 0) {
        message.warning("Tidak ada data untuk diekspor");
        return;
      }
      
      const flattenObj = (ob: any): any => {
        let result: any = {};
        for (const i in ob) {
          if ((typeof ob[i]) === 'object' && !Array.isArray(ob[i]) && ob[i] !== null) {
            const temp = flattenObj(ob[i]);
            for (const j in temp) {
              result[i + '_' + j] = temp[j];
            }
          } else {
            result[i] = ob[i];
          }
        }
        return result;
      };

      const flatItems = items.map(flattenObj);
      const header = Object.keys(flatItems[0]);
      const csv = [
        header.join(','), // header row first
        ...flatItems.map((row: Record<string, any>) => header.map(fieldName => JSON.stringify(row[fieldName] || '')).join(','))
      ].join('\r\n');

      const csvContent = "data:text/csv;charset=utf-8," + csv;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `laporan_${reportType}_${dayjs().format('YYYY-MM-DD')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      message.error("Gagal mengekspor data");
    }
  }, [reportData, reportType]);

  return {
    reportData, loading, dateRange, setDateRange, reportType, setReportType,
    selectedSemester, setSelectedSemester, selectedTahunAjaran, setSelectedTahunAjaran,
    fetchReport, exportCSV,
  };
}
