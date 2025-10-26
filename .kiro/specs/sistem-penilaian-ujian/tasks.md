# Implementation Plan - Sistem Penilaian Ujian

- [ ] 1. Setup project structure and core interfaces
  - Create directory structure for exam evaluation components
  - Define TypeScript interfaces for all data models (UjianData, ExamCategory, EvaluationScores, MHQTemplate)
  - Create base types for exam categories and scoring systems
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 2. Implement core UI components and design system
- [ ] 2.1 Create StepIndicator component with modern progress visualization
  - Build horizontal progress bar with circular step indicators
  - Implement smooth animations for step transitions
  - Add responsive design for mobile devices
  - _Requirements: 7.2, 7.3_

- [ ] 2.2 Build CategorySelection component with elegant card design
  - Create category cards with icons, descriptions, and hover animations
  - Implement selection states with visual feedback
  - Add color-coded category system (Tasmi, Kenaikan Juz, UAS, MHQ)
  - _Requirements: 1.3, 1.4_

- [ ] 2.3 Develop JuzRangeSelector with intuitive range selection
  - Build dual slider component for juz range selection
  - Add validation for valid juz ranges
  - Implement visual feedback for selected ranges
  - _Requirements: 1.4, 1.5_

- [ ] 3. Create category-specific evaluation forms
- [ ] 3.1 Implement TasmiForm for per-page evaluation
  - Build grid layout displaying all pages in selected juz range
  - Create individual score input fields for each page
  - Implement real-time average calculation display
  - Add progress indicator showing completion percentage
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 3.2 Build KenaikanJuzForm for per-juz evaluation
  - Create simplified card layout for each juz in range
  - Implement score input fields with validation
  - Add animated score calculation display
  - Build juz summary information display
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3.3 Develop MHQForm for detailed criteria-based evaluation
  - Create accordion-style layout for each juz
  - Build question cards with 4-column criteria grid (Tajwid, Sifatul Huruf, Kejelasan Bacaan, Kelancaran)
  - Implement color-coded criteria with icons
  - Add real-time weighted score calculation using MHQ template
  - Create visual progress indicators for each juz completion
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4. Build MHQ template management system
- [ ] 4.1 Create admin interface for MHQ criteria configuration
  - Build form for setting percentage weights for four criteria
  - Implement validation ensuring total weights equal 100%
  - Add preview of calculation formula
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 4.2 Implement MHQ template application system
  - Create system to apply template configuration to evaluations
  - Build automatic calculation engine using weighted formula
  - Add template versioning and change tracking
  - _Requirements: 5.4, 5.5_

- [ ] 5. Develop supporting features and controls
- [ ] 5.1 Build MusafDigital component for Quran reference
  - Create side panel with Quran text display
  - Implement synchronized highlighting with current evaluation
  - Add smooth page transitions and responsive collapse
  - Build page navigation controls
  - _Requirements: 6.1, 6.2_

- [ ] 5.2 Implement exam session controls
  - Create pause exam functionality with session state management
  - Build general notes field for overall exam feedback
  - Add auto-save functionality for draft evaluations
  - Implement session recovery on page reload
  - _Requirements: 6.3, 6.4, 6.5_

- [ ] 6. Create main dialog container and navigation system
- [ ] 6.1 Build FormPenilaianUjianDialog main container
  - Create full-screen modal with backdrop blur and animations
  - Implement responsive layout with maximum width constraints
  - Add elegant shadow and border styling
  - Build modal state management and lifecycle
  - _Requirements: 1.1, 7.4_

- [ ] 6.2 Implement step navigation and validation system
  - Create Previous/Next button navigation with validation
  - Build step validation logic for each evaluation phase
  - Add confirmation dialogs for critical actions
  - Implement form state persistence during navigation
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 7. Build calculation engines for all exam categories
- [ ] 7.1 Implement Tasmi calculation system
  - Create function to calculate average of all page scores
  - Add real-time score updates during input
  - Build score validation and range checking
  - _Requirements: 8.1, 8.4_

- [ ] 7.2 Build Kenaikan Juz and UAS calculation system
  - Create function to calculate average of all juz scores
  - Implement real-time calculation display
  - Add score validation and error handling
  - _Requirements: 8.2, 8.4_

- [ ] 7.3 Develop MHQ calculation engine
  - Build weighted score calculation for individual questions
  - Create juz average calculation from question scores
  - Implement final MHQ score calculation from juz averages
  - Add real-time calculation updates throughout evaluation
  - _Requirements: 8.3, 8.4, 8.5_

- [ ] 8. Implement data persistence and API integration
- [ ] 8.1 Create API endpoints for exam data management
  - Build endpoints for saving and retrieving exam evaluations
  - Implement santri data fetching from halaqah
  - Create MHQ template CRUD operations
  - Add exam history and reporting endpoints
  - _Requirements: 1.2, 5.4, 8.5_

- [ ] 8.2 Build data validation and error handling
  - Implement comprehensive input validation
  - Create error state management and user feedback
  - Add network error handling with retry mechanisms
  - Build offline support with local storage fallback
  - _Requirements: 7.3, 8.4, 8.5_

- [ ] 9. Add advanced UX features and optimizations
- [ ] 9.1 Implement preview and confirmation system
  - Create comprehensive preview screen before final submission
  - Build confirmation dialog with evaluation summary
  - Add edit functionality from preview screen
  - Implement final submission with success feedback
  - _Requirements: 7.1, 7.4_

- [ ] 9.2 Build responsive design and mobile optimizations
  - Implement mobile-first responsive layouts
  - Create touch-friendly interfaces for mobile devices
  - Add bottom sheet navigation for mobile
  - Build collapsible Mushaf overlay for small screens
  - _Requirements: 6.1, 7.2_

- [ ] 9.3 Add accessibility features and compliance
  - Implement keyboard navigation throughout the application
  - Add ARIA labels and screen reader support
  - Create high contrast mode support
  - Build focus management system
  - _Requirements: 7.2, 7.3_

- [ ] 9.4 Implement performance optimizations
  - Add code splitting for evaluation form components
  - Implement virtual scrolling for large page/question lists
  - Create skeleton loading states for better perceived performance
  - Add service worker for offline functionality
  - _Requirements: 6.5, 7.4_

- [ ] 10. Integration and final testing
- [ ] 10.1 Integrate all components into main exam workflow
  - Connect all evaluation forms to main dialog container
  - Implement complete workflow from santri selection to final submission
  - Add comprehensive error handling and user feedback
  - Build final integration with existing exam management system
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 10.2 Create comprehensive testing suite
  - Write unit tests for calculation engines and validation logic
  - Build integration tests for complete evaluation workflows
  - Add visual regression tests for UI consistency
  - Create accessibility and performance testing
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_