const fs = require('fs');
const file = 'C:/Users/farre/AR_update/components/admin/settings/AdminSettingsHub.tsx';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const replacement1 = `              children: (
                <SettingsTabUmum
                  namaLembaga={namaLembaga} setNamaLembaga={setNamaLembaga}
                  alamatLembaga={alamatLembaga} setAlamatLembaga={setAlamatLembaga}
                  tahunAjaran={tahunAjaran} setTahunAjaran={setTahunAjaran}
                  semesterAktif={semesterAktif} setSemesterAktif={setSemesterAktif}
                  notifikasiWa={notifikasiWa} setNotifikasiWa={setNotifikasiWa}
                />
              ),`;
              
const replacement2 = `              children: (
                <SettingsTabHalaqah
                  maxSantriPerHalaqah={maxSantriPerHalaqah} setMaxSantriPerHalaqah={setMaxSantriPerHalaqah}
                  pendaftaranMandiri={pendaftaranMandiri} setPendaftaranMandiri={setPendaftaranMandiri}
                  autoPlotHalaqah={autoPlotHalaqah} setAutoPlotHalaqah={setAutoPlotHalaqah}
                />
              ),`;
              
const replacement3 = `              children: (
                <SettingsTabUjian
                  kkmDefault={kkmDefault} setKkmDefault={setKkmDefault}
                  bobotKelancaran={bobotKelancaran} setBobotKelancaran={setBobotKelancaran}
                  bobotTajwid={bobotTajwid} setBobotTajwid={setBobotTajwid}
                  defaultSoalMhq={defaultSoalMhq} setDefaultSoalMhq={setDefaultSoalMhq}
                  autoVerifikasiUjian={autoVerifikasiUjian} setAutoVerifikasiUjian={setAutoVerifikasiUjian}
                />
              ),`;
              
const replacement4 = `              children: (
                <SettingsTabAkses
                  twoFactorAuth={twoFactorAuth} setTwoFactorAuth={setTwoFactorAuth}
                  allowGuruEditNilai={allowGuruEditNilai} setAllowGuruEditNilai={setAllowGuruEditNilai}
                  publicRaporAccess={publicRaporAccess} setPublicRaporAccess={setPublicRaporAccess}
                />
              ),`;

let newContent = [
  ...lines.slice(0, 121),
  replacement1,
  ...lines.slice(212, 221),
  replacement2,
  ...lines.slice(284, 293),
  replacement3,
  ...lines.slice(386, 395),
  replacement4,
  ...lines.slice(456)
].join('\n');

const imports = `import { SettingsTabUmum } from "./SettingsTabUmum";
import { SettingsTabHalaqah } from "./SettingsTabHalaqah";
import { SettingsTabUjian } from "./SettingsTabUjian";
import { SettingsTabAkses } from "./SettingsTabAkses";`;

newContent = newContent.replace('import {', imports + '\nimport {');

fs.writeFileSync(file, newContent);
console.log('Success');
