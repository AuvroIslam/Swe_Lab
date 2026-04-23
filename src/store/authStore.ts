import { create } from 'zustand';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

interface AuthStore {
  user: FirebaseAuthTypes.User | null;
  isInitializing: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setInitializing: (value: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isInitializing: true,
  setUser: (user) => set({ user }),
  setInitializing: (value) => set({ isInitializing: value }),
}));
