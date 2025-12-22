# Prescription Drug Intelligence - Frontend Setup

## Overview

The frontend for the Prescription Drug Intelligence module is fully integrated and ready to use. This document outlines what has been set up and how to access it.

## Components Created

### 1. **PrescriptionForm Component** (`src/components/PrescriptionForm.tsx`)
   - Patient information input form
   - Dynamic drug list with add/remove functionality
   - Form validation
   - Supports brand and generic drug names
   - Dosage, frequency, duration inputs

### 2. **DrugIntelligencePanel Component** (`src/components/DrugIntelligencePanel.tsx`)
   - Color-coded risk assessment (Green/Yellow/Red)
   - Drug verification status display
   - Safety alerts with adverse events
   - Drug interaction warnings
   - Regulatory compliance status (CDSCO & AYUSH)
   - Medical disclaimer

### 3. **Prescriptions Page** (`src/app/prescriptions/page.tsx`)
   - Tabbed interface:
     - **New Prescription**: Input form for analyzing new prescriptions
     - **Analysis Results**: View detailed intelligence report
     - **History**: Browse past prescriptions with pagination
   - Prescription management (view, delete)
   - Real-time analysis results

## API Integration

### API Client (`src/lib/api/prescriptions.ts`)
- `analyzePrescription()` - Analyze a prescription
- `searchDrugs()` - Search for drugs
- `getDrugIntelligence()` - Get drug intelligence by RXCUI
- `getUserPrescriptions()` - Get user's prescription history
- `getPrescriptionById()` - Get specific prescription
- `deletePrescription()` - Delete a prescription

### React Query Hooks (`src/hooks/use-prescriptions.ts`)
- `useAnalyzePrescription()` - Mutation hook for analysis
- `useSearchDrugs()` - Query hook for drug search
- `useDrugIntelligence()` - Query hook for drug intelligence
- `usePrescriptions()` - Query hook for prescription list
- `usePrescription()` - Query hook for single prescription
- `useDeletePrescription()` - Mutation hook for deletion

## Navigation Integration

### Navbar
- Added "Prescriptions" link to main navigation
- Icon: Pill (from lucide-react)
- Accessible from desktop and mobile menus

### Dashboard
- Added "Analyze Prescription" button
- Quick access to prescription analysis

### Routes
- Route added to `src/config/routes.ts`
- Path: `/prescriptions`

## Features

### 1. Prescription Input
- Patient details (name, age, gender, weight)
- Known allergies
- Diagnosis
- Multiple drugs with:
  - Drug name (brand or generic)
  - Dose
  - Frequency
  - Duration
  - Quantity (optional)
  - Special instructions (optional)

### 2. Analysis Results
- **Overall Risk Assessment**: LOW / MODERATE / HIGH
- **Drug Verification**: 
  - Verified/Unverified status
  - Normalized drug names
  - RXCUI identifiers
  - Generic/Brand name mapping
- **Safety Alerts**:
  - Adverse events from OpenFDA
  - Warning levels per drug
  - Frequency of reported events
- **Drug Interactions**:
  - Severity levels (mild/moderate/severe/contraindicated)
  - Clinical descriptions
  - Management recommendations
- **Regulatory Status**:
  - CDSCO approval status
  - AYUSH identification
  - Registration numbers

### 3. Prescription History
- List of all analyzed prescriptions
- Filter by status
- Pagination support
- View and delete functionality
- Quick access to previous analyses

## Color Coding

### Risk Levels
- **LOW** (Green): Safe prescription, standard monitoring
- **MODERATE** (Yellow): Review recommended, some concerns
- **HIGH** (Red): High-risk factors, careful review required

### Interaction Severity
- **Contraindicated** (Red): Absolute contraindication
- **Severe** (Orange): Significant risk
- **Moderate** (Yellow): Moderate risk
- **Mild** (Blue): Minor concern

### Warning Levels
- **HIGH**: Serious adverse events
- **MODERATE**: Moderate adverse events
- **LOW**: Minor adverse events

## UI Components Used

All components use Shadcn/ui components:
- `Card`, `CardContent`, `CardHeader`, `CardTitle`
- `Button`
- `Input`, `Textarea`
- `Label`
- `Badge`
- `Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue`
- `AlertDialog` and related components

## Access

1. **Via Navigation**: Click "Prescriptions" in the main navbar
2. **Via Dashboard**: Click "Analyze Prescription" button
3. **Direct URL**: Navigate to `/prescriptions`

## Usage Flow

1. **Create Prescription**:
   - Go to Prescriptions page
   - Fill in patient information
   - Add drugs (one or more)
   - Click "Analyze Prescription"

2. **View Results**:
   - Automatically switches to "Analysis Results" tab
   - Review all intelligence data
   - Check risk levels and warnings

3. **View History**:
   - Switch to "History" tab
   - Browse past prescriptions
   - Click "View Analysis" to see details
   - Delete if needed

## Error Handling

- Toast notifications for success/error
- Loading states during API calls
- Graceful error messages
- Form validation before submission

## Responsive Design

- Mobile-friendly layout
- Responsive grid system
- Touch-friendly buttons
- Collapsible sections

## Dependencies

All required dependencies are already in the project:
- `@tanstack/react-query` - Data fetching
- `lucide-react` - Icons
- `date-fns` - Date formatting
- Shadcn/ui components

## Next Steps

1. Test the prescription flow end-to-end
2. Verify API connectivity
3. Test with real drug names
4. Review color coding and alerts
5. Test on mobile devices

## Notes

- All API calls use authentication headers
- Caching is implemented for better performance
- Medical disclaimer is displayed on results
- All data is stored in MongoDB via backend API

