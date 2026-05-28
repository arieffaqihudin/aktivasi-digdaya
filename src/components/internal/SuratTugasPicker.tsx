// Backward-compat shim. The canonical implementation now lives in
// src/components/forms/SuratTugasSelector.tsx.
export {
  SuratTugasSelector as SuratTugasPicker,
  validateSuratTugas,
  emptySuratTugas,
} from "@/components/forms/SuratTugasSelector";
export type {
  SuratTugasValue,
  SuratTugasMode,
} from "@/components/forms/SuratTugasSelector";
