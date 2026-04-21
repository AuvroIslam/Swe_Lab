import { create } from 'zustand';
import { ExerciseType, RepScore, SetSummary } from '../types/pose';

interface ExerciseStore {
  // ── current state ──
  exerciseType: ExerciseType | null;
  isActive: boolean;
  repCount: number;
  validRepCount: number;
  currentPhase: string;
  currentFeedback: string[];
  lastRepScore: RepScore | null;
  lastRepCounted: boolean;

  // ── set result ──
  setSummary: SetSummary | null;

  // ── actions ──
  startExercise: (type: ExerciseType) => void;
  updateFrame: (data: FrameUpdate) => void;
  finishSet: (summary: SetSummary) => void;
  reset: () => void;
}

interface FrameUpdate {
  repCount: number;
  validRepCount: number;
  currentPhase: string;
  feedback: string[];
  lastRepScore: RepScore | null;
  lastRepCounted: boolean;
}

export const useExerciseStore = create<ExerciseStore>((set) => ({
  exerciseType: null,
  isActive: false,
  repCount: 0,
  validRepCount: 0,
  currentPhase: 'IDLE',
  currentFeedback: [],
  lastRepScore: null,
  lastRepCounted: false,
  setSummary: null,

  startExercise: (type) =>
    set({
      exerciseType: type,
      isActive: true,
      repCount: 0,
      validRepCount: 0,
      currentPhase: 'IDLE',
      currentFeedback: [],
      lastRepScore: null,
      lastRepCounted: false,
      setSummary: null,
    }),

  updateFrame: (data) =>
    set({
      repCount: data.repCount,
      validRepCount: data.validRepCount,
      currentPhase: data.currentPhase,
      currentFeedback: data.feedback,
      lastRepScore: data.lastRepScore,
      lastRepCounted: data.lastRepCounted,
    }),

  finishSet: (summary) =>
    set({
      isActive: false,
      setSummary: summary,
    }),

  reset: () =>
    set({
      exerciseType: null,
      isActive: false,
      repCount: 0,
      validRepCount: 0,
      currentPhase: 'IDLE',
      currentFeedback: [],
      lastRepScore: null,
      lastRepCounted: false,
      setSummary: null,
    }),
}));
