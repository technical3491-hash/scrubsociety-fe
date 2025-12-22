# Prescription Module - Folder Structure

All prescription-related files have been organized into dedicated folders for better maintainability.

## New Folder Structure

```
frontend/src/
├── components/
│   └── prescriptions/
│       ├── PrescriptionForm.tsx          # Prescription input form component
│       └── DrugIntelligencePanel.tsx      # Analysis results display component
│
├── lib/
│   └── api/
│       └── prescriptions/
│           └── index.ts                  # API client functions and types
│
├── hooks/
│   └── prescriptions/
│       └── index.ts                      # React Query hooks
│
└── app/
    └── prescriptions/
        └── page.tsx                      # Main prescriptions page
```

## File Locations

### Components
- **PrescriptionForm**: `frontend/src/components/prescriptions/PrescriptionForm.tsx`
- **DrugIntelligencePanel**: `frontend/src/components/prescriptions/DrugIntelligencePanel.tsx`

### API Client
- **API Functions & Types**: `frontend/src/lib/api/prescriptions/index.ts`
  - All API functions (analyzePrescription, searchDrugs, etc.)
  - TypeScript interfaces and types
  - Export: `@/lib/api/prescriptions`

### Hooks
- **React Query Hooks**: `frontend/src/hooks/prescriptions/index.ts`
  - useAnalyzePrescription
  - useSearchDrugs
  - useDrugIntelligence
  - usePrescriptions
  - usePrescription
  - useDeletePrescription
  - Export: `@/hooks/prescriptions`

### Pages
- **Prescriptions Page**: `frontend/src/app/prescriptions/page.tsx`

## Import Examples

### In Components
```typescript
import PrescriptionForm from '@/components/prescriptions/PrescriptionForm';
import DrugIntelligencePanel from '@/components/prescriptions/DrugIntelligencePanel';
```

### In Pages
```typescript
import { useAnalyzePrescription, usePrescriptions } from '@/hooks/prescriptions';
import { AnalyzePrescriptionInput, PrescriptionAnalysis } from '@/lib/api/prescriptions';
```

### In Hooks
```typescript
import { analyzePrescription, searchDrugs } from '@/lib/api/prescriptions';
```

## Benefits

1. **Better Organization**: All prescription-related files are grouped together
2. **Easier Maintenance**: Easy to find and update prescription features
3. **Clear Structure**: Follows a logical folder hierarchy
4. **Scalability**: Easy to add more prescription-related components/files

## Migration Notes

- All imports have been updated automatically
- Old files have been removed
- No breaking changes to functionality
- All paths use the new folder structure

