# Requirements Document - Sistem Penilaian Ujian

## Introduction

Sistem penilaian ujian adalah fitur yang memungkinkan guru untuk melakukan penilaian santri berdasarkan kategori ujian yang berbeda dengan metode penilaian yang spesifik untuk setiap kategori. Sistem ini mendukung tiga kategori utama: Tasmi' (penilaian per halaman), Kenaikan Juz & UAS (penilaian per juz), dan MHQ (penilaian per pertanyaan dengan kriteria detail).

## Glossary

- **Sistem_Penilaian**: Aplikasi web yang mengelola proses penilaian ujian santri
- **Guru**: Pengguna yang melakukan penilaian terhadap santri
- **Santri**: Siswa yang dinilai dalam ujian
- **Tasmi**: Kategori ujian untuk menilai kelancaran setoran per halaman
- **Kenaikan_Juz**: Kategori ujian untuk menilai penguasaan per juz untuk kenaikan tingkat
- **UAS**: Ujian Akhir Semester yang menilai penguasaan per juz
- **MHQ**: Muraja'ah Hafalan dengan penilaian per pertanyaan menggunakan kriteria detail
- **Juz**: Bagian Al-Quran yang terdiri dari sekitar 20 halaman
- **Halaman**: Unit terkecil dalam juz, berisi ayat-ayat Al-Quran
- **Kriteria_MHQ**: Empat aspek penilaian MHQ (Tajwid, Sifatul Huruf, Kejelasan Bacaan, Kelancaran)
- **Template_MHQ**: Konfigurasi bobot untuk setiap kriteria MHQ yang diatur oleh admin
- **Mushaf_Digital**: Tampilan Al-Quran digital yang menyesuaikan halaman/juz yang sedang diuji

## Requirements

### Requirement 1

**User Story:** As a guru, I want to create a new exam with specific category selection, so that I can assess santri according to the appropriate evaluation method.

#### Acceptance Criteria

1. WHEN guru accesses the exam creation menu, THE Sistem_Penilaian SHALL display a linear workflow with four sequential steps
2. THE Sistem_Penilaian SHALL require guru to select santri from their halaqah before proceeding to category selection
3. THE Sistem_Penilaian SHALL provide three distinct exam categories: Tasmi, Kenaikan_Juz, UAS, and MHQ
4. THE Sistem_Penilaian SHALL require juz range selection (start juz and end juz) for all categories
5. WHEN all required selections are completed, THE Sistem_Penilaian SHALL display category-specific evaluation forms

### Requirement 2

**User Story:** As a guru, I want to evaluate Tasmi exams per page, so that I can assess santri's fluency for each page individually.

#### Acceptance Criteria

1. WHEN guru selects Tasmi category and juz range, THE Sistem_Penilaian SHALL display all pages within the selected juz range
2. THE Sistem_Penilaian SHALL provide one score input field for each page in the range
3. IF juz 1 to 1 is selected, THEN THE Sistem_Penilaian SHALL display 20 rows for 20 pages with individual score fields
4. THE Sistem_Penilaian SHALL calculate final score as total of all page scores divided by number of pages
5. THE Sistem_Penilaian SHALL save individual page scores and calculated final score

### Requirement 3

**User Story:** As a guru, I want to evaluate Kenaikan Juz and UAS exams per juz, so that I can assess santri's overall mastery of each juz.

#### Acceptance Criteria

1. WHEN guru selects Kenaikan_Juz or UAS category and juz range, THE Sistem_Penilaian SHALL display all juz within the selected range
2. THE Sistem_Penilaian SHALL provide one score input field for each juz in the range
3. IF juz 1 to 3 is selected, THEN THE Sistem_Penilaian SHALL display 3 rows for juz 1, 2, and 3 with individual score fields
4. THE Sistem_Penilaian SHALL calculate final score as total of all juz scores divided by number of juz
5. THE Sistem_Penilaian SHALL save individual juz scores and calculated final score

### Requirement 4

**User Story:** As a guru, I want to evaluate MHQ exams with detailed criteria per question, so that I can assess santri's memorization quality comprehensively.

#### Acceptance Criteria

1. WHEN guru selects MHQ category and juz range, THE Sistem_Penilaian SHALL display configuration popup for questions per juz
2. THE Sistem_Penilaian SHALL allow guru to specify number of questions per juz (minimum 1, maximum 10)
3. WHEN configuration is completed, THE Sistem_Penilaian SHALL display evaluation form with four criteria for each question
4. THE Sistem_Penilaian SHALL provide score inputs for Tajwid, Sifatul_Huruf, Kejelasan_Bacaan, and Kelancaran for each question
5. THE Sistem_Penilaian SHALL calculate question score using weighted formula from Template_MHQ

### Requirement 5

**User Story:** As an admin, I want to configure MHQ evaluation criteria and weights, so that the system can automatically calculate MHQ scores according to institutional standards.

#### Acceptance Criteria

1. THE Sistem_Penilaian SHALL provide admin interface for managing MHQ criteria configuration
2. THE Sistem_Penilaian SHALL allow admin to set percentage weights for four criteria: Tajwid, Sifatul_Huruf, Kejelasan_Bacaan, Kelancaran
3. THE Sistem_Penilaian SHALL validate that total percentage weights equal 100%
4. THE Sistem_Penilaian SHALL apply Template_MHQ configuration to all MHQ evaluations automatically
5. THE Sistem_Penilaian SHALL save Template_MHQ changes and apply them to future evaluations

### Requirement 6

**User Story:** As a guru, I want to use digital mushaf and exam session controls during evaluation, so that I can conduct exams efficiently with proper reference materials.

#### Acceptance Criteria

1. WHEN guru conducts any exam, THE Sistem_Penilaian SHALL display Mushaf_Digital alongside the evaluation form
2. THE Sistem_Penilaian SHALL automatically adjust Mushaf_Digital to show pages/juz being evaluated
3. THE Sistem_Penilaian SHALL provide pause exam button to temporarily suspend evaluation session
4. THE Sistem_Penilaian SHALL provide general notes field for overall exam feedback
5. THE Sistem_Penilaian SHALL auto-save evaluation progress as draft during the session

### Requirement 7

**User Story:** As a guru, I want to preview and navigate through evaluation forms easily, so that I can complete assessments efficiently and accurately.

#### Acceptance Criteria

1. THE Sistem_Penilaian SHALL provide preview functionality before final submission
2. THE Sistem_Penilaian SHALL include clear navigation with Previous and Next buttons
3. THE Sistem_Penilaian SHALL validate all required fields before allowing progression
4. THE Sistem_Penilaian SHALL maintain evaluation state when navigating between sections
5. THE Sistem_Penilaian SHALL provide confirmation dialog before final submission

### Requirement 8

**User Story:** As a guru, I want the system to automatically calculate final scores based on category-specific formulas, so that scoring is consistent and accurate across all evaluations.

#### Acceptance Criteria

1. WHEN Tasmi evaluation is completed, THE Sistem_Penilaian SHALL calculate final score as average of all page scores
2. WHEN Kenaikan_Juz or UAS evaluation is completed, THE Sistem_Penilaian SHALL calculate final score as average of all juz scores
3. WHEN MHQ evaluation is completed, THE Sistem_Penilaian SHALL calculate question scores using Template_MHQ weights, then average per juz, then final average
4. THE Sistem_Penilaian SHALL display calculated scores in real-time during evaluation
5. THE Sistem_Penilaian SHALL store both individual component scores and calculated final scores