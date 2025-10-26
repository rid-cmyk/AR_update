# Design Document - Sistem Penilaian Ujian

## Overview

Sistem penilaian ujian dirancang dengan pendekatan modern dan elegan menggunakan design system yang konsisten. Interface mengutamakan user experience yang intuitif dengan visual hierarchy yang jelas, animasi yang halus, dan responsive design yang optimal di berbagai perangkat.

## Architecture

### Frontend Architecture
- **Framework**: Next.js 14 dengan App Router
- **UI Library**: Radix UI primitives dengan custom styling
- **Styling**: Tailwind CSS dengan CSS variables untuk theming
- **State Management**: React hooks (useState, useEffect) untuk local state
- **Type Safety**: TypeScript untuk type definitions

### Component Structure
```
components/
├── guru/
│   └── ujian/
│       ├── FormPenilaianUjianDialog.tsx (Main container)
│       ├── StepIndicator.tsx (Progress visualization)
│       ├── SantriSelection.tsx (Step 1)
│       ├── CategorySelection.tsx (Step 2)
│       ├── JuzRangeSelection.tsx (Step 3)
│       ├── EvaluationForms/
│       │   ├── TasmiForm.tsx (Per-page evaluation)
│       │   ├── KenaikanJuzForm.tsx (Per-juz evaluation)
│       │   └── MHQForm.tsx (Per-question with criteria)
│       ├── MusafDigital.tsx (Quran reference)
│       └── ExamControls.tsx (Pause, notes, navigation)
└── ui/ (Reusable components)
```

## Design System

### Color Palette
- **Primary**: Modern blue gradient (#3B82F6 to #1D4ED8)
- **Secondary**: Soft gray tones (#F8FAFC, #E2E8F0)
- **Success**: Emerald green (#10B981)
- **Warning**: Amber (#F59E0B)
- **Error**: Rose red (#EF4444)
- **Background**: Clean white (#FFFFFF) with dark mode support

### Typography
- **Primary Font**: Geist Sans (modern, readable)
- **Monospace**: Geist Mono for code/numbers
- **Hierarchy**: 
  - H1: 2xl font-bold (32px)
  - H2: xl font-semibold (24px)
  - H3: lg font-medium (20px)
  - Body: base font-normal (16px)
  - Caption: sm text-muted-foreground (14px)

### Spacing & Layout
- **Container**: max-w-4xl with responsive padding
- **Grid**: CSS Grid and Flexbox for layouts
- **Spacing Scale**: 4px base unit (space-1 to space-24)
- **Border Radius**: rounded-lg (8px) for cards, rounded-md (6px) for inputs

## Components and Interfaces

### 1. Main Dialog Container
```typescript
interface FormPenilaianUjianDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: UjianData) => void
}
```

**Design Features:**
- Full-screen overlay with backdrop blur
- Centered modal with smooth zoom-in animation
- Maximum width 4xl (896px) with responsive height
- Elegant shadow and border styling

### 2. Step Indicator Component
```typescript
interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  stepLabels: string[]
}
```

**Visual Design:**
- Horizontal progress bar with circular step indicators
- Active steps: Primary color with checkmark icon
- Current step: Primary color with number
- Future steps: Muted gray with number
- Connecting lines with gradient fill animation

### 3. Category Selection Interface
```typescript
interface CategorySelectionProps {
  categories: ExamCategory[]
  selectedCategory: ExamCategory | null
  onSelect: (category: ExamCategory) => void
}

interface ExamCategory {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  evaluationMethod: 'per-page' | 'per-juz' | 'per-question'
}
```

**Design Features:**
- Card-based selection with hover animations
- Category icons with color-coded backgrounds
- Clear typography hierarchy
- Selection state with border highlight and background tint

### 4. Juz Range Selector
```typescript
interface JuzRangeSelectorProps {
  startJuz: number
  endJuz: number
  onRangeChange: (start: number, end: number) => void
  maxJuz: number
}
```

**Visual Elements:**
- Dual slider component with range selection
- Visual feedback for selected range
- Juz numbers with Arabic numerals
- Validation indicators for valid ranges

### 5. Evaluation Form Components

#### Tasmi Form (Per-Page)
```typescript
interface TasmiFormProps {
  juzRange: { start: number; end: number }
  pageScores: { [pageId: string]: number }
  onScoreChange: (pageId: string, score: number) => void
}
```

**Design:**
- Grid layout with page cards
- Each page shows: Juz number, Page number, Score input
- Real-time average calculation display
- Progress indicator showing completion percentage

#### Kenaikan Juz Form (Per-Juz)
```typescript
interface KenaikanJuzFormProps {
  juzRange: { start: number; end: number }
  juzScores: { [juzId: string]: number }
  onScoreChange: (juzId: string, score: number) => void
}
```

**Design:**
- Simplified card layout for each juz
- Larger score inputs with better visual hierarchy
- Juz summary information
- Animated score calculation

#### MHQ Form (Per-Question with Criteria)
```typescript
interface MHQFormProps {
  juzRange: { start: number; end: number }
  questionsPerJuz: number
  criteriaWeights: CriteriaWeights
  scores: MHQScores
  onScoreChange: (questionId: string, criteria: string, score: number) => void
}

interface CriteriaWeights {
  tajwid: number
  sifatulHuruf: number
  kejelasanBacaan: number
  kelancaran: number
}
```

**Design:**
- Accordion-style layout for each juz
- Question cards with 4-column criteria grid
- Color-coded criteria with icons
- Real-time weighted score calculation
- Visual progress for each juz completion

### 6. Mushaf Digital Component
```typescript
interface MusafDigitalProps {
  currentJuz: number
  currentPage?: number
  onPageChange: (page: number) => void
}
```

**Design Features:**
- Side panel with Quran text display
- Synchronized highlighting with current evaluation
- Smooth page transitions
- Responsive collapse on mobile devices

## Data Models

### Core Entities
```typescript
interface UjianData {
  id: string
  santriId: string
  category: ExamCategory
  juzRange: { start: number; end: number }
  tanggalUjian: Date
  scores: EvaluationScores
  finalScore: number
  notes: string
  status: 'draft' | 'completed'
  createdAt: Date
  updatedAt: Date
}

interface EvaluationScores {
  tasmi?: { [pageId: string]: number }
  kenaikanJuz?: { [juzId: string]: number }
  mhq?: {
    questionsPerJuz: number
    scores: {
      [questionId: string]: {
        tajwid: number
        sifatulHuruf: number
        kejelasanBacaan: number
        kelancaran: number
        weightedScore: number
      }
    }
  }
}

interface MHQTemplate {
  id: string
  name: string
  criteriaWeights: CriteriaWeights
  maxScore: number
  isActive: boolean
}
```

## Error Handling

### Validation Strategy
- **Real-time validation**: Input validation on change
- **Visual feedback**: Error states with red borders and messages
- **Form validation**: Comprehensive validation before step progression
- **Network errors**: Graceful handling with retry mechanisms

### Error States Design
- Inline error messages with clear typography
- Toast notifications for system errors
- Loading states with skeleton components
- Empty states with helpful illustrations

## Testing Strategy

### Component Testing
- Unit tests for calculation logic
- Integration tests for form workflows
- Visual regression tests for UI consistency
- Accessibility testing with screen readers

### User Experience Testing
- Usability testing with actual teachers
- Performance testing on various devices
- Cross-browser compatibility testing
- Mobile responsiveness validation

## Performance Optimizations

### Frontend Optimizations
- **Code splitting**: Lazy loading for evaluation forms
- **Memoization**: React.memo for expensive components
- **Virtual scrolling**: For large lists of pages/questions
- **Image optimization**: Optimized Quran page images
- **Bundle optimization**: Tree shaking and minification

### UX Optimizations
- **Auto-save**: Draft saving every 30 seconds
- **Offline support**: Service worker for basic functionality
- **Progressive loading**: Skeleton screens during data fetch
- **Smooth animations**: 60fps transitions with CSS transforms

## Accessibility Features

### WCAG 2.1 AA Compliance
- **Keyboard navigation**: Full keyboard accessibility
- **Screen reader support**: Proper ARIA labels and roles
- **Color contrast**: Minimum 4.5:1 ratio for text
- **Focus management**: Clear focus indicators
- **Alternative text**: Descriptive alt text for images

### Inclusive Design
- **Font scaling**: Respects user font size preferences
- **Reduced motion**: Respects prefers-reduced-motion
- **High contrast mode**: Support for high contrast themes
- **Touch targets**: Minimum 44px touch targets on mobile

## Responsive Design

### Breakpoint Strategy
- **Mobile**: 320px - 767px (single column layout)
- **Tablet**: 768px - 1023px (adapted two-column)
- **Desktop**: 1024px+ (full multi-column layout)

### Mobile Adaptations
- **Navigation**: Bottom sheet for step navigation
- **Forms**: Stacked layout with larger touch targets
- **Mushaf**: Collapsible overlay instead of side panel
- **Typography**: Adjusted font sizes for readability

## Animation and Micro-interactions

### Transition Design
- **Page transitions**: Smooth slide animations between steps
- **State changes**: Subtle scale and opacity transitions
- **Loading states**: Elegant skeleton animations
- **Success feedback**: Satisfying completion animations

### Interaction Feedback
- **Hover states**: Subtle elevation and color changes
- **Active states**: Clear pressed feedback
- **Selection feedback**: Smooth highlight transitions
- **Progress feedback**: Animated progress indicators